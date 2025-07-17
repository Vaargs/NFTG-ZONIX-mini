// === MINI MODERATOR MODULE ===

class MiniModerator {
    constructor() {
        this.moderatorUsername = '@VladGaar';
        this.isModerator = false;
        this.pendingSubmissions = [];
        this.flaggedPixels = [];
        this.moderationHistory = [];
        this.isModeratorPanelOpen = false;
        
        this.init();
    }

    init() {
        this.checkModeratorStatus();
        this.loadModerationData();
        this.createModeratorUI();
        this.setupEventListeners();
        console.log('✅ MiniModerator initialized');
    }

    checkModeratorStatus() {
        // Проверяем является ли текущий пользователь модератором
        const currentUser = window.miniGrid ? window.miniGrid.currentUser : '@demo_user';
        
        // Получаем пользователя из Telegram WebApp если доступно
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
            const telegramUsername = telegramUser.username ? `@${telegramUser.username}` : null;
            
            if (telegramUsername === this.moderatorUsername) {
                this.isModerator = true;
                console.log('🛡️ Moderator access granted for:', telegramUsername);
            }
        }
        
        // Fallback для демо режима
        if (currentUser === this.moderatorUsername || currentUser === '@demo_user') {
            this.isModerator = true;
            console.log('🛡️ Moderator access granted (demo mode)');
        }
        
