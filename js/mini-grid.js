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
        
        this.currentMode = 'view';
        this.currentUser = '@demo_user';
        
        this.init();
    }

    init() {
        this.createGrid();
        this.setupEventListeners();
        this.loadPixelData();
        this.simulateOwnedPixels();
        
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
            
            pixel.addEventListener('click', (e) => this.handlePixelClick(i, e));
            pixel.addEventListener('touchstart', (e) => e.stopPropagation());
            
            gridContainer.appendChild(pixel);
        }
        
        this.updatePixelDisplay();
        console.log(`Created ${this.gridSize * this.gridSize} pixels`);
    }

    setupEventListeners() {
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) return;

        // Mouse events
        gridContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        gridContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        gridContainer.addEventListener('mouseup', () => this.handleMouseUp());
        gridContainer.addEventListener('mouseleave', () => this.handleMouseUp());

        // Touch events
        gridContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        gridContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        gridContainer.addEventListener('touchend', () => this.handleTouchEnd());

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('center')?.addEventListener('click', () => this.centerGrid());

        // Prevent context menu on grid
        gridContainer.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handlePixelClick(pixelId, event) {
        event.stopPropagation();
        
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
        if (e.target.closest('.pixel')) return; // Don't drag when clicking pixels
        
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        
        const container = document.getElementById('grid-container');
        container.style.cursor = 'grabbing';
        
        e.preventDefault();
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
    }

    handleMouseUp() {
        this.isDragging = false;
        
        const container = document.getElementById('grid-container');
        container.style.cursor = 'grab';
    }

    handleTouchStart(e) {
        if (e.target.closest('.pixel')) return;
        
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            this.isDragging = false;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.lastTouchDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
        }
        
        e.preventDefault();
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
        }
        
        e.preventDefault();
    }

    handleTouchEnd() {
        this.isDragging = false;
        this.lastTouchDistance = 0;
    }

    zoomIn() {
        this.scale = Math.min(3, this.scale * 1.2);
        this.updateGridTransform();
        MiniUtils.vibrate([30]);
    }

    zoomOut() {
        this.scale = Math.max(0.5, this.scale * 0.8);
        this.updateGridTransform();
        MiniUtils.vibrate([30]);
    }

    centerGrid() {
        this.translateX = 0;
        this.translateY = 0;
        this.scale = 1;
        this.updateGridTransform();
        MiniUtils.vibrate([50]);
    }

    updateGridTransform() {
        const grid = document.getElementById('pixel-grid');
        if (grid) {
            grid.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
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
        
        // Показываем индикатор режима
        MiniUtils.showModeIndicator(mode);
        
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
        this.savePixelData();
        
        MiniUtils.showNotification(`Куплено ${pixelsToUpdate.length} пикселей!`, 'success');
    }

    updatePixelDisplay() {
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const pixel = document.querySelector(`[data-id="${i}"]`);
            if (!pixel) continue;

            // Удаляем все классы состояния
            pixel.classList.remove('owned', 'selected', 'mass-selected', 'edit-selected', 'with-image');

            // Добавляем соответствующие классы
            if (this.pixels.has(i)) {
                pixel.classList.add('owned');
                
                const data = this.pixels.get(i);
                pixel.title = `Пиксель #${i}\nВладелец: ${data.owner}\nКатегория: ${data.category || 'Не указана'}`;
                
                // Если есть изображение
                if (data.imageUrl) {
                    pixel.style.backgroundImage = `url(${data.imageUrl})`;
                    pixel.classList.add('with-image');
                }
            } else {
                pixel.title = `Пиксель #${i} - Доступен для покупки`;
                pixel.style.backgroundImage = '';
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
        MiniUtils.showNotification('Все данные очищены', 'info');
    }
}

// Глобальная инициализация
window.MiniGrid = MiniGrid;