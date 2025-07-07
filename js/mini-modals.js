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
    showPurchaseModal(pixelId, pixelPrice = 5) {
        const purchasePixelId = document.getElementById('purchase-pixel-id');
        const purchasePrice = document.getElementById('purchase-price');
        
        if (purchasePixelId) purchasePixelId.textContent = pixelId;
        if (purchasePrice) purchasePrice.textContent = pixelPrice;
        
        // Reset form
        this.resetPurchaseForm();
        
        this.activeModal = 'purchase-modal';
        const modal = document.getElementById('purchase-modal');
        if (modal) {
            modal.classList.add('active');
            // Добавляем вибрацию для обратной связи
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

    confirmPurchase() {
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
    showMassPurchaseModal(selectedPixels, pixelPrice = 5) {
        const count = selectedPixels.size;
        const total = count * pixelPrice;

        const massCount = document.getElementById('mass-count');
        const massTotal = document.getElementById('mass-total');
        
        if (massCount) massCount.textContent = count;
        if (massTotal) massTotal.textContent = total;
        
        // Reset form
        this.resetMassPurchaseForm();
        
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

    confirmMassPurchase() {
        const massCategorySelect = document.getElementById('mass-category-select');
        const massTelegramLink = document.getElementById('mass-telegram-link');
        
        if (!massCategorySelect || !massTelegramLink) {
            MiniUtils.showNotification('Ошибка формы', 'error');
            return;
        }
        
        const category = massCategorySelect.value;
        const telegramLink = massTelegramLink.value.trim();

        // Validation
        if (!this.validateMassPurchaseForm(category, telegramLink)) {
            return;
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
        if (infoPrice) infoPrice.textContent = MiniUtils.formatPrice(pixelData.price || 5);

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
                    btn.textContent = 'Обработка...';
                }
            });
            inputs.forEach(input => input.disabled = true);
        } else {
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.classList.contains('btn-success')) {
                    if (modalId === 'purchase-modal') {
                        btn.textContent = '💰 Купить';
                    } else if (modalId === 'mass-purchase-modal') {
                        btn.textContent = '🛒 Купить все';
                    }
                }
            });
            inputs.forEach(input => input.disabled = false);
        }
    }

    // Telegram WebApp specific methods
    initTelegramWebAppHandlers() {
        const config = MiniUtils.getTelegramConfig();
        
        if (config.isWebApp) {
            // Обработка кнопки "Назад" в Telegram
            config.telegram.onEvent('backButtonClicked', () => {
                if (this.isModalOpen()) {
                    this.closeAllModals();
                } else {
                    config.telegram.close();
                }
            });

            // Показываем кнопку назад когда открыта модалка
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const modal = mutation.target;
                        if (modal.classList.contains('active')) {
                            config.telegram.BackButton.show();
                        } else if (!this.isModalOpen()) {
                            config.telegram.BackButton.hide();
                        }
                    }
                });
            });

            // Наблюдаем за всеми модальными окнами
            document.querySelectorAll('.modal').forEach(modal => {
                observer.observe(modal, { attributes: true });
            });
        }
    }

    // Validation helpers
    highlightInvalidField(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('invalid');
            field.focus();
            
            // Создаем временную подсказку
            const hint = document.createElement('div');
            hint.className = 'validation-hint';
            hint.textContent = message;
            hint.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                background: #ff4444;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                z-index: 1000;
                margin-top: 2px;
            `;
            
            field.style.position = 'relative';
            field.parentNode.appendChild(hint);
            
            // Удаляем подсказку через 3 секунды
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 3000);
        }
    }

    removeValidationHighlight(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('invalid');
            
            // Удаляем подсказку если есть
            const hint = field.parentNode.querySelector('.validation-hint');
            if (hint) {
                hint.parentNode.removeChild(hint);
            }
        }
    }

    // Auto-save form data (для улучшения UX)
    setupAutoSave() {
        const forms = ['purchase-modal', 'mass-purchase-modal'];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                const inputs = form.querySelectorAll('input, select, textarea');
                
                inputs.forEach(input => {
                    input.addEventListener('input', MiniUtils.debounce(() => {
                        this.saveFormData(formId);
                    }, 500));
                });
            }
        });
    }

    saveFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });

        MiniUtils.saveToStorage(`form-${formId}`, formData);
    }

    loadFormData(formId) {
        const formData = MiniUtils.loadFromStorage(`form-${formId}`, {});
        
        Object.keys(formData).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input && formData[inputId]) {
                input.value = formData[inputId];
            }
        });
    }

    clearFormData(formId) {
        localStorage.removeItem(`form-${formId}`);
    }

    // Analytics/metrics helpers (для будущего использования)
    trackModalOpen(modalType) {
        console.log(`Modal opened: ${modalType}`);
        // Здесь можно добавить отправку аналитики
    }

    trackPurchase(pixelCount, totalCost) {
        console.log(`Purchase completed: ${pixelCount} pixels for ${totalCost} TON`);
        // Здесь можно добавить отправку аналитики
    }

    // Error handling для форм
    handleFormError(error, formId) {
        console.error(`Form error in ${formId}:`, error);
        
        this.showLoadingState(formId, false);
        
        let message = 'Произошла ошибка при отправке формы';
        if (error.message) {
            message += `: ${error.message}`;
        }
        
        MiniUtils.showNotification(message, 'error');
    }

    // Accessibility helpers
    setupAccessibility() {
        // Добавляем поддержку навигации по клавиатуре
        document.addEventListener('keydown', (e) => {
            if (!this.isModalOpen()) return;

            // Tab навигация внутри модальных окон
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    const focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        });

        // Автофокус на первый элемент при открытии модального окна
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const modal = mutation.target;
                    if (modal.classList.contains('active')) {
                        const firstInput = modal.querySelector('input, select, textarea, button');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 100);
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    }
}

// Глобальная инициализация
window.MiniModals = MiniModals;