        if (this.isModerator) {
            this.showModeratorNotification();
        }
    }

    showModeratorNotification() {
        setTimeout(() => {
            MiniUtils.showNotification('Режим модератора активирован', 'success');
        }, 1000);
    }

    createModeratorUI() {
        if (!this.isModerator) return;

        // Добавляем кнопку модератора в главное меню
        this.addModeratorButton();
        
        // Создаем панель модератора
        this.createModeratorPanel();
    }

    addModeratorButton() {
        const menuItems = document.querySelector('.menu-items');
        if (!menuItems || document.getElementById('moderator-btn')) return;

        const moderatorButton = document.createElement('button');
        moderatorButton.className = 'menu-item moderator-item';
        moderatorButton.id = 'moderator-btn';
        moderatorButton.innerHTML = `
            <span class="menu-icon">🛡️</span>
            <span class="menu-text">
                <div class="menu-title">МОДЕРАЦИЯ</div>
                <div class="menu-subtitle">Управление контентом</div>
            </span>
            <span class="menu-arrow">→</span>
        `;

        // Добавляем стили для кнопки модератора
        moderatorButton.style.cssText = `
            background: linear-gradient(145deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.2)) !important;
            border-color: rgba(255, 68, 68, 0.3) !important;
            box-shadow: 0 0 15px rgba(255, 68, 68, 0.1) !important;
        `;

        // Вставляем после кнопки статистики
        const statsBtn = document.getElementById('stats-btn');
        if (statsBtn) {
            statsBtn.parentNode.insertBefore(moderatorButton, statsBtn.nextSibling);
        } else {
            menuItems.appendChild(moderatorButton);
        }
    }

    createModeratorPanel() {
        const moderatorPanel = document.createElement('div');
        moderatorPanel.className = 'moderator-sidebar';
        moderatorPanel.id = 'moderator-sidebar';
        moderatorPanel.innerHTML = `
            <div class="sidebar-header">
                <h3>🛡️ ПАНЕЛЬ МОДЕРАЦИИ</h3>
                <button class="close-sidebar" id="close-moderator-sidebar">×</button>
            </div>
            
            <div class="sidebar-content">
                <div class="moderation-stats">
                    <div class="stat-item">
                        <span class="stat-value" id="pending-submissions-count">0</span>
                        <span class="stat-label">Заявок на рассмотрении</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="flagged-pixels-count">0</span>
                        <span class="stat-label">Пикселей с жалобами</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="total-pixels-count">0</span>
                        <span class="stat-label">Всего пикселей</span>
                    </div>
                </div>

                <div class="moderation-tabs">
                    <button class="moderation-tab active" data-tab="submissions">📝 ЗАЯВКИ</button>
                    <button class="moderation-tab" data-tab="pixels">🖼️ ПИКСЕЛИ</button>
                    <button class="moderation-tab" data-tab="reports">⚠️ ЖАЛОБЫ</button>
                    <button class="moderation-tab" data-tab="history">📊 ИСТОРИЯ</button>
                </div>

                <div class="moderation-content">
                    <!-- Вкладка заявок -->
                    <div class="moderation-tab-content active" id="submissions-content">
                        <div class="submissions-list" id="submissions-list">
                            <!-- Заявки будут загружены здесь -->
                        </div>
                    </div>

                    <!-- Вкладка пикселей -->
                    <div class="moderation-tab-content" id="pixels-content">
                        <div class="pixels-filter">
                            <select id="pixels-filter-select">
                                <option value="all">Все пиксели</option>
                                <option value="with-images">С изображениями</option>
                                <option value="with-links">С ссылками</option>
                                <option value="recent">Недавние</option>
                            </select>
                        </div>
                        <div class="pixels-list" id="pixels-list">
                            <!-- Пиксели будут загружены здесь -->
                        </div>
                    </div>

                    <!-- Вкладка жалоб -->
                    <div class="moderation-tab-content" id="reports-content">
                        <div class="reports-list" id="reports-list">
                            <div class="empty-state">
                                <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                                <div>Жалоб пока нет</div>
                            </div>
                        </div>
                    </div>

                    <!-- Вкладка истории -->
                    <div class="moderation-tab-content" id="history-content">
                        <div class="history-list" id="history-list">
                            <!-- История модерации будет загружена здесь -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Добавляем стили
        moderatorPanel.style.cssText = `
            position: fixed;
            top: 0;
            right: -100%;
            width: 95%;
            max-width: 450px;
            height: 100vh;
            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
            border-left: 1px solid rgba(255, 68, 68, 0.3);
            box-shadow: -5px 0 30px rgba(255, 68, 68, 0.2);
            z-index: 300;
            transition: right 0.4s ease;
            overflow-y: auto;
        `;

        document.body.appendChild(moderatorPanel);
    }

    setupEventListeners() {
        if (!this.isModerator) return;

        // Кнопка модератора в меню
        const moderatorBtn = document.getElementById('moderator-btn');
        if (moderatorBtn) {
            moderatorBtn.addEventListener('click', () => this.toggleModeratorPanel());
        }

        // Закрытие панели
        const closeModerator = document.getElementById('close-moderator-sidebar');
        if (closeModerator) {
            closeModerator.addEventListener('click', () => this.closeModeratorPanel());
        }

        // Переключение вкладок
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('moderation-tab')) {
                this.switchModerationTab(e.target.dataset.tab);
            }
        });

        // Фильтр пикселей
        const pixelsFilter = document.getElementById('pixels-filter-select');
        if (pixelsFilter) {
            pixelsFilter.addEventListener('change', () => this.filterPixels());
        }

        // Закрытие по клику вне панели
        document.addEventListener('click', (e) => {
            const moderatorSidebar = document.getElementById('moderator-sidebar');
            const moderatorBtn = document.getElementById('moderator-btn');
            
            if (this.isModeratorPanelOpen && moderatorSidebar && 
                !moderatorSidebar.contains(e.target) && 
                !moderatorBtn?.contains(e.target)) {
                this.closeModeratorPanel();
            }
        });

        // Добавляем контекстное меню на пиксели для модератора
        this.setupPixelContextMenu();
    }

    setupPixelContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            if (!this.isModerator) return;
            
            const pixel = e.target.closest('.pixel');
            if (pixel) {
                e.preventDefault();
                this.showPixelContextMenu(e, parseInt(pixel.dataset.id));
            }
        });
    }

    showPixelContextMenu(event, pixelId) {
        // Создаем контекстное меню для пикселя
        const existingMenu = document.getElementById('pixel-context-menu');
        if (existingMenu) existingMenu.remove();

        const contextMenu = document.createElement('div');
        contextMenu.id = 'pixel-context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
            border: 1px solid rgba(255, 68, 68, 0.3);
            border-radius: 8px;
            padding: 8px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            min-width: 200px;
        `;

        const pixelData = window.miniGrid?.pixels.get(pixelId);
        const isOwned = !!pixelData;

        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="inspect">
                🔍 Инспектировать пиксель
            </div>
            ${isOwned ? `
                <div class="context-menu-item" data-action="edit">
                    ✏️ Редактировать контент
                </div>
                <div class="context-menu-item" data-action="flag">
                    ⚠️ Отметить как проблемный
                </div>
                <div class="context-menu-item" data-action="reset">
                    🗑️ Сбросить пиксель
                </div>
            ` : `
                <div class="context-menu-item disabled">
                    📭 Пиксель свободен
                </div>
            `}
        `;

        // Стили для элементов меню
        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                color: #fff;
                font-size: 12px;
                transition: background 0.2s ease;
            `;

            if (!item.classList.contains('disabled')) {
                item.addEventListener('mouseover', () => {
                    item.style.background = 'rgba(255, 68, 68, 0.2)';
                });
                item.addEventListener('mouseout', () => {
                    item.style.background = 'transparent';
                });
                item.addEventListener('click', () => {
                    this.handlePixelContextAction(item.dataset.action, pixelId);
                    contextMenu.remove();
                });
            } else {
                item.style.color = '#666';
                item.style.cursor = 'not-allowed';
            }
        });

        document.body.appendChild(contextMenu);

        // Удаляем меню при клике вне его
        setTimeout(() => {
            document.addEventListener('click', () => {
                contextMenu.remove();
            }, { once: true });
        }, 100);
    }

    handlePixelContextAction(action, pixelId) {
        switch (action) {
            case 'inspect':
                this.inspectPixel(pixelId);
                break;
            case 'edit':
                this.editPixelContent(pixelId);
                break;
            case 'flag':
                this.flagPixel(pixelId);
                break;
            case 'reset':
                this.resetPixel(pixelId);
                break;
        }
    }

    inspectPixel(pixelId) {
        const pixelData = window.miniGrid?.pixels.get(pixelId);
        
        let info = `🔍 Инспекция пикселя #${pixelId}\n\n`;
        
        if (pixelData) {
            info += `👤 Владелец: ${pixelData.owner}\n`;
            info += `🔗 Канал: ${pixelData.channel || 'Не указан'}\n`;
            info += `📝 Описание: ${pixelData.description || 'Не указано'}\n`;
            info += `📂 Категории: ${pixelData.categories?.join(', ') || 'Не указаны'}\n`;
            info += `📅 Дата покупки: ${MiniUtils.formatDate(pixelData.purchaseDate)}\n`;
            info += `💰 Цена: ${pixelData.price || 0.01} TON\n`;
            info += `🖼️ Изображение: ${pixelData.imageUrl ? 'Есть' : 'Нет'}\n`;
        } else {
            info += `Пиксель свободен`;
        }

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Инспекция пикселя',
                message: info,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(info);
        }
    }

    editPixelContent(pixelId) {
        // Открываем специальный модальный диалог для редактирования контента модератором
        this.showModeratorEditModal(pixelId);
    }

    flagPixel(pixelId) {
        const reason = prompt('Причина пометки как проблемный:');
        if (!reason) return;

        const flagRecord = {
            pixelId,
            reason,
            timestamp: new Date().toISOString(),
            moderator: this.moderatorUsername,
            status: 'flagged'
        };

        this.flaggedPixels.push(flagRecord);
        this.saveModerationData();
        
        MiniUtils.showNotification(`Пиксель #${pixelId} помечен как проблемный`, 'success');
        this.updateModerationStats();
    }

    resetPixel(pixelId) {
        if (confirm(`Сбросить пиксель #${pixelId}? Это действие нельзя отменить.`)) {
            // Удаляем данные пикселя
            if (window.miniGrid?.pixels.has(pixelId)) {
                window.miniGrid.pixels.delete(pixelId);
                window.miniGrid.savePixelData();
                window.miniGrid.updatePixelDisplay();
            }

            // Записываем в историю модерации
            this.addModerationRecord('reset', pixelId, 'Пиксель сброшен модератором');
            
            MiniUtils.showNotification(`Пиксель #${pixelId} сброшен`, 'success');
        }
    }

    toggleModeratorPanel() {
        if (this.isModeratorPanelOpen) {
            this.closeModeratorPanel();
        } else {
            this.openModeratorPanel();
        }
    }

    openModeratorPanel() {
        const panel = document.getElementById('moderator-sidebar');
        if (panel) {
            panel.style.right = '0';
            this.isModeratorPanelOpen = true;
            
            // Закрываем главное меню
            if (window.miniChannels) {
                window.miniChannels.closeMainSidebar();
            }
            
            // Загружаем данные
            this.loadModerationData();
            this.updateModerationContent();
            this.updateModerationStats();
            
            MiniUtils.vibrate([100]);
        }
    }

    closeModeratorPanel() {
        const panel = document.getElementById('moderator-sidebar');
        if (panel) {
            panel.style.right = '-100%';
            this.isModeratorPanelOpen = false;
        }
    }

    switchModerationTab(tabName) {
        // Переключаем активную вкладку
        document.querySelectorAll('.moderation-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.moderation-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-content`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        // Загружаем контент для вкладки
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'submissions':
                this.loadSubmissions();
                break;
            case 'pixels':
                this.loadPixelsForModeration();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'history':
                this.loadModerationHistory();
                break;
        }
    }

    loadSubmissions() {
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        const submissionsList = document.getElementById('submissions-list');
        
        if (!submissionsList) return;

        const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');

        if (pendingSubmissions.length === 0) {
            submissionsList.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 32px; margin-bottom: 12px;">📝</div>
                    <div>Новых заявок нет</div>
                </div>
            `;
            return;
        }

        submissionsList.innerHTML = pendingSubmissions.map(submission => `
            <div class="submission-card" data-id="${submission.id}">
                <div class="submission-header">
                    <div class="submission-title">${submission.channelName}</div>
                    <div class="submission-date">${MiniUtils.formatDate(submission.submittedAt)}</div>
                </div>
                
                <div class="submission-info">
                    <div class="info-row">
                        <span class="info-label">🔗 Канал:</span>
                        <span class="info-value">${submission.telegramLink}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📂 Категории:</span>
                        <span class="info-value">${submission.categories.join(', ')}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">👤 Контакт:</span>
                        <span class="info-value">${submission.ownerContact || 'Не указан'}</span>
                    </div>
                </div>
                
                <div class="submission-description">
                    ${submission.description}
                </div>
                
                <div class="submission-actions">
                    <button class="btn-approve" onclick="window.miniModerator?.approveSubmission('${submission.id}')">
                        ✅ Одобрить
                    </button>
                    <button class="btn-reject" onclick="window.miniModerator?.rejectSubmission('${submission.id}')">
                        ❌ Отклонить
                    </button>
                    <button class="btn-edit" onclick="window.miniModerator?.editSubmission('${submission.id}')">
                        ✏️ Редактировать
                    </button>
                </div>
            </div>
        `).join('');
    }

    approveSubmission(submissionId) {
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        const submissionIndex = submissions.findIndex(sub => sub.id === submissionId);
        
        if (submissionIndex === -1) return;

        submissions[submissionIndex].status = 'approved';
        submissions[submissionIndex].approvedAt = new Date().toISOString();
        submissions[submissionIndex].approvedBy = this.moderatorUsername;
        
        MiniUtils.saveToStorage('nftg-channel-submissions', submissions);
        
        // Записываем в историю
        this.addModerationRecord('approve', submissionId, `Заявка "${submissions[submissionIndex].channelName}" одобрена`);
        
        MiniUtils.showNotification(`Заявка "${submissions[submissionIndex].channelName}" одобрена`, 'success');
        
        this.loadSubmissions();
        this.updateModerationStats();
        
        // Обновляем каналы
        if (window.miniChannels) {
            window.miniChannels.loadChannelsFromPixels();
        }
    }

    rejectSubmission(submissionId) {
        const reason = prompt('Причина отклонения (будет отправлена владельцу):');
        if (!reason) return;

        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        const submissionIndex = submissions.findIndex(sub => sub.id === submissionId);
        
        if (submissionIndex === -1) return;

        submissions[submissionIndex].status = 'rejected';
        submissions[submissionIndex].rejectedAt = new Date().toISOString();
        submissions[submissionIndex].rejectedBy = this.moderatorUsername;
        submissions[submissionIndex].rejectionReason = reason;
        
        MiniUtils.saveToStorage('nftg-channel-submissions', submissions);
        
        // Записываем в историю
        this.addModerationRecord('reject', submissionId, `Заявка "${submissions[submissionIndex].channelName}" отклонена: ${reason}`);
        
        MiniUtils.showNotification(`Заявка "${submissions[submissionIndex].channelName}" отклонена`, 'success');
        
        this.loadSubmissions();
        this.updateModerationStats();
    }

    editSubmission(submissionId) {
        // Здесь можно открыть модальное окно для редактирования заявки
        MiniUtils.showNotification('Функция редактирования заявок в разработке', 'info');
    }

    loadPixelsForModeration() {
        if (!window.miniGrid) return;

        const pixelsList = document.getElementById('pixels-list');
        if (!pixelsList) return;

        const allPixels = Array.from(window.miniGrid.pixels.entries());
        const filter = document.getElementById('pixels-filter-select')?.value || 'all';
        
        let filteredPixels = allPixels;

        switch (filter) {
            case 'with-images':
                filteredPixels = allPixels.filter(([id, data]) => data.imageUrl);
                break;
            case 'with-links':
                filteredPixels = allPixels.filter(([id, data]) => data.telegramLink);
                break;
            case 'recent':
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                filteredPixels = allPixels.filter(([id, data]) => 
                    new Date(data.purchaseDate) > yesterday
                );
                break;
        }

        if (filteredPixels.length === 0) {
            pixelsList.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 32px; margin-bottom: 12px;">🖼️</div>
                    <div>Пикселей не найдено</div>
                </div>
            `;
            return;
        }

        pixelsList.innerHTML = filteredPixels.map(([pixelId, pixelData]) => `
            <div class="pixel-mod-card" data-pixel-id="${pixelId}">
                <div class="pixel-mod-header">
                    <span class="pixel-id">#${pixelId}</span>
                    <span class="pixel-owner">${pixelData.owner}</span>
                    <span class="pixel-date">${MiniUtils.formatDate(pixelData.purchaseDate)}</span>
                </div>
                
                ${pixelData.imageUrl ? `
                    <div class="pixel-image-preview">
                        <img src="${pixelData.imageUrl}" alt="Pixel #${pixelId}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                    </div>
                ` : ''}
                
                <div class="pixel-mod-info">
                    <div class="info-row">
                        <span class="info-label">🔗 Канал:</span>
                        <span class="info-value">${pixelData.channel || 'Не указан'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📝 Описание:</span>
                        <span class="info-value">${pixelData.description || 'Не указано'}</span>
                    </div>
                </div>
                
                <div class="pixel-mod-actions">
                    <button class="btn-mod-edit" onclick="window.miniModerator?.editPixelContent(${pixelId})">
                        ✏️ Редактировать
                    </button>
                    <button class="btn-mod-flag" onclick="window.miniModerator?.flagPixel(${pixelId})">
                        ⚠️ Пометить
                    </button>
                    <button class="btn-mod-reset" onclick="window.miniModerator?.resetPixel(${pixelId})">
                        🗑️ Сбросить
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterPixels() {
        this.loadPixelsForModeration();
    }

    loadReports() {
        const reportsList = document.getElementById('reports-list');
        if (!reportsList) return;

        // В будущем здесь будут загружаться жалобы пользователей
        reportsList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                <div>Система жалоб в разработке</div>
                <div style="font-size: 12px; color: #666; margin-top: 8px;">
                    Скоро пользователи смогут отправлять жалобы на неподходящий контент
                </div>
            </div>
        `;
    }

    loadModerationHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        if (this.moderationHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
                    <div>История модерации пуста</div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.moderationHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(record => `
                <div class="history-record">
                    <div class="history-header">
                        <span class="history-action">${this.getActionIcon(record.action)} ${this.getActionText(record.action)}</span>
                        <span class="history-date">${MiniUtils.formatDate(record.timestamp)}</span>
                    </div>
                    <div class="history-description">${record.description}</div>
                    <div class="history-moderator">Модератор: ${record.moderator}</div>
                </div>
            `).join('');
    }

    getActionIcon(action) {
        const icons = {
            'approve': '✅',
            'reject': '❌',
            'edit': '✏️',
            'flag': '⚠️',
            'reset': '🗑️',
            'unflag': '🔓'
        };
        return icons[action] || '📝';
    }

    getActionText(action) {
        const texts = {
            'approve': 'Одобрение',
            'reject': 'Отклонение',
            'edit': 'Редактирование',
            'flag': 'Пометка',
            'reset': 'Сброс',
            'unflag': 'Снятие пометки'
        };
        return texts[action] || 'Действие';
    }

    addModerationRecord(action, targetId, description) {
        const record = {
            id: MiniUtils.generateId(),
            action,
            targetId,
            description,
            moderator: this.moderatorUsername,
            timestamp: new Date().toISOString()
        };

        this.moderationHistory.push(record);
        this.saveModerationData();
    }

    updateModerationStats() {
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        const pendingCount = submissions.filter(sub => sub.status === 'pending').length;
        const totalPixels = window.miniGrid ? window.miniGrid.pixels.size : 0;

        document.getElementById('pending-submissions-count').textContent = pendingCount;
        document.getElementById('flagged-pixels-count').textContent = this.flaggedPixels.length;
        document.getElementById('total-pixels-count').textContent = totalPixels;
    }

    updateModerationContent() {
        const activeTab = document.querySelector('.moderation-tab.active')?.dataset.tab;
        if (activeTab) {
            this.loadTabContent(activeTab);
        }
    }

    showModeratorEditModal(pixelId) {
        const modal = document.createElement('div');
        modal.className = 'modal moderator-modal';
        modal.id = 'moderator-edit-modal';
        
        const pixelData = window.miniGrid?.pixels.get(pixelId) || {};
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🛡️ МОДЕРАЦИЯ ПИКСЕЛЯ #${pixelId}</h3>
                
                <div class="form-group">
                    <label>👤 Владелец:</label>
                    <input type="text" id="mod-owner" class="form-control" value="${pixelData.owner || ''}" readonly>
                </div>
                
                <div class="form-group">
                    <label>🔗 Telegram канал:</label>
                    <input type="text" id="mod-telegram-link" class="form-control" value="${pixelData.telegramLink || ''}">
                </div>
                
                <div class="form-group">
                    <label>📝 Описание:</label>
                    <textarea id="mod-description" class="form-control" rows="3" maxlength="200">${pixelData.description || ''}</textarea>
                    <div class="char-counter">
                        <span id="mod-description-chars">${(pixelData.description || '').length}</span>/200
                    </div>
                </div>
                
                <div class="form-group">
                    <label>📂 Категории:</label>
                    <div class="category-selector" id="mod-categories">
                        <div class="category-tag ${pixelData.categories?.includes('Крипта') ? 'selected' : ''}" data-category="Крипта">💰 КРИПТА</div>
                        <div class="category-tag ${pixelData.categories?.includes('Игры') ? 'selected' : ''}" data-category="Игры">🎮 ИГРЫ</div>
                        <div class="category-tag ${pixelData.categories?.includes('Новости') ? 'selected' : ''}" data-category="Новости">📰 НОВОСТИ</div>
                        <div class="category-tag ${pixelData.categories?.includes('Технологии') ? 'selected' : ''}" data-category="Технологии">💻 ТЕХНОЛОГИИ</div>
                        <div class="category-tag ${pixelData.categories?.includes('Бизнес') ? 'selected' : ''}" data-category="Бизнес">💼 БИЗНЕС</div>
                        <div class="category-tag ${pixelData.categories?.includes('Образование') ? 'selected' : ''}" data-category="Образование">📚 ОБРАЗОВАНИЕ</div>
                        <div class="category-tag ${pixelData.categories?.includes('Спорт') ? 'selected' : ''}" data-category="Спорт">⚽ СПОРТ</div>
                        <div class="category-tag ${pixelData.categories?.includes('Развлечения') ? 'selected' : ''}" data-category="Развлечения">🎬 РАЗВЛЕЧЕНИЯ</div>
                    </div>
                </div>
                
                ${pixelData.imageUrl ? `
                    <div class="form-group">
                        <label>🖼️ Изображение:</label>
                        <div class="image-preview">
                            <img src="${pixelData.imageUrl}" style="max-width: 150px; max-height: 150px; border-radius: 4px;">
                            <button type="button" class="btn-remove-image" onclick="window.miniModerator?.removePixelImage(${pixelId})">
                                🗑️ Удалить изображение
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <div class="moderation-actions">
                    <div class="action-group">
                        <label>🛡️ Действия модератора:</label>
                        <div class="mod-action-buttons">
                            <button class="btn btn-warning" onclick="window.miniModerator?.flagPixelFromModal(${pixelId})">
                                ⚠️ Пометить как проблемный
                            </button>
                            <button class="btn btn-danger" onclick="window.miniModerator?.resetPixelFromModal(${pixelId})">
                                🗑️ Сбросить пиксель
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-success" onclick="window.miniModerator?.saveModeratorChanges(${pixelId})">
                        💾 СОХРАНИТЬ ИЗМЕНЕНИЯ
                    </button>
                    <button class="btn btn-secondary" onclick="window.miniModerator?.closeModeratorEditModal()">
                        ❌ ОТМЕНА
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');

        // Настраиваем обработчики
        this.setupModeratorModalEvents(pixelId);
    }

    setupModeratorModalEvents(pixelId) {
        // Счетчик символов
        const descriptionTextarea = document.getElementById('mod-description');
        const charCounter = document.getElementById('mod-description-chars');
        if (descriptionTextarea && charCounter) {
            descriptionTextarea.addEventListener('input', (e) => {
                charCounter.textContent = e.target.value.length;
            });
        }

        // Выбор категорий
        const categorySelector = document.getElementById('mod-categories');
        if (categorySelector) {
            categorySelector.addEventListener('click', (e) => {
                if (e.target.classList.contains('category-tag')) {
                    e.target.classList.toggle('selected');
                }
            });
        }
    }

    removePixelImage(pixelId) {
        if (confirm('Удалить изображение с пикселя?')) {
            const pixelData = window.miniGrid?.pixels.get(pixelId);
            if (pixelData) {
                delete pixelData.imageUrl;
                window.miniGrid.pixels.set(pixelId, pixelData);
                window.miniGrid.savePixelData();
                window.miniGrid.updatePixelDisplay();
                
                this.addModerationRecord('edit', pixelId, `Изображение удалено с пикселя #${pixelId}`);
                
                MiniUtils.showNotification(`Изображение удалено с пикселя #${pixelId}`, 'success');
                this.closeModeratorEditModal();
            }
        }
    }

    flagPixelFromModal(pixelId) {
        this.closeModeratorEditModal();
        this.flagPixel(pixelId);
    }

    resetPixelFromModal(pixelId) {
        this.closeModeratorEditModal();
        this.resetPixel(pixelId);
    }

    saveModeratorChanges(pixelId) {
        const telegramLink = document.getElementById('mod-telegram-link')?.value.trim();
        const description = document.getElementById('mod-description')?.value.trim();
        
        // Собираем выбранные категории
        const selectedCategories = Array.from(document.querySelectorAll('#mod-categories .category-tag.selected'))
            .map(tag => tag.dataset.category);

        // Валидация
        if (telegramLink && !MiniUtils.validateTelegramUsername(telegramLink)) {
            MiniUtils.showNotification('Некорректная ссылка на Telegram канал', 'error');
            return;
        }

        // Обновляем данные пикселя
        const pixelData = window.miniGrid?.pixels.get(pixelId);
        if (pixelData) {
            const changes = [];
            
            if (telegramLink !== pixelData.telegramLink) {
                pixelData.telegramLink = telegramLink;
                pixelData.channel = MiniUtils.extractTelegramUsername(telegramLink);
                changes.push('ссылка на канал');
            }
            
            if (description !== pixelData.description) {
                pixelData.description = description;
                changes.push('описание');
            }
            
            if (JSON.stringify(selectedCategories) !== JSON.stringify(pixelData.categories)) {
                pixelData.categories = selectedCategories;
                changes.push('категории');
            }

            if (changes.length > 0) {
                window.miniGrid.pixels.set(pixelId, pixelData);
                window.miniGrid.savePixelData();
                window.miniGrid.updatePixelDisplay();
                
                this.addModerationRecord('edit', pixelId, `Изменено модератором: ${changes.join(', ')}`);
                
                MiniUtils.showNotification(`Пиксель #${pixelId} обновлен модератором`, 'success');
                
                // Обновляем каналы
                if (window.miniChannels) {
                    window.miniChannels.onPixelPurchased();
                }
            }
        }

        this.closeModeratorEditModal();
    }

    closeModeratorEditModal() {
        const modal = document.getElementById('moderator-edit-modal');
        if (modal) {
            modal.remove();
        }
    }

    loadModerationData() {
        this.moderationHistory = MiniUtils.loadFromStorage('nftg-moderation-history', []);
        this.flaggedPixels = MiniUtils.loadFromStorage('nftg-flagged-pixels', []);
    }

    saveModerationData() {
        MiniUtils.saveToStorage('nftg-moderation-history', this.moderationHistory);
        MiniUtils.saveToStorage('nftg-flagged-pixels', this.flaggedPixels);
    }

    // Публичные методы для интеграции с другими модулями
    isModerator() {
        return this.isModerator;
    }

    getModeratorUsername() {
        return this.moderatorUsername;
    }

    getPendingSubmissionsCount() {
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        return submissions.filter(sub => sub.status === 'pending').length;
    }

    getFlaggedPixelsCount() {
        return this.flaggedPixels.length;
    }

    // Методы для отчетности
    getModerationStats() {
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        
        return {
            pendingSubmissions: submissions.filter(sub => sub.status === 'pending').length,
            approvedSubmissions: submissions.filter(sub => sub.status === 'approved').length,
            rejectedSubmissions: submissions.filter(sub => sub.status === 'rejected').length,
            flaggedPixels: this.flaggedPixels.length,
            moderationActions: this.moderationHistory.length,
            totalPixels: window.miniGrid ? window.miniGrid.pixels.size : 0
        };
    }

    exportModerationReport() {
        const stats = this.getModerationStats();
        const submissions = MiniUtils.loadFromStorage('nftg-channel-submissions', []);
        
        const report = {
            generatedAt: new Date().toISOString(),
            moderator: this.moderatorUsername,
            statistics: stats,
            submissions: submissions,
            flaggedPixels: this.flaggedPixels,
            moderationHistory: this.moderationHistory,
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nftg-moderation-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        MiniUtils.showNotification('Отчет по модерации экспортирован', 'success');
    }

    // Методы для автоматической модерации (в будущем)
    autoModerateProfanity(text) {
        // Список запрещенных слов (базовый)
        const profanityList = ['спам', 'мошенничество', 'обман'];
        
        for (const word of profanityList) {
            if (text.toLowerCase().includes(word.toLowerCase())) {
                return {
                    hasProfanity: true,
                    detectedWords: [word]
                };
            }
        }
        
        return { hasProfanity: false, detectedWords: [] };
    }

    autoModerateLinks(link) {
        // Проверка на подозрительные домены
        const suspiciousDomains = ['bit.ly', 'tinyurl.com'];
        
        try {
            const url = new URL(link);
            if (suspiciousDomains.includes(url.hostname)) {
                return {
                    isSuspicious: true,
                    reason: 'Подозрительный домен'
                };
            }
        } catch (e) {
            return {
                isSuspicious: true,
                reason: 'Некорректная ссылка'
            };
        }
        
        return { isSuspicious: false };
    }

    // Дебаг информация
    getDebugInfo() {
        return {
            isModerator: this.isModerator,
            moderatorUsername: this.moderatorUsername,
            isModeratorPanelOpen: this.isModeratorPanelOpen,
            pendingSubmissions: this.getPendingSubmissionsCount(),
            flaggedPixels: this.getFlaggedPixelsCount(),
            moderationHistory: this.moderationHistory.length,
            stats: this.getModerationStats()
        };
    }
}

