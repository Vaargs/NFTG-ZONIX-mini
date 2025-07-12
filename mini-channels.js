// @ts-nocheck
// === MINI CHANNELS NAVIGATOR ===

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
        // Hamburger menu toggle - теперь открывает главное меню
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const closeMainSidebarBtn = document.getElementById('close-main-sidebar');
        
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleMainSidebar());
        }
        
        if (closeMainSidebarBtn) {
            closeMainSidebarBtn.addEventListener('click', () => this.closeMainSidebar());
        }

        // Main menu items
        document.getElementById('channels-navigator-btn')?.addEventListener('click', () => {
            this.closeMainSidebar();
            setTimeout(() => this.openSidebar(), 300);
        });

        document.getElementById('market-btn')?.addEventListener('click', () => this.openMarket());
        document.getElementById('website-btn')?.addEventListener('click', () => this.openWebsite());
        document.getElementById('verification-btn')?.addEventListener('click', () => this.startVerification());
        document.getElementById('stats-btn')?.addEventListener('click', () => this.showStats());

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

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('channel-sidebar');
            const mainSidebar = document.getElementById('main-sidebar');
            const hamburger = document.getElementById('hamburger-menu');
            
            if (this.isOpen && sidebar && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                this.closeSidebar();
            }
            
            if (this.isMainSidebarOpen && mainSidebar && !mainSidebar.contains(e.target) && !hamburger.contains(e.target)) {
                this.closeMainSidebar();
            }
        });

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
            sidebar.classList.add('active');
            this.isMainSidebarOpen = true;
            
            // Animate hamburger
            if (hamburger) {
                hamburger.classList.add('active');
            }
            
            // Show Telegram back button
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.BackButton.show();
            }
            
            // Update user info
            this.updateUserInfo();
            
            // Vibration feedback
            MiniUtils.vibrate([50]);
            
            console.log('Main sidebar opened');
        }
    }

    closeMainSidebar() {
        const sidebar = document.getElementById('main-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            sidebar.classList.remove('active');
            this.isMainSidebarOpen = false;
            
            // Reset hamburger
            if (hamburger) {
                hamburger.classList.remove('active');
            }
            
            // Hide Telegram back button if no other modals open
            if (window.Telegram?.WebApp && !this.isOpen && !window.miniModals?.isModalOpen()) {
                window.Telegram.WebApp.BackButton.hide();
            }
            
            console.log('Main sidebar closed');
        }
    }

    updateUserInfo() {
        const userName = document.getElementById('user-name');
        const userStatus = document.getElementById('user-status');
        
        if (userName) {
            userName.textContent = window.miniGrid ? window.miniGrid.currentUser : '@demo_user';
        }
        
        if (userStatus) {
            if (this.userVerified) {
                userStatus.textContent = 'Верифицирован ✓';
                userStatus.classList.add('verified');
            } else {
                userStatus.textContent = 'Не верифицирован';
                userStatus.classList.remove('verified');
            }
        }
    }

    openSidebar() {
        const sidebar = document.getElementById('channel-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            sidebar.classList.add('active');
            this.isOpen = true;
            
            // Animate hamburger
            if (hamburger) {
                hamburger.classList.add('active');
            }
            
            // Show Telegram back button
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.BackButton.show();
            }
            
            // Load fresh channel data
            this.loadChannelsFromPixels();
            this.applyFilters();
            
            // Vibration feedback
            MiniUtils.vibrate([50]);
            
            console.log('Channels sidebar opened');
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('channel-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sidebar) {
            sidebar.classList.remove('active');
            this.isOpen = false;
            
            // Reset hamburger
            if (hamburger) {
                hamburger.classList.remove('active');
            }
            
            // Hide Telegram back button
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
                    
                    // Check if channel already exists
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
                            userRating: this.userRatings.get(channelName) || null
                        });
                    } else {
                        // Add additional pixel IDs to existing channel
                        if (!existingChannel.pixelIds) {
                            existingChannel.pixelIds = [existingChannel.pixelId];
                        }
                        existingChannel.pixelIds.push(pixelId);
                    }
                }
            });
        }

        // Add demo channels if no pixel channels exist
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
                userRating: null
            });
        }

        this.channels = pixelChannels;
        console.log('Loaded channels:', this.channels.length);
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

        // Apply search filter
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

        // Apply category filters
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

        // Apply sorting
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
                        </div>
                        <div class="channel-stats">
                            📍 #${channel.pixelId} • 👥 ${this.formatSubscriberCount(channel.subscribers)} • ⭐ ${channel.rating || 'N/A'} • 📝 ${channel.postsPerMonth}/мес
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

        // Animate channel cards
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
            
            if (window.miniGrid) {
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

        if (!this.userVerified) {
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
        document.getElementById('verify-account')?.addEventListener('click', () => this.startVerification());
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

    startVerification() {
        this.closeRatingModal();
        this.closeMainSidebar();
        
        const botLink = 'https://t.me/nftg_zonix_bot';
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(botLink);
        } else {
            window.open(botLink, '_blank', 'noopener,noreferrer');
        }
        
        MiniUtils.showNotification('Переход к боту для верификации', 'info');
    }

    showStats() {
        this.closeMainSidebar();
        
        const stats = this.getChannelStats();
        const categoryStats = this.getCategoryStats();
        const activeChannels = this.getMostActiveChannels(3);
        const trendingChannels = this.getTrendingChannels(3);
        
        let statsMessage = `📊 Статистика каналов:\n\n`;
        statsMessage += `Всего каналов: ${stats.total}\n`;
        statsMessage += `Ваших каналов: ${stats.owned}\n`;
        statsMessage += `Средние подписчики: ${this.formatSubscriberCount(stats.avgSubscribers)}\n`;
        statsMessage += `Средний рейтинг: ${stats.avgRating}⭐\n\n`;
        
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
        const owned = this.channels.filter(ch => ch.isOwned).length;
        const totalSubscribers = this.channels.reduce((sum, ch) => sum + ch.subscribers, 0);
        const avgSubscribers = total > 0 ? Math.round(totalSubscribers / total) : 0;
        const totalRating = this.channels.reduce((sum, ch) => sum + (ch.rating || 0), 0);
        const avgRating = total > 0 ? (totalRating / total).toFixed(1) : '0.0';
        
        return {
            total,
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
        this.userVerified = MiniUtils.loadFromStorage('nftg-user-verified', false);
    }

    saveUserVerification(verified) {
        this.userVerified = verified;
        MiniUtils.saveToStorage('nftg-user-verified', verified);
        this.updateUserInfo();
    }

    onPixelPurchased() {
        this.loadChannelsFromPixels();
        if (this.isOpen) {
            this.applyFilters();
        }
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
            filteredCount: this.filteredChannels.length,
            activeFilters: this.activeFilters,
            currentSort: this.currentSort,
            searchTerm: this.searchTerm,
            isOpen: this.isOpen,
            isMainSidebarOpen: this.isMainSidebarOpen,
            userVerified: this.userVerified,
            userRatingsCount: this.userRatings.size
        };
    }

    exportChannelsData() {
        const data = {
            channels: this.channels,
            userRatings: Object.fromEntries(this.userRatings),
            userVerified: this.userVerified,
            stats: this.getChannelStats(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nftg-channels-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        MiniUtils.showNotification('Данные каналов экспортированы', 'success');
    }

    clearAllData() {
        if (confirm('Очистить все данные каналов и рейтингов?')) {
            this.channels = [];
            this.filteredChannels = [];
            this.userRatings.clear();
            this.userVerified = false;
            
            localStorage.removeItem('nftg-user-ratings');
            localStorage.removeItem('nftg-user-verified');
            
            this.updateUserInfo();
            this.loadChannelsFromPixels();
            
            if (this.isOpen) {
                this.applyFilters();
            }
            
            MiniUtils.showNotification('Данные каналов очищены', 'info');
        }
    }

    searchChannels(query) {
        this.searchTerm = query.toLowerCase();
        this.applyFilters();
    }

    filterByCategory(category) {
        this.activeFilters = [category];
        this.applyFilters();
        
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.toggle('active', tag.dataset.category === category);
        });
    }

    sortChannels(sortType) {
        this.currentSort = sortType;
        this.applyFilters();
        
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = sortType;
        }
    }

    rateMultipleChannels(channelIds, rating, comment = '') {
        let updated = 0;
        
        channelIds.forEach(channelId => {
            const channel = this.channels.find(ch => ch.id === channelId);
            if (channel) {
                this.userRatings.set(channel.channel, {
                    rating: rating,
                    comment: comment,
                    date: new Date().toISOString()
                });
                
                const channelIndex = this.channels.findIndex(ch => ch.id === channelId);
                if (channelIndex !== -1) {
                    this.channels[channelIndex].userRating = rating;
                }
                updated++;
            }
        });
        
        if (updated > 0) {
            this.saveUserRatings();
            this.applyFilters();
            MiniUtils.showNotification(`Оценено каналов: ${updated}`, 'success');
        }
        
        return updated;
    }

    openMultipleChannels(channelIds) {
        channelIds.forEach((channelId, index) => {
            const channel = this.channels.find(ch => ch.id === channelId);
            if (channel && channel.telegramLink) {
                setTimeout(() => {
                    this.openChannel(channel.telegramLink);
                }, index * 1000);
            }
        });
    }

    lazyLoadChannels() {
        const batchSize = 20;
        let currentBatch = 0;
        
        const loadBatch = () => {
            const start = currentBatch * batchSize;
            const end = start + batchSize;
            const batch = this.filteredChannels.slice(start, end);
            
            if (batch.length > 0) {
                this.renderChannelBatch(batch, start);
                currentBatch++;
                
                if (end < this.filteredChannels.length) {
                    setTimeout(loadBatch, 100);
                }
            }
        };
        
        loadBatch();
    }

    renderChannelBatch(channels, startIndex) {
        const channelsList = document.getElementById('channels-list');
        if (!channelsList) return;
        
        const fragment = document.createDocumentFragment();
        
        channels.forEach((channel, index) => {
            const channelElement = this.createChannelElement(channel, startIndex + index);
            fragment.appendChild(channelElement);
        });
        
        channelsList.appendChild(fragment);
    }

    createChannelElement(channel, index) {
        const div = document.createElement('div');
        div.className = `channel-card ${channel.isOwned ? 'owned' : ''}`;
        div.onclick = () => this.viewChannel(channel.id);
        
        div.innerHTML = `
            <div class="channel-header">
                <div class="channel-avatar">${MiniUtils.getCategoryIcon(channel.category)}</div>
                <div class="channel-info">
                    <div class="channel-name">
                        ${channel.name}
                        ${channel.isOwned ? ' <span style="background: linear-gradient(45deg, #00FF88, #00CC66); color: #000; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 600;">МОЙ</span>' : ''}
                        ${channel.verified ? ' <span style="background: linear-gradient(45deg, #00D4FF, #0099CC); color: #000; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 600;">✓</span>' : ''}
                    </div>
                    <div class="channel-stats">
                        📍 #${channel.pixelId} • 👥 ${this.formatSubscriberCount(channel.subscribers)} • ⭐ ${channel.rating || 'N/A'} • 📝 ${channel.postsPerMonth}/мес
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
        `;
        
        div.style.opacity = '0';
        div.style.transform = 'translateY(10px)';
        div.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            div.style.opacity = '1';
            div.style.transform = 'translateY(0)';
        }, index * 50);
        
        return div;
    }

    getUsageStats() {
        const stats = MiniUtils.loadFromStorage('nftg-channels-stats', {
            totalChannelsViewed: 0,
            totalRatingsSubmitted: 0,
            mostViewedCategory: null,
            lastActivity: null
        });
        
        return stats;
    }

    updateUsageStats(action, data = {}) {
        const stats = this.getUsageStats();
        
        switch (action) {
            case 'channel_viewed':
                stats.totalChannelsViewed += 1;
                break;
            case 'rating_submitted':
                stats.totalRatingsSubmitted += 1;
                break;
            case 'category_viewed':
                if (!stats.categoryViews) stats.categoryViews = {};
                stats.categoryViews[data.category] = (stats.categoryViews[data.category] || 0) + 1;
                
                const mostViewed = Object.entries(stats.categoryViews)
                    .sort(([,a], [,b]) => b - a)[0];
                stats.mostViewedCategory = mostViewed ? mostViewed[0] : null;
                break;
        }
        
        stats.lastActivity = new Date().toISOString();
        MiniUtils.saveToStorage('nftg-channels-stats', stats);
        
        console.log('Usage stats updated:', stats);
    }

    exportUsageStats() {
        const stats = this.getUsageStats();
        const channelsData = {
            stats: stats,
            channels: this.getChannelStats(),
            categories: this.getCategoryStats(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(channelsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nftg-channels-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        MiniUtils.showNotification('Статистика каналов экспортирована', 'success');
    }
}

// Global initialization
window.MiniChannels = MiniChannels;