// === MINI WALLET MANAGER ===

// === КОНФИГУРАЦИЯ ПЛАТЕЖЕЙ ===
class PaymentConfig {
    static RECIPIENT_ADDRESS = "UQAeXSRClDQ5Xcx9WoKKfT9zn_pyk-Uep7fnSdnd_-4dUTHQ"; // ВАШ TON КОШЕЛЕК
    static PIXEL_PRICE = 5; // Цена за пиксель в TON
    static TRANSACTION_COMMENT = "NFTG-ZONIX Pixel Purchase"; // Комментарий к транзакции
    
    // Для тестирования можете использовать тестнет адрес
    static TEST_RECIPIENT = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
    
    static getRecipientAddress(isTestnet = false) {
        if (isTestnet) {
            return this.TEST_RECIPIENT;
        }
        
        return this.RECIPIENT_ADDRESS;
    }
}

class MiniWallet {
    constructor() {
        this.tonConnect = null;
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        this.isTestnet = false; // Установлено в false для реальных платежей
        
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
            
            // Если ошибка связана с манифестом или уже существующим компонентом
            if (error.message.includes('already been used') || 
                error.message.includes('tc-root') || 
                error.message.includes('422') ||
                error.message.includes('manifest')) {
                console.log('🔄 TON Connect initialization failed, switching to demo mode');
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
        
        // В демо режиме сразу показываем как подключенный через 2 секунды
        setTimeout(() => {
            MiniUtils.showNotification('Демо режим кошелька активирован', 'info');
        }, 500);
        
        // Предлагаем ручное подключение
        this.isDemoMode = true;
    }

    getManifestUrl() {
        // Для localhost - создаем inline манифест
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.createInlineManifest();
        }
        
        // Для вашего Vercel домена - используем статический файл (более надежно)
        if (window.location.hostname === 'nftg-zonix-mini.vercel.app') {
            return `${window.location.origin}/tonconnect-manifest.json`;
        }
        
        // Для продакшена - если у вас будет собственный домен
        if (window.location.hostname.includes('nftg-zonix.com')) {
            return `${window.location.origin}/tonconnect-manifest.json`;
        }
        
        // Fallback: используем проверенный тестовый манифест
        return 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';
    }

    createInlineManifest() {
        // Создаем blob URL с манифестом для localhost
        const manifest = {
            url: window.location.origin,
            name: "NFTG-ZONIX Mini App",
            iconUrl: "https://ton.org/download/ton_symbol.png", // Используем стандартную иконку TON
            termsOfUseUrl: `${window.location.origin}`,
            privacyPolicyUrl: `${window.location.origin}`
        };
        
        const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        console.log('Created inline manifest for localhost:', manifest);
        return url;
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
            if (this.tonConnect && !this.isDemoMode) {
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
            // Если демо режим или TON Connect недоступен
            if (this.isDemoMode || !this.tonConnect) {
                this.showDemoConnectOptions();
                return;
            }

            MiniUtils.showNotification('Подключение кошелька...', 'info');
            
            // Пробуем открыть модальное окно подключения
            await this.tonConnect.openModal();
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            
            // Если ошибка подключения - предлагаем демо режим
            this.showConnectionErrorOptions(error);
        }
    }

