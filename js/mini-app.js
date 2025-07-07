// === MINI APP MAIN ===

class MiniApp {
    constructor() {
        this.grid = null;
        this.modals = null;
        this.channels = null;
        this.editor = null;
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
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ NFTG-ZONIX Mini App initialized successfully!');
            MiniUtils.showNotification('Приложение готово к работе!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize Mini App:', error);
            MiniUtils.showNotification('Ошибка инициализации приложения', 'error');
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
        
        // Setup cross-module communication
        this.setupModuleCommunication();
        
        console.log('✅ All modules initialized');
    }

    setupModuleCommunication() {
        // Hook grid events to update channels
        const originalPurchasePixel = this.grid.purchasePixel.bind(this.grid);
        this.grid.purchasePixel = (pixelId, data) => {
            originalPurchasePixel(pixelId, data);
            // Update channels after purchase
            this.channels.onPixelPurchased();
        };

        const originalCompleteMassPurchase = this.grid.completeMassPurchase.bind(this.grid);
        this.grid.completeMassPurchase = (purchaseData) => {
            originalCompleteMassPurchase(purchaseData);
            // Update channels after mass purchase
            this.channels.onPixelPurchased();
        };

        // Setup Telegram WebApp back button handling
        if (this.telegramConfig.isWebApp) {
            this.telegramConfig.telegram.onEvent('backButtonClicked', () => {
                if (this.modals.isModalOpen()) {
                    this.modals.closeAllModals();
                } else if (this.channels.isOpen) {
                    this.channels.closeSidebar();
                } else if (this.editor.isOpen) {
                    this.editor.closeEditor();
                } else {
                    this.telegramConfig.telegram.close();
                }
            });
        }

        console.log('🔗 Module communication setup completed');
    }

    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                this.setMode(mode);
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Skip if modal is open
            if (this.modals.isModalOpen() || this.channels.isOpen || this.editor.isOpen) {
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
                    this.channels.toggleSidebar();
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
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Special handling for mass-buy mode
        if (mode === 'mass-buy') {
            // Auto-enable mass selection mode
            this.grid.massSelectionEnabled = true;
        }

        // Vibration feedback
        MiniUtils.vibrate([50]);

        console.log(`✅ Mode changed to: ${mode}`);
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

        // Apply Telegram theme colors
        if (themeParams.bg_color) {
            root.style.setProperty('--tg-bg-color', themeParams.bg_color);
        }
        if (themeParams.text_color) {
            root.style.setProperty('--tg-text-color', themeParams.text_color);
        }
        if (themeParams.hint_color) {
            root.style.setProperty('--tg-hint-color', themeParams.hint_color);
        }
        if (themeParams.button_color) {
            root.style.setProperty('--tg-button-color', themeParams.button_color);
        }
        if (themeParams.button_text_color) {
            root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
        }

        console.log('🎨 Telegram theme applied');
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
        } else if (this.editor.isOpen) {
            this.editor.closeEditor();
        } else {
            // Clear all selections
            this.grid.clearSelection();
            this.grid.clearMassSelection();
            this.grid.clearEditSelection();
        }
    }

    handleResize() {
        // Update canvas sizes if needed
        if (this.editor.isOpen && this.editor.canvas) {
            this.editor.setupCanvas();
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

    // Debug and development methods
    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            currentMode: this.currentMode,
            telegram: this.telegramConfig,
            modules: {
                grid: this.grid?.getDebugInfo?.() || 'Not available',
                channels: this.channels?.getDebugInfo?.() || 'Not available',
                editor: this.editor?.getState?.() || 'Not available'
            },
            selectedPixels: this.getSelectedPixels(),
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
        if (confirm('Сбросить все данные приложения?')) {
            // Clear all data
            localStorage.clear();
            
            // Reload the page
            window.location.reload();
        }
    }

    exportAppData() {
        const data = {
            pixels: this.grid?.getAllPixels() || {},
            channels: this.channels?.channels || [],
            exportDate: new Date().toISOString(),
            version: '1.0.0'
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
        MiniUtils.showNotification('Данные экспортированы', 'success');
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
        
        // Send error to Telegram if available
        if (this.telegramConfig.isWebApp) {
            this.telegramConfig.telegram.sendData(JSON.stringify({
                type: 'error',
                error: error.message,
                context,
                timestamp: new Date().toISOString()
            }));
        }
        
        MiniUtils.showNotification('Произошла ошибка', 'error');
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
            
            console.log('🛠️ Development mode active');
            console.log('Available commands: debugApp(), resetApp(), exportApp()');
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize Mini App:', error);
        alert('Ошибка при запуске приложения: ' + error.message);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMiniApp);
} else {
    initMiniApp();
}