// === MINI WALLET MANAGER ===

class MiniWallet {
    constructor() {
        this.tonConnect = null;
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        this.isTestnet = true; // Для тестирования
        
        this.init();
    }

    async init() {
        try {
            // Проверяем что TON Connect UI не был уже инициализирован
            if (window.tonConnectInstance) {
                console.log('Using existing TON Connect instance');
                this.tonConnect = window.tonConnectInstance;
            } else {
                // Инициализация TON Connect UI только один раз
                this.tonConnect = new TON_CONNECT_UI.TonConnectUI({
                    manifestUrl: this.getManifestUrl(),
                    uiPreferences: {
                        theme: 'DARK',
                        colorsSet: {
                            [TON_CONNECT_UI.THEME.DARK]: {
                                connectButton: {
                                    background: '#00D4FF',
                                    foreground: '#000000'
                                }
                            }
                        }
                    }
                });
                
                // Сохраняем инстанс глобально
                window.tonConnectInstance = this.tonConnect;
            }

            // Добавляем кнопку подключения
            this.createConnectButton();
            
            // Слушаем изменения состояния
            this.setupEventListeners();
            
            // Проверяем существующее подключение
            this.checkExistingConnection();
            
            console.log('✅ TON Wallet initialized');
        } catch (error) {
            console.error('❌ Failed to initialize TON wallet:', error);
            
            // Если ошибка связана с уже существующим компонентом, пробуем демо режим
            if (error.message.includes('already been used') || error.message.includes('tc-root')) {
                console.log('🔄 TON Connect already initialized, switching to demo mode');
                this.initDemoMode();
            } else {
                this.handleWalletError(error);
            }
        }
    }

    initDemoMode() {
        console.log('🧪 Initializing demo wallet mode');
        
        // Создаем кнопку подключения
        this.createConnectButton();
        
        // В демо режиме сразу показываем как подключенный
        setTimeout(() => {
            this.forceConnect();
        }, 1000);
        
        MiniUtils.showNotification('Демо режим кошелька активирован', 'info');
    }

