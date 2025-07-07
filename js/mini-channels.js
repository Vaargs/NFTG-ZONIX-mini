// === MINI CHANNELS NAVIGATOR ===

class MiniChannels {
    constructor() {
        this.channels = [];
        this.filteredChannels = [];
        this.activeFilters = [];
        this.currentSort = 'newest';
        this.searchTerm = '';
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChannelsFromPixels();
    }

    setupEventListeners() {
        // Hamburger menu toggle
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const closeSidebarBtn = document.getElementById('close-sidebar');
        
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
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

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('channel-sidebar');
            const hamburger = document.getElementById('hamburger-menu');
            
            if (this.isOpen && sidebar && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                this.closeSidebar();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
        });

        // Telegram WebApp back button
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('backButtonClicked', () => {
                if (this.isOpen) {
                    this.closeSidebar();
                }
            });
        }
    }

    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
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
                            rating: this.generateRating(pixelId)
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
                    description: 'Демо-канал для тестирования',
                    category: 'Демо',
                    telegramLink: 'https://t.me/demo_channel',
                    owner: '@demo_user',
                    purchaseDate: new Date().toISOString(),
                    pixelId: 11,
                    isOwned: true,
                    price: 5,
                    subscribers: 1250,
                    rating: 4.2
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
                        </div>
                        <div class="channel-stats">
                            📍 #${channel.pixelId} • 👥 ${this.formatSubscriberCount(channel.subscribers)} • ⭐ ${channel.rating || 'N/A'}
                        </div>
                    </div>
                </div>
                <div class="channel-description">${channel.description}</div>
                <div class="channel-footer">
                    <div class="channel-category">${MiniUtils.getCategoryIcon(channel.category)} ${channel.category}</div>
                    <button class="view-channel-btn" onclick="event.stopPropagation(); window.miniChannels?.openChannel('${channel.telegramLink}')">
                        Открыть
                    </button>
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

    // Method to be called when new pixels are purchased
    onPixelPurchased() {
        if (this.isOpen) {
            this.loadChannelsFromPixels();
            this.applyFilters();
            console.log('Channels updated after purchase');
        }
    }

    // Search helpers
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            this.searchTerm = '';
            this.applyFilters();
        }
    }

    clearFilters() {
        // Clear category filters
        this.activeFilters = [];
        document.querySelectorAll('.filter-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        // Reset sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = 'newest';
            this.currentSort = 'newest';
        }
        
        this.applyFilters();
        MiniUtils.showNotification('Фильтры очищены', 'info');
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

    // Export channels data
    exportChannels() {
        const data = {
            channels: this.channels,
            exportDate: new Date().toISOString(),
            stats: this.getChannelStats()
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
        MiniUtils.showNotification('Данные экспортированы', 'success');
    }

    // Advanced search functionality
    searchByOwner(ownerName) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = ownerName;
            this.searchTerm = ownerName.toLowerCase();
            this.applyFilters();
        }
    }

    searchByCategory(category) {
        this.clearFilters();
        this.activeFilters = [category];
        
        const categoryTag = document.querySelector(`[data-category="${category}"]`);
        if (categoryTag) {
            categoryTag.classList.add('active');
        }
        
        this.applyFilters();
    }

    // Accessibility helpers
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            // Navigate channels with arrow keys
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const cards = document.querySelectorAll('.channel-card');
                const focused = document.querySelector('.channel-card:focus');
                
                let index = focused ? Array.from(cards).indexOf(focused) : -1;
                
                if (e.key === 'ArrowDown') {
                    index = (index + 1) % cards.length;
                } else {
                    index = index <= 0 ? cards.length - 1 : index - 1;
                }
                
                if (cards[index]) {
                    cards[index].focus();
                    cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
            
            // Enter to open channel
            if (e.key === 'Enter' && document.activeElement?.classList.contains('channel-card')) {
                const channelId = document.activeElement.onclick.toString().match(/'([^']+)'/)?.[1];
                if (channelId) {
                    this.viewChannel(channelId);
                }
            }
        });
        
        // Make channel cards focusable
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.channel-card').forEach(card => {
                card.setAttribute('tabindex', '0');
                card.style.outline = 'none';
                
                card.addEventListener('focus', () => {
                    card.style.background = 'rgba(0, 212, 255, 0.1)';
                });
                
                card.addEventListener('blur', () => {
                    card.style.background = '';
                });
            });
        });
        
        observer.observe(document.getElementById('channels-list') || document.body, {
            childList: true,
            subtree: true
        });
    }

    // Performance optimization for large channel lists
    setupVirtualScrolling() {
        // For future implementation if channel list becomes very large
        // This would render only visible items to improve performance
        console.log('Virtual scrolling can be implemented here for large datasets');
    }

    // Refresh channels data
    refreshChannels() {
        this.loadChannelsFromPixels();
        this.applyFilters();
        MiniUtils.showNotification('Каналы обновлены', 'success');
        MiniUtils.vibrate([50]);
    }

    // Get channel by pixel ID
    getChannelByPixelId(pixelId) {
        return this.channels.find(channel => 
            channel.pixelId === pixelId || 
            (channel.pixelIds && channel.pixelIds.includes(pixelId))
        );
    }

    // Get channels by category
    getChannelsByCategory(category) {
        return this.channels.filter(channel => channel.category === category);
    }

    // Get channels by owner
    getChannelsByOwner(owner) {
        return this.channels.filter(channel => channel.owner === owner);
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

    // Helper method for debugging
    getDebugInfo() {
        return {
            isOpen: this.isOpen,
            totalChannels: this.channels.length,
            filteredChannels: this.filteredChannels.length,
            activeFilters: this.activeFilters,
            currentSort: this.currentSort,
            searchTerm: this.searchTerm,
            stats: this.getChannelStats(),
            categoryStats: this.getCategoryStats()
        };
    }
}

// Global initialization
window.MiniChannels = MiniChannels;