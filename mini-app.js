// === TELEGRAM WEBAPP COMPATIBILITY ===

// Проверяем совместимость с Telegram WebApp
function checkTelegramCompatibility() {
    if (window.Telegram?.WebApp) {
        console.log('✅ Telegram WebApp detected');
        
        // Настраиваем Telegram WebApp
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Применяем тему Telegram
        if (tg.colorScheme === 'dark') {
            document.body.classList.add('telegram-dark');
        }
        
        // Обрабатываем кнопку назад
        tg.BackButton.onClick(() => {
            if (window.miniApp) {
                window.miniApp.handleEscapeKey();
            }
        });
        
        return true;
    }
    return false;
}

// Инициализируем совместимость при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkTelegramCompatibility);
} else {
    checkTelegramCompatibility();
}

// === MINI APP MAIN ===

class MiniApp {
    constructor() {
        this.grid = null;
        this.modals = null;
        this.channels = null;
        this.editor = null;
        this.wallet = null;
        this.telegramConfig = null;
        
        this.currentMode = 'view';
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing NFTG-ZONIX Mini App...');
            
            // Initialize Telegram WebApp
            this.telegramConfig = MiniUtils.initTelegramWebApp();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize modules
            await this.initializeModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Set initial mode
            this.setMode('view');
            
            // Setup Telegram WebApp specific features
            this.setupTelegramFeatures();
            
            // Update UI with strict styling
            this.updateStrictUI();
            
            // Update grid container height for new bottom bar
            this.updateGridContainerHeight();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ NFTG-ZONIX Mini App initialized successfully!');
            MiniUtils.showNotification('ПРИЛОЖЕНИЕ ГОТОВО К РАБОТЕ!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize Mini App:', error);
            MiniUtils.showNotification('ОШИБКА ИНИЦИАЛИЗАЦИИ ПРИЛОЖЕНИЯ', 'error');
        }
    }

    async initializeModules() {
        console.log('📦 Initializing modules...');
        
        // Initialize grid (core module)
        this.grid = new MiniGrid();
        window.miniGrid = this.grid;
        
        // Initialize modals
        this.modals = new MiniModals();
        window.miniModals = this.modals;
        
        // Initialize channels navigator
        this.channels = new MiniChannels();
        window.miniChannels = this.channels;
        
        // Initialize image editor
        this.editor = new MiniEditor();
        window.miniEditor = this.editor;
        
        // Initialize wallet (after TON Connect UI loads)
        this.initializeWallet();
        
        // Setup cross-module communication
        this.setupModuleCommunication();
        
        console.log('✅ All modules initialized');
    }

    initializeWallet() {
        // Проверяем что TON Connect UI загружен
        const checkTonConnect = () => {
            if (typeof TON_CONNECT_UI !== 'undefined') {
                try {
                    this.wallet = new MiniWallet();
                    window.miniWallet = this.wallet;
                    console.log('✅ Wallet module initialized');
                } catch (error) {
                    console.warn('⚠️ Wallet initialization failed:', error);
                    // Продолжаем работу без кошелька
                }
            } else {
                // Повторяем попытку через 500ms
                setTimeout(checkTonConnect, 500);
            }
        };
        
        checkTonConnect();
    }

    setupModuleCommunication() {
        // Hook grid events to update channels
        const originalPurchasePixel = this.grid.purchasePixel.bind(this.grid);
        this.grid.purchasePixel = (pixelId, data) => {
            originalPurchasePixel(pixelId, data);
            // Update channels after purchase
            this.channels.onPixelPurchased();
            // Update cost display
            this.updateCostDisplay();
        };

        const originalCompleteMassPurchase = this.grid.completeMassPurchase.bind(this.grid);
        this.grid.completeMassPurchase = (purchaseData) => {
            originalCompleteMassPurchase(purchaseData);
            // Update channels after mass purchase
            this.channels.onPixelPurchased();
            // Update cost display
            this.updateCostDisplay();
        };

        // Hook для обновления режимов
        const originalSetMode = this.grid.setMode.bind(this.grid);
        this.grid.setMode = (mode) => {
            originalSetMode(mode);
            this.updateCostDisplay();
            this.updateStrictModeDisplay(mode);
        };

        // Hook для обновления бесшовного режима после применения изображений
        const originalApplyToPixels = this.editor.applyToPixels.bind(this.editor);
        this.editor.applyToPixels = () => {
            originalApplyToPixels();
            // Обновляем бесшовный режим после применения изображений
            setTimeout(() => {
                if (this.grid) {
                    this.grid.updateSeamlessMode();
                }
            }, 100);
        };

        // Setup Telegram WebApp back button handling
        if (this.telegramConfig.isWebApp) {
            try {
                const version = this.telegramConfig.telegram.version;
                if (version && parseFloat(version) >= 6.1) {
                    this.telegramConfig.telegram.onEvent('backButtonClicked', () => {
                        if (this.modals.isModalOpen()) {
                            this.modals.closeAllModals();
                        } else if (this.channels.isOpen) {
                            this.channels.closeSidebar();
                        } else if (this.channels.isMainSidebarOpen) {
                            this.channels.closeMainSidebar();
                        } else if (this.editor.isOpen) {
                            this.editor.closeEditor();
                        } else {
                            this.telegramConfig.telegram.close();
                        }
                    });
                }
            } catch (error) {
                console.log('BackButton not supported in this version');
            }
        }

        console.log('🔗 Module communication setup completed');
    }

    setupEventListeners() {
        // ИСПРАВЛЕНО: Mode switching с проверкой на кнопку "О проекте"
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Проверяем, это кнопка "О проекте" или обычная кнопка режима
                if (tab.id === 'about-mode') {
                    // Для кнопки "О проекте" - открываем модальное окно
                    if (this.modals) {
                        this.modals.showAboutModal();
                    }
                } else {
                    // Для обычных кнопок режима - переключаем режим
                    const mode = tab.dataset.mode;
                    if (mode) {
                        this.setMode(mode);
                    }
                }
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Skip if modal is open
            if (this.modals.isModalOpen() || this.channels.isOpen || this.channels.isMainSidebarOpen || this.editor.isOpen) {
                return;
            }

            switch (e.key) {
                case '1':
                    this.setMode('view');
                    break;
                case '2':
                    this.setMode('buy');
                    break;
                case '3':
                    this.setMode('mass-buy');
                    break;
                case '4':
                    this.setMode('edit');
                    break;
                case 'c':
                case 'C':
                    this.grid.centerGrid();
                    break;
                case 'h':
                case 'H':
                    this.channels.toggleMainSidebar();
                    break;
                case 's':
                case 'S':
                    // Клавиша для переключения бесшовного режима
                    if (this.grid) {
                        const newMode = this.grid.toggleSeamlessMode();
                        MiniUtils.showNotification(
                            `БЕСШОВНЫЙ РЕЖИМ ${newMode ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}`, 
                            'info'
                        );
                    }
                    break;
                case 'w':
                case 'W':
                    // Клавиша для открытия кошелька
                    if (this.wallet) {
                        this.channels.openMainSidebar();
                        setTimeout(() => {
                            document.getElementById('wallet-connect-btn')?.click();
                        }, 300);
                    }
                    break;
                case 'Escape':
                    this.handleEscapeKey();
                    break;
            }
        });

        // Prevent zoom on iOS Safari
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());

        // Handle window resize
        window.addEventListener('resize', MiniUtils.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle visibility change (app backgrounding/foregrounding)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        console.log('👂 Event listeners setup completed');
    }

    setMode(mode) {
        if (!this.isInitialized || this.currentMode === mode) return;

        console.log(`🔄 Switching mode: ${this.currentMode} → ${mode}`);

        // Update grid mode
        this.grid.setMode(mode);
        this.currentMode = mode;

        // Update UI
        document.querySelectorAll('.mode-tab').forEach(tab => {
            // Только для кнопок с data-mode атрибутом
            if (tab.dataset.mode) {
                tab.classList.toggle('active', tab.dataset.mode === mode);
            }
        });

        // Update mode display in header
        this.updateStrictModeDisplay(mode);

        // Special handling for mass-buy mode
        if (mode === 'mass-buy') {
            // Auto-enable mass selection mode
            this.grid.massSelectionEnabled = true;
        }

        // Update cost display
        this.updateCostDisplay();

        // Vibration feedback
        MiniUtils.vibrate([50]);

        console.log(`✅ Mode changed to: ${mode}`);
    }

    updateStrictModeDisplay(mode) {
        const modeDisplay = document.getElementById('mode-display');
        const modeNames = {
            'view': 'ПРОСМОТР',
            'buy': 'ПОКУПКА',
            'mass-buy': 'МАССОВАЯ ПОКУПКА',
            'edit': 'РЕДАКТИРОВАНИЕ'
        };
        if (modeDisplay) {
            modeDisplay.textContent = modeNames[mode] || mode.toUpperCase();
        }
    }

    updateCostDisplay() {
        const costDisplay = document.getElementById('cost-display');
        if (!costDisplay || !this.grid) return;

        let selectedCount = 0;
        let totalCost = 0;

        switch (this.currentMode) {
            case 'buy':
                selectedCount = this.grid.selectedPixels.size;
                break;
            case 'mass-buy':
                selectedCount = this.grid.massSelectedPixels.size;
                break;
            case 'edit':
                selectedCount = this.grid.editSelectedPixels.size;
                break;
        }

        totalCost = selectedCount * 0.01; // 0.01 TON per pixel

        if (selectedCount > 0) {
            costDisplay.textContent = `${totalCost.toFixed(2)} TON`;
            costDisplay.style.color = '#00ff88';
        } else {
            costDisplay.textContent = '0 TON';
            costDisplay.style.color = '#666';
        }
    }

    updateGridContainerHeight() {
        const bottomBar = document.getElementById('bottom-bar');
        const gridContainer = document.getElementById('grid-container');
        
        if (bottomBar && gridContainer) {
            // Используем наблюдатель для отслеживания изменений высоты bottom-bar
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const bottomBarHeight = entry.target.offsetHeight;
                    gridContainer.style.height = `calc(100vh - 60px - ${bottomBarHeight}px)`;
                }
            });
            
            resizeObserver.observe(bottomBar);
        }
    }

    updateStrictUI() {
        // Update all text to uppercase where needed
        const updateTextToUppercase = (selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent && !el.querySelector('span')) {
                    el.textContent = el.textContent.toUpperCase();
                }
            });
        };

        // Update status labels
        updateTextToUppercase('.status-label');
        
        // Update button labels that should be uppercase
        const actionButton = document.getElementById('action-button');
        if (actionButton) {
            actionButton.textContent = actionButton.textContent.toUpperCase();
        }

        // Update user status
        const userStatus = document.getElementById('user-status');
        if (userStatus && userStatus.textContent) {
            userStatus.textContent = userStatus.textContent.toUpperCase();
        }

        console.log('🎨 Strict UI styling applied');
    }

    setupTelegramFeatures() {
        if (!this.telegramConfig.isWebApp) return;

        const { telegram } = this.telegramConfig;

        // Setup main button for actions
        if (telegram.MainButton) {
            telegram.MainButton.hide();
        }

        // Setup theme
        if (this.telegramConfig.theme) {
            this.applyTelegramTheme(this.telegramConfig.theme);
        }

        // Setup closing confirmation
        telegram.enableClosingConfirmation();

        // Setup viewport
        telegram.expand();

        // Handle theme changes
        telegram.onEvent('themeChanged', () => {
            this.applyTelegramTheme(telegram.themeParams);
        });

        // Setup haptic feedback
        this.setupHapticFeedback();

        console.log('📱 Telegram WebApp features setup completed');
    }

    applyTelegramTheme(themeParams) {
        if (!themeParams) return;

        const root = document.documentElement;

        // Apply Telegram theme colors but maintain strict design
        if (themeParams.bg_color) {
            // Don't override our strict color scheme completely
            root.style.setProperty('--tg-bg-color', themeParams.bg_color);
        }
        
        console.log('🎨 Telegram theme applied (strict mode)');
    }

    setupHapticFeedback() {
        if (!this.telegramConfig.isWebApp) return;

        const { telegram } = this.telegramConfig;

        // Override vibrate function to use Telegram's haptic feedback
        const originalVibrate = MiniUtils.vibrate;
        MiniUtils.vibrate = (pattern) => {
            if (telegram.HapticFeedback) {
                if (Array.isArray(pattern) && pattern.length > 0) {
                    if (pattern[0] >= 100) {
                        telegram.HapticFeedback.impactOccurred('heavy');
                    } else if (pattern[0] >= 50) {
                        telegram.HapticFeedback.impactOccurred('medium');
                    } else {
                        telegram.HapticFeedback.impactOccurred('light');
                    }
                } else {
                    telegram.HapticFeedback.impactOccurred('medium');
                }
            } else {
                originalVibrate(pattern);
            }
        };

        console.log('📳 Haptic feedback setup completed');
    }

    handleEscapeKey() {
        // Handle escape key in order of priority
        if (this.modals.isModalOpen()) {
            this.modals.closeAllModals();
        } else if (this.channels.isOpen) {
            this.channels.closeSidebar();
        } else if (this.channels.isMainSidebarOpen) {
            this.channels.closeMainSidebar();
        } else if (this.editor.isOpen) {
            this.editor.closeEditor();
        } else {
            // Clear all selections
            this.grid.clearSelection();
            this.grid.clearMassSelection();
            this.grid.clearEditSelection();
            this.updateCostDisplay();
        }
    }

    handleResize() {
        // Update canvas sizes if needed
        if (this.editor.isOpen && this.editor.canvas) {
            this.editor.setupCanvas();
        }

        // Обновляем высоту контейнера сетки с учетом новой высоты bottom-bar
        this.updateGridContainerHeight();

        // Обновляем бесшовный режим при изменении размера окна
        if (this.grid) {
            setTimeout(() => {
                this.grid.updateSeamlessMode();
            }, 100);
        }

        console.log('📐 Resize handled');
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // App is being backgrounded
            this.onAppBackground();
        } else {
            // App is being foregrounded
            this.onAppForeground();
        }
    }

    onAppBackground() {
        // Save state when app goes to background
        if (this.grid) {
            this.grid.savePixelData();
        }

        console.log('⏸️ App backgrounded');
    }

    onAppForeground() {
        // Refresh data when app comes to foreground
        if (this.channels) {
            this.channels.refreshChannels();
        }

        // Обновляем бесшовный режим при возвращении в приложение
        if (this.grid) {
            setTimeout(() => {
                this.grid.updateSeamlessMode();
            }, 100);
        }

        // Обновляем баланс кошелька
        if (this.wallet && this.wallet.isConnected) {
            this.wallet.loadBalance();
        }

        console.log('▶️ App foregrounded');
    }

    // Public API methods
    getCurrentMode() {
        return this.currentMode;
    }

    getSelectedPixels() {
        if (!this.grid) return [];

        switch (this.currentMode) {
            case 'buy':
                return Array.from(this.grid.selectedPixels);
            case 'mass-buy':
                return Array.from(this.grid.massSelectedPixels);
            case 'edit':
                return Array.from(this.grid.editSelectedPixels);
            default:
                return [];
        }
    }

    clearAllSelections() {
        if (this.grid) {
            this.grid.clearSelection();
            this.grid.clearMassSelection();
            this.grid.clearEditSelection();
            this.updateCostDisplay();
        }
    }

    centerGridOnPixel(pixelId) {
        if (this.grid) {
            const pixelElement = document.querySelector(`[data-id="${pixelId}"]`);
            if (pixelElement) {
                const rect = pixelElement.getBoundingClientRect();
                const containerRect = document.getElementById('grid-container').getBoundingClientRect();
                
                const offsetX = (containerRect.width / 2) - (rect.left + rect.width / 2 - containerRect.left);
                const offsetY = (containerRect.height / 2) - (rect.top + rect.height / 2 - containerRect.top);
                
                this.grid.translateX = offsetX;
                this.grid.translateY = offsetY;
                this.grid.updateGridTransform();
            }
        }
    }

    // Методы для управления бесшовным режимом
    enableSeamlessMode() {
        if (this.grid) {
            this.grid.enableSeamlessMode();
            MiniUtils.showNotification('БЕСШОВНЫЙ РЕЖИМ ВКЛЮЧЕН', 'success');
        }
    }

    disableSeamlessMode() {
        if (this.grid) {
            this.grid.disableSeamlessMode();
            MiniUtils.showNotification('БЕСШОВНЫЙ РЕЖИМ ВЫКЛЮЧЕН', 'info');
        }
    }

    toggleSeamlessMode() {
        if (this.grid) {
            const newMode = this.grid.toggleSeamlessMode();
            MiniUtils.showNotification(
                `БЕСШОВНЫЙ РЕЖИМ ${newMode ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}`, 
                newMode ? 'success' : 'info'
            );
            return newMode;
        }
        return false;
    }

    // Методы для управления кошельком
    connectWallet() {
        if (this.wallet) {
            return this.wallet.connectWallet();
        } else {
            MiniUtils.showNotification('КОШЕЛЕК НЕ ИНИЦИАЛИЗИРОВАН', 'error');
            return Promise.resolve(false);
        }
    }

    disconnectWallet() {
        if (this.wallet) {
            return this.wallet.disconnectWallet();
        }
    }

    getWalletInfo() {
        if (this.wallet) {
            return {
                isConnected: this.wallet.isConnected,
                address: this.wallet.walletAddress,
                balance: this.wallet.balance
            };
        }
        return { isConnected: false, address: null, balance: 0 };
    }

    // Debug and development methods
    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            currentMode: this.currentMode,
            telegram: this.telegramConfig,
            modules: {
                grid: this.grid?.getDebugInfo?.() || 'Not available',
                channels: this.channels?.getDebugInfo?.() || 'Not available',
                editor: this.editor?.getState?.() || 'Not available',
                wallet: this.wallet?.getDebugInfo?.() || 'Not available'
            },
            selectedPixels: this.getSelectedPixels(),
            seamlessMode: this.grid?.seamlessMode || false,
            walletInfo: this.getWalletInfo(),
            performance: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : 'Not available'
            }
        };
    }

    resetApp() {
        if (confirm('СБРОСИТЬ ВСЕ ДАННЫЕ ПРИЛОЖЕНИЯ?')) {
            // Clear all data
            localStorage.clear();
            
            // Disconnect wallet if connected
            if (this.wallet && this.wallet.isConnected) {
                this.wallet.disconnectWallet();
            }
            
            // Reload the page
            window.location.reload();
        }
    }

    exportAppData() {
        const data = {
            pixels: this.grid?.getAllPixels() || {},
            channels: this.channels?.channels || [],
            seamlessMode: this.grid?.seamlessMode || false,
            walletConnected: this.wallet?.isConnected || false,
            exportDate: new Date().toISOString(),
            version: '1.2.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nftg-zonix-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        MiniUtils.showNotification('ДАННЫЕ ЭКСПОРТИРОВАНЫ', 'success');
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
        return result;
    }

    // Error handling
    handleGlobalError(error, context = 'Unknown') {
        console.error(`💥 Global error in ${context}:`, error);
        
        // Проверяем что error существует и имеет message
        const errorMessage = error && error.message ? error.message : 'НЕИЗВЕСТНАЯ ОШИБКА';
        
        // Send error to Telegram if available
        if (this.telegramConfig.isWebApp) {
            try {
                this.telegramConfig.telegram.sendData(JSON.stringify({
                    type: 'error',
                    error: errorMessage,
                    context,
                    timestamp: new Date().toISOString()
                }));
            } catch (e) {
                // Игнорируем ошибки отправки
                console.log('Could not send error data to Telegram');
            }
        }
        
        MiniUtils.showNotification('ПРОИЗОШЛА ОШИБКА', 'error');
    }

    // Wallet integration helpers
    async purchaseWithWallet(pixelId, price) {
        if (!this.wallet) {
            MiniUtils.showNotification('КОШЕЛЕК НЕ ДОСТУПЕН', 'error');
            return false;
        }

        if (!this.wallet.isConnected) {
            MiniUtils.showNotification('ПОДКЛЮЧИТЕ КОШЕЛЕК ДЛЯ ПОКУПКИ', 'error');
            return false;
        }

        try {
            const success = await this.wallet.purchasePixel(pixelId, price);
            return success;
        } catch (error) {
            this.handleGlobalError(error, 'Wallet purchase');
            return false;
        }
    }

    async massPurchaseWithWallet(pixelIds, totalPrice) {
        if (!this.wallet || !this.wallet.isConnected) {
            MiniUtils.showNotification('ПОДКЛЮЧИТЕ КОШЕЛЕК ДЛЯ ПОКУПКИ', 'error');
            return false;
        }

        try {
            const success = await this.wallet.purchasePixel(null, totalPrice);
            return success;
        } catch (error) {
            this.handleGlobalError(error, 'Wallet mass purchase');
            return false;
        }
    }
}