    getManifestUrl() {
        // В продакшене заменить на реальный URL
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';
        }
        return 'https://your-domain.com/tonconnect-manifest.json';
    }

    createConnectButton() {
        // Добавляем кнопку кошелька в главное меню
        const menuItems = document.querySelector('.menu-items');
        if (!menuItems) return;

        // Проверяем что кнопка еще не создана
        if (document.getElementById('wallet-connect-btn')) {
            return;
        }

        const walletButton = document.createElement('button');
        walletButton.className = 'menu-item wallet-connect-item';
        walletButton.id = 'wallet-connect-btn';
        walletButton.innerHTML = `
            <span class="menu-icon">👛</span>
            <span class="menu-text">
                <div class="menu-title" id="wallet-title">Подключить кошелек</div>
                <div class="menu-subtitle" id="wallet-subtitle">TON кошелек для покупок</div>
            </span>
            <span class="menu-arrow">→</span>
        `;

        // Вставляем перед кнопкой верификации
        const verificationBtn = document.getElementById('verification-btn');
        if (verificationBtn) {
            menuItems.insertBefore(walletButton, verificationBtn);
        } else {
            menuItems.appendChild(walletButton);
        }

        walletButton.addEventListener('click', () => this.handleWalletClick());
    }

    setupEventListeners() {
        if (this.tonConnect) {
            // Слушаем изменения подключения
            this.tonConnect.onStatusChange((wallet) => {
                if (wallet) {
                    this.onWalletConnected(wallet);
                } else {
                    this.onWalletDisconnected();
                }
            });
        }

        // Обновляем кнопки покупки при подключении кошелька
        const originalShowActionButton = window.miniGrid?.showActionButton?.bind(window.miniGrid);
        if (originalShowActionButton) {
            window.miniGrid.showActionButton = (type) => {
                originalShowActionButton(type);
                this.updateActionButtonForWallet(type);
            };
        }

        // Интегрируемся с модалами покупки
        setTimeout(() => {
            this.enhancePurchaseModals();
        }, 1000);
    }

    async checkExistingConnection() {
        try {
            if (this.tonConnect) {
                const currentWallet = this.tonConnect.wallet;
                if (currentWallet?.account?.address) {
                    this.onWalletConnected(currentWallet);
                }
            }
        } catch (error) {
            console.log('No existing wallet connection');
        }
    }

    async handleWalletClick() {
        if (this.isConnected) {
            // Показываем меню кошелька
            this.showWalletMenu();
        } else {
            // Подключаем кошелек
            await this.connectWallet();
        }
    }

    async connectWallet() {
        try {
            if (!this.tonConnect) {
                // Если TON Connect недоступен, используем демо режим
                this.forceConnect();
                return;
            }

            MiniUtils.showNotification('Подключение кошелька...', 'info');
            
            // Открываем модальное окно подключения
            await this.tonConnect.openModal();
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            MiniUtils.showNotification('Ошибка подключения кошелька', 'error');
        }
    }

    async disconnectWallet() {
        try {
            if (this.tonConnect) {
                await this.tonConnect.disconnect();
            } else {
                // Для демо режима
                this.onWalletDisconnected();
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    }

    onWalletConnected(wallet) {
        this.isConnected = true;
        this.walletAddress = wallet?.account?.address || "UQDemoWalletAddressForTestingPurposes123456789";
        
        // Обновляем UI
        this.updateWalletButton(true);
        this.updateStatusInfo();
        
        // Загружаем баланс
        this.loadBalance();
        
        MiniUtils.showNotification('Кошелек подключен!', 'success');
        MiniUtils.vibrate([100, 50, 100]);
        
        console.log('Wallet connected:', this.walletAddress);
    }

    onWalletDisconnected() {
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        
        // Обновляем UI
        this.updateWalletButton(false);
        this.updateStatusInfo();
        
        MiniUtils.showNotification('Кошелек отключен', 'info');
        
        console.log('Wallet disconnected');
    }

    updateWalletButton(connected) {
        const walletTitle = document.getElementById('wallet-title');
        const walletSubtitle = document.getElementById('wallet-subtitle');
        const walletButton = document.getElementById('wallet-connect-btn');

        if (connected) {
            if (walletTitle) walletTitle.textContent = 'TON Кошелек';
            if (walletSubtitle) walletSubtitle.textContent = this.formatAddress(this.walletAddress);
            if (walletButton) walletButton.classList.add('connected');
        } else {
            if (walletTitle) walletTitle.textContent = 'Подключить кошелек';
            if (walletSubtitle) walletSubtitle.textContent = 'TON кошелек для покупок';
            if (walletButton) walletButton.classList.remove('connected');
        }
    }

    updateStatusInfo() {
        // Добавляем информацию о балансе в статус бар
        let balanceElement = document.getElementById('wallet-balance');
        
        if (!balanceElement) {
            balanceElement = document.createElement('div');
            balanceElement.id = 'wallet-balance';
            balanceElement.className = 'status-item';
            balanceElement.innerHTML = `
                <span class="status-label">Баланс:</span>
                <span class="status-value" id="balance-value">-</span>
            `;
            
            const statusInfo = document.querySelector('.status-info');
            if (statusInfo) {
                statusInfo.appendChild(balanceElement);
            }
        }

        const balanceValue = document.getElementById('balance-value');
        if (balanceValue) {
            if (this.isConnected) {
                balanceValue.textContent = `${this.balance.toFixed(2)} TON`;
                balanceValue.style.color = this.balance > 0 ? '#00FF88' : '#FFB800';
            } else {
                balanceValue.textContent = '-';
                balanceValue.style.color = '#666';
            }
        }
    }

    updateActionButtonForWallet(type) {
        const actionButton = document.getElementById('action-button');
        if (!actionButton || !this.isConnected) return;

        // Добавляем индикатор TON к кнопке покупки
        const currentText = actionButton.textContent;
        if (!currentText.includes('💎')) {
            const originalHTML = actionButton.innerHTML;
            actionButton.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>💎</span>
                    <span>${currentText}</span>
                </div>
            `;
        }
    }

    async loadBalance() {
        try {
            if (!this.walletAddress) return;

            // Для тестирования используем mock баланс
            if (this.isTestnet) {
                this.balance = 100 + Math.random() * 50; // 100-150 TON для теста
                this.updateStatusInfo();
                return;
            }

            // В продакшене здесь будет реальный запрос к API TON
            // const response = await fetch(`https://tonapi.io/v2/accounts/${this.walletAddress}`);
            // const data = await response.json();
            // this.balance = data.balance / 1000000000; // Convert from nanoTON
            
        } catch (error) {
            console.error('Failed to load balance:', error);
            this.balance = 0;
            this.updateStatusInfo();
        }
    }

    showWalletMenu() {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'TON Кошелек',
                message: `Адрес: ${this.formatAddress(this.walletAddress)}\nБаланс: ${this.balance.toFixed(2)} TON`,
                buttons: [
                    { id: 'copy', type: 'default', text: 'Копировать адрес' },
                    { id: 'disconnect', type: 'destructive', text: 'Отключить' },
                    { type: 'cancel' }
                ]
            }, (buttonId) => {
                this.handleWalletMenuAction(buttonId);
            });
        } else {
            // Fallback для браузера
            const action = prompt(`TON Кошелек\nАдрес: ${this.formatAddress(this.walletAddress)}\nБаланс: ${this.balance.toFixed(2)} TON\n\nВведите 'copy' для копирования или 'disconnect' для отключения:`);
            if (action) {
                this.handleWalletMenuAction(action);
            }
        }
    }

    handleWalletMenuAction(action) {
        switch (action) {
            case 'copy':
                MiniUtils.copyToClipboard(this.walletAddress);
                MiniUtils.showNotification('Адрес скопирован', 'success');
                break;
            case 'disconnect':
                this.disconnectWallet();
                break;
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

    // Методы для покупки (интеграция с существующими модалами)
    async purchasePixel(pixelId, price) {
        if (!this.isConnected) {
            MiniUtils.showNotification('Подключите кошелек для покупки', 'error');
            return false;
        }

        if (this.balance < price) {
            MiniUtils.showNotification('Недостаточно средств', 'error');
            return false;
        }

        try {
            // В продакшене здесь будет реальная транзакция
            if (this.isTestnet) {
                return await this.mockTransaction(price);
            }

            // Реальная транзакция TON
            // const transaction = await this.sendTransaction(price);
            // return transaction.success;

        } catch (error) {
            console.error('Purchase failed:', error);
            MiniUtils.showNotification('Ошибка покупки', 'error');
            return false;
        }
    }

    async mockTransaction(amount) {
        // Имитация транзакции для тестирования
        return new Promise((resolve) => {
            MiniUtils.showNotification('Обработка платежа...', 'info');
            
            setTimeout(() => {
                this.balance -= amount;
                this.updateStatusInfo();
                MiniUtils.showNotification(`Платеж ${amount} TON выполнен!`, 'success');
                resolve(true);
            }, 2000);
        });
    }

    async sendTransaction(amount, toAddress = null) {
        try {
            if (!this.tonConnect) {
                throw new Error('TON Connect not available');
            }

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
                messages: [
                    {
                        address: toAddress || "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c", // placeholder
                        amount: (amount * 1000000000).toString(), // Convert to nanoTON
                        payload: "Pixel purchase" // comment
                    }
                ]
            };

            const result = await this.tonConnect.sendTransaction(transaction);
            return { success: true, result };
        } catch (error) {
            console.error('Transaction failed:', error);
            return { success: false, error };
        }
    }

    // Интеграция с существующими модалами покупки
    enhancePurchaseModals() {
        // Перехватываем подтверждение покупки
        const originalConfirmPurchase = window.miniModals?.confirmPurchase?.bind(window.miniModals);
        if (originalConfirmPurchase) {
            window.miniModals.confirmPurchase = async () => {
                if (this.isConnected) {
                    const pixelIdElement = document.getElementById('purchase-pixel-id');
                    const pixelId = pixelIdElement ? parseInt(pixelIdElement.textContent) : null;
                    const success = await this.purchasePixel(pixelId, 5); // 5 TON
                    if (success) {
                        originalConfirmPurchase();
                    }
                } else {
                    MiniUtils.showNotification('Подключите кошелек для покупки', 'error');
                }
            };
        }

        // Аналогично для массовой покупки
        const originalConfirmMassPurchase = window.miniModals?.confirmMassPurchase?.bind(window.miniModals);
        if (originalConfirmMassPurchase) {
            window.miniModals.confirmMassPurchase = async () => {
                if (this.isConnected) {
                    const count = parseInt(document.getElementById('mass-count')?.textContent || '0');
                    const total = count * 5;
                    const success = await this.purchasePixel(null, total);
                    if (success) {
                        originalConfirmMassPurchase();
                    }
                } else {
                    MiniUtils.showNotification('Подключите кошелек для покупки', 'error');
                }
            };
        }
    }

    // Utility methods
    isWalletConnected() {
        return this.isConnected;
    }

    getWalletAddress() {
        return this.walletAddress;
    }

    getBalance() {
        return this.balance;
    }

    setTestMode(enabled) {
        this.isTestnet = enabled;
        console.log(`Test mode ${enabled ? 'enabled' : 'disabled'}`);
        
        // Перезагружаем баланс
        if (this.isConnected) {
            this.loadBalance();
        }
    }

    handleWalletError(error) {
        console.error('Wallet error:', error);
        
        // Показываем пользователю понятную ошибку
        let message = 'Ошибка кошелька';
        if (error.message?.includes('User rejected')) {
            message = 'Подключение отменено';
        } else if (error.message?.includes('Network')) {
            message = 'Проблема с сетью';
        }
        
        MiniUtils.showNotification(message, 'error');
    }

    // Методы для управления из консоли
    async forceConnect() {
        this.isConnected = true;
        this.walletAddress = "UQDemoWalletAddressForTestingPurposes123456789";
        this.balance = 150;
        
        this.updateWalletButton(true);
        this.updateStatusInfo();
        
        MiniUtils.showNotification('Демо кошелек подключен!', 'success');
        console.log('Demo wallet connected for testing');
    }

    async forceDisconnect() {
        this.onWalletDisconnected();
        console.log('Wallet force disconnected');
    }

    addBalance(amount) {
        if (this.isConnected) {
            this.balance += amount;
            this.updateStatusInfo();
            MiniUtils.showNotification(`Добавлено ${amount} TON`, 'success');
            console.log(`Added ${amount} TON, new balance: ${this.balance}`);
        } else {
            console.log('Wallet not connected');
        }
    }

    // Debug methods
    getDebugInfo() {
        return {
            isConnected: this.isConnected,
            walletAddress: this.walletAddress,
            balance: this.balance,
            isTestnet: this.isTestnet,
            tonConnectReady: !!this.tonConnect,
            manifestUrl: this.getManifestUrl()
        };
    }

    // Методы для тестирования транзакций
    async testPurchase(amount = 5) {
        console.log(`Testing purchase of ${amount} TON...`);
        
        if (!this.isConnected) {
            console.log('❌ Wallet not connected');
            return false;
        }
        
        if (this.balance < amount) {
            console.log('❌ Insufficient balance');
            return false;
        }
        
        const success = await this.purchasePixel(null, amount);
        console.log(success ? '✅ Purchase successful' : '❌ Purchase failed');
        return success;
    }

    // Статистика использования
    getUsageStats() {
        const stats = MiniUtils.loadFromStorage('nftg-wallet-stats', {
            totalTransactions: 0,
            totalSpent: 0,
            pixelsPurchased: 0,
            lastTransaction: null
        });
        
        return stats;
    }

    updateUsageStats(amount, pixelCount = 1) {
        const stats = this.getUsageStats();
        
        stats.totalTransactions += 1;
        stats.totalSpent += amount;
        stats.pixelsPurchased += pixelCount;
        stats.lastTransaction = new Date().toISOString();
        
        MiniUtils.saveToStorage('nftg-wallet-stats', stats);
        
        console.log('Usage stats updated:', stats);
    }

    // Экспорт данных кошелька
    exportWalletData() {
        const data = {
            address: this.walletAddress,
            stats: this.getUsageStats(),
            isTestnet: this.isTestnet,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nftg-wallet-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        MiniUtils.showNotification('Данные кошелька экспортированы', 'success');
    }
}

// Инициализация с проверкой на повторную загрузку
function initWallet() {
    // Проверяем что TON Connect UI загружен
    if (typeof TON_CONNECT_UI !== 'undefined') {
        // Небольшая задержка для полной загрузки
        setTimeout(() => {
            // Проверяем что кошелек еще не инициализирован
            if (!window.miniWallet) {
                window.miniWallet = new MiniWallet();
                
                // Development helpers
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    window.connectDemoWallet = () => window.miniWallet?.forceConnect();
                    window.disconnectDemoWallet = () => window.miniWallet?.forceDisconnect();
                    window.addBalance = (amount) => window.miniWallet?.addBalance(amount);
                    window.testPurchase = (amount) => window.miniWallet?.testPurchase(amount);
                    window.walletStats = () => window.miniWallet?.getUsageStats();
                    window.exportWallet = () => window.miniWallet?.exportWalletData();
                    window.setTestMode = (enabled) => window.miniWallet?.setTestMode(enabled);
                    
                    console.log('🛠️ Wallet development mode active');
                    console.log('Available commands: connectDemoWallet(), disconnectDemoWallet(), addBalance(amount), testPurchase(amount), walletStats(), exportWallet(), setTestMode(true/false)');
                }
            } else {
                console.log('Wallet already initialized');
            }
        }, 500);
    } else {
        console.warn('TON Connect UI not loaded, wallet features disabled');
        
        // Создаем заглушку для совместимости
        window.miniWallet = {
            isConnected: false,
            balance: 0,
            forceConnect: () => console.log('TON Connect not available'),
            getDebugInfo: () => ({ error: 'TON Connect not loaded' })
        };
    }
}

// Инициализируем только один раз
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWallet);
} else {
    initWallet();
}

// Экспорт для использования в других модулях
window.MiniWallet = MiniWallet;