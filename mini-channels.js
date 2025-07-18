class MiniChannels {
    constructor() {
        this.channels = [];
        this.filteredChannels = [];
        this.activeFilters = [];
        this.currentSort = 'newest';
        this.searchTerm = '';
        this.isOpen = false;
        this.isMainSidebarOpen = false;
        this.userVerified = false;
        this.userRatings = new Map();
        this.currentRatingChannel = null;
        this.selectedRating = 0;
        this.verificationStatus = 'none'; // none, pending, verified, failed
        this.verificationTransactionHash = null;
        
        // Cache DOM elements
        this.userNameElement = document.getElementById('user-name');
        this.userStatusElement = document.getElementById('user-status');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChannelsFromPixels();
        this.loadUserVerification();
        this.loadUserRatings();
        console.log('✅ MiniChannels initialized');
    }

    setupEventListeners() {
        // Hamburger menu toggle
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const closeMainSidebarBtn = document.getElementById('close-main-sidebar');
        
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleMainSidebar());
        }
        
        if (closeMainSidebarBtn) {
            closeMainSidebarBtn.addEventListener('click', () => this.closeMainSidebar());
        }

        // Main menu items
        const channelsNavigatorBtn = document.getElementById('channels-navigator-btn');
        if (channelsNavigatorBtn) {
            channelsNavigatorBtn.addEventListener('click', () => {
                this.closeMainSidebar();
                setTimeout(() => this.openSidebar(), 300);
            });
        }

        const submitChannelBtn = document.getElementById('submit-channel-btn');
        if (submitChannelBtn) {
            submitChannelBtn.addEventListener('click', () => {
                this.closeMainSidebar();
                setTimeout(() => {
                    if (window.miniModals) {
                        window.miniModals.showChannelSubmissionModal();
                    } else {
                        console.error('MiniModals not available');
                        MiniUtils.showNotification('Ошибка: модуль модальных окон не загружен', 'error');
                    }
                }, 300);
            });
        }

        const marketBtn = document.getElementById('market-btn');
        if (marketBtn) {
            marketBtn.addEventListener('click', () => this.openMarket());
        }

        const websiteBtn = document.getElementById('website-btn');
        if (websiteBtn) {
            websiteBtn.addEventListener('click', () => this.openWebsite());
        }

        const verificationBtn = document.getElementById('verification-btn');
        if (verificationBtn) {
            verificationBtn.addEventListener('click', () => this.handleVerificationClick());
        }

        const statsBtn = document.getElementById('stats-btn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showStats());
        }

        // Channel navigator close
        const closeSidebarBtn = document.getElementById('close-sidebar');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeSidebar());
        }

        // Search and filters
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', MiniUtils.debounce((e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300));
        }

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFilters();
            });
        }

        // Category filters
        const categoryFilters = document.getElementById('category-filters');
        if (categoryFilters) {
            categoryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-tag')) {
                    this.toggleCategoryFilter(e.target);
                }
            });
        }

        // Rating modal events
        this.setupRatingModalEvents();

        // Optimized click handler for closing sidebar
        document.addEventListener('click', (e) => {
            if (!this.isOpen && !this.isMainSidebarOpen) return;
            
            const sidebar = document.getElementById('channel-sidebar');
            const mainSidebar = document.getElementById('main-sidebar');
            const hamburger = document.getElementById('hamburger-menu');
            
            if (
                (this.isOpen && sidebar && !sidebar.contains(e.target) && !hamburger.contains(e.target)) ||
                (this.isMainSidebarOpen && mainSidebar && !mainSidebar.contains(e.target) && !hamburger.contains(e.target))
            ) {
                if (this.isOpen) this.closeSidebar();
                if (this.isMainSidebarOpen) this.closeMainSidebar();
            }
        }, { passive: true });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isOpen) {
                    this.closeSidebar();
                } else if (this.isMainSidebarOpen) {
                    this.closeMainSidebar();
                }
            }
        });

        // Telegram WebApp back button
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('backButtonClicked', () => {
                if (this.isOpen) {
                    this.closeSidebar();
                } else if (this.isMainSidebarOpen) {
                    this.closeMainSidebar();
                }
            });
        }
    }

    toggleMainSidebar() {
        if (this.isMainSidebarOpen) {
            this.closeMainSidebar();
        } else {
            this.openMainSidebar();
        }
    }

    openMainSidebar() {
        const sidebar = document.getElementById('main-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            requestAnimationFrame(() => {
                sidebar.classList.add('active');
                this.isMainSidebarOpen = true;
                
                if (hamburger) {
                    hamburger.classList.add('active');
                }
                
                // Defer Telegram API call
                setTimeout(() => {
                    if (window.Telegram?.WebApp) {
                        window.Telegram.WebApp.BackButton.show();
                    }
                }, 0);
                
                this.updateUserInfo();
                MiniUtils.vibrate([30]); // Reduced vibration duration
                console.log('Main sidebar opened');
            });
        }
    }

    closeMainSidebar() {
        const sidebar = document.getElementById('main-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            requestAnimationFrame(() => {
                sidebar.classList.remove('active');
                this.isMainSidebarOpen = false;
                
                if (hamburger) {
                    hamburger.classList.remove('active');
                }
                
                if (window.Telegram?.WebApp && !this.isOpen && !window.miniModals?.isModalOpen()) {
                    window.Telegram.WebApp.BackButton.hide();
                }
                
                console.log('Main sidebar closed');
            });
        }
    }

    updateUserInfo() {
        requestAnimationFrame(() => {
            if (this.userNameElement) {
                this.userNameElement.textContent = window.miniGrid ? window.miniGrid.currentUser : '@demo_user';
            }
            
            if (this.userStatusElement) {
                this.updateVerificationStatus(this.userStatusElement);
            }
        });
    }

    updateVerificationStatus(statusElement) {
        requestAnimationFrame(() => {
            if (!statusElement) return;

            const statusConfig = {
                verified: {
                    text: 'Верифицирован ✓',
                    class: 'verified',
                    color: '#00FF88',
                    background: 'rgba(0, 255, 136, 0.1)'
                },
                pending: {
                    text: 'Верификация...',
                    class: 'pending',
                    color: '#FFB800',
                    background: 'rgba(255, 184, 0, 0.1)'
                },
                failed: {
                    text: 'Ошибка верификации',
                    class: 'failed',
                    color: '#FF4444',
                    background: 'rgba(255, 68, 68, 0.1)'
                },
                none: {
                    text: 'Не верифицирован',
                    class: '',
                    color: '#FFB800',
                    background: 'rgba(255, 184, 0, 0.1)'
                }
            };

            const config = statusConfig[this.verificationStatus] || statusConfig.none;
            statusElement.textContent = config.text;
            statusElement.className = `user-status ${config.class}`;
            statusElement.style.color = config.color;
            statusElement.style.background = config.background;
        });
    }

    openSidebar() {
        const sidebar = document.getElementById('channel-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            sidebar.classList.add('active');
            this.isOpen = true;
            
            if (hamburger) {
                hamburger.classList.add('active');
            }
            
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.BackButton.show();
            }
            
            this.loadChannelsFromPixels();
            this.applyFilters();
            
            MiniUtils.vibrate([30]);
            console.log('Channels sidebar opened');
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('channel-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            sidebar.classList.remove('active');
            this.isOpen = false;
            
            if (hamburger) {
                hamburger.classList.remove('active');
            }
            
            if (window.Telegram?.WebApp && !window.miniModals?.isModalOpen()) {
                window.Telegram.WebApp.BackButton.hide();
            }
            
            console.log('Channels sidebar closed');
        }
    }

    loadChannelsFromPixels() {
        const pixelChannels = [];
        
        if (window.miniGrid && window.miniGrid.pixels) {
            window.miniGrid.pixels.forEach((pixelData, pixelId) => {
                if (pixelData.channel || pixelData.telegramLink) {
                    const channelName = pixelData.channel || MiniUtils.extractTelegramUsername(pixelData.telegramLink);
                    
                    const existingChannel = pixelChannels.find(ch => ch.channel === channelName);
                    
                    if (!existingChannel) {
                        const subscribers = this.generateSubscriberCount(
                            this.getFirstCategory(pixelData) || 'Разное', 
                            pixelId
                        );
                        
                        pixelChannels.push({
                            id: `pixel_${pixelId}`,
                            channel: channelName,
                            name: channelName.replace('@', ''),
                            description: pixelData.description || 'Канал из пиксель-сетки',
                            category: this.getFirstCategory(pixelData) || 'Разное',
                            categories: pixelData.categories || [pixelData.category || 'Разное'],
                            telegramLink: pixelData.telegramLink || MiniUtils.normalizeTelegramLink(channelName),
                            owner: pixelData.owner,
                            purchaseDate: pixelData.purchaseDate,
                            pixelId: pixelId,
                            isOwned: pixelData.owner === (window.miniGrid ? window.miniGrid.currentUser : '@demo_user'),
                            price: pixelData.price || 0.01,
                            subscribers: subscribers,
                            rating: this.generateRating(pixelId),
                            postsPerMonth: this.generatePostsPerMonth(pixelId),
                            verified: Math.random() > 0.7,
                            userRating: this.userRatings.get(channelName) || null,
                            type: 'pixel'
                        });
                    } else {
                        if (!existingChannel.pixelIds) {
                            existingChannel.pixelIds = [existingChannel.pixelId];
                        }
                        existingChannel.pixelIds.push(pixelId);
                    }
                }
            });
        }

        const approvedSubmissions = this.loadApprovedSubmissions();
        approvedSubmissions.forEach(submission => {
            pixelChannels.push({
                id: `submission_${submission.id}`,
                channel: submission.telegramLink,
                name: submission.channelName,
                description: submission.description,
                category: submission.categories[0] || 'Разное',
                categories: submission.categories,
                telegramLink: submission.telegramLink,
                owner: submission.ownerContact || 'Модерация',
                purchaseDate: submission.submittedAt,
                pixelId: null,
                isOwned: false,
                price: 0,
                subscribers: submission.subscriberCount || this.generateSubscriberCount(submission.categories[0] || 'Разное', submission.id.hashCode()),
                rating: this.generateRating(submission.id.hashCode()),
                postsPerMonth: this.generatePostsPerMonth(submission.id.hashCode()),
                verified: true,
                userRating: this.userRatings.get(submission.channelName) || null,
                type: 'approved'
            });
        });

        if (pixelChannels.length === 0) {
            pixelChannels.push({
                id: 'demo_1',
                channel: '@demo_channel',
                name: 'demo_channel',
                description: 'Демо-канал для тестирования функций приложения',
                category: 'Демо',
                categories: ['Демо'],
                telegramLink: 'https://t.me/demo_channel',
                owner: '@demo_user',
                purchaseDate: new Date().toISOString(),
                pixelId: 11,
                isOwned: true,
                price: 0.01,
                subscribers: 1250,
                rating: 4.2,
                postsPerMonth: 45,
                verified: true,
                userRating: null,
                type: 'pixel'
            });
        }

        this.channels = pixelChannels;
        console.log('Loaded channels:', this.channels.length, 'pixel channels:', pixelChannels.filter(ch => ch.type === 'pixel').length, 'approved submissions:', pixelChannels.filter(ch => ch.type === 'approved').length);
    }

    loadApprovedSubmissions() {
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        const approved = submissions.filter(sub => sub.status === 'approved');
        
        if (approved.length === 0) {
            const demoApproved = [
                {
                    id: 'demo_approved_1',
                    channelName: 'Crypto Analytics Pro',
                    telegramLink: 'https://t.me/crypto_analytics_pro',
                    description: 'Профессиональная аналитика криптовалют и рынков',
                    categories: ['Крипта', 'Бизнес'],
                    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'approved',
                    subscriberCount: 15420,
                    ownerContact: '@crypto_admin'
                },
                {
                    id: 'demo_approved_2',
                    channelName: 'GameDev News',
                    telegramLink: 'https://t.me/gamedev_news_ru',
                    description: 'Новости игровой индустрии и разработки игр',
                    categories: ['Игры', 'Технологии'],
                    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'approved',
                    subscriberCount: 8750,
                    ownerContact: '@gamedev_moderator'
                }
            ];
            
            MiniUtils.saveToStorage('nftg-channel-submissions', demoApproved);
            return demoApproved;
        }
        
        return approved;
    }

    getFirstCategory(pixelData) {
        if (pixelData.categories && Array.isArray(pixelData.categories) && pixelData.categories.length > 0) {
            return pixelData.categories[0];
        }
        return pixelData.category || null;
    }

    formatCategories(categories) {
        if (!categories || !Array.isArray(categories)) {
            return 'Не указана';
        }
        return categories.join(', ');
    }

    generateSubscriberCount(category, pixelId) {
        const baseRanges = {
            'Крипта': { min: 5000, max: 150000 },
            'Новости': { min: 10000, max: 200000 },
            'Технологии': { min: 3000, max: 80000 },
            'Игры': { min: 8000, max: 120000 },
            'Бизнес': { min: 2000, max: 50000 },
            'Образование': { min: 1500, max: 40000 },
            'Спорт': { min: 2000, max: 60000 },
            'Развлечения': { min: 5000, max: 100000 },
            'Демо': { min: 500, max: 2000 }
        };

        const range = baseRanges[category] || { min: 1000, max: 25000 };
        const seed = pixelId * 137;
        const random = Math.abs(Math.sin(seed)) * (range.max - range.min) + range.min;
        
        return Math.floor(random);
    }

    generateRating(pixelId) {
        const seed = pixelId * 73;
        const random = Math.abs(Math.sin(seed));
        return Math.round((3 + random * 2) * 10) / 10;
    }

    generatePostsPerMonth(pixelId) {
        const seed = pixelId * 89;
        const random = Math.abs(Math.sin(seed));
        return Math.floor(random * 120 + 5);
    }

    toggleCategoryFilter(element) {
        const category = element.dataset.category;
        
        if (element.classList.contains('active')) {
            this.activeFilters = this.activeFilters.filter(f => f !== category);
            element.classList.remove('active');
        } else {
            if (this.activeFilters.length < 3) {
                this.activeFilters.push(category);
                element.classList.add('active');
            } else {
                MiniUtils.showNotification('Максимум 3 категории', 'info');
            }
        }
        
        this.applyFilters();
        MiniUtils.vibrate([30]);
    }

    applyFilters() {
        let filtered = [...this.channels];

        if (this.searchTerm) {
            filtered = filtered.filter(channel => 
                channel.name.toLowerCase().includes(this.searchTerm) ||
                channel.description.toLowerCase().includes(this.searchTerm) ||
                channel.category.toLowerCase().includes(this.searchTerm) ||
                (channel.categories && channel.categories.some(cat => 
                    cat.toLowerCase().includes(this.searchTerm)
                ))
            );
        }

        if (this.activeFilters.length > 0) {
            filtered = filtered.filter(channel => {
                if (channel.categories && Array.isArray(channel.categories)) {
                    return this.activeFilters.some(filter => 
                        channel.categories.includes(filter)
                    );
                }
                return this.activeFilters.includes(channel.category);
            });
        }

        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'subscribers':
                filtered.sort((a, b) => b.subscribers - a.subscribers);
                break;
            case 'activity':
                filtered.sort((a, b) => b.postsPerMonth - a.postsPerMonth);
                break;
        }

        this.filteredChannels = filtered;
        this.renderChannels();
    }

    renderChannels() {
        const channelsList = document.getElementById('channels-list');
        if (!channelsList) return;

        if (this.filteredChannels.length === 0) {
            channelsList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.6);">
                    <div style="font-size: 32px; margin-bottom: 12px;">📺</div>
                    <div style="font-size: 16px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">Каналы не найдены</div>
                    <div style="font-size: 12px;">Купите пиксели с каналами или измените фильтры</div>
                </div>
            `;
            return;
        }

        channelsList.innerHTML = this.filteredChannels.map(channel => `
            <div class="channel-card ${channel.isOwned ? 'owned' : ''}" onclick="window.miniChannels?.viewChannel('${channel.id}')">
                <div class="channel-header">
                    <div class="channel-avatar">${MiniUtils.getCategoryIcon(channel.category)}</div>
                    <div class="channel-info">
                        <div class="channel-name">
                            ${channel.name}
                            ${channel.isOwned ? ' <span style="background: linear-gradient(45deg, #00FF88, #00CC66); color: #000; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 600;">МОЙ</span>' : ''}
                            ${channel.verified ? ' <span style="background: linear-gradient(45deg, #00D4FF, #0099CC); color: #000; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 600;">✓</span>' : ''}
                            ${channel.type === 'approved' ? ' <span style="background: linear-gradient(45deg, #9D4EDD, #7209B7); color: #fff; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 600;">📝</span>' : ''}
                        </div>
                        <div class="channel-stats">
                            ${channel.pixelId ? `📍 #${channel.pixelId} • ` : '🆓 Без пикселя • '}👥 ${this.formatSubscriberCount(channel.subscribers)} • ⭐ ${channel.rating || 'N/A'} • 📝 ${channel.postsPerMonth}/мес
                        </div>
                    </div>
                </div>
                <div class="channel-description">${channel.description}</div>
                <div class="channel-categories" style="margin: 8px 0; font-size: 10px; color: rgba(255,255,255,0.7);">
                    📂 ${this.formatCategories(channel.categories)}
                </div>
                <div class="channel-footer">
                    <div class="channel-category">${MiniUtils.getCategoryIcon(channel.category)} ${channel.category}</div>
                    <div class="channel-actions">
                        <button class="rate-channel-btn" onclick="event.stopPropagation(); window.miniChannels?.rateChannel('${channel.id}')">
                            ⭐ ${channel.userRating || 'Оценить'}
                        </button>
                        <button class="view-channel-btn" onclick="event.stopPropagation(); window.miniChannels?.openChannel('${channel.telegramLink}')">
                            Открыть
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        setTimeout(() => {
            const cards = document.querySelectorAll('.channel-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
                card.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }, 50);
    }

    formatSubscriberCount(count) {
        return MiniUtils.formatSubscriberCount(count);
    }

    viewChannel(channelId) {
        const channel = this.channels.find(ch => ch.id === channelId);
        if (channel) {
            this.closeSidebar();
            
            if (channel.type === 'pixel' && window.miniGrid && channel.pixelId) {
                const pixelElement = document.querySelector(`[data-id="${channel.pixelId}"]`);
                if (pixelElement) {
                    const rect = pixelElement.getBoundingClientRect();
                    const containerRect = document.getElementById('grid-container').getBoundingClientRect();
                    
                    const offsetX = (containerRect.width / 2) - (rect.left + rect.width / 2 - containerRect.left);
                    const offsetY = (containerRect.height / 2) - (rect.top + rect.height / 2 - containerRect.top);
                    
                    window.miniGrid.translateX = offsetX;
                    window.miniGrid.translateY = offsetY;
                    window.miniGrid.updateGridTransform();
                    
                    pixelElement.style.animation = 'pulse 2s ease-in-out 3';
                    setTimeout(() => {
                        pixelElement.style.animation = '';
                    }, 6000);
                }
                
                const categoriesText = this.formatCategories(channel.categories);
                MiniUtils.showNotification(`Пиксель #${channel.pixelId} (${this.formatSubscriberCount(channel.subscribers)} подписчиков, ${categoriesText})`, 'success');
            } else if (channel.type === 'approved') {
                const categoriesText = this.formatCategories(channel.categories);
                MiniUtils.showNotification(`${channel.name} (${this.formatSubscriberCount(channel.subscribers)} подписчиков, ${categoriesText}) - Одобренная заявка`, 'success');
            }
            
            MiniUtils.vibrate([100, 50, 100]);
        }
    }

    openChannel(telegramLink) {
        if (telegramLink && telegramLink !== '#') {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.openTelegramLink(telegramLink);
            } else {
                window.open(telegramLink, '_blank', 'noopener,noreferrer');
            }
            MiniUtils.showNotification('Открытие канала', 'info');
            MiniUtils.vibrate([50]);
        } else {
            MiniUtils.showNotification('Ссылка недоступна', 'error');
        }
    }

    rateChannel(channelId) {
        const channel = this.channels.find(ch => ch.id === channelId);
        if (!channel) return;

        if (this.verificationStatus !== 'verified') {
            MiniUtils.showNotification('Для оценки каналов требуется верификация', 'info');
            this.showRatingModal(channel, false);
            return;
        }

        this.showRatingModal(channel, true);
    }

    showRatingModal(channel, canRate = true) {
        document.getElementById('rating-channel-name').textContent = channel.channel;
        document.getElementById('rating-channel-description').textContent = channel.description;
        document.querySelector('.rating-value').textContent = channel.rating;

        const verificationNotice = document.querySelector('.verification-notice');
        const submitButton = document.getElementById('submit-rating');
        const verifyButton = document.getElementById('verify-account');

        if (canRate) {
            verificationNotice.style.display = 'none';
            submitButton.style.display = 'inline-block';
            verifyButton.style.display = 'none';
        } else {
            verificationNotice.style.display = 'flex';
            submitButton.style.display = 'none';
            verifyButton.style.display = 'inline-block';
        }

        this.resetRatingSelection();
        
        if (channel.userRating) {
            this.setRatingSelection(channel.userRating);
        }

        this.currentRatingChannel = channel;
        document.getElementById('channel-rating-modal').classList.add('active');
        MiniUtils.vibrate([100]);
    }

    setupRatingModalEvents() {
        const starRating = document.getElementById('star-rating');
        if (starRating) {
            starRating.addEventListener('click', (e) => {
                if (e.target.classList.contains('star')) {
                    const rating = parseInt(e.target.dataset.rating);
                    this.setRatingSelection(rating);
                }
            });
        }

        const commentTextarea = document.getElementById('rating-comment');
        const charCounter = document.getElementById('comment-chars');
        if (commentTextarea && charCounter) {
            commentTextarea.addEventListener('input', (e) => {
                charCounter.textContent = e.target.value.length;
            });
        }

        document.getElementById('submit-rating')?.addEventListener('click', () => this.submitRating());
        document.getElementById('verify-account')?.addEventListener('click', () => this.handleVerificationClick());
        document.getElementById('cancel-rating')?.addEventListener('click', () => this.closeRatingModal());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeRatingModal();
            }
        });
    }

    setRatingSelection(rating) {
        const stars = document.querySelectorAll('.star');
        const ratingText = document.getElementById('rating-text');

        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });

        const ratingTexts = {
            1: 'Очень плохо',
            2: 'Плохо',
            3: 'Нормально',
            4: 'Хорошо',
            5: 'Отлично'
        };

        ratingText.textContent = ratingTexts[rating] || 'Выберите оценку';
        this.selectedRating = rating;
    }

    resetRatingSelection() {
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
        document.getElementById('rating-text').textContent = 'Выберите оценку';
        document.getElementById('rating-comment').value = '';
        document.getElementById('comment-chars').textContent = '0';
        this.selectedRating = 0;
    }

    submitRating() {
        if (!this.selectedRating || this.selectedRating < 1 || this.selectedRating > 5) {
            MiniUtils.showNotification('Выберите оценку от 1 до 5 звезд', 'error');
            return;
        }

        const comment = document.getElementById('rating-comment').value.trim();
        const channel = this.currentRatingChannel;

        this.userRatings.set(channel.channel, {
            rating: this.selectedRating,
            comment: comment,
            date: new Date().toISOString()
        });

        const channelIndex = this.channels.findIndex(ch => ch.id === channel.id);
        if (channelIndex !== -1) {
            this.channels[channelIndex].userRating = this.selectedRating;
        }

        this.saveUserRatings();
        this.applyFilters();
        this.closeRatingModal();

        MiniUtils.showNotification(`Канал ${channel.channel} оценен на ${this.selectedRating} звезд!`, 'success');
        MiniUtils.vibrate([100, 50, 100]);
    }

    closeRatingModal() {
        document.getElementById('channel-rating-modal').classList.remove('active');
        this.currentRatingChannel = null;
        this.selectedRating = 0;
    }

    openMarket() {
        this.closeMainSidebar();
        MiniUtils.showNotification('Маркет будет доступен в следующем обновлении', 'info');
    }

    openWebsite() {
        const websiteUrl = 'https://nftg-zonix.com';
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(websiteUrl);
        } else {
            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
        }
        
        MiniUtils.showNotification('Открытие официального сайта', 'info');
        this.closeMainSidebar();
    }

    handleVerificationClick() {
        this.closeRatingModal();
        this.closeMainSidebar();
        
        if (this.verificationStatus === 'verified') {
            this.showVerificationStatus();
        } else if (this.verificationStatus === 'pending') {
            this.showPendingVerification();
        } else {
            this.startVerification();
        }
    }

    showVerificationStatus() {
        const verificationData = this.getVerificationData();
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: '✅ Аккаунт верифицирован',
                message: `Ваш аккаунт успешно верифицирован!\n\nДата: ${verificationData.date}\nТранзакция: ${verificationData.hash || 'Демо'}`,
                buttons: [
                    { id: 'reset', type: 'destructive', text: 'Сбросить верификацию' },
                    { type: 'ok' }
                ]
            }, (buttonId) => {
                if (buttonId === 'reset') {
                    this.resetVerification();
                }
            });
        } else {
            const action = confirm(`✅ Аккаунт верифицирован!\n\nДата: ${verificationData.date}\nТранзакция: ${verificationData.hash || 'Демо'}\n\nСбросить верификацию?`);
            if (action) {
                this.resetVerification();
            }
        }
    }

    showPendingVerification() {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: '⏳ Проверка транзакции',
                message: 'Ваша транзакция проверяется. Это может занять до 5 минут.',
                buttons: [
                    { id: 'check', type: 'default', text: 'Проверить сейчас' },
                    { id: 'cancel', type: 'destructive', text: 'Отменить' },
                    { type: 'ok' }
                ]
            }, (buttonId) => {
                if (buttonId === 'check') {
                    this.checkVerificationStatus();
                } else if (buttonId === 'cancel') {
                    this.cancelVerification();
                }
            });
        } else {
            const action = prompt('⏳ Проверка транзакции\n\nВведите:\n"check" - проверить сейчас\n"cancel" - отменить');
            if (action === 'check') {
                this.checkVerificationStatus();
            } else if (action === 'cancel') {
                this.cancelVerification();
            }
        }
    }

    async startVerification() {
        if (!window.miniWallet || !window.miniWallet.isConnected) {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.showPopup({
                    title: 'Подключите кошелек',
                    message: 'Для верификации необходимо подключить TON кошелек',
                    buttons: [
                        { id: 'connect', type: 'default', text: 'Подключить' },
                        { type: 'cancel' }
                    ]
                }, (buttonId) => {
                    if (buttonId === 'connect') {
                        this.openMainSidebar();
                        setTimeout(() => {
                            document.getElementById('wallet-connect-btn')?.click();
                        }, 300);
                    }
                });
            } else {
                if (confirm('Для верификации необходимо подключить TON кошелек. Открыть настройки?')) {
                    this.openMainSidebar();
                    setTimeout(() => {
                        document.getElementById('wallet-connect-btn')?.click();
                    }, 300);
                }
            }
            return;
        }

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: '🔐 Верификация аккаунта',
                message: 'Для верификации отправьте 0.01 TON на адрес верификации. Средства будут возвращены на ваш кошелек в течение 24 часов.',
                buttons: [
                    { id: 'verify', type: 'default', text: 'Отправить 0.01 TON' },
                    { id: 'demo', type: 'default', text: '🧪 Демо верификация' },
                    { type: 'cancel' }
                ]
            }, (buttonId) => {
                if (buttonId === 'verify') {
                    this.processVerification(false);
                } else if (buttonId === 'demo') {
                    this.processVerification(true);
                }
            });
        } else {
            const choice = prompt('🔐 Верификация аккаунта\n\nВыберите:\n"verify" - отправить 0.01 TON\n"demo" - демо верификация');
            if (choice === 'verify') {
                this.processVerification(false);
            } else if (choice === 'demo') {
                this.processVerification(true);
            }
        }
    }

    async processVerification(isDemo = false) {
        try {
            this.verificationStatus = 'pending';
            this.updateUserInfo();
            
            if (isDemo) {
                MiniUtils.showNotification('Демо верификация запущена...', 'info');
                
                setTimeout(() => {
                    this.completeVerification({
                        hash: 'demo_transaction_' + Date.now(),
                        amount: 0.01,
                        isDemo: true
                    });
                }, 3000);
                
            } else {
                MiniUtils.showNotification('Отправка верификационной транзакции...', 'info');
                
                const success = await window.miniWallet.sendVerificationTransaction();
                
                if (success) {
                    setTimeout(() => {
                        this.checkVerificationStatus();
                    }, 30000);
                } else {
                    this.verificationStatus = 'failed';
                    this.updateUserInfo();
                    MiniUtils.showNotification('Ошибка отправки транзакции', 'error');
                }
            }
            
        } catch (error) {
            console.error('Verification failed:', error);
            this.verificationStatus = 'failed';
            this.updateUserInfo();
            MiniUtils.showNotification('Ошибка верификации', 'error');
        }
    }

    async checkVerificationStatus() {
        MiniUtils.showNotification('Проверка статуса верификации...', 'info');
        
        try {
            setTimeout(() => {
                this.completeVerification({
                    hash: this.verificationTransactionHash || 'verified_' + Date.now(),
                    amount: 0.01,
                    isDemo: false
                });
            }, 2000);
            
        } catch (error) {
            console.error('Status check failed:', error);
            MiniUtils.showNotification('Ошибка проверки статуса', 'error');
        }
    }

    completeVerification(transactionData) {
        this.verificationStatus = 'verified';
        this.userVerified = true;
        this.verificationTransactionHash = transactionData.hash;
        
        const verificationData = {
            verified: true,
            status: 'verified',
            transactionHash: transactionData.hash,
            amount: transactionData.amount,
            date: new Date().toISOString(),
            isDemo: transactionData.isDemo || false
        };
        
        this.saveUserVerification(verificationData);
        this.updateUserInfo();
        
        const message = transactionData.isDemo ? 
            'Демо верификация завершена!' : 
            'Верификация завершена! Средства будут возвращены в течение 24 часов.';
            
        MiniUtils.showNotification(message, 'success');
        MiniUtils.vibrate([100, 50, 100, 50, 100]);
        
        console.log('Verification completed:', verificationData);
    }

    cancelVerification() {
        this.verificationStatus = 'none';
        this.verificationTransactionHash = null;
        this.updateUserInfo();
        MiniUtils.showNotification('Верификация отменена', 'info');
    }

    resetVerification() {
        this.verificationStatus = 'none';
        this.userVerified = false;
        this.verificationTransactionHash = null;
        
        const verificationData = {
            verified: false,
            status: 'none',
            transactionHash: null,
            amount: 0,
            date: null,
            isDemo: false
        };
        
        this.saveUserVerification(verificationData);
        this.updateUserInfo();
        
        MiniUtils.showNotification('Верификация сброшена', 'info');
    }

    getVerificationData() {
        return MiniUtils.loadFromStorage('nftg-user-verification-data', {
            verified: false,
            status: 'none',
            transactionHash: null,
            amount: 0,
            date: null,
            isDemo: false
        });
    }

    showStats() {
        this.closeMainSidebar();
        
        const stats = this.getChannelStats();
        const categoryStats = this.getCategoryStats();
        const activeChannels = this.getMostActiveChannels(3);
        const trendingChannels = this.getTrendingChannels(3);
        const verificationData = this.getVerificationData();
        
        let statsMessage = `📊 Статистика каналов:\n\n`;
        statsMessage += `Всего каналов: ${stats.total}\n`;
        statsMessage += `С пикселями: ${stats.pixelChannels}\n`;
        statsMessage += `Одобренных заявок: ${stats.approvedChannels}\n`;
        statsMessage += `Ваших каналов: ${stats.owned}\n`;
        statsMessage += `Средние подписчики: ${this.formatSubscriberCount(stats.avgSubscribers)}\n`;
        statsMessage += `Средний рейтинг: ${stats.avgRating}⭐\n\n`;
        
        if (verificationData.verified) {
            statsMessage += `🔐 Статус: Верифицирован ✓\n`;
            statsMessage += `📅 Дата верификации: ${MiniUtils.formatDate(verificationData.date)}\n`;
            if (verificationData.isDemo) {
                statsMessage += `🧪 Тип: Демо верификация\n`;
            }
            statsMessage += '\n';
        } else {
            statsMessage += `🔓 Статус: Не верифицирован\n\n`;
        }
        
        if (activeChannels.length > 0) {
            statsMessage += `🔥 Самые активные:\n`;
            activeChannels.forEach(channel => {
                statsMessage += `• ${channel.name} (${channel.postsPerMonth}/мес)\n`;
            });
            statsMessage += '\n';
        }
        
        if (trendingChannels.length > 0) {
            statsMessage += `📈 Популярные:\n`;
            trendingChannels.forEach(channel => {
                statsMessage += `• ${channel.name} (${this.formatSubscriberCount(channel.subscribers)})\n`;
            });
            statsMessage += '\n';
        }
        
        if (Object.keys(categoryStats).length > 0) {
            statsMessage += `📂 По категориям:\n`;
            Object.entries(categoryStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .forEach(([category, count]) => {
                    statsMessage += `• ${MiniUtils.getCategoryIcon(category)} ${category}: ${count}\n`;
                });
        }

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Статистика каналов',
                message: statsMessage,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(statsMessage);
        }
    }

    getChannelStats() {
        const total = this.channels.length;
        const pixelChannels = this.channels.filter(ch => ch.type === 'pixel').length;
        const approvedChannels = this.channels.filter(ch => ch.type === 'approved').length;
        const owned = this.channels.filter(ch => ch.isOwned).length;
        const totalSubscribers = this.channels.reduce((sum, ch) => sum + ch.subscribers, 0);
        const avgSubscribers = total > 0 ? Math.round(totalSubscribers / total) : 0;
        const totalRating = this.channels.reduce((sum, ch) => sum + (ch.rating || 0), 0);
        const avgRating = total > 0 ? (totalRating / total).toFixed(1) : '0.0';
        
        return {
            total,
            pixelChannels,
            approvedChannels,
            owned,
            avgSubscribers,
            avgRating
        };
    }

    getCategoryStats() {
        const stats = {};
        this.channels.forEach(channel => {
            if (channel.categories && Array.isArray(channel.categories)) {
                channel.categories.forEach(category => {
                    stats[category] = (stats[category] || 0) + 1;
                });
            } else if (channel.category) {
                stats[channel.category] = (stats[channel.category] || 0) + 1;
            }
        });
        return stats;
    }

    getMostActiveChannels(limit = 5) {
        return [...this.channels]
            .sort((a, b) => b.postsPerMonth - a.postsPerMonth)
            .slice(0, limit);
    }

    getTrendingChannels(limit = 5) {
        return [...this.channels]
            .sort((a, b) => b.subscribers - a.subscribers)
            .slice(0, limit);
    }

    loadUserRatings() {
        const saved = MiniUtils.loadFromStorage('nftg-user-ratings', {});
        this.userRatings = new Map(Object.entries(saved));
    }

    saveUserRatings() {
        const ratingsObj = Object.fromEntries(this.userRatings);
        MiniUtils.saveToStorage('nftg-user-ratings', ratingsObj);
    }

    loadUserVerification() {
        const verificationData = this.getVerificationData();
        
        this.userVerified = verificationData.verified;
        this.verificationStatus = verificationData.status;
        this.verificationTransactionHash = verificationData.transactionHash;
        
        console.log('Loaded verification data:', verificationData);
    }

    saveUserVerification(verificationData) {
        this.userVerified = verificationData.verified;
        this.verificationStatus = verificationData.status;
        this.verificationTransactionHash = verificationData.transactionHash;
        
        MiniUtils.saveToStorage('nftg-user-verification-data', verificationData);
        this.updateUserInfo();
        
        console.log('Saved verification data:', verificationData);
    }

    onPixelPurchased() {
        this.loadChannelsFromPixels();
        if (this.isOpen) {
            this.applyFilters();
        }
        console.log('Channels refreshed');
    }

    refreshChannels() {
        this.loadChannelsFromPixels();
        if (this.isOpen) {
            this.applyFilters();
        }
        console.log('Channels refreshed');
    }

    getDebugInfo() {
        return {
            channelsCount: this.channels.length,
            pixelChannels: this.channels.filter(ch => ch.type === 'pixel').length,
            approvedChannels: this.channels.filter(ch => ch.type === 'approved').length,
            filteredCount: this.filteredChannels.length,
            activeFilters: this.activeFilters,
            currentSort: this.currentSort,
            searchTerm: this.searchTerm,
            isOpen: this.isOpen,
            isMainSidebarOpen: this.isMainSidebarOpen,
            userVerified: this.userVerified,
            verificationStatus: this.verificationStatus,
            verificationHash: this.verificationTransactionHash,
            userRatingsCount: this.userRatings.size
        };
    }
}

String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

window.MiniChannels = MiniChannels;