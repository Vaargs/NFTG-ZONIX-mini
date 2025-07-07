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
        
        // Interaction state
        this.isDragging = false;
        this.isRotating = false;
        this.lastX = 0;
        this.lastY = 0;
        this.rotationStartAngle = 0;
        
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
        
        // Set canvas size
        this.canvas.width = 300;
        this.canvas.height = 200;
        
        // Enable high quality rendering
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
        
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawAreaGuide() {
        if (!this.ctx || !this.areaShape) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const cellSize = Math.min(
            (this.canvas.width - 40) / this.areaShape.width,
            (this.canvas.height - 40) / this.areaShape.height
        );
        
        const areaWidth = this.areaShape.width * cellSize;
        const areaHeight = this.areaShape.height * cellSize;
        const startX = centerX - areaWidth / 2;
        const startY = centerY - areaHeight / 2;
        
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
            
            this.fitImageToCanvas();
            this.redraw();
            
            // Enable controls
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
        if (!this.currentImage || !this.canvas) return;
        
        const padding = 20;
        const availableWidth = this.canvas.width - padding * 2;
        const availableHeight = this.canvas.height - padding * 2;
        
        const scaleX = availableWidth / this.currentImage.width;
        const scaleY = availableHeight / this.currentImage.height;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        
        this.scale = Math.max(0.1, scale);
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        console.log('Image fitted to canvas', { scale: this.scale });
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
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
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
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
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
        this.drawAreaGuide();

        if (this.currentImage) {
            this.drawImage();
        } else {
            // Draw placeholder text
            this.ctx.fillStyle = '#666';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Загрузите изображение', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawImage() {
        if (!this.currentImage) return;
        
        this.ctx.save();
        
        const centerX = this.canvas.width / 2 + this.offsetX;
        const centerY = this.canvas.height / 2 + this.offsetY;
        
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

        // Create simple preview notification
        MiniUtils.showNotification('Предпросмотр готов! Нажмите "Применить" для сохранения', 'info');
        MiniUtils.vibrate([100]);
    }

    applyToPixels() {
        if (!this.currentImage || !this.areaShape) {
            MiniUtils.showNotification('Загрузите изображение', 'error');
            return;
        }

        try {
            // Generate image data for each pixel
            this.selectedPixels.forEach((pixelId, index) => {
                const cellImage = this.generatePixelImage(pixelId);
                
                // Apply to pixel element
                const pixelElement = document.querySelector(`[data-id="${pixelId}"]`);
                if (pixelElement && cellImage) {
                    pixelElement.style.backgroundImage = `url(${cellImage})`;
                    pixelElement.style.backgroundSize = 'cover';
                    pixelElement.style.backgroundPosition = 'center';
                    pixelElement.classList.add('with-image');
                    
                    // Add animation
                    setTimeout(() => {
                        pixelElement.style.animation = 'pulse 0.6s ease-out';
                        setTimeout(() => {
                            pixelElement.style.animation = '';
                        }, 600);
                    }, index * 50);
                }
                
                // Update pixel data in grid
                if (window.miniGrid && window.miniGrid.pixels.has(pixelId)) {
                    const pixelData = window.miniGrid.pixels.get(pixelId);
                    pixelData.imageUrl = cellImage;
                    window.miniGrid.pixels.set(pixelId, pixelData);
                }
            });

            // Save to storage
            if (window.miniGrid) {
                window.miniGrid.savePixelData();
            }

            MiniUtils.showNotification(`Изображение применено к ${this.selectedPixels.length} пикселям!`, 'success');
            MiniUtils.vibrate([100, 50, 100]);
            
            // Close editor after a short delay
            setTimeout(() => {
                this.closeEditor();
            }, 1500);
            
        } catch (error) {
            MiniUtils.handleError(error, 'Apply to pixels');
        }
    }

    generatePixelImage(pixelId) {
        // Create a small canvas for this pixel
        const cellCanvas = document.createElement('canvas');
        const cellCtx = cellCanvas.getContext('2d');
        
        const cellSize = 30; // Size for mobile pixels
        cellCanvas.width = cellSize;
        cellCanvas.height = cellSize;
        
        cellCtx.imageSmoothingEnabled = true;
        cellCtx.imageSmoothingQuality = 'high';
        
        cellCtx.save();
        
        // Calculate pixel position in the selected area
        const pixelIndex = this.selectedPixels.indexOf(pixelId);
        if (pixelIndex === -1) return null;
        
        // Calculate row and column in the selected area
        const col = pixelIndex % this.areaShape.width;
        const row = Math.floor(pixelIndex / this.areaShape.width);
        
        console.log(`Pixel ${pixelId}: index=${pixelIndex}, col=${col}, row=${row}, area=${this.areaShape.width}x${this.areaShape.height}`);
        
        // Set up canvas transformation
        cellCtx.translate(cellSize / 2, cellSize / 2);
        cellCtx.scale(this.scale, this.scale);
        cellCtx.rotate((this.rotation * Math.PI) / 180);
        
        // Calculate the source rectangle from the original image
        const imageWidth = this.currentImage.width;
        const imageHeight = this.currentImage.height;
        
        // Calculate how much of the image each pixel should show
        const pixelWidthInImage = imageWidth / this.areaShape.width;
        const pixelHeightInImage = imageHeight / this.areaShape.height;
        
        // Calculate the source position in the original image
        const sourceX = col * pixelWidthInImage;
        const sourceY = row * pixelHeightInImage;
        
        // Draw the specific part of the image for this pixel
        cellCtx.drawImage(
            this.currentImage,
            sourceX, sourceY, // Source position
            pixelWidthInImage, pixelHeightInImage, // Source size
            -cellSize/2 + this.offsetX/this.scale, -cellSize/2 + this.offsetY/this.scale, // Destination position
            cellSize, cellSize // Destination size
        );
        
        cellCtx.restore();
        
        return cellCanvas.toDataURL('image/png');
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
        this.resetTransform();
        
        if (this.canvas) {
            this.clearCanvas();
        }
        
        this.disableControls();
        
        // Reset file input
        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.value = '';
        }
    }

    // Debug methods
    getState() {
        return {
            isOpen: this.isOpen,
            hasImage: !!this.currentImage,
            selectedPixels: this.selectedPixels.length,
            areaShape: this.areaShape,
            transform: {
                scale: this.scale,
                rotation: this.rotation,
                offset: { x: this.offsetX, y: this.offsetY }
            },
            canvasReady: !!(this.canvas && this.ctx)
        };
    }
}

// Global initialization
window.MiniEditor = MiniEditor;