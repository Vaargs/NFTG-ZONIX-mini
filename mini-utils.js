// === MINI APP UTILITIES ===

class MiniUtils {
    // Показ уведомлений через Telegram WebApp
    static showNotification(message, type = 'info') {
        // Используем переводы если доступны
        const translatedMessage = window.MiniI18n ? 
            (typeof message === 'string' && message.includes('.') ? window.MiniI18n.t(message) : message) : 
            message;
        
        // Преобразуем сообщение в верхний регистр для строгого стиля
        const strictMessage = translatedMessage.toUpperCase();
        
        // Используем Telegram WebApp API если доступно
        if (window.Telegram?.WebApp) {
            try {
                // Проверяем версию API перед использованием
                const version = window.Telegram.WebApp.version;
                if (version && parseFloat(version) >= 6.1) {
                    if (type === 'error') {
                        window.Telegram.WebApp.showAlert(strictMessage);
                    } else {
                        window.Telegram.WebApp.showPopup({
                            title: 'NFTG-ZONIX',
                            message: strictMessage,
                            buttons: [{ type: 'ok' }]
                        });
                    }
                } else {
                    // Fallback для старых версий - используем toast
                    this.createToast(strictMessage, type);
                }
            } catch (error) {
                // Если API недоступен - используем toast
                this.createToast(strictMessage, type);
            }
        } else {
            // Fallback для десктопа
            this.createToast(strictMessage, type);
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
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00ff88' : '#00D4FF'};
            color: ${type === 'success' || type === 'info' ? '#000' : '#fff'};
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            max-width: 280px;
            word-wrap: break-word;
            border: 1px solid ${type === 'error' ? '#cc0000' : type === 'success' ? '#00cc66' : '#0099CC'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.5px;
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

    // Форматирование даты в строгом стиле
    static formatDate(dateString) {
        if (!dateString) return window.MiniI18n ? window.MiniI18n.t('pixel.unknown_date') : 'НЕИЗВЕСТНА';
        
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch (error) {
            return window.MiniI18n ? window.MiniI18n.t('pixel.unknown_date') : 'НЕИЗВЕСТНА';
        }
    }

    // Форматирование цены в строгом стиле
    static formatPrice(price, currency = 'TON') {
        const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;
        return `${formattedPrice} ${currency}`;
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
        
        let message = window.MiniI18n ? window.MiniI18n.t('error.unknown') : 'ПРОИЗОШЛА ОШИБКА';
        if (error.message) {
            message += `: ${error.message.toUpperCase()}`;
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

        const modeText = window.MiniI18n ? 
            window.MiniI18n.t('header.mode.' + mode) : 
            mode.toUpperCase();

        indicator.textContent = modeText;
        indicator.classList.add('show');

        // Скрыть через 2 секунды
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    // Обновить отображение текущего режима
    static updateModeDisplay(mode) {
        const display = document.getElementById('mode-display');
        if (!display || !mode) return;

        const modeText = window.MiniI18n ? 
            window.MiniI18n.t('header.mode.' + mode) : 
            mode.toUpperCase();

        display.textContent = modeText;
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

    // Форматирование числа подписчиков в строгом стиле
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
            'Крипта': '💰', 'CRYPTO': '💰', 'crypto': '💰',
            'Игры': '🎮', 'GAMES': '🎮', 'games': '🎮',
            'Новости': '📰', 'NEWS': '📰', 'news': '📰',
            'Технологии': '💻', 'TECH': '💻', 'tech': '💻',
            'Бизнес': '💼', 'BUSINESS': '💼', 'business': '💼',
            'Образование': '📚', 'EDUCATION': '📚', 'education': '📚',
            'Спорт': '⚽', 'SPORTS': '⚽', 'sports': '⚽',
            'Развлечения': '🎬', 'ENTERTAINMENT': '🎬', 'entertainment': '🎬',
            'Демо': '🧪', 'DEMO': '🧪', 'demo': '🧪',
            'Общее': '📁', 'GENERAL': '📁', 'general': '📁'
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
                
                // Применение темы Telegram (адаптированное под строгий стиль)
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

    // Строгое форматирование текста
    static formatStrictText(text) {
        if (!text) return '';
        return text.toUpperCase().trim();
    }

    // Форматирование номера пикселя
    static formatPixelNumber(pixelId) {
        return `#${pixelId.toString().padStart(3, '0')}`;
    }

    // Форматирование статуса в строгом стиле
    static formatStatus(status) {
        if (window.MiniI18n) {
            const statusMap = {
                'sent': 'notification.transaction_sent',
                'confirmed': 'notification.transaction_confirmed',
                'pending': 'notification.transaction_pending',
                'failed': 'notification.transaction_rejected',
                'verified': 'user.verified',
                'not_verified': 'user.not_verified'
            };
            return window.MiniI18n.t(statusMap[status] || status);
        }
        
        const statusMap = {
            'sent': 'ОТПРАВЛЕНО',
            'confirmed': 'ПОДТВЕРЖДЕНО',
            'pending': 'В ОЖИДАНИИ',
            'failed': 'ОШИБКА',
            'verified': 'ВЕРИФИЦИРОВАН',
            'not_verified': 'НЕ ВЕРИФИЦИРОВАН'
        };
        return statusMap[status] || status.toUpperCase();
    }

    // Валидация email (если потребуется)
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Генерация QR кода (если потребуется)
    static generateQRCode(text, size = 150) {
        // Здесь можно добавить генерацию QR кода
        console.log('QR Code generation requested for:', text);
        return null;
    }

    // Проверка подключения к интернету
    static checkInternetConnection() {
        return navigator.onLine;
    }

    // Получение информации о устройстве
    static getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            isMobile: this.isMobile(),
            isTelegram: !!window.Telegram?.WebApp,
            currentLanguage: window.MiniI18n ? window.MiniI18n.getCurrentLanguage() : 'ru'
        };
    }

    // Логирование в строгом стиле
    static log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
        
        switch (type) {
            case 'error':
                console.error(prefix, message);
                break;
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'success':
                console.log(`%c${prefix} ${message}`, 'color: #00ff88; font-weight: bold;');
                break;
            default:
                console.log(prefix, message);
        }
    }

    // Создание уникального идентификатора сессии
    static createSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `session_${timestamp}_${random}`;
    }

    // Безопасное выполнение функции
    static safeExecute(fn, fallback = null, context = 'Unknown') {
        try {
            return fn();
        } catch (error) {
            this.log(`Error in ${context}: ${error.message}`, 'error');
            return fallback;
        }
    }

    // Очистка объекта от пустых значений
    static cleanObject(obj) {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    }

    // Получение локализованного текста
    static t(key, params = {}) {
        return window.MiniI18n ? window.MiniI18n.t(key, params) : key;
    }

    // Получение локализованного текста уведомления
    static getNotificationText(key, params = {}) {
        return window.MiniI18n ? window.MiniI18n.getNotificationText(key, params) : key;
    }

    // Получение локализованного текста ошибки
    static getErrorText(key, params = {}) {
        return window.MiniI18n ? window.MiniI18n.getErrorText(key, params) : key;
    }

    // Получение локализованного текста кнопки
    static getButtonText(key, params = {}) {
        return window.MiniI18n ? window.MiniI18n.getButtonText(key, params) : key;
    }
}

// Экспорт для использования в других модулях
window.MiniUtils = MiniUtils;