    showDemoConnectOptions() {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Подключение кошелька',
                message: 'Выберите способ подключения:',
                buttons: [
                    { id: 'demo', type: 'default', text: '🧪 Демо кошелек' },
                    { id: 'real', type: 'default', text: '💎 Реальный кошелек' },
                    { type: 'cancel' }
                ]
            }, (buttonId) => {
                this.handleConnectOption(buttonId);
            });
        } else {
            // Fallback для браузера
            const options = `
Демо режим кошелька активен.

Опции:
1. Подключить демо кошелек (demo)
2. Попробовать реальный кошелек (real)

Введите команду:`;
            
            const choice = prompt(options);
            this.handleConnectOption(choice);
        }
    }

    showConnectionErrorOptions(error) {
        const errorMsg = error.message?.includes('manifest') ? 
            'Ошибка загрузки манифеста кошелька' : 
            'Ошибка подключения кошелька';

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Ошибка подключения',
                message: `${errorMsg}\n\nИспользовать демо режим?`,
                buttons: [
                    { id: 'demo', type: 'default', text: 'Да, демо режим' },
                    { type: 'cancel', text: 'Отмена' }
                ]
            }, (buttonId) => {
                if (buttonId === 'demo') {
                    this.forceConnect();
                }
            });
        } else {
            if (confirm(`${errorMsg}\n\nИспользовать демо режим для тестирования?`)) {
                this.forceConnect();
            }
        }
    }

    handleConnectOption(option) {
        switch (option) {
            case 'demo':
                this.forceConnect();
                break;
            case 'real':
                if (this.tonConnect) {
                    this.tonConnect.openModal().catch(error => {
                        MiniUtils.showNotification('Не удалось открыть кошелек', 'error');
                        console.error('Real wallet connection failed:', error);
                    });
                } else {
                    MiniUtils.showNotification('TON Connect недоступен', 'error');
                }
                break;
        }
    }

    async disconnectWallet() {
        try {
            if (this.tonConnect && !this.isDemoMode) {
                await this.tonConnect.disconnect();
            } else {
                // Для демо режима
                this.onWalletDisconnected();
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            // Принудительно отключаем
            this.onWalletDisconnected();
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
        
        const walletType = this.isDemoMode ? 'Демо кошелек' : 'Кошелек';
        MiniUtils.showNotification(`${walletType} подключен!`, 'success');
        MiniUtils.vibrate([100, 50, 100]);
        
        console.log('Wallet connected:', this.walletAddress);
        console.log('Payments will go to:', PaymentConfig.RECIPIENT_ADDRESS);
    }

    onWalletDisconnected() {
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        this.isDemoMode = false;
        
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
            const prefix = this.isDemoMode ? '🧪 ' : '💎 ';
            if (walletTitle) walletTitle.textContent = `${prefix}TON Кошелек`;
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
                const suffix = this.isDemoMode ? ' 🧪' : '';
                balanceValue.textContent = `${this.balance.toFixed(2)} TON${suffix}`;
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
        const icon = this.isDemoMode ? '🧪' : '💎';
        if (!currentText.includes(icon)) {
            const originalHTML = actionButton.innerHTML;
            actionButton.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>${icon}</span>
                    <span>${currentText}</span>
                </div>
            `;
        }
    }

    async loadBalance() {
        try {
            if (!this.walletAddress) return;

            // Для демо режима используем mock баланс
            if (this.isDemoMode) {
                this.balance = 100 + Math.random() * 50; // 100-150 TON для теста
                this.updateStatusInfo();
                return;
            }

            // Для реального кошелька попробуем загрузить баланс через API
            try {
                const response = await fetch(`https://tonapi.io/v2/accounts/${this.walletAddress}`);
                if (response.ok) {
                    const data = await response.json();
                    this.balance = parseFloat(data.balance) / 1000000000; // Convert from nanoTON
                } else {
                    // Если API недоступен, используем mock
                    this.balance = 50 + Math.random() * 100;
                }
            } catch (error) {
                console.log('Could not load real balance, using mock');
                this.balance = 50 + Math.random() * 100;
            }
            
            this.updateStatusInfo();
            
        } catch (error) {
            console.error('Failed to load balance:', error);
            this.balance = 0;
            this.updateStatusInfo();
        }
    }

    showWalletMenu() {
        const walletType = this.isDemoMode ? 'Демо кошелек' : 'TON Кошелек';
        const balanceText = this.isDemoMode ? 
            `${this.balance.toFixed(2)} TON (тестовые)` : 
            `${this.balance.toFixed(2)} TON`;

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: walletType,
                message: `Адрес: ${this.formatAddress(this.walletAddress)}\nБаланс: ${balanceText}\n\nПлатежи идут на:\n${this.formatAddress(PaymentConfig.RECIPIENT_ADDRESS)}`,
                buttons: [
                    { id: 'copy', type: 'default', text: 'Копировать адрес' },
                    ...(this.isDemoMode ? [{ id: 'add_balance', type: 'default', text: 'Добавить баланс' }] : []),
                    { id: 'disconnect', type: 'destructive', text: 'Отключить' },
                    { type: 'cancel' }
                ]
            }, (buttonId) => {
                this.handleWalletMenuAction(buttonId);
            });
        } else {
            // Fallback для браузера
            const demoOptions = this.isDemoMode ? '\n\'add\' - добавить баланс' : '';
            const action = prompt(`${walletType}\nАдрес: ${this.formatAddress(this.walletAddress)}\nБаланс: ${balanceText}\n\nПлатежи идут на: ${this.formatAddress(PaymentConfig.RECIPIENT_ADDRESS)}\n\nВведите команду:\n'copy' - копировать адрес${demoOptions}\n'disconnect' - отключить:`);
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
            case 'add_balance':
            case 'add':
                if (this.isDemoMode) {
                    this.addBalance(50);
                }
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
            // В демо режиме используем mock транзакцию
            if (this.isDemoMode) {
                return await this.mockTransaction(price);
            }

            // Реальная транзакция TON
            MiniUtils.showNotification('Отправка транзакции...', 'info');
            
            const transaction = await this.sendTransaction(price, pixelId);
            
            if (transaction.success) {
                // Обновляем баланс (приблизительно)
                this.balance -= price;
                this.updateStatusInfo();
                
                MiniUtils.showNotification(`Транзакция отправлена! ${price} TON → ${this.formatAddress(PaymentConfig.RECIPIENT_ADDRESS)}`, 'success');
                return true;
            } else {
                MiniUtils.showNotification('Транзакция отклонена', 'error');
                return false;
            }

        } catch (error) {
            console.error('Purchase failed:', error);
            MiniUtils.showNotification('Ошибка покупки', 'error');
            return false;
        }
    }

    async mockTransaction(amount) {
        // Имитация транзакции для тестирования
        return new Promise((resolve) => {
            const transactionType = this.isDemoMode ? 'демо' : 'тестовый';
            MiniUtils.showNotification(`Обработка ${transactionType} платежа...`, 'info');
            
            setTimeout(() => {
                this.balance -= amount;
                this.updateStatusInfo();
                MiniUtils.showNotification(`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} платеж ${amount} TON выполнен!`, 'success');
                resolve(true);
            }, 2000);
        });
    }

    async sendTransaction(amount, pixelId = null, toAddress = null) {
        try {
            if (!this.tonConnect) {
                throw new Error('TON Connect not available');
            }

            // Используем настроенный адрес получателя (ВАШ КОШЕЛЕК!)
            const recipientAddress = toAddress || PaymentConfig.getRecipientAddress(this.isTestnet);
            
            // Создаем комментарий с информацией о покупке
            let comment = PaymentConfig.TRANSACTION_COMMENT;
            if (pixelId !== null) {
                comment += ` - Pixel #${pixelId}`;
            }

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
                messages: [
                    {
                        address: recipientAddress,
                        amount: (amount * 1000000000).toString(), // Convert to nanoTON
                        payload: comment // Комментарий к транзакции
                    }
                ]
            };

            console.log('Sending transaction:', {
                recipient: recipientAddress,
                amount: `${amount} TON`,
                comment: comment
            });

            const result = await this.tonConnect.sendTransaction(transaction);
            
            // Сохраняем информацию о транзакции
            this.saveTransactionInfo(amount, pixelId, recipientAddress, result);
            
            return { success: true, result };
            
        } catch (error) {
            console.error('Transaction failed:', error);
            return { success: false, error };
        }
    }

    saveTransactionInfo(amount, pixelId, recipient, transactionResult) {
        const transactions = MiniUtils.loadFromStorage('nftg-transaction-history', []);
        
        const transaction = {
            id: MiniUtils.generateId(),
            amount: amount,
            pixelId: pixelId,
            recipient: recipient,
            timestamp: new Date().toISOString(),
            status: 'sent',
            comment: `${PaymentConfig.TRANSACTION_COMMENT}${pixelId ? ` - Pixel #${pixelId}` : ''}`,
            transactionResult: transactionResult
        };
        
        transactions.push(transaction);
        
        // Сохраняем только последние 100 транзакций
        if (transactions.length > 100) {
            transactions.splice(0, transactions.length - 100);
        }
        
        MiniUtils.saveToStorage('nftg-transaction-history', transactions);
        console.log('Transaction saved to history:', transaction);
    }

    getTransactionHistory() {
        return MiniUtils.loadFromStorage('nftg-transaction-history', []);
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
                    const success = await this.purchasePixel(pixelId, PaymentConfig.PIXEL_PRICE);
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
                    const total = count * PaymentConfig.PIXEL_PRICE;
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
        } else if (error.message?.includes('manifest')) {
            message = 'Ошибка конфигурации кошелька';
        }
        
        MiniUtils.showNotification(message, 'error');
    }

    // Методы для управления из консоли
    async forceConnect() {
        this.isConnected = true;
        this.isDemoMode = true;
        this.walletAddress = "UQDemoWalletAddressForTestingPurposes123456789";
        this.balance = 150;
        
        this.updateWalletButton(true);
        this.updateStatusInfo();
        
        MiniUtils.showNotification('Демо кошелек подключен!', 'success');
        console.log('Demo wallet connected for testing');
        console.log('Real payments will go to:', PaymentConfig.RECIPIENT_ADDRESS);
    }

    async forceDisconnect() {
        this.onWalletDisconnected();
        console.log('Wallet force disconnected');
    }

    addBalance(amount) {
        if (this.isConnected) {
            this.balance += amount;
            this.updateStatusInfo();
            const prefix = this.isDemoMode ? 'Демо: ' : '';
            MiniUtils.showNotification(`${prefix}Добавлено ${amount} TON`, 'success');
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
            isDemoMode: this.isDemoMode || false,
            tonConnectReady: !!this.tonConnect,
            manifestUrl: this.getManifestUrl(),
            recipientAddress: PaymentConfig.RECIPIENT_ADDRESS
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
            lastTransaction: null,
            demoMode: this.isDemoMode || false
        });
        
        return stats;
    }

    updateUsageStats(amount, pixelCount = 1) {
        const stats = this.getUsageStats();
        
        stats.totalTransactions += 1;
        stats.totalSpent += amount;
        stats.pixelsPurchased += pixelCount;
        stats.lastTransaction = new Date().toISOString();
        stats.demoMode = this.isDemoMode || false;
        
        MiniUtils.saveToStorage('nftg-wallet-stats', stats);
        
        console.log('Usage stats updated:', stats);
    }

    // Экспорт данных кошелька
    exportWalletData() {
        const data = {
            address: this.walletAddress,
            stats: this.getUsageStats(),
            isTestnet: this.isTestnet,
            isDemoMode: this.isDemoMode || false,
            recipientAddress: PaymentConfig.RECIPIENT_ADDRESS,
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
                    console.log('💰 Payments will go to:', PaymentConfig.RECIPIENT_ADDRESS);
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