// === MINI GRID MANAGER ===

class MiniGrid {
    constructor() {
        this.gridSize = 10;
        this.pixels = new Map();
        this.selectedPixels = new Set();
        this.massSelectedPixels = new Set();
        this.editSelectedPixels = new Set();
        
        // Grid transform state
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        
        // Interaction state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.lastTouchDistance = 0;
        
        // New drag mode state
        this.dragMode = false; // Режим перетаскивания
        
        // ДОБАВЛЕНО: Автоматический бесшовный режим
        this.seamlessMode = true;
        
        this.currentMode = 'view';
        this.currentUser = '@demo_user';
        
        this.init();
    }

    init() {
        this.createGrid();
        this.setupEventListeners();
        this.loadPixelData();
        this.simulateOwnedPixels();
        
        // ДОБАВЛЕНО: Автоматически включаем бесшовный режим при загрузке
        setTimeout(() => {
            this.updateSeamlessMode();
        }, 100);
        
        console.log('✅ MiniGrid initialized');
    }

    createGrid() {
        const gridContainer = document.getElementById('pixel-grid');
        if (!gridContainer) {
            console.error('Grid container not found');
            return;
        }
        
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.dataset.id = i;
            pixel.title = `Пиксель #${i}`;
            
            // Обычный клик для выбора пикселя
            pixel.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.dragMode) {
                    this.handlePixelClick(i, e);
                }
            });
            
            // Touch события для мобильных
            pixel.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.dragMode && !this.isDragging) {
                    // Обычный тап - обрабатываем как клик
                    this.handlePixelClick(i, e);
                }
            });
            
            gridContainer.appendChild(pixel);
        }
        
        this.updatePixelDisplay();
        console.log(`Created ${this.gridSize * this.gridSize} pixels`);
    }

    setupEventListeners() {
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) return;

        // Mouse events для контейнера сетки
        gridContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        gridContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        gridContainer.addEventListener('mouseup', () => this.handleMouseUp());
        gridContainer.addEventListener('mouseleave', () => this.handleMouseUp());

        // Touch events для контейнера сетки
        gridContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        gridContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        gridContainer.addEventListener('touchend', () => this.handleTouchEnd(), { passive: false });

        // Zoom controls - исправляем для мобильных
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const centerBtn = document.getElementById('center');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.zoomIn();
            });
            zoomInBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.zoomIn();
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.zoomOut();
            });
            zoomOutBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.zoomOut();
            });
        }

        if (centerBtn) {
            centerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.centerGrid();
            });
            centerBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.centerGrid();
            });
        }

        // Добавляем кнопку руки в плавающие элементы управления
        this.addDragModeButton();

        // Prevent context menu on grid
        gridContainer.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    addDragModeButton() {
        const controlsContainer = document.querySelector('.floating-controls');
        if (!controlsContainer) return;

        const dragBtn = document.createElement('button');
        dragBtn.className = 'control-btn drag-mode-btn';
        dragBtn.id = 'drag-mode-btn';
        dragBtn.innerHTML = '✋';
        dragBtn.title = 'Режим перетаскивания';
        
        // Добавляем кнопку после кнопки центрирования
        const centerBtn = document.getElementById('center');
        if (centerBtn && centerBtn.parentNode) {
            centerBtn.parentNode.insertBefore(dragBtn, centerBtn.nextSibling);
        } else {
            controlsContainer.appendChild(dragBtn);
        }

        // Обработчики событий для кнопки руки
        dragBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDragMode();
        });
        
        dragBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDragMode();
        });
    }

    toggleDragMode() {
        this.dragMode = !this.dragMode;
        const dragBtn = document.getElementById('drag-mode-btn');
        const gridContainer = document.getElementById('grid-container');
        
        if (this.dragMode) {
            // Включаем режим перетаскивания
            dragBtn.classList.add('active');
            dragBtn.innerHTML = '✊';
            dragBtn.title = 'Выключить режим перетаскивания';
            if (gridContainer) {
                gridContainer.style.cursor = 'grab';
            }
            MiniUtils.showNotification('Режим перетаскивания включен', 'info');
        } else {
            // Выключаем режим перетаскивания
            dragBtn.classList.remove('active');
            dragBtn.innerHTML = '✋';
            dragBtn.title = 'Режим перетаскивания';
            if (gridContainer) {
                gridContainer.style.cursor = 'default';
            }
            MiniUtils.showNotification('Режим перетаскивания выключен', 'info');
        }
        
        MiniUtils.vibrate([50]);
    }

    handlePixelClick(pixelId, event) {
        // Вибрация для тактильной обратной связи
        MiniUtils.vibrate([50]);
        
        switch (this.currentMode) {
            case 'view':
                this.handleViewMode(pixelId);
                break;
            case 'buy':
                this.handleBuyMode(pixelId, event);
                break;
            case 'mass-buy':
                this.handleMassBuyMode(pixelId, event);
                break;
            case 'edit':
                this.handleEditMode(pixelId);
                break;
        }
    }

    handleViewMode(pixelId) {
        // В режиме просмотра показываем информацию о пикселе
        if (this.pixels.has(pixelId)) {
            if (window.miniModals) {
                window.miniModals.showPixelInfo(pixelId, this.pixels.get(pixelId));
            }
        }
    }

    handleBuyMode(pixelId, event) {
        if (this.pixels.has(pixelId)) {
            // Показать информацию о купленном пикселе
            this.handleViewMode(pixelId);
            return;
        }

        // Для свободных пикселей - выбираем и показываем кнопку покупки
        if (event.ctrlKey || event.metaKey) {
            // Multi-select с Ctrl/Cmd
            this.togglePixelSelection(pixelId);
        } else {
            // Одиночный выбор
            this.clearSelection();
            this.selectedPixels.add(pixelId);
        }
        
        this.updatePixelDisplay();
        this.showActionButton('buy');
        this.updateStatusInfo();
    }

    handleMassBuyMode(pixelId, event) {
        if (this.pixels.has(pixelId)) {
            // Показать информацию о купленном пикселе
            this.handleViewMode(pixelId);
            return;
        }

        // Массовое выделение
        if (event.ctrlKey || event.metaKey) {
            this.toggleMassPixelSelection(pixelId);
        } else if (event.shiftKey && this.massSelectedPixels.size > 0) {
            this.selectMassPixelRange(pixelId);
        } else {
            this.toggleMassPixelSelection(pixelId);
        }
        
        this.updatePixelDisplay();
        this.showActionButton('mass-buy');
        this.updateStatusInfo();
    }

    handleEditMode(pixelId) {
        const pixel = this.pixels.get(pixelId);
        if (!pixel || pixel.owner !== this.currentUser) {
            MiniUtils.showNotification('Можно редактировать только свои пиксели', 'info');
            return;
        }

        // Автоматический выбор связанной области
        this.autoSelectEditArea(pixelId);
        this.updatePixelDisplay();
        this.showActionButton('edit');
        this.updateStatusInfo();
    }

    togglePixelSelection(pixelId) {
        if (this.selectedPixels.has(pixelId)) {
            this.selectedPixels.delete(pixelId);
        } else {
            this.selectedPixels.add(pixelId);
        }
    }

    toggleMassPixelSelection(pixelId) {
        if (this.massSelectedPixels.has(pixelId)) {
            this.massSelectedPixels.delete(pixelId);
        } else {
            this.massSelectedPixels.add(pixelId);
        }
    }

    selectMassPixelRange(endPixelId) {
        const selectedArray = Array.from(this.massSelectedPixels);
        if (selectedArray.length === 0) return;

        const startPixelId = selectedArray[selectedArray.length - 1];
        const minId = Math.min(startPixelId, endPixelId);
        const maxId = Math.max(startPixelId, endPixelId);

        for (let i = minId; i <= maxId; i++) {
            if (!this.pixels.has(i)) {
                this.massSelectedPixels.add(i);
            }
        }
    }

    autoSelectEditArea(startPixelId) {
        this.clearEditSelection();
        
        // Находим все собственные пиксели
        const ownedPixels = Array.from(this.pixels.keys())
            .filter(id => this.pixels.get(id).owner === this.currentUser);
        
        // Находим связанную группу с выбранным пикселем
        const groups = MiniUtils.findConnectedGroups(ownedPixels, this.gridSize);
        const targetGroup = groups.find(group => group.includes(startPixelId));
        
        if (targetGroup) {
            targetGroup.forEach(id => this.editSelectedPixels.add(id));
        } else {
            // Если пиксель не в группе, выбираем только его
            this.editSelectedPixels.add(startPixelId);
        }
    }

    clearSelection() {
        this.selectedPixels.clear();
        this.hideActionButton();
    }

    clearMassSelection() {
        this.massSelectedPixels.clear();
        this.hideActionButton();
    }

    clearEditSelection() {
        this.editSelectedPixels.clear();
        this.hideActionButton();
    }

    // Grid manipulation methods
    handleMouseDown(e) {
        // Проверяем режим перетаскивания или клик не на пикселе
        if (this.dragMode || !e.target.closest('.pixel')) {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            
            const container = document.getElementById('grid-container');
            if (container) {
                container.style.cursor = 'grabbing';
            }
            
            e.preventDefault();
            e.stopPropagation();
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastX;
        const deltaY = e.clientY - this.lastY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        
        this.updateGridTransform();
        
        e.preventDefault();
        e.stopPropagation();
    }

    handleMouseUp() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        const container = document.getElementById('grid-container');
        if (container) {
            container.style.cursor = this.dragMode ? 'grab' : 'default';
        }
    }

    handleTouchStart(e) {
        // Проверяем режим перетаскивания или касание не на пикселе
        if (this.dragMode || !e.target.closest('.pixel')) {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.lastX = e.touches[0].clientX;
                this.lastY = e.touches[0].clientY;
                e.preventDefault();
                e.stopPropagation();
            } else if (e.touches.length === 2) {
                this.isDragging = false;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                this.lastTouchDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 1 && this.isDragging) {
            const deltaX = e.touches[0].clientX - this.lastX;
            const deltaY = e.touches[0].clientY - this.lastY;
            
            this.translateX += deltaX;
            this.translateY += deltaY;
            
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            
            this.updateGridTransform();
            e.preventDefault();
            e.stopPropagation();
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            
            if (this.lastTouchDistance > 0) {
                const scaleFactor = distance / this.lastTouchDistance;
                this.scale = Math.max(0.5, Math.min(3, this.scale * scaleFactor));
                this.updateGridTransform();
            }
            
            this.lastTouchDistance = distance;
            e.preventDefault();
            e.stopPropagation();
        }
    }

    handleTouchEnd() {
        this.isDragging = false;
        this.lastTouchDistance = 0;
    }

    zoomIn() {
        this.scale = Math.min(3, this.scale * 1.2);
        this.updateGridTransform();
        MiniUtils.vibrate([30]);
        console.log('Zoom in:', this.scale);
    }

    zoomOut() {
        this.scale = Math.max(0.5, this.scale * 0.8);
        this.updateGridTransform();
        MiniUtils.vibrate([30]);
        console.log('Zoom out:', this.scale);
    }

    centerGrid() {
        console.log('Centering grid...');
        
        // Сбрасываем трансформацию к исходному состоянию
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        
        // Анимация центрирования
        this.animateToTransform(0, 0, 1);
        MiniUtils.vibrate([50]);
        console.log('Grid centered to:', { x: this.translateX, y: this.translateY, scale: this.scale });
    }

    // Новый метод для плавной анимации трансформации
    animateToTransform(targetX, targetY, targetScale, duration = 300) {
        const startX = this.translateX;
        const startY = this.translateY;
        const startScale = this.scale;
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Функция плавности (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.translateX = startX + (targetX - startX) * easeOut;
            this.translateY = startY + (targetY - startY) * easeOut;
            this.scale = startScale + (targetScale - startScale) * easeOut;
            
            this.updateGridTransform();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateGridTransform() {
        const grid = document.getElementById('pixel-grid');
        if (grid) {
            // ИСПРАВЛЕНО: Правильное центрирование относительно центра сетки
            grid.style.transformOrigin = '50% 50%'; // Центр сетки
            grid.style.transform = `translate(calc(-50% + ${this.translateX}px), calc(-50% + ${this.translateY}px)) scale(${this.scale})`;
        }
    }

    // Mode management
    setMode(mode) {
        // Очищаем все выделения при смене режима
        this.clearSelection();
        this.clearMassSelection();
        this.clearEditSelection();
        
        this.currentMode = mode;
        this.updatePixelDisplay();
        this.updateStatusInfo();
        
        // Обновляем отображение режима в шапке
        MiniUtils.updateModeDisplay(mode);
        
        console.log(`Mode changed to: ${mode}`);
    }

    // Action button management
    showActionButton(type) {
        const container = document.getElementById('action-button-container');
        const button = document.getElementById('action-button');
        
        if (!container || !button) return;
        
        // Определяем текст и стиль кнопки
        let buttonText = 'Действие';
        let buttonClass = 'buy-mode';
        
        switch (type) {
            case 'buy':
                const selectedCount = this.selectedPixels.size;
                buttonText = selectedCount > 1 ? `Купить ${selectedCount} пикселей` : 'Купить пиксель';
                buttonClass = 'buy-mode';
                break;
            case 'mass-buy':
                const massCount = this.massSelectedPixels.size;
                buttonText = `Купить ${massCount} пикселей`;
                buttonClass = 'mass-buy-mode';
                break;
            case 'edit':
                const editCount = this.editSelectedPixels.size;
                buttonText = editCount > 1 ? 'Редактировать область' : 'Редактировать пиксель';
                buttonClass = 'edit-mode';
                break;
        }
        
        button.textContent = buttonText;
        button.className = `action-button ${buttonClass}`;
        container.classList.add('show');
        
        // Добавляем обработчик клика
        button.onclick = () => this.handleActionButtonClick(type);
    }

    hideActionButton() {
        const container = document.getElementById('action-button-container');
        if (container) {
            container.classList.remove('show');
        }
    }

    handleActionButtonClick(type) {
        switch (type) {
            case 'buy':
                if (this.selectedPixels.size === 1) {
                    const pixelId = Array.from(this.selectedPixels)[0];
                    if (window.miniModals) {
                        window.miniModals.showPurchaseModal(pixelId, 5);
                    }
                } else if (this.selectedPixels.size > 1) {
                    if (window.miniModals) {
                        window.miniModals.showMassPurchaseModal(this.selectedPixels, 5);
                    }
                }
                break;
            case 'mass-buy':
                if (window.miniModals) {
                    window.miniModals.showMassPurchaseModal(this.massSelectedPixels, 5);
                }
                break;
            case 'edit':
                if (window.miniEditor) {
                    window.miniEditor.openEditor(Array.from(this.editSelectedPixels));
                }
                break;
        }
    }

    // Pixel data management
    purchasePixel(pixelId, data) {
        try {
            this.pixels.set(pixelId, {
                ...data,
                purchaseDate: new Date().toISOString(),
                price: 5,
                pixelId
            });

            // Анимация покупки
            const pixelElement = document.querySelector(`[data-id="${pixelId}"]`);
            if (pixelElement) {
                pixelElement.style.animation = 'pulse 0.6s ease-out';
                setTimeout(() => {
                    pixelElement.style.animation = '';
                }, 600);
            }

            this.updatePixelDisplay();
            this.updateStatusInfo();
            
            // ДОБАВЛЕНО: Обновляем бесшовный режим после покупки
            this.updateSeamlessMode();
            
            // Сохранение в localStorage
            this.savePixelData();
            
            console.log(`Pixel ${pixelId} purchased`);
        } catch (error) {
            MiniUtils.handleError(error, 'Purchase pixel');
        }
    }

    completeMassPurchase(purchaseData) {
        const pixelsToUpdate = this.currentMode === 'buy' 
            ? Array.from(this.selectedPixels)
            : Array.from(this.massSelectedPixels);
        
        pixelsToUpdate.forEach(pixelId => {
            this.pixels.set(pixelId, {
                ...purchaseData,
                purchaseDate: new Date().toISOString(),
                price: 5,
                pixelId,
                isMassPurchase: true
            });

            // Анимация с задержкой
            setTimeout(() => {
                const pixelElement = document.querySelector(`[data-id="${pixelId}"]`);
                if (pixelElement) {
                    pixelElement.style.animation = 'pulse 0.6s ease-out';
                    setTimeout(() => {
                        pixelElement.style.animation = '';
                    }, 600);
                }
            }, Math.random() * 1000);
        });

        // Очищаем выделения
        this.clearSelection();
        this.clearMassSelection();
        
        this.updatePixelDisplay();
        this.updateStatusInfo();
        
        // ДОБАВЛЕНО: Обновляем бесшовный режим после массовой покупки
        this.updateSeamlessMode();
        
        this.savePixelData();
        
        MiniUtils.showNotification(`Куплено ${pixelsToUpdate.length} пикселей!`, 'success');
    }

    // ИСПРАВЛЕНО: Упрощенный updatePixelDisplay без обводки
    updatePixelDisplay() {
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const pixel = document.querySelector(`[data-id="${i}"]`);
            if (!pixel) continue;

            // УПРОЩЕНО: Удаляем только основные классы состояния
            pixel.classList.remove('owned', 'selected', 'mass-selected', 'edit-selected', 'with-image');
            
            // ИСПРАВЛЕНО: Сбрасываем стили фона
            pixel.style.backgroundImage = '';
            pixel.style.backgroundColor = '';

            // Добавляем соответствующие классы
            if (this.pixels.has(i)) {
                const data = this.pixels.get(i);
                pixel.classList.add('owned');
                
                pixel.title = `Пиксель #${i}\nВладелец: ${data.owner}\nКатегория: ${data.category || 'Не указана'}`;
                
                // ИСПРАВЛЕНО: Если есть изображение, устанавливаем его правильно
                if (data.imageUrl) {
                    pixel.style.backgroundImage = `url("${data.imageUrl}")`;
                    pixel.classList.add('with-image');
                    console.log(`Applied image to pixel ${i}:`, data.imageUrl.substring(0, 50) + '...');
                }
            } else {
                pixel.title = `Пиксель #${i} - Доступен для покупки`;
                // Возвращаем базовый стиль для пустых пикселей
                pixel.style.backgroundColor = '#1a1a1a';
            }
            
            if (this.selectedPixels.has(i)) {
                pixel.classList.add('selected');
            }
            
            if (this.massSelectedPixels.has(i)) {
                pixel.classList.add('mass-selected');
            }
            
            if (this.editSelectedPixels.has(i)) {
                pixel.classList.add('edit-selected');
            }
        }

        // УПРОЩЕНО: Просто обновляем бесшовный режим
        setTimeout(() => {
            this.updateSeamlessMode();
        }, 50);
    }

    // УПРОЩЕНО: Простой бесшовный режим без обводки
    updateSeamlessMode() {
        const grid = document.getElementById('pixel-grid');
        if (!grid) return;

        // Находим все пиксели с изображениями
        const imagePixels = [];
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const pixelData = this.pixels.get(i);
            if (pixelData && pixelData.imageUrl) {
                imagePixels.push(i);
            }
        }

        console.log('Found image pixels:', imagePixels);

        if (imagePixels.length > 0) {
            // Включаем бесшовный режим если есть изображения
            grid.classList.add('seamless');
            console.log('Seamless mode enabled with', imagePixels.length, 'image pixels');
        } else {
            // Выключаем бесшовный режим если нет изображений
            grid.classList.remove('seamless');
            console.log('Seamless mode disabled - no image pixels');
        }
    }

    // ДОБАВЛЕНО: Удаление всех обводок групп (оставляем пустой метод для совместимости)
    removeAllGroupBorders() {
        // Метод оставлен для совместимости, но больше ничего не делает
        console.log('Group borders removed (simplified)');
    }

    updateStatusInfo() {
        const ownedCount = Array.from(this.pixels.keys())
            .filter(id => this.pixels.get(id).owner === this.currentUser).length;
        
        let selectedCount = 0;
        switch (this.currentMode) {
            case 'buy':
                selectedCount = this.selectedPixels.size;
                break;
            case 'mass-buy':
                selectedCount = this.massSelectedPixels.size;
                break;
            case 'edit':
                selectedCount = this.editSelectedPixels.size;
                break;
        }

        const ownedElement = document.getElementById('owned-count');
        const selectedElement = document.getElementById('selected-count');
        
        if (ownedElement) ownedElement.textContent = `${ownedCount}/100`;
        if (selectedElement) selectedElement.textContent = selectedCount;
    }

    savePixelData() {
        MiniUtils.saveToStorage('nftg-zonix-mini-pixels', Object.fromEntries(this.pixels));
    }

    loadPixelData() {
        const saved = MiniUtils.loadFromStorage('nftg-zonix-mini-pixels', {});
        this.pixels = new Map(Object.entries(saved).map(([id, data]) => [parseInt(id), data]));
        this.updatePixelDisplay();
        this.updateStatusInfo();
        
        // ДОБАВЛЕНО: Обновляем бесшовный режим после загрузки данных
        setTimeout(() => {
            this.updateSeamlessMode();
        }, 100);
    }

    simulateOwnedPixels() {
        // Создаем демо-данные только если нет сохраненных данных
        if (this.pixels.size === 0) {
            const demoPixels = [11, 12, 21, 22]; // 2x2 квадрат
            
            demoPixels.forEach(id => {
                this.pixels.set(id, {
                    owner: this.currentUser,
                    purchaseDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    channel: '@demo_channel',
                    telegramLink: 'https://t.me/demo_channel',
                    category: 'Демо',
                    description: 'Демо-пиксель для тестирования',
                    price: 5
                });
            });

            this.updatePixelDisplay();
            this.savePixelData();
            console.log('Created demo pixels');
        }
    }

    // Utility methods
    getOwnedPixels() {
        return Array.from(this.pixels.keys())
            .filter(id => this.pixels.get(id).owner === this.currentUser);
    }

    getPixelData(pixelId) {
        return this.pixels.get(pixelId) || null;
    }

    getAllPixels() {
        return Object.fromEntries(this.pixels);
    }

    clearAllData() {
        this.pixels.clear();
        this.clearSelection();
        this.clearMassSelection();
        this.clearEditSelection();
        localStorage.removeItem('nftg-zonix-mini-pixels');
        this.updatePixelDisplay();
        this.updateStatusInfo();
        this.updateSeamlessMode();
        MiniUtils.showNotification('Все данные очищены', 'info');
    }

    // Метод для центрирования на конкретном пикселе
    centerOnPixel(pixelId) {
        const pixelElement = document.querySelector(`[data-id="${pixelId}"]`);
        const container = document.getElementById('grid-container');
        
        if (!pixelElement || !container) return;
        
        const containerRect = container.getBoundingClientRect();
        const pixelRect = pixelElement.getBoundingClientRect();
        
        // Вычисляем необходимое смещение для центрирования пикселя
        const targetX = (containerRect.width / 2) - (pixelRect.left + pixelRect.width / 2 - containerRect.left);
        const targetY = (containerRect.height / 2) - (pixelRect.top + pixelRect.height / 2 - containerRect.top);
        
        // Анимируем к новой позиции
        this.animateToTransform(targetX, targetY, this.scale);
    }

    // ДОБАВЛЕНО: Публичные методы для управления бесшовным режимом
    enableSeamlessMode() {
        this.seamlessMode = true;
        this.updateSeamlessMode();
        console.log('Seamless mode enabled');
    }

    disableSeamlessMode() {
        this.seamlessMode = false;
        const grid = document.getElementById('pixel-grid');
        if (grid) {
            grid.classList.remove('seamless');
        }
        this.removeAllGroupBorders();
        console.log('Seamless mode disabled');
    }

    toggleSeamlessMode() {
        if (this.seamlessMode) {
            this.disableSeamlessMode();
        } else {
            this.enableSeamlessMode();
        }
        return this.seamlessMode;
    }

    // Debug method
    getDebugInfo() {
        return {
            gridSize: this.gridSize,
            pixelCount: this.pixels.size,
            seamlessMode: this.seamlessMode,
            transform: {
                scale: this.scale,
                translateX: this.translateX,
                translateY: this.translateY
            },
            selections: {
                normal: this.selectedPixels.size,
                mass: this.massSelectedPixels.size,
                edit: this.editSelectedPixels.size
            },
            mode: this.currentMode,
            isDragging: this.isDragging,
            dragMode: this.dragMode,
            imagePixels: Array.from(this.pixels.keys()).filter(id => this.pixels.get(id).imageUrl).length
        };
    }
}

// Глобальная инициализация
window.MiniGrid = MiniGrid;