// CSS стили для модерации
const moderatorStyles = `
<style>
.moderator-sidebar .sidebar-content {
    padding: 16px;
}

.moderation-stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: linear-gradient(145deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.05));
    border: 1px solid rgba(255, 68, 68, 0.2);
    border-radius: 8px;
}

.moderation-stats .stat-item {
    text-align: center;
}

.moderation-stats .stat-value {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #ff4444;
    margin-bottom: 4px;
}

.moderation-stats .stat-label {
    font-size: 11px;
    color: #ccc;
}

.moderation-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 68, 68, 0.2);
}

.moderation-tab {
    flex: 1;
    padding: 8px 4px;
    background: transparent;
    border: none;
    color: #ccc;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
}

.moderation-tab.active {
    color: #ff4444;
    border-bottom-color: #ff4444;
}

.moderation-tab:hover {
    color: #fff;
}

.moderation-tab-content {
    display: none;
}

.moderation-tab-content.active {
    display: block;
}

.submission-card, .pixel-mod-card {
    background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
}

.submission-header, .pixel-mod-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.submission-title {
    font-weight: 600;
    color: #fff;
    font-size: 14px;
}

.submission-date, .pixel-date {
    font-size: 10px;
    color: #999;
}

.submission-info, .pixel-mod-info {
    margin: 8px 0;
}

.info-row {
    display: flex;
    margin-bottom: 4px;
    font-size: 11px;
}

.info-label {
    min-width: 80px;
    color: #ccc;
    font-weight: 600;
}

.info-value {
    color: #fff;
    flex: 1;
    word-break: break-word;
}

.submission-description {
    background: rgba(0, 0, 0, 0.3);
    padding: 8px;
    border-radius: 4px;
    margin: 8px 0;
    font-size: 11px;
    line-height: 1.4;
    color: #ddd;
}

.submission-actions, .pixel-mod-actions {
    display: flex;
    gap: 6px;
    margin-top: 12px;
}

.btn-approve, .btn-reject, .btn-edit, .btn-mod-edit, .btn-mod-flag, .btn-mod-reset {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
}

.btn-approve {
    background: linear-gradient(145deg, #00ff88, #00cc66);
    color: #000;
}

.btn-reject, .btn-mod-reset {
    background: linear-gradient(145deg, #ff4444, #cc0000);
    color: #fff;
}

.btn-edit, .btn-mod-edit {
    background: linear-gradient(145deg, #00D4FF, #0099CC);
    color: #000;
}

.btn-mod-flag {
    background: linear-gradient(145deg, #FFB800, #FF9500);
    color: #000;
}

.pixel-id {
    font-family: monospace;
    font-weight: bold;
    color: #00D4FF;
}

.pixel-owner {
    color: #00ff88;
    font-size: 11px;
}

.pixel-image-preview {
    margin: 8px 0;
    text-align: center;
}

.pixels-filter {
    margin-bottom: 16px;
}

.pixels-filter select {
    width: 100%;
    padding: 8px;
    background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
}

.history-record {
    background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.history-action {
    font-weight: 600;
    color: #fff;
    font-size: 12px;
}

.history-date {
    font-size: 10px;
    color: #999;
}

.history-description {
    font-size: 11px;
    color: #ddd;
    margin-bottom: 4px;
    line-height: 1.3;
}

.history-moderator {
    font-size: 10px;
    color: #ff4444;
    font-weight: 600;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255,255,255,0.6);
}

.moderator-modal .modal-content {
    max-width: 500px;
    max-height: 90vh;
}

.image-preview {
    text-align: center;
    margin: 8px 0;
}

.btn-remove-image {
    display: block;
    margin: 8px auto 0;
    padding: 4px 8px;
    background: linear-gradient(145deg, #ff4444, #cc0000);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
}

.moderation-actions {
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid rgba(255, 68, 68, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin: 16px 0;
}

.action-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #ff4444;
}

.mod-action-buttons {
    display: flex;
    gap: 8px;
}

.mod-action-buttons .btn {
    flex: 1;
    font-size: 11px;
    padding: 8px 12px;
}
</style>
`;

// Добавляем стили в документ
document.head.insertAdjacentHTML('beforeend', moderatorStyles);

// Глобальная инициализация
window.MiniModerator = MiniModerator;