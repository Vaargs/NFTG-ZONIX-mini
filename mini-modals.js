// === MINI MODALS MANAGER ===

class MiniModals {
    constructor() {
        this.activeModal = null;
        this.selectedCategories = [];
        this.currentPixelIds = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Purchase Modal (БЕЗ КАТЕГОРИЙ)
        document.getElementById('confirm-purchase')?.addEventListener('click', () => this.confirmPurchase());
        document.getElementById('cancel-purchase')?.addEventListener('click', () => this.closePurchaseModal());

        // Mass Purchase Modal (БЕЗ КАТЕГОРИЙ)
        document.getElementById('confirm-mass-purchase')?.addEventListener('click', () => this.confirmMassPurchase());
        document.getElementById('cancel-mass-purchase')?.addEventListener('click', () => this.closeMassPurchaseModal());

        // НОВОЕ: Pixel Info Edit Modal
        document.getElementById('save-pixel-info')?.addEventListener('click', () => this.savePixelInfo());
        document.getElementById('cancel-pixel-info-edit')?.addEventListener('click', () => this.closePixelInfoEditModal());

        // Pixel Info Modal
        document.getElementById('visit-channel')?.addEventListener('click', () => this.visitChannel());
        document.getElementById('close-pixel-info')?.addEventListener('click', () => this.closePixelInfoModal());

        // НОВОЕ: Channel Submission Modal
        document.getElementById('submit-channel-application')?.addEventListener('click', () => this.submitChannelApplication());
        document.getElementById('cancel-channel-submission')?.addEventListener('click', () => this.closeChannelSubmissionModal());

        // НОВОЕ: About Modal
        document.getElementById('about-mode')?.addEventListener('click', () => this.showAboutModal());
        document.getElementById('close-about')?.addEventListener('click', () => this.closeAboutModal());
        document.getElementById('visit-website-about')?.addEventListener('click', () => this.visitWebsiteFromAbout());

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
        
        // НОВОЕ: Category selection for pixel info edit
        this.setupCategorySelection();
        
        // НОВОЕ: Channel submission events
        this.setupChannelSubmissionEvents();
        
        console.log('✅ Modal event listeners setup completed');
    }

