// === MINI APP UTILITIES ===

class MiniUtils {
    // Показ уведомлений через Telegram WebApp
    static showNotification(message, type = 'info') {
        // Используем Telegram WebApp API если доступно
        if (window.Telegram?.WebApp) {
            try {
                // Проверяем версию API перед использованием
                const version = window.Telegram.WebApp.version;
                if (version && parseFloat(version) >= 6.1) {
                    if (type === 'error') {
                        window.Telegram.WebApp.showAlert(message);
                    } else {
                        window.Telegram.WebApp.showPopup({
                            title: 'NFTG-ZONIX',
                            message: message,
                            buttons: [{ type: 'ok' }]
                        });
                    }
                } else {
                    // Fallback для старых версий - используем toast
                    this.createToast(message, type);
                }
            } catch (error) {
                // Если API недоступен - используем toast
                this.createToast(message, type);
            }
        } else {
            // Fallback для десктопа
            this.createToast(message, type);
        }
    }

    // Создание toast уведомления для десктопа
    static createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00FF88' : '#00D4FF'};
            color: ${type === 'success' || type === 'info' ? '#000' : '#fff'};
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            max-width: 250px;
            word-wrap: break-word;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Валидация Telegram username
    static validateTelegramUsername(input) {
        if (!input || typeof input !== 'string') return false;
        const trimmed = input.trim();
        
        // Проверяем ссылку на канал t.me
        if (trimmed.includes('t.me/')) {
            const username = trimmed.replace(/^(https?:\/\/)?t\.me\//, '');
            return /^[a-zA-Z0-9_]{5,32}$/.test(username);
        }
        
        // Проверяем @username формат
        if (trimmed.startsWith('@')) {
            return /^@[a-zA-Z0-9_]{5,32}$/.test(trimmed);
        }
        
        // Проверяем простой username
        return /^[a-zA-Z0-9_]{5,32}$/.test(trimmed);
    }

    // Нормализация Telegram ссылки
    static normalizeTelegramLink(input) {
        if (!input || typeof input !== 'string') return '';
        const trimmed = input.trim();
        
        if (trimmed.startsWith('https://t.me/')) {
            return trimmed;
        }
        
        if (trimmed.startsWith('t.me/')) {
            return `https://${trimmed}`;
        }
        
        if (trimmed.startsWith('@')) {
            return `https://t.me/${trimmed.slice(1)}`;
        }
        
        return `https://t.me/${trimmed}`;
    }

    // Извлечение username из ссылки
    static extractTelegramUsername(input) {
        if (!input || typeof input !== 'string') return '';
        const trimmed = input.trim();
        
        if (trimmed.includes('t.me/')) {
            const username = trimmed.replace(/^(https?:\/\/)?t\.me\//, '');
            return `@${username}`;
        }
        
        if (trimmed.startsWith('@')) {
            return trimmed;
        }
        
        return `@${trimmed}`;
    }

    // Форматирование даты
    static formatDate(dateString) {
        if (!dateString) return 'Неизвестна';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        } catch (error) {
            return 'Неизвестна';
        }
    }

    // Форматирование цены
    static formatPrice(price, currency = 'TON') {
        return `${price} ${currency}`;
    }

    // Генерация случайных пикселей
    static generateRandomPixels(totalPixels, ownedPixels, count) {
        const availablePixels = [];
        for (let i = 0; i < totalPixels; i++) {
            if (!ownedPixels.has(i)) {
                availablePixels.push(i);
            }
        }

        const selected = [];
        const maxCount = Math.min(count, availablePixels.length);
        
        for (let i = 0; i < maxCount; i++) {
            const randomIndex = Math.floor(Math.random() * availablePixels.length);
            const pixelId = availablePixels.splice(randomIndex, 1)[0];
            selected.push(pixelId);
        }

        return selected;
    }

    // Получение соседних пикселей
    static getNeighbors(pixelId, gridSize) {
        const row = Math.floor(pixelId / gridSize);
        const col = pixelId % gridSize;
        const neighbors = [];

        if (row > 0) neighbors.push((row - 1) * gridSize + col); // top
        if (row < gridSize - 1) neighbors.push((row + 1) * gridSize + col); // bottom
        if (col > 0) neighbors.push(row * gridSize + (col - 1)); // left
        if (col < gridSize - 1) neighbors.push(row * gridSize + (col + 1)); // right

        return neighbors;
    }

    // Поиск связанных групп пикселей
    static findConnectedGroups(pixelIds, gridSize) {
        const visited = new Set();
        const groups = [];

        pixelIds.forEach(pixelId => {
            if (!visited.has(pixelId)) {
                const group = this.dfsConnectedPixels(pixelId, pixelIds, visited, gridSize);
                if (group.length > 0) {
                    groups.push(group);
                }
            }
        });

        return groups.sort((a, b) => b.length - a.length);
    }

    // DFS для поиска связанных пикселей
    static dfsConnectedPixels(pixelId, availablePixels, visited, gridSize) {
        if (visited.has(pixelId) || !availablePixels.includes(pixelId)) {
            return [];
        }

        visited.add(pixelId);
        const group = [pixelId];

        const neighbors = this.getNeighbors(pixelId, gridSize);
        neighbors.forEach(neighborId => {
            if (availablePixels.includes(neighborId)) {
                group.push(...this.dfsConnectedPixels(neighborId, availablePixels, visited, gridSize));
            }
        });

        return group;
    }

    // Преобразование пикселя в координаты
    static pixelToCoords(pixelId, gridSize) {
        return {
            row: Math.floor(pixelId / gridSize),
            col: pixelId % gridSize
        };
    }

    // Преобразование координат в пиксель
    static coordsToPixel(row, col, gridSize) {
        return row * gridSize + col;
    }

    // Сохранение данных в localStorage
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    }

