// === MINI MODALS MANAGER ===

class MiniModals {
    constructor() {
        this.activeModal = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Purchase Modal
        document.getElementById('confirm-purchase')?.addEventListener('click', () => this.confirmPurchase());
        document.getElementById('cancel-purchase')?.addEventListener('click', () => this.closePurchaseModal());

        // Mass Purchase Modal
        document.getElementById('confirm-mass-purchase')?.addEventListener('click', () => this.confirmMassPurchase());
        document.getElementById('cancel-mass-purchase')?.addEventListener('click', () => this.closeMassPurchaseModal());

        // Pixel Info Modal
        document.getElementById('visit-channel')?.addEventListener('click', () => this.visitChannel());
        document.getElementById('close-pixel-info')?.addEventListener('click', () => this.closePixelInfoModal());

        // Global modal handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Form validation
        this.setupFormValidation();
        
        console.log('✅ Modal event listeners setup completed');
    }

    setupFormValidation() {
        // Real-time validation for Telegram links
        const telegramInputs = ['telegram-link', 'mass-telegram-link'];

        telegramInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', this.validateTelegramLink);
                input.addEventListener('blur', this.validateTelegramLink);
            }
        });

        // Category validation
        const categorySelects = ['category-select', 'mass-category-select'];
        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', this.validateCategory);
            }
        });
    }

    validateTelegramLink(e) {
        const input = e.target;
        const value = input.value.trim();
        
        if (value === '') {
            input.setCustomValidity('');
            input.classList.remove('valid', 'invalid');
            return true;
        }
        
        const isValid = MiniUtils.validateTelegramUsername(value);
        
        if (isValid) {
            input.setCustomValidity('');
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.setCustomValidity('Введите @username или ссылку https://t.me/username');
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        
        return isValid;
    }

    validateCategory(e) {
        const select = e.target;
        const isValid = select.value !== '';
        
        if (isValid) {
            select.classList.remove('invalid');
            select.classList.add('valid');
        } else {
            select.classList.remove('valid');
            select.classList.add('invalid');
        }
        
        return isValid;
    }

    // === PURCHASE MODAL ===
    showPurchaseModal(pixelId, pixelPrice = 0.01) {
        const purchasePixelId = document.getElementById('purchase-pixel-id');
        const purchasePrice = document.getElementById('purchase-price');
        
        if (purchasePixelId) purchasePixelId.textContent = pixelId;
        if (purchasePrice) purchasePrice.textContent = pixelPrice;
        
        // Reset form
        this.resetPurchaseForm();
        
        // Показываем информацию о кошельке если подключен
        this.updateWalletInfoInModal('purchase');
        
        this.activeModal = 'purchase-modal';
        const modal = document.getElementById('purchase-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([100]);
        }
    }

    closePurchaseModal() {
        const modal = document.getElementById('purchase-modal');
        if (modal) modal.classList.remove('active');
        this.activeModal = null;
    }

    resetPurchaseForm() {
        const categorySelect = document.getElementById('category-select');
        const telegramLink = document.getElementById('telegram-link');
        const pixelDescription = document.getElementById('pixel-description');
        
        if (categorySelect) categorySelect.value = '';
        if (telegramLink) telegramLink.value = '';
        if (pixelDescription) pixelDescription.value = '';
        
        // Reset validation classes
        document.querySelectorAll('#purchase-modal .form-control').forEach(input => {
            input.classList.remove('valid', 'invalid');
            input.setCustomValidity('');
        });
    }

    async confirmPurchase() {
        const purchasePixelId = document.getElementById('purchase-pixel-id');
        const categorySelect = document.getElementById('category-select');
        const telegramLink = document.getElementById('telegram-link');
        const pixelDescription = document.getElementById('pixel-description');
        
        if (!purchasePixelId || !categorySelect || !telegramLink) {
            MiniUtils.showNotification('Ошибка формы', 'error');
            return;
        }
        
        const pixelId = parseInt(purchasePixelId.textContent);
        const category = categorySelect.value;
        const telegramLinkValue = telegramLink.value.trim();
        const description = pixelDescription ? pixelDescription.value.trim() : '';

        // Validation
        if (!this.validatePurchaseForm(category, telegramLinkValue)) {
            return;
        }

        // Проверяем кошелек если подключен
        if (window.miniWallet && window.miniWallet.isConnected) {
            this.showLoadingState('purchase-modal', true);
            
            try {
                const success = await window.miniWallet.purchasePixel(pixelId, 0.01);
                if (!success) {
                    this.showLoadingState('purchase-modal', false);
                    return;
                }
            } catch (error) {
                this.showLoadingState('purchase-modal', false);
                MiniUtils.showNotification('Ошибка платежа', 'error');
                return;
            }
            
            this.showLoadingState('purchase-modal', false);
        }

        const purchaseData = {
            category,
            channel: MiniUtils.extractTelegramUsername(telegramLinkValue),
            telegramLink: MiniUtils.normalizeTelegramLink(telegramLinkValue),
            description,
            owner: window.miniGrid ? window.miniGrid.currentUser : '@demo_user'
        };

        // Call purchase method from grid
        if (window.miniGrid) {
            window.miniGrid.purchasePixel(pixelId, purchaseData);
            MiniUtils.showNotification(`Пиксель #${pixelId} куплен!`, 'success');
        }

        this.closePurchaseModal();
    }

    validatePurchaseForm(category, telegramLink) {
        let isValid = true;

        if (!category) {
            MiniUtils.showNotification('Выберите категорию канала', 'error');
            const categorySelect = document.getElementById('category-select');
            if (categorySelect) categorySelect.focus();
            isValid = false;
        }

        if (!telegramLink || !MiniUtils.validateTelegramUsername(telegramLink)) {
            MiniUtils.showNotification('Введите корректный Telegram канал', 'error');
            const telegramLinkInput = document.getElementById('telegram-link');
            if (telegramLinkInput) telegramLinkInput.focus();
            isValid = false;
        }

        return isValid;
    }

    // === MASS PURCHASE MODAL ===
    showMassPurchaseModal(selectedPixels, pixelPrice = 0.01) {
        const count = selectedPixels.size;
        const total = count * pixelPrice;

        const massCount = document.getElementById('mass-count');
        const massTotal = document.getElementById('mass-total');
        
        if (massCount) massCount.textContent = count;
        if (massTotal) massTotal.textContent = total;
        
        // Reset form
        this.resetMassPurchaseForm();
        
        // Показываем информацию о кошельке если подключен
        this.updateWalletInfoInModal('mass-purchase');
        
        this.activeModal = 'mass-purchase-modal';
        const modal = document.getElementById('mass-purchase-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([100]);
        }
    }

    closeMassPurchaseModal() {
        const modal = document.getElementById('mass-purchase-modal');
        if (modal) modal.classList.remove('active');
        this.activeModal = null;
    }

    resetMassPurchaseForm() {
        const massCategorySelect = document.getElementById('mass-category-select');
        const massTelegramLink = document.getElementById('mass-telegram-link');
        
        if (massCategorySelect) massCategorySelect.value = '';
        if (massTelegramLink) massTelegramLink.value = '';
        
        // Reset validation classes
        document.querySelectorAll('#mass-purchase-modal .form-control').forEach(input => {
            input.classList.remove('valid', 'invalid');
            input.setCustomValidity('');
        });
    }

    async confirmMassPurchase() {
        const massCategorySelect = document.getElementById('mass-category-select');
        const massTelegramLink = document.getElementById('mass-telegram-link');
        const massCount = document.getElementById('mass-count');
        
        if (!massCategorySelect || !massTelegramLink) {
            MiniUtils.showNotification('Ошибка формы', 'error');
            return;
        }
        
        const category = massCategorySelect.value;
        const telegramLink = massTelegramLink.value.trim();
        const count = parseInt(massCount.textContent || '0');
        const total = count * 0.01;

        // Validation
        if (!this.validateMassPurchaseForm(category, telegramLink)) {
            return;
        }

        // Проверяем кошелек если подключен
        if (window.miniWallet && window.miniWallet.isConnected) {
            this.showLoadingState('mass-purchase-modal', true);
            
            try {
                const success = await window.miniWallet.purchasePixel(null, total);
                if (!success) {
                    this.showLoadingState('mass-purchase-modal', false);
                    return;
                }
            } catch (error) {
                this.showLoadingState('mass-purchase-modal', false);
                MiniUtils.showNotification('Ошибка платежа', 'error');
                return;
            }
            
            this.showLoadingState('mass-purchase-modal', false);
        }

        // Call mass purchase method from grid
        if (window.miniGrid) {
            const purchaseData = {
                category,
                channel: MiniUtils.extractTelegramUsername(telegramLink),
                telegramLink: MiniUtils.normalizeTelegramLink(telegramLink),
                description: `Массовая покупка пикселей`,
                owner: window.miniGrid.currentUser
            };

            window.miniGrid.completeMassPurchase(purchaseData);
        }

        this.closeMassPurchaseModal();
    }

    validateMassPurchaseForm(category, telegramLink) {
        let isValid = true;

        if (!category) {
            MiniUtils.showNotification('Выберите категорию', 'error');
            const massCategorySelect = document.getElementById('mass-category-select');
            if (massCategorySelect) massCategorySelect.focus();
            isValid = false;
        }

        if (!telegramLink || !MiniUtils.validateTelegramUsername(telegramLink)) {
            MiniUtils.showNotification('Введите корректный Telegram канал', 'error');
            const massTelegramLink = document.getElementById('mass-telegram-link');
            if (massTelegramLink) massTelegramLink.focus();
            isValid = false;
        }

        return isValid;
    }

    // === WALLET INTEGRATION ===
    updateWalletInfoInModal(modalType) {
        if (!window.miniWallet) return;

        const isConnected = window.miniWallet.isConnected;
        const balance = window.miniWallet.balance;
        
        // Добавляем информацию о кошельке в модальные окна
        const modalId = modalType === 'purchase' ? 'purchase-modal' : 'mass-purchase-modal';
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Ищем существующий блок с информацией о кошельке
        let walletInfo = modal.querySelector('.wallet-info-block');
        
        if (!walletInfo) {
            walletInfo = document.createElement('div');
            walletInfo.className = 'wallet-info-block';
            
            // Вставляем перед кнопками действий
            const modalActions = modal.querySelector('.modal-actions');
            if (modalActions) {
                modalActions.parentNode.insertBefore(walletInfo, modalActions);
            }
        }

        if (isConnected) {
            const price = modalType === 'purchase' ? 0.01 : parseFloat(document.getElementById('mass-total')?.textContent || '0');
            const canAfford = balance >= price;
            
            walletInfo.innerHTML = `
                <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; padding: 12px; margin: 16px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 16px;">💎</span>
                        <span style="color: #00D4FF; font-weight: 600; font-size: 12px;">TON Кошелек подключен</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <span style="color: rgba(255,255,255,0.7);">Баланс:</span>
                        <span style="color: ${canAfford ? '#00FF88' : '#FFB800'}; font-weight: 600;">${balance.toFixed(2)} TON</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <span style="color: rgba(255,255,255,0.7);">К оплате:</span>
                        <span style="color: #fff; font-weight: 600;">${price} TON</span>
                    </div>
                    ${!canAfford ? '<div style="color: #FFB800; font-size: 10px; margin-top: 4px; text-align: center;">⚠️ Недостаточно средств</div>' : ''}
                </div>
            `;
        } else {
            walletInfo.innerHTML = `
                <div style="background: rgba(255, 184, 0, 0.1); border: 1px solid rgba(255, 184, 0, 0.3); border-radius: 8px; padding: 12px; margin: 16px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 16px;">👛</span>
                        <span style="color: #FFB800; font-weight: 600; font-size: 12px;">Кошелек не подключен</span>
                    </div>
                    <div style="color: rgba(255,184,0,0.8); font-size: 10px; text-align: center;">
                        Подключите TON кошелек для покупки пикселей
                    </div>
                    <button onclick="window.miniChannels?.openMainSidebar(); setTimeout(() => document.getElementById('wallet-connect-btn')?.click(), 300);" 
                            style="width: 100%; margin-top: 8px; padding: 6px 12px; background: linear-gradient(45deg, #FFB800, #FF9500); color: #000; border: none; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer;">
                        Подключить кошелек
                    </button>
                </div>
            `;
        }
    }

    // === PIXEL INFO MODAL ===
    showPixelInfo(pixelId, pixelData) {
        const infoPixelId = document.getElementById('info-pixel-id');
        const infoOwner = document.getElementById('info-owner');
        const infoCategory = document.getElementById('info-category');
        const infoDate = document.getElementById('info-date');
        const infoPrice = document.getElementById('info-price');
        
        if (infoPixelId) infoPixelId.textContent = pixelId;
        if (infoOwner) infoOwner.textContent = pixelData.channel || pixelData.owner || '@unknown';
        if (infoCategory) infoCategory.textContent = pixelData.category || 'Не указана';
        if (infoDate) infoDate.textContent = MiniUtils.formatDate(pixelData.purchaseDate);
        if (infoPrice) infoPrice.textContent = MiniUtils.formatPrice(pixelData.price || 0.01);

        // Store channel link for visit button
        this.currentChannelLink = pixelData.telegramLink || MiniUtils.normalizeTelegramLink(pixelData.channel || '');

        this.activeModal = 'pixel-info-modal';
        const modal = document.getElementById('pixel-info-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([50]);
        }
    }

    closePixelInfoModal() {
        const modal = document.getElementById('pixel-info-modal');
        if (modal) modal.classList.remove('active');
        this.activeModal = null;
        this.currentChannelLink = null;
    }

    visitChannel() {
        if (this.currentChannelLink && this.currentChannelLink !== '#') {
            // Используем Telegram WebApp API если доступно
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.openTelegramLink(this.currentChannelLink);
            } else {
                window.open(this.currentChannelLink, '_blank', 'noopener,noreferrer');
            }
            MiniUtils.showNotification('Переход в канал', 'info');
        } else {
            MiniUtils.showNotification('Ссылка на канал недоступна', 'error');
        }
    }

    // === UTILITY METHODS ===
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.activeModal = null;
        this.currentChannelLink = null;
    }

    isModalOpen() {
        return this.activeModal !== null;
    }

    getCurrentModal() {
        return this.activeModal;
    }

    // Form data helpers
    getPurchaseFormData() {
        const categorySelect = document.getElementById('category-select');
        const telegramLink = document.getElementById('telegram-link');
        const pixelDescription = document.getElementById('pixel-description');
        
        return {
            category: categorySelect ? categorySelect.value : '',
            telegramLink: telegramLink ? telegramLink.value.trim() : '',
            description: pixelDescription ? pixelDescription.value.trim() : ''
        };
    }

    getMassPurchaseFormData() {
        const massCategorySelect = document.getElementById('mass-category-select');
        const massTelegramLink = document.getElementById('mass-telegram-link');
        
        return {
            category: massCategorySelect ? massCategorySelect.value : '',
            telegramLink: massTelegramLink ? massTelegramLink.value.trim() : ''
        };
    }

    // Populate forms with existing data
    populatePurchaseForm(data) {
        const categorySelect = document.getElementById('category-select');
        const telegramLink = document.getElementById('telegram-link');
        const pixelDescription = document.getElementById('pixel-description');
        
        if (data.category && categorySelect) categorySelect.value = data.category;
        if (data.channel && telegramLink) telegramLink.value = data.channel;
        if (data.description && pixelDescription) pixelDescription.value = data.description;
    }

    // Show loading state
    showLoadingState(modalId, show = true) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const buttons = modal.querySelectorAll('.btn');
        const inputs = modal.querySelectorAll('.form-control');

        if (show) {
            buttons.forEach(btn => {
                btn.disabled = true;
                if (btn.classList.contains('btn-success')) {
                    btn.innerHTML = `
                        <div class="transaction-loader">
                            <div class="spinner"></div>
                            <span>Обработка...</span>
                        </div>
                    `;
                }
            });
            inputs.forEach(input => input.disabled = true);
        } else {
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.classList.contains('btn-success')) {
                    if (modalId === 'purchase-modal') {
                        btn.innerHTML = '💰 Купить';
                    } else if (modalId === 'mass-purchase-modal') {
                        btn.innerHTML = '🛒 Купить все';
                    }
                }
            });
            inputs.forEach(input => input.disabled = false);
        }
    }

    getModalStats() {
        return {
            activeModal: this.activeModal,
            isOpen: this.isModalOpen(),
            walletConnected: window.miniWallet?.isConnected || false,
            walletBalance: window.miniWallet?.balance || 0
        };
    }
}

// Глобальная инициализация
window.MiniModals = MiniModals;