// Global error handlers
window.addEventListener('error', (e) => {
    if (window.miniApp) {
        window.miniApp.handleGlobalError(e.error, 'Global error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    if (window.miniApp) {
        window.miniApp.handleGlobalError(e.reason, 'Unhandled promise rejection');
    }
});

// Initialize app when DOM is ready
function initMiniApp() {
    try {
        window.miniApp = new MiniApp();
        
        // Development helpers
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.debugApp = () => window.miniApp.getDebugInfo();
            window.resetApp = () => window.miniApp.resetApp();
            window.exportApp = () => window.miniApp.exportAppData();
            window.toggleSeamless = () => window.miniApp.toggleSeamlessMode();
            window.enableSeamless = () => window.miniApp.enableSeamlessMode();
            window.disableSeamless = () => window.miniApp.disableSeamlessMode();
            window.connectWallet = () => window.miniApp.connectWallet();
            window.disconnectWallet = () => window.miniApp.disconnectWallet();
            window.walletInfo = () => window.miniApp.getWalletInfo();
            
            console.log('🛠️ Development mode active');
            console.log('Available commands: debugApp(), resetApp(), exportApp(), toggleSeamless(), enableSeamless(), disableSeamless(), connectWallet(), disconnectWallet(), walletInfo()');
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize Mini App:', error);
        alert('ОШИБКА ПРИ ЗАПУСКЕ ПРИЛОЖЕНИЯ: ' + error.message);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMiniApp);
} else {
    initMiniApp();
}