    // === НОВОЕ: ABOUT MODAL ===
    showAboutModal() {
        this.activeModal = 'about-modal';
        const modal = document.getElementById('about-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([100]);
            
            // Show Telegram back button
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.BackButton.show();
            }
        }
    }

    closeAboutModal() {
        const modal = document.getElementById('about-modal');
        if (modal) modal.classList.remove('active');
        
        this.activeModal = null;
        
        // Hide Telegram back button if no other modals open
        if (window.Telegram?.WebApp && !this.isModalOpen()) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    visitWebsiteFromAbout() {
        const websiteUrl = 'https://nftg-zonix.com';
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(websiteUrl);
        } else {
            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
        }
        
        MiniUtils.showNotification('Переход на официальный сайт', 'info');
        this.closeAboutModal();
    }

    setupFormValidation() {
        // Real-time validation for Telegram links
        const telegramInputs = ['telegram-link', 'mass-telegram-link', 'edit-telegram-link', 'submission-telegram-link'];

        telegramInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', this.validateTelegramLink);
                input.addEventListener('blur', this.validateTelegramLink);
            }
        });

        // Character counter for description
        const descriptionTextarea = document.getElementById('edit-description');
        const charCounter = document.getElementById('edit-description-chars');
        if (descriptionTextarea && charCounter) {
            descriptionTextarea.addEventListener('input', (e) => {
                charCounter.textContent = e.target.value.length;
            });
        }
    }

    // НОВОЕ: Настройка выбора категорий
    setupCategorySelection() {
        const categorySelector = document.getElementById('edit-categories');
        if (categorySelector) {
            categorySelector.addEventListener('click', (e) => {
                if (e.target.classList.contains('category-tag')) {
                    this.toggleCategory(e.target);
                }
            });
        }
    }

    // НОВОЕ: Настройка событий подачи заявки
    setupChannelSubmissionEvents() {
        // Category selection for submission
        const submissionCategories = document.getElementById('submission-categories');
        if (submissionCategories) {
            submissionCategories.addEventListener('click', (e) => {
                if (e.target.classList.contains('category-tag')) {
                    this.toggleSubmissionCategory(e.target);
                }
            });
        }
        
        // Character counters
        const charCounters = [
            { fieldId: 'submission-channel-name', counterId: 'submission-name-chars', maxLength: 50 },
            { fieldId: 'submission-description', counterId: 'submission-description-chars', maxLength: 300 }
        ];
        
        charCounters.forEach(({ fieldId, counterId }) => {
            const field = document.getElementById(fieldId);
            const counter = document.getElementById(counterId);
            if (field && counter) {
                field.addEventListener('input', () => {
                    counter.textContent = field.value.length;
                });
            }
        });
    }

    // НОВОЕ: Переключение категории для подачи заявки
    toggleSubmissionCategory(categoryElement) {
        const category = categoryElement.dataset.category;
        
        if (categoryElement.classList.contains('selected')) {
            // Убираем категорию
            categoryElement.classList.remove('selected');
            this.selectedCategories = this.selectedCategories.filter(c => c !== category);
        } else {
            // Добавляем категорию (максимум 3)
            if (this.selectedCategories.length < 3) {
                categoryElement.classList.add('selected');
                this.selectedCategories.push(category);
            } else {
                MiniUtils.showNotification('Максимум 3 категории', 'info');
                return;
            }
        }
        
        this.updateSubmissionCategoriesDisplay();
        MiniUtils.vibrate([30]);
    }

    // НОВОЕ: Обновление отображения выбранных категорий для подачи заявки
    updateSubmissionCategoriesDisplay() {
        const displayElement = document.getElementById('submission-categories-text');
        if (displayElement) {
            if (this.selectedCategories.length === 0) {
                displayElement.textContent = 'Нет';
                displayElement.style.color = '#666';
            } else {
                displayElement.textContent = this.selectedCategories.join(', ');
                displayElement.style.color = '#00FF88';
            }
        }
    }

    // НОВОЕ: Переключение категории
    toggleCategory(categoryElement) {
        const category = categoryElement.dataset.category;
        
        if (categoryElement.classList.contains('selected')) {
            // Убираем категорию
            categoryElement.classList.remove('selected');
            this.selectedCategories = this.selectedCategories.filter(c => c !== category);
        } else {
            // Добавляем категорию (максимум 3)
            if (this.selectedCategories.length < 3) {
                categoryElement.classList.add('selected');
                this.selectedCategories.push(category);
            } else {
                MiniUtils.showNotification('Максимум 3 категории', 'info');
                return;
            }
        }
        
        this.updateSelectedCategoriesDisplay();
        MiniUtils.vibrate([30]);
    }

    // НОВОЕ: Обновление отображения выбранных категорий
    updateSelectedCategoriesDisplay() {
        const displayElement = document.getElementById('selected-categories-text');
        if (displayElement) {
            if (this.selectedCategories.length === 0) {
                displayElement.textContent = 'Нет';
                displayElement.style.color = '#666';
            } else {
                displayElement.textContent = this.selectedCategories.join(', ');
                displayElement.style.color = '#00FF88';
            }
        }
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

    // === PURCHASE MODAL (БЕЗ КАТЕГОРИЙ) ===
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
        const telegramLink = document.getElementById('telegram-link');
        const pixelDescription = document.getElementById('pixel-description');
        
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
        const telegramLink = document.getElementById('telegram-link');
        const pixelDescription = document.getElementById('pixel-description');
        
        if (!purchasePixelId || !telegramLink) {
            MiniUtils.showNotification('Ошибка формы', 'error');
            return;
        }
        
        const pixelId = parseInt(purchasePixelId.textContent);
        const telegramLinkValue = telegramLink.value.trim();
        const description = pixelDescription ? pixelDescription.value.trim() : '';

        // Validation
        if (!this.validatePurchaseForm(telegramLinkValue)) {
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
            categories: ['Общее'], // Дефолтная категория
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

    validatePurchaseForm(telegramLink) {
        let isValid = true;

        if (!telegramLink || !MiniUtils.validateTelegramUsername(telegramLink)) {
            MiniUtils.showNotification('Введите корректный Telegram канал', 'error');
            const telegramLinkInput = document.getElementById('telegram-link');
            if (telegramLinkInput) telegramLinkInput.focus();
            isValid = false;
        }

        return isValid;
    }

    // === MASS PURCHASE MODAL (БЕЗ КАТЕГОРИЙ) ===
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
        const massTelegramLink = document.getElementById('mass-telegram-link');
        const massPixelDescription = document.getElementById('mass-pixel-description');
        
        if (massTelegramLink) massTelegramLink.value = '';
        if (massPixelDescription) massPixelDescription.value = '';
        
        // Reset validation classes
        document.querySelectorAll('#mass-purchase-modal .form-control').forEach(input => {
            input.classList.remove('valid', 'invalid');
            input.setCustomValidity('');
        });
    }

    async confirmMassPurchase() {
        const massTelegramLink = document.getElementById('mass-telegram-link');
        const massPixelDescription = document.getElementById('mass-pixel-description');
        const massCount = document.getElementById('mass-count');
        
        if (!massTelegramLink) {
            MiniUtils.showNotification('Ошибка формы', 'error');
            return;
        }
        
        const telegramLink = massTelegramLink.value.trim();
        const description = massPixelDescription ? massPixelDescription.value.trim() : '';
        const count = parseInt(massCount.textContent || '0');
        const total = count * 0.01;

        // Validation
        if (!this.validateMassPurchaseForm(telegramLink)) {
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
                categories: ['Общее'], // Дефолтная категория
                channel: MiniUtils.extractTelegramUsername(telegramLink),
                telegramLink: MiniUtils.normalizeTelegramLink(telegramLink),
                description: description || `Массовая покупка пикселей`,
                owner: window.miniGrid.currentUser
            };

            window.miniGrid.completeMassPurchase(purchaseData);
        }

        this.closeMassPurchaseModal();
    }

    validateMassPurchaseForm(telegramLink) {
        let isValid = true;

        if (!telegramLink || !MiniUtils.validateTelegramUsername(telegramLink)) {
            MiniUtils.showNotification('Введите корректный Telegram канал', 'error');
            const massTelegramLink = document.getElementById('mass-telegram-link');
            if (massTelegramLink) massTelegramLink.focus();
            isValid = false;
        }

        return isValid;
    }

    // === НОВОЕ: PIXEL INFO EDIT MODAL ===
    showPixelInfoEditModal(pixelIds) {
        this.currentPixelIds = [...pixelIds];
        this.selectedCategories = [];
        
        const editPixelCount = document.getElementById('edit-pixel-count');
        if (editPixelCount) editPixelCount.textContent = pixelIds.length;
        
        // Load existing data from first pixel
        this.loadExistingPixelData(pixelIds[0]);
        
        // Reset form
        this.resetPixelInfoEditForm();
        
        this.activeModal = 'pixel-info-edit-modal';
        const modal = document.getElementById('pixel-info-edit-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([100]);
            
            // Show Telegram back button
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.BackButton.show();
            }
        }
    }

    closePixelInfoEditModal() {
        const modal = document.getElementById('pixel-info-edit-modal');
        if (modal) modal.classList.remove('active');
        
        this.activeModal = null;
        this.currentPixelIds = [];
        this.selectedCategories = [];
        
        // Hide Telegram back button if no other modals open
        if (window.Telegram?.WebApp && !this.isModalOpen()) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    loadExistingPixelData(pixelId) {
        if (!window.miniGrid || !window.miniGrid.pixels.has(pixelId)) return;
        
        const pixelData = window.miniGrid.pixels.get(pixelId);
        
        // Load categories
        if (pixelData.categories && Array.isArray(pixelData.categories)) {
            this.selectedCategories = [...pixelData.categories];
            this.updateCategorySelection();
        }
        
        // Load telegram link
        const telegramInput = document.getElementById('edit-telegram-link');
        if (telegramInput && pixelData.telegramLink) {
            telegramInput.value = pixelData.telegramLink;
        }
        
        // Load description
        const descriptionInput = document.getElementById('edit-description');
        if (descriptionInput && pixelData.description) {
            descriptionInput.value = pixelData.description;
            // Update character counter
            const charCounter = document.getElementById('edit-description-chars');
            if (charCounter) charCounter.textContent = pixelData.description.length;
        }
        
        this.updateSelectedCategoriesDisplay();
    }

    updateCategorySelection() {
        // Reset all categories
        document.querySelectorAll('#edit-categories .category-tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        
        // Select current categories
        this.selectedCategories.forEach(category => {
            const tagElement = document.querySelector(`#edit-categories .category-tag[data-category="${category}"]`);
            if (tagElement) {
                tagElement.classList.add('selected');
            }
        });
    }

    resetPixelInfoEditForm() {
        // Reset categories
        this.selectedCategories = [];
        document.querySelectorAll('#edit-categories .category-tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        
        // Reset form fields
        const telegramInput = document.getElementById('edit-telegram-link');
        const descriptionInput = document.getElementById('edit-description');
        const charCounter = document.getElementById('edit-description-chars');
        
        if (telegramInput) telegramInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (charCounter) charCounter.textContent = '0';
        
        this.updateSelectedCategoriesDisplay();
        
        // Reset validation classes
        document.querySelectorAll('#pixel-info-edit-modal .form-control').forEach(input => {
            input.classList.remove('valid', 'invalid');
            input.setCustomValidity('');
        });
    }

    savePixelInfo() {
        const telegramLink = document.getElementById('edit-telegram-link');
        const description = document.getElementById('edit-description');
        
        if (!telegramLink) {
            MiniUtils.showNotification('Ошибка формы', 'error');
            return;
        }
        
        const telegramLinkValue = telegramLink.value.trim();
        const descriptionValue = description ? description.value.trim() : '';
        
        // Validation
        if (telegramLinkValue && !MiniUtils.validateTelegramUsername(telegramLinkValue)) {
            MiniUtils.showNotification('Введите корректный Telegram канал', 'error');
            telegramLink.focus();
            return;
        }
        
        if (this.selectedCategories.length === 0) {
            MiniUtils.showNotification('Выберите хотя бы одну категорию', 'error');
            return;
        }
        
        // Update pixel data
        if (window.miniGrid) {
            this.currentPixelIds.forEach(pixelId => {
                if (window.miniGrid.pixels.has(pixelId)) {
                    const pixelData = window.miniGrid.pixels.get(pixelId);
                    
                    // Update data
                    pixelData.categories = [...this.selectedCategories];
                    if (telegramLinkValue) {
                        pixelData.channel = MiniUtils.extractTelegramUsername(telegramLinkValue);
                        pixelData.telegramLink = MiniUtils.normalizeTelegramLink(telegramLinkValue);
                    }
                    if (descriptionValue) {
                        pixelData.description = descriptionValue;
                    }
                    
                    window.miniGrid.pixels.set(pixelId, pixelData);
                }
            });
            
            // Save and update display
            window.miniGrid.savePixelData();
            window.miniGrid.updatePixelDisplay();
            
            // Update channels if needed
            if (window.miniChannels) {
                window.miniChannels.onPixelPurchased();
            }
        }
        
        MiniUtils.showNotification(`Информация обновлена для ${this.currentPixelIds.length} пикселей!`, 'success');
        MiniUtils.vibrate([100, 50, 100]);
        
        this.closePixelInfoEditModal();
    }

    // === НОВОЕ: CHANNEL SUBMISSION MODAL ===
    showChannelSubmissionModal() {
        this.resetChannelSubmissionForm();
        this.activeModal = 'channel-submission-modal';
        
        const modal = document.getElementById('channel-submission-modal');
        if (modal) {
            modal.classList.add('active');
            MiniUtils.vibrate([100]);
            
            // Show Telegram back button
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.BackButton.show();
            }
        }
    }

    closeChannelSubmissionModal() {
        const modal = document.getElementById('channel-submission-modal');
        if (modal) modal.classList.remove('active');
        
        this.activeModal = null;
        this.selectedCategories = [];
        
        // Hide Telegram back button if no other modals open
        if (window.Telegram?.WebApp && !this.isModalOpen()) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    resetChannelSubmissionForm() {
        // Reset form fields
        const fields = [
            'submission-telegram-link',
            'submission-channel-name', 
            'submission-description',
            'submission-owner-contact'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        // Reset checkbox
        const termsCheckbox = document.getElementById('submission-terms');
        if (termsCheckbox) termsCheckbox.checked = false;
        
        // Reset categories
        this.selectedCategories = [];
        document.querySelectorAll('#submission-categories .category-tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        this.updateSubmissionCategoriesDisplay();
        
        // Reset character counters
        const counters = [
            { fieldId: 'submission-channel-name', counterId: 'submission-name-chars' },
            { fieldId: 'submission-description', counterId: 'submission-description-chars' }
        ];
        
        counters.forEach(({ counterId }) => {
            const counter = document.getElementById(counterId);
            if (counter) counter.textContent = '0';
        });
    }

    submitChannelApplication() {
        // Получаем данные формы
        const telegramLink = document.getElementById('submission-telegram-link')?.value.trim();
        const channelName = document.getElementById('submission-channel-name')?.value.trim();
        const description = document.getElementById('submission-description')?.value.trim();
        const ownerContact = document.getElementById('submission-owner-contact')?.value.trim();
        const termsAccepted = document.getElementById('submission-terms')?.checked || false;
        
        // Валидация
        if (!telegramLink || !MiniUtils.validateTelegramUsername(telegramLink)) {
            MiniUtils.showNotification('Введите корректную ссылку на Telegram канал', 'error');
            document.getElementById('submission-telegram-link')?.focus();
            return;
        }
        
        if (!channelName) {
            MiniUtils.showNotification('Введите название канала', 'error');
            document.getElementById('submission-channel-name')?.focus();
            return;
        }
        
        if (this.selectedCategories.length === 0) {
            MiniUtils.showNotification('Выберите хотя бы одну категорию', 'error');
            return;
        }
        
        if (!description) {
            MiniUtils.showNotification('Введите описание канала', 'error');
            document.getElementById('submission-description')?.focus();
            return;
        }
        
        if (!termsAccepted) {
            MiniUtils.showNotification('Необходимо согласиться с правилами', 'error');
            return;
        }
        
        // Создаем заявку (БЕЗ дополнительных опций)
        const submission = {
            id: MiniUtils.generateId(),
            telegramLink: MiniUtils.normalizeTelegramLink(telegramLink),
            channelName: channelName,
            categories: [...this.selectedCategories],
            description: description,
            ownerContact: ownerContact || null,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        // Сохраняем заявку
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        submissions.push(submission);
        MiniUtils.saveToStorage('nftg-channel-submissions', submissions);
        
        // Показываем успешное сообщение
        MiniUtils.showNotification(`Заявка на канал "${channelName}" отправлена на модерацию!`, 'success');
        MiniUtils.vibrate([100, 50, 100]);
        
        // Закрываем модальное окно
        this.closeChannelSubmissionModal();
        
        // Обновляем каналы если возможно
        if (window.miniChannels) {
            setTimeout(() => {
                window.miniChannels.loadChannelsFromPixels();
            }, 500);
        }
        
        console.log('Channel submission created:', submission);
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
        const infoCategories = document.getElementById('info-categories');
        const infoDate = document.getElementById('info-date');
        const infoPrice = document.getElementById('info-price');
        
        if (infoPixelId) infoPixelId.textContent = pixelId;
        if (infoOwner) infoOwner.textContent = pixelData.channel || pixelData.owner || '@unknown';
        if (infoCategories) {
            const categories = pixelData.categories && Array.isArray(pixelData.categories) 
                ? pixelData.categories.join(', ') 
                : (pixelData.category || 'Не указаны');
            infoCategories.textContent = categories;
        }
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
        this.currentPixelIds = [];
        this.selectedCategories = [];
        
        // Hide Telegram back button
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    isModalOpen() {
        return this.activeModal !== null;
    }

    getCurrentModal() {
        return this.activeModal;
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
            walletBalance: window.miniWallet?.balance || 0,
            selectedCategories: this.selectedCategories.length,
            currentPixelIds: this.currentPixelIds.length
        };
    }
}

// Глобальная инициализация
window.MiniModals = MiniModals;