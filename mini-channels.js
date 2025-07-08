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
                        const subscribers = this.generateSubscriberCount(pixelData.category || 'Разное', pixelId);
                        
                        pixelChannels.push({
                            id: `pixel_${pixelId}`,
                            channel: channelName,
                            name: channelName.replace('@', ''),
                            description: pixelData.description || 'Канал из пиксель-сетки',
                            category: pixelData.category || 'Разное',
                            telegramLink: pixelData.telegramLink || MiniUtils.normalizeTelegramLink(channelName),
                            owner: pixelData.owner,
                            purchaseDate: pixelData.purchaseDate,
                            pixelId: pixelId,
                            isOwned: pixelData.owner === (window.miniGrid ? window.miniGrid.currentUser : '@demo_user'),
                            price: pixelData.price || 5,
                            subscribers: subscribers,
                            rating: this.generateRating(pixelId),
                            postsPerMonth: this.generatePostsPerMonth(pixelId),
                            verified: Math.random() > 0.7, // 30% verified channels
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
            pixelChannels.push(
                {
                    id: 'demo_1',
                    channel: '@demo_channel',
                    name: 'demo_channel',
                    description: 'Демо-канал для тестирования функций приложения',
                    category: 'Демо',
                    telegramLink: 'https://t.me/demo_channel',
                    owner: '@demo_user',
                    purchaseDate: new Date().toISOString(),
                    pixelId: 11,
                    isOwned: true,
                    price: 5,
                    subscribers: 1250,
                    rating: 4.2,
                    postsPerMonth: 45,
                    verified: true,
                    userRating: null
                }
            );
        }

        this.channels = pixelChannels;
        console.log('Loaded channels:', this.channels.length);
    }

    generateSubscriberCount(category, pixelId) {
        const baseRanges = {
            'Крипта': { min: 5000, max: 150000 },
            'Новости': { min: 10000, max: 200000 },
            'Технологии': { min: 3000, max: 80000 },
            'Игры': { min: 8000, max: 120000 },
            'Бизнес': { min: 2000, max: 50000 },
            'Образование': { min: 1500, max: 40000 },
            'Демо': { min: 500, max: 2000 }
        };

        const range = baseRanges[category] || { min: 1000, max: 25000 };
        
        // Use pixelId as seed for consistent results
        const seed = pixelId * 137;
        const random = Math.abs(Math.sin(seed)) * (range.max - range.min) + range.min;
        
        return Math.floor(random);
    }

    generateRating(pixelId) {
        // Generate consistent rating based on pixel ID
        const seed = pixelId * 73;
        const random = Math.abs(Math.sin(seed));
        return Math.round((3 + random * 2) * 10) / 10; // Rating between 3.0 and 5.0
    }

    generatePostsPerMonth(pixelId) {
        // Generate consistent posts per month based on pixel ID
        const seed = pixelId * 89;
        const random = Math.abs(Math.sin(seed));
        return Math.floor(random * 120 + 5); // Between 5 and 125 posts per month
    }

    toggleCategoryFilter(element) {
        const category = element.dataset.category;
        
        if (element.classList.contains('active')) {
            // Remove filter
            this.activeFilters = this.activeFilters.filter(f => f !== category);
            element.classList.remove('active');
        } else {
            // Add filter (max 3)
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
                channel.category.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply category filters
        if (this.activeFilters.length > 0) {
            filtered = filtered.filter(channel => 
                this.activeFilters.includes(channel.category)
            );
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
            // Close sidebar and highlight pixel
            this.closeSidebar();
            
            if (window.miniGrid) {
                // Scroll to pixel and highlight it
                const pixelElement = document.querySelector(`[data-id="${channel.pixelId}"]`);
                if (pixelElement) {
                    // Center the grid on the pixel
                    const rect = pixelElement.getBoundingClientRect();
                    const containerRect = document.getElementById('grid-container').getBoundingClientRect();
                    
                    const offsetX = (containerRect.width / 2) - (rect.left + rect.width / 2 - containerRect.left);
                    const offsetY = (containerRect.height / 2) - (rect.top + rect.height / 2 - containerRect.top);
                    
                    window.miniGrid.translateX = offsetX;
                    window.miniGrid.translateY = offsetY;
                    window.miniGrid.updateGridTransform();
                    
                    // Highlight animation
                    pixelElement.style.animation = 'pulse 2s ease-in-out 3';
                    setTimeout(() => {
                        pixelElement.style.animation = '';
                    }, 6000);
                }
                
                MiniUtils.showNotification(`Пиксель #${channel.pixelId} (${this.formatSubscriberCount(channel.subscribers)} подписчиков)`, 'success');
            }
            
            MiniUtils.vibrate([100, 50, 100]);
        }
    }

    openChannel(telegramLink) {
        if (telegramLink && telegramLink !== '#') {
            // Use Telegram WebApp API if available
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

    // Channel rating functionality
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
        // Populate channel info
        document.getElementById('rating-channel-name').textContent = channel.channel;
        document.getElementById('rating-channel-description').textContent = channel.description;
        document.querySelector('.rating-value').textContent = channel.rating;

        // Show/hide verification notice
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

        // Reset rating selection
        this.resetRatingSelection();
        
        // Show existing user rating if any
        if (channel.userRating) {
            this.setRatingSelection(channel.userRating);
        }

        // Store current channel for rating
        this.currentRatingChannel = channel;

        // Show modal
        document.getElementById('channel-rating-modal').classList.add('active');
        MiniUtils.vibrate([100]);
    }

    setupRatingModalEvents() {
        // Star rating selection
        const starRating = document.getElementById('star-rating');
        if (starRating) {
            starRating.addEventListener('click', (e) => {
                if (e.target.classList.contains('star')) {
                    const rating = parseInt(e.target.dataset.rating);
                    this.setRatingSelection(rating);
                }
            });
        }

        // Comment character counter
        const commentTextarea = document.getElementById('rating-comment');
        const charCounter = document.getElementById('comment-chars');
        if (commentTextarea && charCounter) {
            commentTextarea.addEventListener('input', (e) => {
                charCounter.textContent = e.target.value.length;
            });
        }

        // Modal buttons
        document.getElementById('submit-rating')?.addEventListener('click', () => this.submitRating());
        document.getElementById('verify-account')?.addEventListener('click', () => this.startVerification());
        document.getElementById('cancel-rating')?.addEventListener('click', () => this.closeRatingModal());

        // Close on escape
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

        // Save user rating
        this.userRatings.set(channel.channel, {
            rating: this.selectedRating,
            comment: comment,
            date: new Date().toISOString()
        });

        // Update channel data
        const channelIndex = this.channels.findIndex(ch => ch.id === channel.id);
        if (channelIndex !== -1) {
            this.channels[channelIndex].userRating = this.selectedRating;
        }

        // Save to storage
        this.saveUserRatings();

        // Update display
        this.applyFilters();

        // Close modal
        this.closeRatingModal();

        MiniUtils.showNotification(`Канал ${channel.channel} оценен на ${this.selectedRating} звезд!`, 'success');
        MiniUtils.vibrate([100, 50, 100]);
    }

    closeRatingModal() {
        document.getElementById('channel-rating-modal').classList.remove('active');
        this.currentRatingChannel = null;
        this.selectedRating = 0;
    }

    // Main menu actions
    openMarket() {
        this.closeMainSidebar();
        MiniUtils.showNotification('Маркет будет доступен в следующем обновлении', 'info');
        // TODO: Implement market functionality
    }

    openWebsite() {
        const websiteUrl = 'https://nftg-zonix.com'; // Replace with actual website
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(websiteUrl);
        } else {
            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
        }
        
        MiniUtils.showNotification('Открытие официального сайта', 'info');
        this.closeMainSidebar();
    }

    startVerification() {
        // Close any open modals/sidebars
        this.closeRatingModal();
        this.closeMainSidebar();
        
        // TODO: Replace with actual bot link
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
            activeChannels.forEach((channel, index) => {
                statsMessage += `${index + 1}. ${channel.name} - ${channel.postsPerMonth} постов/мес\n`;
            });
            statsMessage += `\n`;
        }
        
        if (trendingChannels.length > 0) {
            statsMessage += `📈 В тренде:\n`;
            trendingChannels.forEach((channel, index) => {
                statsMessage += `${index + 1}. ${channel.name} - ${channel.rating}⭐ (${channel.postsPerMonth}/мес)\n`;
            });
            statsMessage += `\n`;
        }
        
        statsMessage += `По категориям:\n`;
        Object.keys(categoryStats).forEach(category => {
            const stat = categoryStats[category];
            statsMessage += `${MiniUtils.getCategoryIcon(category)} ${category}: ${stat.count} каналов\n`;
        });

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Статистика',
                message: statsMessage,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(statsMessage);
        }
    }

    // Method to be called when new pixels are purchased
    onPixelPurchased() {
        if (this.isOpen) {
            this.loadChannelsFromPixels();
            this.applyFilters();
            console.log('Channels updated after purchase');
        }
    }

    // Get most active channels
    getMostActiveChannels(limit = 10) {
        return this.channels
            .sort((a, b) => b.postsPerMonth - a.postsPerMonth)
            .slice(0, limit);
    }

    // Get trending channels (high activity + good rating)
    getTrendingChannels(limit = 5) {
        return this.channels
            .filter(channel => channel.rating >= 4.0 && channel.postsPerMonth >= 30)
            .sort((a, b) => {
                const scoreA = (a.rating * 0.6) + (a.postsPerMonth * 0.004);
                const scoreB = (b.rating * 0.6) + (b.postsPerMonth * 0.004);
                return scoreB - scoreA;
            })
            .slice(0, limit);
    }

    // API methods for real channel data (placeholder for future implementation)
    async fetchRealChannelData(channelUsername) {
        try {
            const response = await fetch(`/api/channel/${channelUsername}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.log('Real channel data not available, using generated data');
            return null;
        }
    }

    async updateChannelWithRealData(channel) {
        const realData = await this.fetchRealChannelData(channel.name);
        
        if (realData) {
            return {
                ...channel,
                subscribers: realData.subscribers || channel.subscribers,
                description: realData.description || channel.description,
                verified: realData.verified || channel.verified,
                postsPerMonth: realData.postsPerMonth || channel.postsPerMonth
            };
        }
        
        return channel;
    }

    // Data persistence
    loadUserVerification() {
        this.userVerified = MiniUtils.loadFromStorage('nftg-zonix-user-verified', false);
    }

    saveUserVerification() {
        MiniUtils.saveToStorage('nftg-zonix-user-verified', this.userVerified);
    }

    loadUserRatings() {
        const ratings = MiniUtils.loadFromStorage('nftg-zonix-user-ratings', {});
        this.userRatings = new Map(Object.entries(ratings));
    }

    saveUserRatings() {
        MiniUtils.saveToStorage('nftg-zonix-user-ratings', Object.fromEntries(this.userRatings));
    }

    // Public method to set user as verified
    setUserVerified(verified = true) {
        this.userVerified = verified;
        this.saveUserVerification();
        this.updateUserInfo();
        
        if (verified) {
            MiniUtils.showNotification('Аккаунт успешно верифицирован! ✅', 'success');
        }
    }

    // Statistics
    getChannelStats() {
        const totalChannels = this.channels.length;
        const ownedChannels = this.channels.filter(ch => ch.isOwned).length;
        const averageSubscribers = this.channels.reduce((sum, ch) => sum + ch.subscribers, 0) / totalChannels;
        const averageRating = this.channels.reduce((sum, ch) => sum + (ch.rating || 0), 0) / totalChannels;
        
        return {
            total: totalChannels,
            owned: ownedChannels,
            avgSubscribers: Math.round(averageSubscribers),
            avgRating: Math.round(averageRating * 10) / 10
        };
    }

    // Analytics and insights
    getCategoryStats() {
        const stats = {};
        this.channels.forEach(channel => {
            const category = channel.category;
            if (!stats[category]) {
                stats[category] = {
                    count: 0,
                    totalSubscribers: 0,
                    avgRating: 0,
                    channels: []
                };
            }
            stats[category].count++;
            stats[category].totalSubscribers += channel.subscribers;
            stats[category].avgRating += (channel.rating || 0);
            stats[category].channels.push(channel);
        });

        // Calculate averages
        Object.keys(stats).forEach(category => {
            const stat = stats[category];
            stat.avgSubscribers = Math.round(stat.totalSubscribers / stat.count);
            stat.avgRating = Math.round((stat.avgRating / stat.count) * 10) / 10;
        });

        return stats;
    }

    refreshChannels() {
        console.log('Refreshing channels data...');
        
        // Перезагружаем каналы из пикселей
        this.loadChannelsFromPixels();
        
        // Применяем текущие фильтры
        this.applyFilters();
        
        console.log('Channels refreshed');
    }

    // Helper method for debugging
    getDebugInfo() {
        return {
            isOpen: this.isOpen,
            isMainSidebarOpen: this.isMainSidebarOpen,
            totalChannels: this.channels.length,
            filteredChannels: this.filteredChannels.length,
            activeFilters: this.activeFilters,
            currentSort: this.currentSort,
            searchTerm: this.searchTerm,
            userVerified: this.userVerified,
            userRatings: this.userRatings.size,
            stats: this.getChannelStats(),
            categoryStats: this.getCategoryStats(),
            mostActive: this.getMostActiveChannels(3).map(ch => `${ch.name}: ${ch.postsPerMonth}/month`),
            trending: this.getTrendingChannels(3).map(ch => `${ch.name}: ${ch.rating}⭐`)
        };
    }
}

// Global initialization
window.MiniChannels = MiniChannels;

// Global functions for external access
window.verifyNFTGUser = function() {
    if (window.miniChannels) {
        window.miniChannels.setUserVerified(true);
        return true;
    }
    return false;
};

window.getNFTGChannelStats = function() {
    if (window.miniChannels) {
        return window.miniChannels.getDebugInfo();
    }
    return null;
};