    // Загрузка данных из localStorage
    static loadFromStorage(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    // Получение конфигурации Telegram WebApp
    static getTelegramConfig() {
        const telegram = window.Telegram?.WebApp || { 
            ready: () => {}, 
            initDataUnsafe: { user: null },
            close: () => {},
            expand: () => {},
            enableClosingConfirmation: () => {},
            disableClosingConfirmation: () => {},
            showPopup: () => {},
            showAlert: () => {}
        };
        
        return {
            telegram,
            user: telegram.initDataUnsafe?.user,
            isWebApp: !!window.Telegram?.WebApp,
            theme: telegram.themeParams || {}
        };
    }

    // Проверка мобильного устройства
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Генерация ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Дебаунс функция
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Обработка ошибок
    static handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'Произошла ошибка';
        if (error.message) {
            message += `: ${error.message}`;
        }
        
        this.showNotification(message, 'error');
    }

    // Вибрация для мобильных устройств
    static vibrate(pattern = [100]) {
        try {
            if (window.Telegram?.WebApp?.HapticFeedback) {
                const version = window.Telegram.WebApp.version;
                if (version && parseFloat(version) >= 6.1) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
            } else if (navigator.vibrate) {
                navigator.vibrate(pattern);
            }
        } catch (error) {
            // Игнорируем ошибки вибрации
            console.log('Vibration not supported');
        }
    }

    // Показать режим на индикаторе
    static showModeIndicator(mode) {
        const indicator = document.getElementById('mode-indicator');
        if (!indicator) return;

        const modeNames = {
            'view': 'Просмотр',
            'buy': 'Покупка',
            'mass-buy': 'Массовая покупка',
            'edit': 'Редактирование'
        };

        indicator.textContent = modeNames[mode] || mode;
        indicator.classList.add('show');

        // Скрыть через 2 секунды
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    // Обновить отображение текущего режима
    static updateModeDisplay(mode) {
        const display = document.getElementById('mode-display');
        if (!display) return;

        const modeNames = {
            'view': 'Просмотр',
            'buy': 'Покупка', 
            'mass-buy': 'Массовая покупка',
            'edit': 'Редактирование'
        };

        display.textContent = modeNames[mode] || mode;
    }

    // Копирование в буфер обмена
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            console.warn('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Проверка поддержки функций браузера
    static checkBrowserSupport() {
        return {
            canvas: !!document.createElement('canvas').getContext,
            fileReader: !!window.FileReader,
            localStorage: !!window.localStorage,
            touch: 'ontouchstart' in window
        };
    }

    // Форматирование числа подписчиков
    static formatSubscriberCount(count) {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        } else {
            return count.toString();
        }
    }

    // Получение иконки категории
    static getCategoryIcon(category) {
        const icons = {
            'Крипта': '💰',
            'Игры': '🎮',
            'Новости': '📰',
            'Технологии': '💻',
            'Бизнес': '💼',
            'Образование': '📚',
            'Спорт': '⚽',
            'Развлечения': '🎬'
        };
        return icons[category] || '📁';
    }

    // Анимация элемента
    static animateElement(element, animationName, duration = 300) {
        return new Promise((resolve) => {
            element.style.animation = `${animationName} ${duration}ms ease`;
            
            const handleAnimationEnd = () => {
                element.style.animation = '';
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }

    // Установка темы приложения
    static setTheme(isDark = true) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    // Инициализация Telegram WebApp
    static initTelegramWebApp() {
        const config = this.getTelegramConfig();
        
        if (config.isWebApp) {
            try {
                // Настройка WebApp
                config.telegram.ready();
                config.telegram.expand();
                
                // Проверяем версию перед использованием методов
                const version = config.telegram.version;
                if (version && parseFloat(version) >= 6.1) {
                    config.telegram.enableClosingConfirmation();
                }
                
                // Применение темы Telegram
                if (config.theme.bg_color) {
                    document.documentElement.style.setProperty('--tg-bg-color', config.theme.bg_color);
                }
                
                console.log('✅ Telegram WebApp initialized, version:', version);
                return config;
            } catch (error) {
                console.log('⚠️ Some Telegram WebApp features not supported:', error.message);
                return config;
            }
        } else {
            console.log('ℹ️ Running in browser mode');
            return config;
        }
    }
}

// Экспорт для использования в других модулях
window.MiniUtils = MiniUtils;