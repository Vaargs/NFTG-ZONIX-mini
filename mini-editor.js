// === MINI IMAGE EDITOR ===

class MiniEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImage = null;
        this.currentImage = null;
        this.selectedPixels = [];
        this.gridSize = 10;
        
        // Transform state
        this.scale = 1;
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Area rect for clipping
        this.areaRect = null;
        this.areaShape = null;
        
        // Interaction state
        this.isDragging = false;
        this.isRotating = false;
        this.lastX = 0;
        this.lastY = 0;
        this.rotationStartAngle = 0;
        
        // НОВОЕ: Настройки качества
        this.outputQuality = 0.95; // Качество JPEG (0.1 - 1.0)
        this.outputSize = 60; // Размер финального пикселя (увеличено с 30)
        this.useHighDPI = true; // Использовать высокое DPI
        
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('✅ MiniEditor initialized');
    }

    setupEventListeners() {
        // Image upload
        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Editor controls
        document.getElementById('close-editor')?.addEventListener('click', () => this.closeEditor());
        document.getElementById('zoom-in-editor')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-editor')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('rotate-left')?.addEventListener('click', () => this.rotateLeft());
        document.getElementById('rotate-right')?.addEventListener('click', () => this.rotateRight());
        document.getElementById('reset-editor')?.addEventListener('click', () => this.resetTransform());
        document.getElementById('preview-editor')?.addEventListener('click', () => this.showPreview());
        document.getElementById('apply-editor')?.addEventListener('click', () => this.applyToPixels());

        // Modal events
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.closeEditor();
            }
        });
    }

    openEditor(pixelIds) {
        if (!pixelIds || pixelIds.length === 0) {
            MiniUtils.showNotification('Не выбраны пиксели для редактирования', 'error');
            return;
        }

        this.selectedPixels = [...pixelIds];
        this.isOpen = true;
        
        // Setup canvas when modal opens
        setTimeout(() => {
            this.setupCanvas();
            this.calculateAreaShape();
            this.redraw();
        }, 100);
        
        const modal = document.getElementById('editor-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([100]);
        }
        
        // Show Telegram back button
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.show();
        }
        
        MiniUtils.showNotification(`Редактор открыт для ${pixelIds.length} пикселей`, 'info');
        console.log('Editor opened for pixels:', pixelIds);
    }

    closeEditor() {
        this.isOpen = false;
        this.clearEditor();
        
        const modal = document.getElementById('editor-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Hide Telegram back button if no other modals open
        if (window.Telegram?.WebApp && !window.miniModals?.isModalOpen()) {
            window.Telegram.WebApp.BackButton.hide();
        }
        
        console.log('Editor closed');
    }

    setupCanvas() {
        this.canvas = document.getElementById('editor-canvas');
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // УЛУЧШЕНО: Настройка высококачественного рендеринга
        const containerWidth = this.canvas.parentElement.clientWidth - 20;
        const containerHeight = 200;
        
        // Увеличиваем размер canvas для лучшего качества
        const scale = this.useHighDPI ? (window.devicePixelRatio || 1) : 1;
        this.canvas.width = Math.min(containerWidth, 400) * scale;
        this.canvas.height = containerHeight * scale;
        
        // Устанавливаем CSS размеры
        this.canvas.style.width = Math.min(containerWidth, 400) + 'px';
        this.canvas.style.height = containerHeight + 'px';
        
        // Масштабируем контекст для высокого DPI
        this.ctx.scale(scale, scale);
        
        // Включаем лучшее качество рендеринга
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Setup interaction
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        this.clearCanvas();
        this.drawAreaGuide();
    }

    calculateAreaShape() {
        if (this.selectedPixels.length === 0) return null;
        
        const rows = this.selectedPixels.map(id => Math.floor(id / this.gridSize));
        const cols = this.selectedPixels.map(id => id % this.gridSize);
        
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);
        
        this.areaShape = {
            width: maxCol - minCol + 1,
            height: maxRow - minRow + 1,
            minRow,
            minCol,
            pixelIds: this.selectedPixels
        };
        
        console.log('Area shape calculated:', this.areaShape);
        return this.areaShape;
    }

    clearCanvas() {
        if (!this.ctx || !this.canvas) return;
        
        // Учитываем масштаб для высокого DPI
        const scale = this.useHighDPI ? (window.devicePixelRatio || 1) : 1;
        const width = this.canvas.width / scale;
        const height = this.canvas.height / scale;
        
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, width, height);
    }

    drawAreaGuide() {
        if (!this.ctx || !this.areaShape) return;
        
        // Учитываем масштаб для высокого DPI
        const scale = this.useHighDPI ? (window.devicePixelRatio || 1) : 1;
        const canvasWidth = this.canvas.width / scale;
        const canvasHeight = this.canvas.height / scale;
        
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        const padding = 40;
        const availableWidth = canvasWidth - padding;
        const availableHeight = canvasHeight - padding;
        
        const cellSize = Math.min(
            availableWidth / this.areaShape.width,
            availableHeight / this.areaShape.height
        );
        
        const areaWidth = this.areaShape.width * cellSize;
        const areaHeight = this.areaShape.height * cellSize;
        const startX = centerX - areaWidth / 2;
        const startY = centerY - areaHeight / 2;
        
        // Store area dimensions for later use
        this.areaRect = {
            x: startX,
            y: startY,
            width: areaWidth,
            height: areaHeight,
            cellSize: cellSize,
            centerX: centerX,
            centerY: centerY
        };
        
        // Draw area outline
        this.ctx.strokeStyle = '#9D4EDD';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(startX, startY, areaWidth, areaHeight);
        this.ctx.setLineDash([]);
        
        // Draw grid
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < this.areaShape.width; i++) {
            const x = startX + i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, startY + areaHeight);
            this.ctx.stroke();
        }
        
        for (let i = 1; i < this.areaShape.height; i++) {
            const y = startY + i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(startX + areaWidth, y);
            this.ctx.stroke();
        }
        
        // Draw info text
        this.ctx.fillStyle = '#9D4EDD';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `Область: ${this.areaShape.width}×${this.areaShape.height}`,
            centerX,
            startY - 10
        );
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            MiniUtils.showNotification('Выберите изображение', 'error');
            return;
        }

        try {
            const image = await this.loadImage(file);
            this.originalImage = image;
            this.currentImage = image;
            
            this.redraw();
            this.fitImageToCanvas();
            this.redraw();
            
            this.enableControls();
            
            MiniUtils.showNotification('Изображение загружено!', 'success');
            MiniUtils.vibrate([50]);
        } catch (error) {
            MiniUtils.handleError(error, 'Image upload');
        }
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    fitImageToCanvas() {
        if (!this.currentImage || !this.canvas || !this.areaRect) return;
        
        const areaWidth = this.areaRect.width;
        const areaHeight = this.areaRect.height;
        
        const scaleX = areaWidth / this.currentImage.width;
        const scaleY = areaHeight / this.currentImage.height;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        this.scale = Math.max(0.1, scale);
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        console.log('Image fitted to area', { 
            scale: this.scale, 
            imageSize: { w: this.currentImage.width, h: this.currentImage.height },
            areaSize: { w: areaWidth, h: areaHeight },
            areaRect: this.areaRect
        });
    }

    handleMouseDown(e) {
        if (!this.currentImage) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        if (e.shiftKey) {
            this.isRotating = true;
            this.isDragging = false;
            this.canvas.style.cursor = 'crosshair';
            
            const centerX = this.areaRect.centerX;
            const centerY = this.areaRect.centerY;
            this.rotationStartAngle = Math.atan2(this.lastY - centerY, this.lastX - centerX) * (180 / Math.PI) - this.rotation;
        } else {
            this.isDragging = true;
            this.isRotating = false;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        if (!this.currentImage) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (this.isRotating) {
            const centerX = this.areaRect.centerX;
            const centerY = this.areaRect.centerY;
            const currentAngle = Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);
            
            this.rotation = currentAngle - this.rotationStartAngle;
            this.rotation = ((this.rotation % 360) + 360) % 360;
            
            this.redraw();
        } else if (this.isDragging) {
            this.offsetX += currentX - this.lastX;
            this.offsetY += currentY - this.lastY;

            this.lastX = currentX;
            this.lastY = currentY;

            this.redraw();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.isRotating = false;
        if (this.canvas) this.canvas.style.cursor = 'grab';
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.isDragging = true;
            this.lastX = touch.clientX - rect.left;
            this.lastY = touch.clientY - rect.top;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;

            this.offsetX += currentX - this.lastX;
            this.offsetY += currentY - this.lastY;

            this.lastX = currentX;
            this.lastY = currentY;

            this.redraw();
        }
    }

    handleTouchEnd() {
        this.isDragging = false;
    }

    zoomIn() {
        this.scale = Math.min(3, this.scale * 1.2);
        this.redraw();
        MiniUtils.vibrate([30]);
    }

    zoomOut() {
        this.scale = Math.max(0.1, this.scale * 0.8);
        this.redraw();
        MiniUtils.vibrate([30]);
    }

    rotateLeft() {
        this.rotation -= 15;
        this.rotation = ((this.rotation % 360) + 360) % 360;
        this.redraw();
        MiniUtils.vibrate([30]);
    }

    rotateRight() {
        this.rotation += 15;
        this.rotation = ((this.rotation % 360) + 360) % 360;
        this.redraw();
        MiniUtils.vibrate([30]);
    }

    resetTransform() {
        if (this.currentImage) {
            this.fitImageToCanvas();
        } else {
            this.scale = 1;
            this.rotation = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
        
        this.redraw();
        MiniUtils.showNotification('Трансформация сброшена', 'info');
        MiniUtils.vibrate([50]);
    }

    redraw() {
        if (!this.ctx || !this.canvas) return;
        
        this.clearCanvas();

        if (this.currentImage) {
            this.drawImage();
            this.drawAreaGuide();
        } else {
            this.drawAreaGuide();
            
            // Учитываем масштаб для высокого DPI
            const scale = this.useHighDPI ? (window.devicePixelRatio || 1) : 1;
            const canvasWidth = this.canvas.width / scale;
            const canvasHeight = this.canvas.height / scale;
            
            this.ctx.fillStyle = '#666';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Загрузите изображение', canvasWidth / 2, canvasHeight / 2);
        }
    }

    drawImage() {
        if (!this.currentImage || !this.areaRect) return;
        
        this.ctx.save();
        
        this.ctx.beginPath();
        this.ctx.rect(this.areaRect.x, this.areaRect.y, this.areaRect.width, this.areaRect.height);
        this.ctx.clip();
        
        const centerX = this.areaRect.centerX + this.offsetX;
        const centerY = this.areaRect.centerY + this.offsetY;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        
        const width = this.currentImage.width;
        const height = this.currentImage.height;
        
        this.ctx.drawImage(
            this.currentImage,
            -width / 2,
            -height / 2,
            width,
            height
        );
        
        this.ctx.restore();
    }

    showPreview() {
        if (!this.currentImage || !this.areaShape) {
            MiniUtils.showNotification('Загрузите изображение', 'error');
            return;
        }

        const cells = this.extractCells();
        this.displayPreview(cells);
        MiniUtils.showNotification('Предпросмотр готов!', 'info');
        MiniUtils.vibrate([100]);
    }

    displayPreview(cells) {
        let previewContainer = document.getElementById('preview-container');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'preview-container';
            previewContainer.style.cssText = `
                margin-top: 20px;
                padding: 20px;
                background: rgba(42, 42, 42, 0.8);
                border: 1px solid #333;
                border-radius: 12px;
                text-align: center;
            `;
            document.querySelector('.editor-content').appendChild(previewContainer);
        }
        
        let previewHTML = '';
        let cellIndex = 0;
        
        for (let row = 0; row < this.areaShape.height; row++) {
            for (let col = 0; col < this.areaShape.width; col++) {
                const globalRow = this.areaShape.minRow + row;
                const globalCol = this.areaShape.minCol + col;
                const pixelId = globalRow * this.gridSize + globalCol;
                
                if (this.selectedPixels.includes(pixelId)) {
                    previewHTML += `<div style="width: 24px; height: 24px; background-image: url(${cells[cellIndex]}); background-size: cover; background-position: center; border: none;"></div>`;
                    cellIndex++;
                } else {
                    previewHTML += `<div style="width: 24px; height: 24px; background: #111; border: 1px solid #333; opacity: 0.3;"></div>`;
                }
            }
        }
        
        previewContainer.innerHTML = `
            <h3 style="color: #9D4EDD; margin-bottom: 15px;">Предпросмотр для ${this.selectedPixels.length} пикселей</h3>
            <div style="margin: 15px 0; color: #b0b0b0; font-size: 12px;">
                Область: ${this.areaShape.width}×${this.areaShape.height} • Позиции: ${this.selectedPixels.slice(0, 5).join(', ')}${this.selectedPixels.length > 5 ? '...' : ''}
            </div>
            <div style="display: inline-grid; grid-template-columns: repeat(${this.areaShape.width}, 24px); gap: 0; background: #000; padding: 4px; border-radius: 5px;">
                ${previewHTML}
            </div>
            <p style="margin-top: 15px; color: #9D4EDD; font-size: 12px; font-weight: bold;">
                ✅ Готово к применению! Нажмите "Применить" для бесшовного изображения
            </p>
        `;
    }

    applyToPixels() {
        if (!this.currentImage || !this.areaShape) {
            MiniUtils.showNotification('Загрузите изображение', 'error');
            return;
        }

        try {
            const cells = this.extractCells();
            
            let cellIndex = 0;
            for (let row = 0; row < this.areaShape.height; row++) {
                for (let col = 0; col < this.areaShape.width; col++) {
                    const globalRow = this.areaShape.minRow + row;
                    const globalCol = this.areaShape.minCol + col;
                    const pixelId = globalRow * this.gridSize + globalCol;
                    
                    if (this.selectedPixels.includes(pixelId)) {
                        const pixelElement = document.querySelector(`[data-id="${pixelId}"]`);
                        if (pixelElement && cells[cellIndex]) {
                            pixelElement.style.backgroundImage = `url(${cells[cellIndex]})`;
                            pixelElement.style.backgroundSize = 'cover';
                            pixelElement.style.backgroundPosition = 'center';
                            pixelElement.classList.add('with-image');
                            
                            setTimeout(() => {
                                pixelElement.style.animation = 'pulse 0.6s ease-out';
                                setTimeout(() => {
                                    pixelElement.style.animation = '';
                                }, 600);
                            }, cellIndex * 50);
                        }
                        
                        if (window.miniGrid && window.miniGrid.pixels.has(pixelId)) {
                            const pixelData = window.miniGrid.pixels.get(pixelId);
                            pixelData.imageUrl = cells[cellIndex];
                            window.miniGrid.pixels.set(pixelId, pixelData);
                        }
                        
                        cellIndex++;
                    }
                }
            }

            if (window.miniGrid) {
                window.miniGrid.savePixelData();
                window.miniGrid.updateSeamlessMode();
            }

            MiniUtils.showNotification(`Изображение применено к ${this.selectedPixels.length} пикселям!`, 'success');
            MiniUtils.vibrate([100, 50, 100]);
            
            setTimeout(() => {
                this.closeEditor();
            }, 1500);
            
        } catch (error) {
            MiniUtils.handleError(error, 'Apply to pixels');
        }
    }

    // УЛУЧШЕНО: Высококачественное извлечение ячеек
    extractCells() {
        const cells = [];
        
        // УЛУЧШЕНО: Увеличенный размер для лучшего качества
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.outputSize;
        tempCanvas.height = this.outputSize;
        
        // Включаем высококачественное сглаживание
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        
        const canvasAreaRect = this.areaRect;
        const canvasCellSize = canvasAreaRect.cellSize;
        
        const pixelMatrix = [];
        for (let row = 0; row < this.areaShape.height; row++) {
            for (let col = 0; col < this.areaShape.width; col++) {
                const globalRow = this.areaShape.minRow + row;
                const globalCol = this.areaShape.minCol + col;
                const pixelId = globalRow * this.gridSize + globalCol;
                
                if (this.selectedPixels.includes(pixelId)) {
                    pixelMatrix.push({
                        pixelId,
                        row,
                        col,
                        localRow: row,
                        localCol: col
                    });
                }
            }
        }
        
        pixelMatrix.forEach(pixelInfo => {
            const { localRow, localCol } = pixelInfo;
            
            // Очищаем временный canvas
            tempCtx.clearRect(0, 0, this.outputSize, this.outputSize);
            
            if (this.currentImage) {
                tempCtx.save();
                
                // Вычисляем позицию ячейки на основном canvas
                const cellCanvasX = canvasAreaRect.x + localCol * canvasCellSize;
                const cellCanvasY = canvasAreaRect.y + localRow * canvasCellSize;
                const cellCenterX = cellCanvasX + canvasCellSize / 2;
                const cellCenterY = cellCanvasY + canvasCellSize / 2;
                
                // Центр изображения с учетом смещений
                const imageCenterX = canvasAreaRect.centerX + this.offsetX;
                const imageCenterY = canvasAreaRect.centerY + this.offsetY;
                
                // Смещение от центра изображения до центра ячейки
                const offsetX = cellCenterX - imageCenterX;
                const offsetY = cellCenterY - imageCenterY;
                
                // Применяем обратный поворот к смещению
                const radians = -this.rotation * Math.PI / 180;
                const rotatedOffsetX = offsetX * Math.cos(radians) - offsetY * Math.sin(radians);
                const rotatedOffsetY = offsetX * Math.sin(radians) + offsetY * Math.cos(radians);
                
                // Настраиваем временный canvas
                tempCtx.translate(this.outputSize / 2, this.outputSize / 2);
                tempCtx.rotate((this.rotation * Math.PI) / 180);
                tempCtx.scale(this.scale, this.scale);
                
                // Вычисляем где должно быть изображение относительно ячейки
                const imageX = -this.currentImage.width / 2 - rotatedOffsetX / this.scale;
                const imageY = -this.currentImage.height / 2 - rotatedOffsetY / this.scale;
                
                // УЛУЧШЕНО: Масштабируем для финального размера
                const scaleFactor = this.outputSize / canvasCellSize;
                tempCtx.scale(scaleFactor, scaleFactor);
                
                // Рисуем изображение с высоким качеством
                tempCtx.drawImage(
                    this.currentImage,
                    imageX,
                    imageY,
                    this.currentImage.width,
                    this.currentImage.height
                );
                
                tempCtx.restore();
            }
            
            // УЛУЧШЕНО: Экспортируем с высоким качеством
            const dataUrl = tempCanvas.toDataURL('image/jpeg', this.outputQuality);
            cells.push(dataUrl);
        });
        
        console.log(`Извлечено ${cells.length} ячеек высокого качества (${this.outputSize}x${this.outputSize}px, качество: ${this.outputQuality})`);
        return cells;
    }

    enableControls() {
        const controls = ['preview-editor', 'apply-editor'];
        controls.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });
    }

    disableControls() {
        const controls = ['preview-editor', 'apply-editor'];
        controls.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
    }

    clearEditor() {
        this.originalImage = null;
        this.currentImage = null;
        this.selectedPixels = [];
        this.areaShape = null;
        this.areaRect = null;
        this.resetTransform();
        
        if (this.canvas) {
            this.clearCanvas();
        }
        
        this.disableControls();
        
        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.value = '';
        }
        
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            previewContainer.remove();
        }
    }

    // НОВОЕ: Методы для настройки качества
    setOutputQuality(quality) {
        this.outputQuality = Math.max(0.1, Math.min(1.0, quality));
        console.log('Output quality set to:', this.outputQuality);
    }

    setOutputSize(size) {
        this.outputSize = Math.max(20, Math.min(200, size));
        console.log('Output size set to:', this.outputSize);
    }

    toggleHighDPI(enabled) {
        this.useHighDPI = enabled;
        console.log('High DPI rendering:', this.useHighDPI ? 'enabled' : 'disabled');
        
        // Пересоздаем canvas с новыми настройками
        if (this.isOpen) {
            this.setupCanvas();
            this.redraw();
        }
    }

    // Debug methods
    getState() {
        return {
            isOpen: this.isOpen,
            hasImage: !!this.currentImage,
            selectedPixels: this.selectedPixels.length,
            areaShape: this.areaShape,
            areaRect: this.areaRect,
            transform: {
                scale: this.scale,
                rotation: this.rotation,
                offset: { x: this.offsetX, y: this.offsetY }
            },
            quality: {
                outputQuality: this.outputQuality,
                outputSize: this.outputSize,
                useHighDPI: this.useHighDPI
            },
            canvasReady: !!(this.canvas && this.ctx)
        };
    }

    // НОВОЕ: Экспорт настроек качества для консольного доступа
    getQualitySettings() {
        return {
            outputQuality: this.outputQuality,
            outputSize: this.outputSize,
            useHighDPI: this.useHighDPI
        };
    }

    // НОВОЕ: Применение предустановок качества
    applyQualityPreset(preset) {
        const presets = {
            'low': { quality: 0.7, size: 40, highDPI: false },
            'medium': { quality: 0.85, size: 60, highDPI: true },
            'high': { quality: 0.95, size: 80, highDPI: true },
            'ultra': { quality: 1.0, size: 120, highDPI: true }
        };

        if (presets[preset]) {
            const settings = presets[preset];
            this.setOutputQuality(settings.quality);
            this.setOutputSize(settings.size);
            this.toggleHighDPI(settings.highDPI);
            
            MiniUtils.showNotification(`Качество установлено: ${preset}`, 'success');
            console.log(`Applied ${preset} quality preset:`, settings);
        } else {
            console.log('Available presets:', Object.keys(presets));
        }
    }
}

// Global initialization
window.MiniEditor = MiniEditor;