// === MINI I18N SYSTEM ===

class MiniI18n {
    constructor() {
        this.currentLanguage = 'ru';
        this.translations = {
            ru: {
                // Header
                'header.logo': 'NFTG-ZONIX',
                'header.mode.view': 'ПРОСМОТР',
                'header.mode.buy': 'ПОКУПКА',
                'header.mode.mass-buy': 'МАССОВАЯ ПОКУПКА',
                'header.mode.edit': 'РЕДАКТИРОВАНИЕ',
                
                // Status bar
                'status.selected': 'ВЫБРАНО',
                'status.owned': 'КУПЛЕНО',
                'status.cost': 'СТОИМОСТЬ',
                
                // Mode tabs
                'mode.view': 'ПРОСМОТР',
                'mode.buy': 'ПОКУПКА',
                'mode.mass-buy': 'МАССОВО',
                'mode.edit': 'РЕДАКТОР',
                'mode.about': 'О ПРОЕКТЕ',
                
                // Buttons
                'button.buy': 'КУПИТЬ',
                'button.buy.multiple': 'КУПИТЬ {count} ПИКСЕЛЕЙ',
                'button.buy.single': 'КУПИТЬ ПИКСЕЛЬ',
                'button.buy.mass': 'КУПИТЬ {count} ПИКСЕЛЕЙ',
                'button.edit': 'РЕДАКТИРОВАТЬ ОБЛАСТЬ',
                'button.edit.single': 'РЕДАКТИРОВАТЬ ПИКСЕЛЬ',
                'button.edit.info': 'РЕДАКТИРОВАТЬ ИНФОРМАЦИЮ',
                'button.close': 'ЗАКРЫТЬ',
                'button.cancel': 'ОТМЕНА',
                'button.confirm': 'ПОДТВЕРДИТЬ',
                'button.save': 'СОХРАНИТЬ',
                'button.apply': 'ПРИМЕНИТЬ',
                'button.reset': 'СБРОСИТЬ',
                'button.preview': 'ПРЕДПРОСМОТР',
                'button.upload': 'ЗАГРУЗИТЬ',
                'button.visit': 'ПЕРЕЙТИ',
                'button.rate': 'ОЦЕНИТЬ',
                'button.open': 'ОТКРЫТЬ',
                'button.connect': 'ПОДКЛЮЧИТЬ',
                'button.disconnect': 'ОТКЛЮЧИТЬ',
                'button.verify': 'ВЕРИФИЦИРОВАТЬСЯ',
                'button.submit': 'ПОДАТЬ ЗАЯВКУ',
                'button.website': 'САЙТ',
                
                // Controls
                'control.zoom.in': 'Увеличить',
                'control.zoom.out': 'Уменьшить',
                'control.center': 'Центр',
                'control.drag': 'Режим перетаскивания',
                'control.language': 'Язык',
                
                // Menu
                'menu.main': 'ГЛАВНОЕ МЕНЮ',
                'menu.channels': 'НАВИГАТОР КАНАЛОВ',
                'menu.channels.desc': 'Обзор и поиск каналов',
                'menu.submit': 'ПОДАТЬ ЗАЯВКУ',
                'menu.submit.desc': 'Добавить канал в поиск',
                'menu.market': 'МАРКЕТ',
                'menu.market.desc': 'Покупка и продажа пикселей',
                'menu.website': 'ВЕБ-САЙТ',
                'menu.website.desc': 'Перейти на официальный сайт',
                'menu.verification': 'ВЕРИФИКАЦИЯ',
                'menu.verification.desc': 'Подтвердить аккаунт',
                'menu.stats': 'СТАТИСТИКА',
                'menu.stats.desc': 'Аналитика и метрики',
                'menu.wallet': 'КОШЕЛЕК',
                'menu.wallet.desc': 'TON кошелек для покупок',
                'menu.wallet.connect': 'Подключить кошелек',
                
                // User status
                'user.verified': 'ВЕРИФИЦИРОВАН',
                'user.not_verified': 'НЕ ВЕРИФИЦИРОВАН',
                'user.pending': 'ВЕРИФИКАЦИЯ...',
                'user.failed': 'ОШИБКА ВЕРИФИКАЦИИ',
                
                // Channels
                'channels.title': 'НАВИГАТОР КАНАЛОВ',
                'channels.search': 'Поиск каналов...',
                'channels.categories': 'КАТЕГОРИИ',
                'channels.sort': 'СОРТИРОВКА',
                'channels.sort.newest': 'НОВЫЕ',
                'channels.sort.rating': 'ПО РЕЙТИНГУ',
                'channels.sort.subscribers': 'ПО ПОДПИСЧИКАМ',
                'channels.sort.activity': 'ПО АКТИВНОСТИ',
                'channels.empty': 'Каналы не найдены',
                'channels.empty.desc': 'Купите пиксели с каналами или измените фильтры',
                'channels.my': 'МОЙ',
                'channels.verified': '✓',
                'channels.approved': '📝',
                'channels.no_pixel': 'Без пикселя',
                'channels.pixel': '#',
                'channels.subscribers': 'подписчиков',
                'channels.rating': 'Оценить',
                'channels.open': 'Открыть',
                
                // Categories
                'category.crypto': 'КРИПТА',
                'category.games': 'ИГРЫ',
                'category.news': 'НОВОСТИ',
                'category.tech': 'ТЕХНОЛОГИИ',
                'category.business': 'БИЗНЕС',
                'category.education': 'ОБРАЗОВАНИЕ',
                'category.sports': 'СПОРТ',
                'category.entertainment': 'РАЗВЛЕЧЕНИЯ',
                'category.demo': 'ДЕМО',
                'category.general': 'ОБЩЕЕ',
                
                // Modals
                'modal.purchase.title': 'ПОКУПКА ПИКСЕЛЯ',
                'modal.purchase.price': 'ЦЕНА',
                'modal.purchase.telegram': 'TELEGRAM КАНАЛ',
                'modal.purchase.description': 'ОПИСАНИЕ (ОПЦИОНАЛЬНО)',
                'modal.purchase.description.placeholder': 'Краткое описание канала',
                'modal.purchase.telegram.placeholder': '@username или https://t.me/username',
                
                'modal.mass_purchase.title': 'МАССОВАЯ ПОКУПКА',
                'modal.mass_purchase.pixels': 'ПИКСЕЛЕЙ',
                'modal.mass_purchase.total': 'ОБЩАЯ ЦЕНА',
                
                'modal.edit.title': 'РЕДАКТОР ИЗОБРАЖЕНИЙ',
                'modal.edit.upload': 'ЗАГРУЗИТЬ',
                'modal.edit.zoom_in': '🔍+',
                'modal.edit.zoom_out': '🔍−',
                'modal.edit.rotate_left': '↺',
                'modal.edit.rotate_right': '↻',
                'modal.edit.reset': '🔄',
                'modal.edit.preview': 'ПРЕДПРОСМОТР',
                'modal.edit.apply': 'ПРИМЕНИТЬ',
                'modal.edit.upload_image': 'Загрузите изображение',
                
                'modal.pixel_info.title': 'ПИКСЕЛЬ',
                'modal.pixel_info.owner': 'ВЛАДЕЛЕЦ',
                'modal.pixel_info.categories': 'КАТЕГОРИИ',
                'modal.pixel_info.date': 'ДАТА',
                'modal.pixel_info.price': 'ЦЕНА',
                'modal.pixel_info.not_specified': 'НЕ УКАЗАНЫ',
                'modal.pixel_info.unknown': 'НЕИЗВЕСТНА',
                
                'modal.edit_info.title': 'РЕДАКТИРОВАТЬ ИНФОРМАЦИЮ ПИКСЕЛЕЙ',
                'modal.edit_info.pixels': 'ПИКСЕЛЕЙ',
                'modal.edit_info.categories': 'КАТЕГОРИИ (ДО 3-Х)',
                'modal.edit_info.selected': 'ВЫБРАНО',
                'modal.edit_info.none': 'НЕТ',
                'modal.edit_info.description': 'ОПИСАНИЕ',
                'modal.edit_info.description.placeholder': 'Описание канала',
                'modal.edit_info.chars': 'символов',
                
                'modal.submission.title': 'ПОДАТЬ ЗАЯВКУ НА КАНАЛ',
                'modal.submission.subtitle': 'Ваш канал появится в поиске после модерации, даже без покупки пикселя',
                'modal.submission.telegram': 'TELEGRAM КАНАЛ',
                'modal.submission.name': 'НАЗВАНИЕ КАНАЛА',
                'modal.submission.name.placeholder': 'Crypto News Today',
                'modal.submission.categories': 'КАТЕГОРИИ (ВЫБЕРИТЕ ДО 3-Х)',
                'modal.submission.description': 'ОПИСАНИЕ КАНАЛА',
                'modal.submission.description.placeholder': 'Кратко опишите ваш канал: тематика, аудитория, частота постов...',
                'modal.submission.contact': 'КОНТАКТ ВЛАДЕЛЬЦА (ОПЦИОНАЛЬНО)',
                'modal.submission.contact.placeholder': '@username для связи',
                'modal.submission.options': 'ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ',
                'modal.submission.adult': '18+ КОНТЕНТ',
                'modal.submission.paid': 'ПЛАТНЫЙ КОНТЕНТ',
                'modal.submission.commercial': 'КОММЕРЧЕСКИЙ КАНАЛ',
                'modal.submission.rules': 'ПРАВИЛА МОДЕРАЦИИ',
                'modal.submission.rules.active': 'Активный канал (посты в последние 30 дней)',
                'modal.submission.rules.quality': 'Качественный контент на русском языке',
                'modal.submission.rules.category': 'Соответствие выбранной категории',
                'modal.submission.rules.auto': 'Количество подписчиков определяется автоматически',
                'modal.submission.rules.no_spam': 'Запрещены: спам, NSFW, мошенничество',
                'modal.submission.rules.no_aggregators': 'Каналы-агрегаторы без авторского контента',
                'modal.submission.agree': 'Я согласен с правилами и подтверждаю, что являюсь владельцем канала',
                
                'modal.rating.title': 'ОЦЕНИТЬ КАНАЛ',
                'modal.rating.current': 'ТЕКУЩИЙ РЕЙТИНГ',
                'modal.rating.your': 'ВАША ОЦЕНКА',
                'modal.rating.select': 'ВЫБЕРИТЕ ОЦЕНКУ',
                'modal.rating.comment': 'КОММЕНТАРИЙ (ОПЦИОНАЛЬНО)',
                'modal.rating.comment.placeholder': 'Поделитесь своим мнением о канале...',
                'modal.rating.verification': 'ВЕРИФИКАЦИЯ ТРЕБУЕТСЯ',
                'modal.rating.verification.desc': 'Для оценки каналов необходимо пройти верификацию через бот',
                'modal.rating.excellent': 'Отлично',
                'modal.rating.good': 'Хорошо',
                'modal.rating.normal': 'Нормально',
                'modal.rating.bad': 'Плохо',
                'modal.rating.very_bad': 'Очень плохо',
                
                'modal.about.title': 'О ПРОЕКТЕ',
                'modal.about.project': 'NFTG-ZONIX',
                'modal.about.subtitle': 'Интерактивная платформа поиска Telegram-каналов',
                'modal.about.description': 'интерактивная платформа по поиску Telegram-каналов и визуальному размещению их на пиксельной сетке. Проект сочетает в себе:',
                'modal.about.catalog': 'Каталог Telegram-каналов по темам, тэгам и популярности',
                'modal.about.grid': 'Визуальную NFT-сетку, где каждый блок представляет канал',
                'modal.about.upload': 'Возможность загрузить изображение и прикрепить ссылку на свой канал',
                'modal.about.moderation': 'Механизмы модерации и защиты от запрещённого контента',
                'modal.about.ton': 'Интеграцию с TON (TON Connect, NFT, транзакции)',
                'modal.about.website': 'Полноценный сайт с поисковой системой и витриной всех размещённых каналов',
                'modal.about.inspiration': 'Проект вдохновлён',
                'modal.about.inspiration.text': 'и адаптирован под Telegram-экосистему.',
                'modal.about.community': 'это не только реклама, но и сообщество.',
                
                // Wallet
                'wallet.connected': 'Кошелек подключен',
                'wallet.not_connected': 'Кошелек не подключен',
                'wallet.balance': 'Баланс',
                'wallet.insufficient': 'Недостаточно средств',
                'wallet.connect.desc': 'Подключите TON кошелек для покупки пикселей',
                'wallet.demo': 'Демо кошелек',
                'wallet.real': 'Реальный кошелек',
                'wallet.copy': 'Копировать адрес',
                'wallet.disconnect': 'Отключить',
                'wallet.connecting': 'Подключение кошелька...',
                'wallet.verification': 'Верификация',
                'wallet.verification.desc': 'Для верификации отправьте 0.01 TON на адрес верификации. Средства будут возвращены на ваш кошелек в течение 24 часов.',
                'wallet.verification.send': 'Отправить 0.01 TON',
                'wallet.verification.demo': 'Демо верификация',
                'wallet.verification.pending': 'Проверка транзакции',
                'wallet.verification.pending.desc': 'Ваша транзакция проверяется. Это может занять до 5 минут.',
                'wallet.verification.check': 'Проверить сейчас',
                'wallet.verification.cancel': 'Отменить',
                'wallet.verification.success': 'Верификация завершена! Средства будут возвращены в течение 24 часов.',
                'wallet.verification.demo.success': 'Демо верификация завершена!',
                
                // Notifications
                'notification.app_ready': 'ПРИЛОЖЕНИЕ ГОТОВО К РАБОТЕ!',
                'notification.drag_on': 'РЕЖИМ ПЕРЕТАСКИВАНИЯ ВКЛЮЧЕН',
                'notification.drag_off': 'РЕЖИМ ПЕРЕТАСКИВАНИЯ ВЫКЛЮЧЕН',
                'notification.seamless_on': 'БЕСШОВНЫЙ РЕЖИМ ВКЛЮЧЕН',
                'notification.seamless_off': 'БЕСШОВНЫЙ РЕЖИМ ВЫКЛЮЧЕН',
                'notification.pixel_purchased': 'ПИКСЕЛЬ #{id} КУПЛЕН!',
                'notification.pixels_purchased': 'КУПЛЕНО {count} ПИКСЕЛЕЙ!',
                'notification.image_uploaded': 'ИЗОБРАЖЕНИЕ ЗАГРУЖЕНО!',
                'notification.image_applied': 'ИЗОБРАЖЕНИЕ ТОЧНО ПРИМЕНЕНО К {count} ПИКСЕЛЯМ!',
                'notification.info_updated': 'ИНФОРМАЦИЯ ОБНОВЛЕНА ДЛЯ {count} ПИКСЕЛЕЙ!',
                'notification.channel_submitted': 'ЗАЯВКА НА КАНАЛ "{name}" ОТПРАВЛЕНА НА МОДЕРАЦИЮ!',
                'notification.channel_rated': 'КАНАЛ {channel} ОЦЕНЕН НА {rating} ЗВЕЗД!',
                'notification.wallet_connected': 'КОШЕЛЕК ПОДКЛЮЧЕН!',
                'notification.wallet_disconnected': 'КОШЕЛЕК ОТКЛЮЧЕН',
                'notification.demo_wallet_connected': 'ДЕМО КОШЕЛЕК ПОДКЛЮЧЕН!',
                'notification.verification_started': 'ДЕМО ВЕРИФИКАЦИЯ ЗАПУЩЕНА...',
                'notification.verification_completed': 'ВЕРИФИКАЦИЯ ЗАВЕРШЕНА!',
                'notification.verification_cancelled': 'ВЕРИФИКАЦИЯ ОТМЕНЕНА',
                'notification.verification_reset': 'ВЕРИФИКАЦИЯ СБРОШЕНА',
                'notification.address_copied': 'АДРЕС СКОПИРОВАН',
                'notification.website_opening': 'ОТКРЫТИЕ ОФИЦИАЛЬНОГО САЙТА',
                'notification.channel_opening': 'ОТКРЫТИЕ КАНАЛА',
                'notification.data_exported': 'ДАННЫЕ ЭКСПОРТИРОВАНЫ',
                'notification.data_cleared': 'ВСЕ ДАННЫЕ ОЧИЩЕНЫ',
                'notification.transform_reset': 'ТРАНСФОРМАЦИЯ СБРОШЕНА',
                'notification.preview_ready': 'ПРЕДПРОСМОТР ГОТОВ!',
                'notification.max_categories': 'МАКСИМУМ 3 КАТЕГОРИИ',
                'notification.select_image': 'ВЫБЕРИТЕ ИЗОБРАЖЕНИЕ',
                'notification.select_pixels': 'НЕ ВЫБРАНЫ ПИКСЕЛИ ДЛЯ РЕДАКТИРОВАНИЯ',
                'notification.own_pixels_only': 'МОЖНО РЕДАКТИРОВАТЬ ТОЛЬКО СВОИ ПИКСЕЛИ',
                'notification.verification_required': 'ДЛЯ ОЦЕНКИ КАНАЛОВ ТРЕБУЕТСЯ ВЕРИФИКАЦИЯ',
                'notification.connect_wallet': 'ПОДКЛЮЧИТЕ КОШЕЛЕК ДЛЯ ПОКУПКИ',
                'notification.insufficient_funds': 'НЕДОСТАТОЧНО СРЕДСТВ. НУЖНО {needed} TON, ДОСТУПНО {available} TON',
                'notification.transaction_sent': 'ТРАНЗАКЦИЯ ОТПРАВЛЕНА! {amount} TON',
                'notification.transaction_rejected': 'ТРАНЗАКЦИЯ ОТКЛОНЕНА',
                'notification.verification_transaction_sent': 'ВЕРИФИКАЦИОННАЯ ТРАНЗАКЦИЯ ОТПРАВЛЕНА! {amount} TON',
                'notification.verification_transaction_rejected': 'ВЕРИФИКАЦИОННАЯ ТРАНЗАКЦИЯ ОТКЛОНЕНА',
                'notification.demo_mode_active': 'ДЕМО РЕЖИМ КОШЕЛЬКА АКТИВИРОВАН',
                'notification.processing_demo_payment': 'ОБРАБОТКА ДЕМО ПЛАТЕЖА...',
                'notification.processing_demo_verification': 'ОБРАБОТКА ДЕМО ВЕРИФИКАЦИИ...',
                'notification.demo_payment_success': 'ДЕМО ПЛАТЕЖ {amount} TON ВЫПОЛНЕН!',
                'notification.demo_verification_success': 'ДЕМО ВЕРИФИКАЦИЯ {amount} TON ВЫПОЛНЕНА!',
                'notification.market_soon': 'МАРКЕТ БУДЕТ ДОСТУПЕН В СЛЕДУЮЩЕМ ОБНОВЛЕНИИ',
                'notification.transaction_processing': 'ОТПРАВКА ТРАНЗАКЦИИ...',
                'notification.verification_transaction_processing': 'ОТПРАВКА ВЕРИФИКАЦИОННОЙ ТРАНЗАКЦИИ...',
                'notification.checking_verification': 'ПРОВЕРКА СТАТУСА ВЕРИФИКАЦИИ...',
                'notification.wallet_error': 'ОШИБКА КОШЕЛЬКА',
                'notification.payment_error': 'ОШИБКА ПЛАТЕЖА',
                'notification.verification_error': 'ОШИБКА ВЕРИФИКАЦИИ',
                'notification.connection_cancelled': 'ПОДКЛЮЧЕНИЕ ОТМЕНЕНО',
                'notification.network_error': 'ПРОБЛЕМА С СЕТЬЮ',
                'notification.config_error': 'ОШИБКА КОНФИГУРАЦИИ КОШЕЛЬКА',
                'notification.ton_connect_unavailable': 'TON CONNECT НЕДОСТУПЕН',
                'notification.wallet_not_available': 'НЕ УДАЛОСЬ ОТКРЫТЬ КОШЕЛЕК',
                'notification.language_changed': 'ЯЗЫК ИЗМЕНЕН НА {language}',
                
                // Errors
                'error.form': 'ОШИБКА ФОРМЫ',
                'error.telegram_link': 'ВВЕДИТЕ КОРРЕКТНЫЙ TELEGRAM КАНАЛ',
                'error.channel_name': 'ВВЕДИТЕ НАЗВАНИЕ КАНАЛА',
                'error.select_categories': 'ВЫБЕРИТЕ ХОТЯ БЫ ОДНУ КАТЕГОРИЮ',
                'error.channel_description': 'ВВЕДИТЕ ОПИСАНИЕ КАНАЛА',
                'error.accept_terms': 'НЕОБХОДИМО СОГЛАСИТЬСЯ С ПРАВИЛАМИ',
                'error.select_rating': 'ВЫБЕРИТЕ ОЦЕНКУ ОТ 1 ДО 5 ЗВЕЗД',
                'error.upload_image': 'ЗАГРУЗИТЕ ИЗОБРАЖЕНИЕ',
                'error.unknown': 'ПРОИЗОШЛА ОШИБКА',
                'error.app_init': 'ОШИБКА ПРИ ЗАПУСКЕ ПРИЛОЖЕНИЯ',
                'error.init': 'ОШИБКА ИНИЦИАЛИЗАЦИИ ПРИЛОЖЕНИЯ',
                'error.channel_link_unavailable': 'ССЫЛКА НА КАНАЛ НЕДОСТУПНА',
                
                // Tooltips
                'tooltip.pixel': 'Пиксель #{id}',
                'tooltip.pixel_available': 'Пиксель #{id} - Доступен для покупки',
                'tooltip.pixel_owned': 'Пиксель #{id}\nВладелец: {owner}\nКатегория: {category}',
                
                // Pixel info
                'pixel.owner': 'Владелец',
                'pixel.category': 'Категория',
                'pixel.categories': 'Категории',
                'pixel.date': 'Дата',
                'pixel.price': 'Цена',
                'pixel.not_specified': 'Не указана',
                'pixel.unknown_date': 'Неизвестна',
                'pixel.unknown_owner': '@unknown',
                
                // Time formats
                'time.today': 'Сегодня',
                'time.yesterday': 'Вчера',
                'time.days_ago': '{count} дней назад',
                'time.just_now': 'Только что',
                'time.minutes_ago': '{count} минут назад',
                'time.hours_ago': '{count} часов назад',
                
                // Stats
                'stats.total_channels': 'Всего каналов',
                'stats.pixel_channels': 'С пикселями',
                'stats.approved_channels': 'Одобренных заявок',
                'stats.owned_channels': 'Ваших каналов',
                'stats.avg_subscribers': 'Средние подписчики',
                'stats.avg_rating': 'Средний рейтинг',
                'stats.verification_status': 'Статус',
                'stats.verification_date': 'Дата верификации',
                'stats.verification_type': 'Тип',
                'stats.verification_demo': 'Демо верификация',
                'stats.not_verified': 'Не верифицирован',
                'stats.verified': 'Верифицирован',
                'stats.most_active': 'Самые активные',
                'stats.trending': 'Популярные',
                'stats.by_categories': 'По категориям',
                'stats.posts_per_month': '/мес',
                
                // Loading states
                'loading.channels': 'Загрузка каналов...',
                'loading.transactions': 'Загрузка транзакций...',
                'loading.processing': 'Обработка...',
                'loading.connecting': 'Подключение...',
                'loading.sending': 'Отправка...',
                'loading.verifying': 'Проверка...',
                
                // Empty states
                'empty.no_channels': 'Каналов нет',
                'empty.no_transactions': 'Транзакций пока нет',
                'empty.no_pixels': 'Пикселей нет',
                'empty.no_selection': 'Ничего не выбрано'
            },
            
            en: {
                // Header
                'header.logo': 'NFTG-ZONIX',
                'header.mode.view': 'VIEW',
                'header.mode.buy': 'BUY',
                'header.mode.mass-buy': 'MASS BUY',
                'header.mode.edit': 'EDIT',
                
                // Status bar
                'status.selected': 'SELECTED',
                'status.owned': 'OWNED',
                'status.cost': 'COST',
                
                // Mode tabs
                'mode.view': 'VIEW',
                'mode.buy': 'BUY',
                'mode.mass-buy': 'MASS',
                'mode.edit': 'EDITOR',
                'mode.about': 'ABOUT',
                
                // Buttons
                'button.buy': 'BUY',
                'button.buy.multiple': 'BUY {count} PIXELS',
                'button.buy.single': 'BUY PIXEL',
                'button.buy.mass': 'BUY {count} PIXELS',
                'button.edit': 'EDIT AREA',
                'button.edit.single': 'EDIT PIXEL',
                'button.edit.info': 'EDIT INFO',
                'button.close': 'CLOSE',
                'button.cancel': 'CANCEL',
                'button.confirm': 'CONFIRM',
                'button.save': 'SAVE',
                'button.apply': 'APPLY',
                'button.reset': 'RESET',
                'button.preview': 'PREVIEW',
                'button.upload': 'UPLOAD',
                'button.visit': 'VISIT',
                'button.rate': 'RATE',
                'button.open': 'OPEN',
                'button.connect': 'CONNECT',
                'button.disconnect': 'DISCONNECT',
                'button.verify': 'VERIFY',
                'button.submit': 'SUBMIT',
                'button.website': 'WEBSITE',
                
                // Controls
                'control.zoom.in': 'Zoom In',
                'control.zoom.out': 'Zoom Out',
                'control.center': 'Center',
                'control.drag': 'Drag Mode',
                'control.language': 'Language',
                
                // Menu
                'menu.main': 'MAIN MENU',
                'menu.channels': 'CHANNELS NAVIGATOR',
                'menu.channels.desc': 'Browse and search channels',
                'menu.submit': 'SUBMIT CHANNEL',
                'menu.submit.desc': 'Add channel to search',
                'menu.market': 'MARKET',
                'menu.market.desc': 'Buy and sell pixels',
                'menu.website': 'WEBSITE',
                'menu.website.desc': 'Visit official website',
                'menu.verification': 'VERIFICATION',
                'menu.verification.desc': 'Verify account',
                'menu.stats': 'STATISTICS',
                'menu.stats.desc': 'Analytics and metrics',
                'menu.wallet': 'WALLET',
                'menu.wallet.desc': 'TON wallet for purchases',
                'menu.wallet.connect': 'Connect wallet',
                
                // User status
                'user.verified': 'VERIFIED',
                'user.not_verified': 'NOT VERIFIED',
                'user.pending': 'VERIFYING...',
                'user.failed': 'VERIFICATION FAILED',
                
                // Channels
                'channels.title': 'CHANNELS NAVIGATOR',
                'channels.search': 'Search channels...',
                'channels.categories': 'CATEGORIES',
                'channels.sort': 'SORT',
                'channels.sort.newest': 'NEWEST',
                'channels.sort.rating': 'BY RATING',
                'channels.sort.subscribers': 'BY SUBSCRIBERS',
                'channels.sort.activity': 'BY ACTIVITY',
                'channels.empty': 'No channels found',
                'channels.empty.desc': 'Buy pixels with channels or change filters',
                'channels.my': 'MY',
                'channels.verified': '✓',
                'channels.approved': '📝',
                'channels.no_pixel': 'No pixel',
                'channels.pixel': '#',
                'channels.subscribers': 'subscribers',
                'channels.rating': 'Rate',
                'channels.open': 'Open',
                
                // Categories
                'category.crypto': 'CRYPTO',
                'category.games': 'GAMES',
                'category.news': 'NEWS',
                'category.tech': 'TECH',
                'category.business': 'BUSINESS',
                'category.education': 'EDUCATION',
                'category.sports': 'SPORTS',
                'category.entertainment': 'ENTERTAINMENT',
                'category.demo': 'DEMO',
                'category.general': 'GENERAL',
                
                // Modals
                'modal.purchase.title': 'BUY PIXEL',
                'modal.purchase.price': 'PRICE',
                'modal.purchase.telegram': 'TELEGRAM CHANNEL',
                'modal.purchase.description': 'DESCRIPTION (OPTIONAL)',
                'modal.purchase.description.placeholder': 'Brief channel description',
                'modal.purchase.telegram.placeholder': '@username or https://t.me/username',
                
                'modal.mass_purchase.title': 'MASS PURCHASE',
                'modal.mass_purchase.pixels': 'PIXELS',
                'modal.mass_purchase.total': 'TOTAL PRICE',
                
                'modal.edit.title': 'IMAGE EDITOR',
                'modal.edit.upload': 'UPLOAD',
                'modal.edit.zoom_in': '🔍+',
                'modal.edit.zoom_out': '🔍−',
                'modal.edit.rotate_left': '↺',
                'modal.edit.rotate_right': '↻',
                'modal.edit.reset': '🔄',
                'modal.edit.preview': 'PREVIEW',
                'modal.edit.apply': 'APPLY',
                'modal.edit.upload_image': 'Upload image',
                
                'modal.pixel_info.title': 'PIXEL',
                'modal.pixel_info.owner': 'OWNER',
                'modal.pixel_info.categories': 'CATEGORIES',
                'modal.pixel_info.date': 'DATE',
                'modal.pixel_info.price': 'PRICE',
                'modal.pixel_info.not_specified': 'NOT SPECIFIED',
                'modal.pixel_info.unknown': 'UNKNOWN',
                
                'modal.edit_info.title': 'EDIT PIXEL INFORMATION',
                'modal.edit_info.pixels': 'PIXELS',
                'modal.edit_info.categories': 'CATEGORIES (UP TO 3)',
                'modal.edit_info.selected': 'SELECTED',
                'modal.edit_info.none': 'NONE',
                'modal.edit_info.description': 'DESCRIPTION',
                'modal.edit_info.description.placeholder': 'Channel description',
                'modal.edit_info.chars': 'characters',
                
                'modal.submission.title': 'SUBMIT CHANNEL',
                'modal.submission.subtitle': 'Your channel will appear in search after moderation, even without buying a pixel',
                'modal.submission.telegram': 'TELEGRAM CHANNEL',
                'modal.submission.name': 'CHANNEL NAME',
                'modal.submission.name.placeholder': 'Crypto News Today',
                'modal.submission.categories': 'CATEGORIES (SELECT UP TO 3)',
                'modal.submission.description': 'CHANNEL DESCRIPTION',
                'modal.submission.description.placeholder': 'Briefly describe your channel: topic, audience, posting frequency...',
                'modal.submission.contact': 'OWNER CONTACT (OPTIONAL)',
                'modal.submission.contact.placeholder': '@username for contact',
                'modal.submission.options': 'ADDITIONAL OPTIONS',
                'modal.submission.adult': '18+ CONTENT',
                'modal.submission.paid': 'PAID CONTENT',
                'modal.submission.commercial': 'COMMERCIAL CHANNEL',
                'modal.submission.rules': 'MODERATION RULES',
                'modal.submission.rules.active': 'Active channel (posts in last 30 days)',
                'modal.submission.rules.quality': 'Quality content in English language',
                'modal.submission.rules.category': 'Matches selected category',
                'modal.submission.rules.auto': 'Subscriber count is determined automatically',
                'modal.submission.rules.no_spam': 'Prohibited: spam, NSFW, fraud',
                'modal.submission.rules.no_aggregators': 'Aggregator channels without original content',
                'modal.submission.agree': 'I agree to the rules and confirm that I am the channel owner',
                
                'modal.rating.title': 'RATE CHANNEL',
                'modal.rating.current': 'CURRENT RATING',
                'modal.rating.your': 'YOUR RATING',
                'modal.rating.select': 'SELECT RATING',
                'modal.rating.comment': 'COMMENT (OPTIONAL)',
                'modal.rating.comment.placeholder': 'Share your opinion about the channel...',
                'modal.rating.verification': 'VERIFICATION REQUIRED',
                'modal.rating.verification.desc': 'Verification is required to rate channels',
                'modal.rating.excellent': 'Excellent',
                'modal.rating.good': 'Good',
                'modal.rating.normal': 'Normal',
                'modal.rating.bad': 'Bad',
                'modal.rating.very_bad': 'Very Bad',
                
                'modal.about.title': 'ABOUT PROJECT',
                'modal.about.project': 'NFTG-ZONIX',
                'modal.about.subtitle': 'Interactive Telegram channel discovery platform',
                'modal.about.description': 'is an interactive platform for discovering Telegram channels and visually placing them on a pixel grid. The project combines:',
                'modal.about.catalog': 'Telegram channel catalog by topics, tags and popularity',
                'modal.about.grid': 'Visual NFT grid where each block represents a channel',
                'modal.about.upload': 'Ability to upload an image and attach a link to your channel',
                'modal.about.moderation': 'Moderation mechanisms and protection against prohibited content',
                'modal.about.ton': 'TON integration (TON Connect, NFT, transactions)',
                'modal.about.website': 'Full-featured website with search engine and showcase of all placed channels',
                'modal.about.inspiration': 'The project is inspired by',
                'modal.about.inspiration.text': 'and adapted for the Telegram ecosystem.',
                'modal.about.community': 'is not only advertising, but also a community.',
                
                // Wallet
                'wallet.connected': 'Wallet connected',
                'wallet.not_connected': 'Wallet not connected',
                'wallet.balance': 'Balance',
                'wallet.insufficient': 'Insufficient funds',
                'wallet.connect.desc': 'Connect TON wallet for purchasing pixels',
                'wallet.demo': 'Demo wallet',
                'wallet.real': 'Real wallet',
                'wallet.copy': 'Copy address',
                'wallet.disconnect': 'Disconnect',
                'wallet.connecting': 'Connecting wallet...',
                'wallet.verification': 'Verification',
                'wallet.verification.desc': 'For verification, send 0.01 TON to the verification address. Funds will be returned to your wallet within 24 hours.',
                'wallet.verification.send': 'Send 0.01 TON',
                'wallet.verification.demo': 'Demo verification',
                'wallet.verification.pending': 'Checking transaction',
                'wallet.verification.pending.desc': 'Your transaction is being verified. This may take up to 5 minutes.',
                'wallet.verification.check': 'Check now',
                'wallet.verification.cancel': 'Cancel',
                'wallet.verification.success': 'Verification completed! Funds will be returned within 24 hours.',
                'wallet.verification.demo.success': 'Demo verification completed!',
                
                // Notifications
                'notification.app_ready': 'APPLICATION READY!',
                'notification.drag_on': 'DRAG MODE ENABLED',
                'notification.drag_off': 'DRAG MODE DISABLED',
                'notification.seamless_on': 'SEAMLESS MODE ENABLED',
                'notification.seamless_off': 'SEAMLESS MODE DISABLED',
                'notification.pixel_purchased': 'PIXEL #{id} PURCHASED!',
                'notification.pixels_purchased': 'PURCHASED {count} PIXELS!',
                'notification.image_uploaded': 'IMAGE UPLOADED!',
                'notification.image_applied': 'IMAGE PRECISELY APPLIED TO {count} PIXELS!',
                'notification.info_updated': 'INFORMATION UPDATED FOR {count} PIXELS!',
                'notification.channel_submitted': 'APPLICATION FOR CHANNEL "{name}" SUBMITTED FOR MODERATION!',
                'notification.channel_rated': 'CHANNEL {channel} RATED {rating} STARS!',
                'notification.wallet_connected': 'WALLET CONNECTED!',
                'notification.wallet_disconnected': 'WALLET DISCONNECTED',
                'notification.demo_wallet_connected': 'DEMO WALLET CONNECTED!',
                'notification.verification_started': 'DEMO VERIFICATION STARTED...',
                'notification.verification_completed': 'VERIFICATION COMPLETED!',
                'notification.verification_cancelled': 'VERIFICATION CANCELLED',
                'notification.verification_reset': 'VERIFICATION RESET',
                'notification.address_copied': 'ADDRESS COPIED',
                'notification.website_opening': 'OPENING OFFICIAL WEBSITE',
                'notification.channel_opening': 'OPENING CHANNEL',
                'notification.data_exported': 'DATA EXPORTED',
                'notification.data_cleared': 'ALL DATA CLEARED',
                'notification.transform_reset': 'TRANSFORM RESET',
                'notification.preview_ready': 'PREVIEW READY!',
                'notification.max_categories': 'MAXIMUM 3 CATEGORIES',
                'notification.select_image': 'SELECT IMAGE',
                'notification.select_pixels': 'NO PIXELS SELECTED FOR EDITING',
                'notification.own_pixels_only': 'CAN ONLY EDIT YOUR OWN PIXELS',
                'notification.verification_required': 'VERIFICATION REQUIRED TO RATE CHANNELS',
                'notification.connect_wallet': 'CONNECT WALLET FOR PURCHASE',
                'notification.insufficient_funds': 'INSUFFICIENT FUNDS. NEED {needed} TON, AVAILABLE {available} TON',
                'notification.transaction_sent': 'TRANSACTION SENT! {amount} TON',
                'notification.transaction_rejected': 'TRANSACTION REJECTED',
                'notification.verification_transaction_sent': 'VERIFICATION TRANSACTION SENT! {amount} TON',
                'notification.verification_transaction_rejected': 'VERIFICATION TRANSACTION REJECTED',
                'notification.demo_mode_active': 'DEMO WALLET MODE ACTIVATED',
                'notification.processing_demo_payment': 'PROCESSING DEMO PAYMENT...',
                'notification.processing_demo_verification': 'PROCESSING DEMO VERIFICATION...',
                'notification.demo_payment_success': 'DEMO PAYMENT {amount} TON COMPLETED!',
                'notification.demo_verification_success': 'DEMO VERIFICATION {amount} TON COMPLETED!',
                'notification.market_soon': 'MARKET WILL BE AVAILABLE IN THE NEXT UPDATE',
                'notification.transaction_processing': 'SENDING TRANSACTION...',
                'notification.verification_transaction_processing': 'SENDING VERIFICATION TRANSACTION...',
                'notification.checking_verification': 'CHECKING VERIFICATION STATUS...',
                'notification.wallet_error': 'WALLET ERROR',
                'notification.payment_error': 'PAYMENT ERROR',
                'notification.verification_error': 'VERIFICATION ERROR',
                'notification.connection_cancelled': 'CONNECTION CANCELLED',
                'notification.network_error': 'NETWORK PROBLEM',
                'notification.config_error': 'WALLET CONFIGURATION ERROR',
                'notification.ton_connect_unavailable': 'TON CONNECT UNAVAILABLE',
                'notification.wallet_not_available': 'COULD NOT OPEN WALLET',
                'notification.language_changed': 'LANGUAGE CHANGED TO {language}',
                
                // Errors
                'error.form': 'FORM ERROR',
                'error.telegram_link': 'ENTER CORRECT TELEGRAM CHANNEL',
                'error.channel_name': 'ENTER CHANNEL NAME',
                'error.select_categories': 'SELECT AT LEAST ONE CATEGORY',
                'error.channel_description': 'ENTER CHANNEL DESCRIPTION',
                'error.accept_terms': 'MUST AGREE TO TERMS',
                'error.select_rating': 'SELECT RATING FROM 1 TO 5 STARS',
                'error.upload_image': 'UPLOAD IMAGE',
                'error.unknown': 'AN ERROR OCCURRED',
                'error.app_init': 'APPLICATION STARTUP ERROR',
                'error.init': 'APPLICATION INITIALIZATION ERROR',
                'error.channel_link_unavailable': 'CHANNEL LINK UNAVAILABLE',
                
                // Tooltips
                'tooltip.pixel': 'Pixel #{id}',
                'tooltip.pixel_available': 'Pixel #{id} - Available for purchase',
                'tooltip.pixel_owned': 'Pixel #{id}\nOwner: {owner}\nCategory: {category}',
                
                // Pixel info
                'pixel.owner': 'Owner',
                'pixel.category': 'Category',
                'pixel.categories': 'Categories',
                'pixel.date': 'Date',
                'pixel.price': 'Price',
                'pixel.not_specified': 'Not specified',
                'pixel.unknown_date': 'Unknown',
                'pixel.unknown_owner': '@unknown',
                
                // Time formats
                'time.today': 'Today',
                'time.yesterday': 'Yesterday',
                'time.days_ago': '{count} days ago',
                'time.just_now': 'Just now',
                'time.minutes_ago': '{count} minutes ago',
                'time.hours_ago': '{count} hours ago',
                
                // Stats
                'stats.total_channels': 'Total channels',
                'stats.pixel_channels': 'With pixels',
                'stats.approved_channels': 'Approved applications',
                'stats.owned_channels': 'Your channels',
                'stats.avg_subscribers': 'Average subscribers',
                'stats.avg_rating': 'Average rating',
                'stats.verification_status': 'Status',
                'stats.verification_date': 'Verification date',
                'stats.verification_type': 'Type',
                'stats.verification_demo': 'Demo verification',
                'stats.not_verified': 'Not verified',
                'stats.verified': 'Verified',
                'stats.most_active': 'Most active',
                'stats.trending': 'Trending',
                'stats.by_categories': 'By categories',
                'stats.posts_per_month': '/month',
                
                // Loading states
                'loading.channels': 'Loading channels...',
                'loading.transactions': 'Loading transactions...',
                'loading.processing': 'Processing...',
                'loading.connecting': 'Connecting...',
                'loading.sending': 'Sending...',
                'loading.verifying': 'Verifying...',
                
                // Empty states
                'empty.no_channels': 'No channels',
                'empty.no_transactions': 'No transactions yet',
                'empty.no_pixels': 'No pixels',
                'empty.no_selection': 'Nothing selected'
            }
        };
        
        // Загружаем сохраненный язык
        this.loadLanguage();
    }
    
    loadLanguage() {
        const saved = localStorage.getItem('nftg-language');
        if (saved && this.translations[saved]) {
            this.currentLanguage = saved;
        }
    }
    
    saveLanguage() {
        localStorage.setItem('nftg-language', this.currentLanguage);
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.saveLanguage();
            this.updateAllTexts();
            
            // Уведомление о смене языка
            const langNames = { ru: 'Русский', en: 'English' };
            if (window.MiniUtils) {
                window.MiniUtils.showNotification(
                    this.t('notification.language_changed', { language: langNames[lang] }),
                    'success'
                );
            }
            
            console.log(`Language changed to: ${lang}`);
        }
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
    
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || key;
        
        // Заменяем параметры в строке
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        });
    }
    
    updateAllTexts() {
        // Обновляем все текстовые элементы на странице
        this.updateElement('mode-display', this.getCurrentModeText());
        this.updateStatusBar();
        this.updateModeTabs();
        this.updateControls();
        this.updateMenu();
        this.updateModals();
        this.updateChannelSidebar();
        this.updateTooltips();
        
        // Обновляем специфические элементы
        this.updatePixelTooltips();
        this.updateActionButtons();
        
        console.log('All texts updated for language:', this.currentLanguage);
    }
    
    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element && text) {
            element.textContent = text;
        }
    }
    
    updateStatusBar() {
        // Обновляем статус-бар
        const statusLabels = {
            'selected-count': this.t('status.selected'),
            'owned-count': this.t('status.owned'),
            'cost-display': this.t('status.cost')
        };
        
        Object.entries(statusLabels).forEach(([id, label]) => {
            const element = document.getElementById(id);
            if (element) {
                const parentLabel = element.parentElement?.querySelector('.status-label');
                if (parentLabel) {
                    parentLabel.textContent = label + ':';
                }
            }
        });
    }
    
    updateModeTabs() {
        // Обновляем кнопки режимов
        const modeButtons = [
            { id: 'view-mode', key: 'mode.view' },
            { id: 'buy-mode', key: 'mode.buy' },
            { id: 'mass-buy-mode', key: 'mode.mass-buy' },
            { id: 'edit-mode', key: 'mode.edit' },
            { id: 'about-mode', key: 'mode.about' }
        ];
        
        modeButtons.forEach(({ id, key }) => {
            const button = document.getElementById(id);
            if (button) {
                const label = button.querySelector('.mode-label');
                if (label) {
                    label.textContent = this.t(key);
                }
            }
        });
    }
    
    updateControls() {
        // Обновляем контролы
        const controls = [
            { id: 'zoom-in', key: 'control.zoom.in' },
            { id: 'zoom-out', key: 'control.zoom.out' },
            { id: 'center', key: 'control.center' },
            { id: 'drag-mode-btn', key: 'control.drag' },
            { id: 'language-btn', key: 'control.language' }
        ];
        
        controls.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element) {
                element.title = this.t(key);
            }
        });
    }
    
    updateMenu() {
        // Обновляем главное меню
        const menuItems = [
            { id: 'channels-navigator-btn', titleKey: 'menu.channels', descKey: 'menu.channels.desc' },
            { id: 'submit-channel-btn', titleKey: 'menu.submit', descKey: 'menu.submit.desc' },
            { id: 'market-btn', titleKey: 'menu.market', descKey: 'menu.market.desc' },
            { id: 'website-btn', titleKey: 'menu.website', descKey: 'menu.website.desc' },
            { id: 'verification-btn', titleKey: 'menu.verification', descKey: 'menu.verification.desc' },
            { id: 'stats-btn', titleKey: 'menu.stats', descKey: 'menu.stats.desc' }
        ];
        
        menuItems.forEach(({ id, titleKey, descKey }) => {
            const button = document.getElementById(id);
            if (button) {
                const title = button.querySelector('.menu-title');
                const desc = button.querySelector('.menu-subtitle');
                
                if (title) title.textContent = this.t(titleKey);
                if (desc) desc.textContent = this.t(descKey);
            }
        });
        
        // Обновляем кошелек
        const walletTitle = document.getElementById('wallet-title');
        const walletSubtitle = document.getElementById('wallet-subtitle');
        
        if (walletTitle && !window.miniWallet?.isConnected) {
            walletTitle.textContent = this.t('menu.wallet.connect');
        }
        if (walletSubtitle && !window.miniWallet?.isConnected) {
            walletSubtitle.textContent = this.t('menu.wallet.desc');
        }
    }
    
    updateModals() {
        // Обновляем About Modal content
        this.updateAboutModal();
        
        // Обновляем другие модальные окна
        this.updatePurchaseModals();
        this.updateChannelModals();
        this.updateEditorModal();
    }

    updateAboutModal() {
        // Update About Modal title
        const aboutModalTitle = document.querySelector('#about-modal h3');
        if (aboutModalTitle) {
            aboutModalTitle.textContent = this.t('modal.about.title');
        }
        
        // Update project title and subtitle
        const projectTitle = document.querySelector('.project-title');
        if (projectTitle) {
            projectTitle.textContent = this.t('modal.about.project');
        }
        
        const projectSubtitle = document.querySelector('.project-subtitle');
        if (projectSubtitle) {
            projectSubtitle.textContent = this.t('modal.about.subtitle');
        }
        
        // Update main description
        const aboutDescription = document.querySelector('.about-description p');
        if (aboutDescription) {
            aboutDescription.innerHTML = `<strong>${this.t('modal.about.project')}</strong> — ${this.t('modal.about.description')}`;
        }
        
        // Update feature items
        const featureItems = document.querySelectorAll('.feature-item');
        const featureKeys = [
            'modal.about.catalog',
            'modal.about.grid', 
            'modal.about.upload',
            'modal.about.moderation',
            'modal.about.ton',
            'modal.about.website'
        ];
        
        featureItems.forEach((item, index) => {
            const featureText = item.querySelector('.feature-text');
            if (featureText && featureKeys[index]) {
                featureText.textContent = this.t(featureKeys[index]);
            }
        });
        
        // Update inspiration section
        const inspirationSection = document.querySelector('.inspiration-section');
        if (inspirationSection) {
            const paragraphs = inspirationSection.querySelectorAll('p');
            if (paragraphs.length >= 2) {
                paragraphs[0].innerHTML = `${this.t('modal.about.inspiration')} <strong>Million Dollar Homepage</strong> ${this.t('modal.about.inspiration.text')}`;
                paragraphs[1].innerHTML = `<strong>${this.t('modal.about.project')}</strong> ${this.t('modal.about.community')}`;
            }
        }
        
        // Update modal action buttons
        const websiteButton = document.getElementById('visit-website-about');
        if (websiteButton) {
            websiteButton.textContent = `🌐 ${this.t('button.website')}`;
        }
        
        const closeButton = document.getElementById('close-about');
        if (closeButton) {
            closeButton.textContent = `❌ ${this.t('button.close')}`;
        }
    }

    updatePurchaseModals() {
        // Update Purchase Modal
        const purchaseTitle = document.querySelector('#purchase-modal h3');
        if (purchaseTitle) {
            const pixelId = document.getElementById('purchase-pixel-id')?.textContent || '0';
            purchaseTitle.innerHTML = `💰 ${this.t('modal.purchase.title')} #<span id="purchase-pixel-id">${pixelId}</span>`;
        }
        
        // Update form labels
        const telegramLabel = document.querySelector('#purchase-modal label[for="telegram-link"]');
        if (telegramLabel) {
            telegramLabel.textContent = `🔗 ${this.t('modal.purchase.telegram')}:`;
        }
        
        const descLabel = document.querySelector('#purchase-modal label[for="pixel-description"]');
        if (descLabel) {
            descLabel.textContent = `📝 ${this.t('modal.purchase.description')}:`;
        }
        
        // Update placeholders
        const telegramInput = document.getElementById('telegram-link');
        if (telegramInput) {
            telegramInput.placeholder = this.t('modal.purchase.telegram.placeholder');
        }
        
        const descInput = document.getElementById('pixel-description');
        if (descInput) {
            descInput.placeholder = this.t('modal.purchase.description.placeholder');
        }
        
        // Update buttons
        const confirmPurchase = document.getElementById('confirm-purchase');
        if (confirmPurchase) {
            confirmPurchase.textContent = `💰 ${this.t('button.buy')}`;
        }
        
        const cancelPurchase = document.getElementById('cancel-purchase');
        if (cancelPurchase) {
            cancelPurchase.textContent = `❌ ${this.t('button.cancel')}`;
        }
        
        // Update Mass Purchase Modal
        const massPurchaseTitle = document.querySelector('#mass-purchase-modal h3');
        if (massPurchaseTitle) {
            massPurchaseTitle.textContent = `🛒 ${this.t('modal.mass_purchase.title')}`;
        }
        
        // Update mass purchase labels
        const massPixelsLabel = document.querySelector('#mass-purchase-modal p:first-of-type');
        if (massPixelsLabel) {
            const count = document.getElementById('mass-count')?.textContent || '0';
            massPixelsLabel.innerHTML = `${this.t('modal.mass_purchase.pixels')}: <span id="mass-count">${count}</span>`;
        }
        
        const massTotalLabel = document.querySelector('#mass-purchase-modal p:nth-of-type(2)');
        if (massTotalLabel) {
            const total = document.getElementById('mass-total')?.textContent || '0';
            massTotalLabel.innerHTML = `${this.t('modal.mass_purchase.total')}: <span id="mass-total">${total}</span> TON`;
        }

        // Update mass purchase form labels
        const massTelegramLabel = document.querySelector('#mass-purchase-modal label[for="mass-telegram-link"]');
        if (massTelegramLabel) {
            massTelegramLabel.textContent = `🔗 ${this.t('modal.purchase.telegram')}:`;
        }
        
        const massDescLabel = document.querySelector('#mass-purchase-modal label[for="mass-pixel-description"]');
        if (massDescLabel) {
            massDescLabel.textContent = `📝 ${this.t('modal.purchase.description')}:`;
        }

        // Update mass purchase placeholders
        const massTelegramInput = document.getElementById('mass-telegram-link');
        if (massTelegramInput) {
            massTelegramInput.placeholder = this.t('modal.purchase.telegram.placeholder');
        }
        
        const massDescInput = document.getElementById('mass-pixel-description');
        if (massDescInput) {
            massDescInput.placeholder = this.t('modal.purchase.description.placeholder');
        }

        // Update mass purchase buttons
        const confirmMassPurchase = document.getElementById('confirm-mass-purchase');
        if (confirmMassPurchase) {
            confirmMassPurchase.textContent = `🛒 ${this.t('button.buy')} ${this.t('mode.mass-buy')}`;
        }
        
        const cancelMassPurchase = document.getElementById('cancel-mass-purchase');
        if (cancelMassPurchase) {
            cancelMassPurchase.textContent = `❌ ${this.t('button.cancel')}`;
        }
    }

    updateChannelModals() {
        // Update Channel Submission Modal
        const submissionTitle = document.querySelector('#channel-submission-modal h3');
        if (submissionTitle) {
            submissionTitle.textContent = `📝 ${this.t('modal.submission.title')}`;
        }

        // Update subtitle
        const submissionSubtitle = document.querySelector('#channel-submission-modal p');
        if (submissionSubtitle && submissionSubtitle.textContent.includes('модерации')) {
            submissionSubtitle.textContent = this.t('modal.submission.subtitle');
        }
        
        // Update channel submission labels
        const submissionLabels = [
            { selector: 'label[for="submission-telegram-link"]', key: 'modal.submission.telegram' },
            { selector: 'label[for="submission-channel-name"]', key: 'modal.submission.name' },
            { selector: 'label[for="submission-categories"]', key: 'modal.submission.categories' },
            { selector: 'label[for="submission-description"]', key: 'modal.submission.description' },
            { selector: 'label[for="submission-owner-contact"]', key: 'modal.submission.contact' }
        ];
        
        submissionLabels.forEach(({ selector, key }) => {
            const label = document.querySelector(`#channel-submission-modal ${selector}`);
            if (label) {
                const isRequired = !key.includes('contact');
                label.textContent = this.t(key) + (isRequired ? ' *' : '');
            }
        });
        
        // Update placeholders
        const submissionInputs = [
            { id: 'submission-telegram-link', key: 'modal.purchase.telegram.placeholder' },
            { id: 'submission-channel-name', key: 'modal.submission.name.placeholder' },
            { id: 'submission-description', key: 'modal.submission.description.placeholder' },
            { id: 'submission-owner-contact', key: 'modal.submission.contact.placeholder' }
        ];
        
        submissionInputs.forEach(({ id, key }) => {
            const input = document.getElementById(id);
            if (input) {
                input.placeholder = this.t(key);
            }
        });

        // Update rules section
        const rulesTitle = document.querySelector('#channel-submission-modal .terms-section h4');
        if (rulesTitle) {
            rulesTitle.textContent = `📋 ${this.t('modal.submission.rules')}:`;
        }

        // Update rules list
        const rulesList = document.querySelector('#channel-submission-modal .rules-list');
        if (rulesList) {
            const rulesKeys = [
                'modal.submission.rules.active',
                'modal.submission.rules.quality',
                'modal.submission.rules.category',
                'modal.submission.rules.auto',
                'modal.submission.rules.no_spam',
                'modal.submission.rules.no_aggregators'
            ];
            
            const rulesItems = rulesList.querySelectorAll('li');
            rulesItems.forEach((item, index) => {
                if (rulesKeys[index]) {
                    const icon = item.textContent.includes('✅') ? '✅ ' : '❌ ';
                    item.textContent = icon + this.t(rulesKeys[index]);
                }
            });
        }

        // Update terms checkbox
        const termsCheckboxLabel = document.querySelector('#channel-submission-modal .terms-checkbox .checkbox-label');
        if (termsCheckboxLabel) {
            termsCheckboxLabel.textContent = this.t('modal.submission.agree');
        }
        
        // Update submission buttons
        const submitButton = document.getElementById('submit-channel-application');
        if (submitButton) {
            submitButton.textContent = `📤 ${this.t('button.submit')}`;
        }
        
        const cancelSubmission = document.getElementById('cancel-channel-submission');
        if (cancelSubmission) {
            cancelSubmission.textContent = `❌ ${this.t('button.cancel')}`;
        }

        // Update Rating Modal
        const ratingTitle = document.querySelector('#channel-rating-modal h3');
        if (ratingTitle) {
            ratingTitle.textContent = `⭐ ${this.t('modal.rating.title')}`;
        }

        // Update rating labels
        const currentRatingLabel = document.querySelector('#channel-rating-modal .current-rating');
        if (currentRatingLabel && currentRatingLabel.textContent.includes('ТЕКУЩИЙ') || currentRatingLabel?.textContent.includes('CURRENT')) {
            const ratingValue = currentRatingLabel.querySelector('.rating-value')?.textContent || '0';
            currentRatingLabel.innerHTML = `${this.t('modal.rating.current')}: <span class="rating-value">${ratingValue}</span> ⭐`;
        }

        const yourRatingLabel = document.querySelector('#channel-rating-modal .rating-label');
        if (yourRatingLabel) {
            yourRatingLabel.textContent = `${this.t('modal.rating.your')}:`;
        }

        const ratingText = document.getElementById('rating-text');
        if (ratingText && (ratingText.textContent.includes('ВЫБЕРИТЕ') || ratingText.textContent.includes('SELECT'))) {
            ratingText.textContent = this.t('modal.rating.select');
        }

        // Update rating comment placeholder
        const ratingComment = document.getElementById('rating-comment');
        if (ratingComment) {
            ratingComment.placeholder = this.t('modal.rating.comment.placeholder');
        }

        // Update rating comment label
        const ratingCommentLabel = document.querySelector('#channel-rating-modal label[for="rating-comment"]');
        if (ratingCommentLabel) {
            ratingCommentLabel.textContent = `💬 ${this.t('modal.rating.comment')}:`;
        }

        // Update verification notice
        const verificationNoticeTitle = document.querySelector('#channel-rating-modal .notice-title');
        if (verificationNoticeTitle) {
            verificationNoticeTitle.textContent = this.t('modal.rating.verification');
        }

        const verificationNoticeDesc = document.querySelector('#channel-rating-modal .notice-subtitle');
        if (verificationNoticeDesc) {
            verificationNoticeDesc.textContent = this.t('modal.rating.verification.desc');
        }

        // Update rating buttons
        const submitRating = document.getElementById('submit-rating');
        if (submitRating) {
            submitRating.textContent = `⭐ ${this.t('button.rate')}`;
        }

        const verifyAccount = document.getElementById('verify-account');
        if (verifyAccount) {
            verifyAccount.textContent = `✅ ${this.t('button.verify')}`;
        }

        const cancelRating = document.getElementById('cancel-rating');
        if (cancelRating) {
            cancelRating.textContent = `❌ ${this.t('button.cancel')}`;
        }
    }

    updateEditorModal() {
        // Update Editor Modal
        const editorTitle = document.querySelector('#editor-modal h3');
        if (editorTitle) {
            editorTitle.textContent = `🎨 ${this.t('modal.edit.title')}`;
        }

        // Update editor buttons
        const editorButtons = [
            { selector: '.editor-controls button[onclick*="image-input"]', key: 'modal.edit.upload', icon: '📁' },
            { id: 'zoom-in-editor', key: 'modal.edit.zoom_in' },
            { id: 'zoom-out-editor', key: 'modal.edit.zoom_out' },
            { id: 'rotate-left', key: 'modal.edit.rotate_left' },
            { id: 'rotate-right', key: 'modal.edit.rotate_right' },
            { id: 'reset-editor', key: 'modal.edit.reset' },
            { id: 'preview-editor', key: 'modal.edit.preview', icon: '👁️' },
            { id: 'apply-editor', key: 'modal.edit.apply', icon: '✅' },
            { id: 'close-editor', key: 'button.close', icon: '❌' }
        ];

        editorButtons.forEach(({ id, selector, key, icon }) => {
            const button = id ? document.getElementById(id) : document.querySelector(selector);
            if (button) {
                const text = this.t(key);
                button.textContent = icon ? `${icon} ${text}` : text;
            }
        });

        // Update upload message
        const uploadMessage = document.querySelector('#editor-modal .canvas-container');
        if (uploadMessage && uploadMessage.textContent.includes('Загрузите') || uploadMessage?.textContent.includes('Upload')) {
            // This will be updated when canvas is drawn
        }

        // Update Pixel Info Edit Modal
        const pixelInfoEditTitle = document.querySelector('#pixel-info-edit-modal h3');
        if (pixelInfoEditTitle) {
            const pixelCount = document.getElementById('edit-pixel-count')?.textContent || '0';
            pixelInfoEditTitle.innerHTML = `📝 ${this.t('modal.edit_info.title')} <span id="edit-pixel-count">${pixelCount}</span>`;
        }

        // Update pixel info edit labels
        const editInfoLabels = [
            { selector: 'label[for="edit-categories"]', key: 'modal.edit_info.categories' },
            { selector: 'label[for="edit-telegram-link"]', key: 'modal.purchase.telegram' },
            { selector: 'label[for="edit-description"]', key: 'modal.edit_info.description' }
        ];

        editInfoLabels.forEach(({ selector, key }) => {
            const label = document.querySelector(`#pixel-info-edit-modal ${selector}`);
            if (label) {
                const icon = label.textContent.match(/^[^\s]+/)?.[0] || '';
                label.textContent = `${icon} ${this.t(key)}:`;
            }
        });

        // Update selected categories display
        const selectedCategoriesText = document.getElementById('selected-categories-text');
        if (selectedCategoriesText && (selectedCategoriesText.textContent === 'НЕТ' || selectedCategoriesText.textContent === 'NONE')) {
            selectedCategoriesText.textContent = this.t('modal.edit_info.none');
        }

        const selectedCategoriesLabel = document.querySelector('#pixel-info-edit-modal .selected-categories');
        if (selectedCategoriesLabel) {
            const textSpan = selectedCategoriesLabel.querySelector('#selected-categories-text');
            if (textSpan) {
                selectedCategoriesLabel.innerHTML = `${this.t('modal.edit_info.selected')}: <span id="selected-categories-text">${textSpan.textContent}</span>`;
            }
        }

        // Update character counter
        const charCounter = document.querySelector('#pixel-info-edit-modal .char-counter');
        if (charCounter) {
            const chars = document.getElementById('edit-description-chars')?.textContent || '0';
            charCounter.innerHTML = `<span id="edit-description-chars">${chars}</span>/200 ${this.t('modal.edit_info.chars')}`;
        }

        // Update pixel info edit buttons
        const savePixelInfo = document.getElementById('save-pixel-info');
        if (savePixelInfo) {
            savePixelInfo.textContent = `💾 ${this.t('button.save')}`;
        }

        const cancelPixelInfoEdit = document.getElementById('cancel-pixel-info-edit');
        if (cancelPixelInfoEdit) {
            cancelPixelInfoEdit.textContent = `❌ ${this.t('button.cancel')}`;
        }

        // Update Pixel Info Modal
        const pixelInfoTitle = document.querySelector('#pixel-info-modal h3');
        if (pixelInfoTitle) {
            const pixelId = document.getElementById('info-pixel-id')?.textContent || '0';
            pixelInfoTitle.innerHTML = `ℹ️ ${this.t('modal.pixel_info.title')} #<span id="info-pixel-id">${pixelId}</span>`;
        }

        // Update pixel info labels
        const pixelInfoLabels = [
            { selector: '.info-row:nth-child(1) .info-label', key: 'modal.pixel_info.owner' },
            { selector: '.info-row:nth-child(2) .info-label', key: 'modal.pixel_info.categories' },
            { selector: '.info-row:nth-child(3) .info-label', key: 'modal.pixel_info.date' },
            { selector: '.info-row:nth-child(4) .info-label', key: 'modal.pixel_info.price' }
        ];

        pixelInfoLabels.forEach(({ selector, key }) => {
            const label = document.querySelector(`#pixel-info-modal ${selector}`);
            if (label) {
                const icon = label.textContent.match(/^[^\s]+/)?.[0] || '';
                label.textContent = `${icon} ${this.t(key)}:`;
            }
        });

        // Update pixel info buttons
        const visitChannel = document.getElementById('visit-channel');
        if (visitChannel) {
            visitChannel.textContent = `🔗 ${this.t('button.visit')}`;
        }

        const closePixelInfo = document.getElementById('close-pixel-info');
        if (closePixelInfo) {
            closePixelInfo.textContent = `❌ ${this.t('button.close')}`;
        }
    }
    
    updateChannelSidebar() {
        // Обновляем сайдбар каналов
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = this.t('channels.search');
        }

        // Update sidebar title
        const sidebarTitle = document.querySelector('#channel-sidebar .sidebar-header h3');
        if (sidebarTitle) {
            sidebarTitle.textContent = `📺 ${this.t('channels.title')}`;
        }
        
        // Обновляем категории
        const categoryTags = document.querySelectorAll('#category-filters .filter-tag');
        categoryTags.forEach(tag => {
            const category = tag.dataset.category;
            if (category) {
                const icon = tag.textContent.match(/^[^\s]+/)?.[0] || '';
                tag.textContent = icon + ' ' + this.t('category.' + category.toLowerCase());
            }
        });
        
        // Обновляем сортировку
        const sortOptions = document.querySelectorAll('#sort-select option');
        const sortKeys = ['newest', 'rating', 'subscribers', 'activity'];
        sortOptions.forEach((option, index) => {
            if (sortKeys[index]) {
                const icon = option.textContent.match(/^[^\s]+/)?.[0] || '';
                option.textContent = icon + ' ' + this.t('channels.sort.' + sortKeys[index]);
            }
        });

        // Update filter labels
        const filterLabels = document.querySelectorAll('#channel-sidebar .filter-group label');
        filterLabels.forEach(label => {
            if (label.textContent.includes('КАТЕГОРИИ') || label.textContent.includes('CATEGORIES')) {
                label.textContent = this.t('channels.categories') + ':';
            } else if (label.textContent.includes('СОРТИРОВКА') || label.textContent.includes('SORT')) {
                label.textContent = this.t('channels.sort') + ':';
            }
        });
    }
    
    updateTooltips() {
        // Обновляем тултипы пикселей
        if (window.miniGrid) {
            window.miniGrid.updatePixelDisplay();
        }
    }
    
    updatePixelTooltips() {
        // Обновляем тултипы всех пикселей
        document.querySelectorAll('.pixel').forEach(pixel => {
            const pixelId = parseInt(pixel.dataset.id);
            const pixelData = window.miniGrid?.pixels.get(pixelId);
            
            if (pixelData) {
                pixel.title = this.t('tooltip.pixel_owned', {
                    id: pixelId,
                    owner: pixelData.owner,
                    category: pixelData.category || this.t('pixel.not_specified')
                });
            } else {
                pixel.title = this.t('tooltip.pixel_available', { id: pixelId });
            }
        });
    }
    
    updateActionButtons() {
        // Обновляем кнопки действий
        const actionButton = document.getElementById('action-button');
        if (actionButton && window.miniApp) {
            const mode = window.miniApp.getCurrentMode();
            const selectedCount = window.miniApp.getSelectedPixels().length;
            
            let buttonText = this.t('button.buy');
            
            switch (mode) {
                case 'buy':
                    buttonText = selectedCount > 1 ? 
                        this.t('button.buy.multiple', { count: selectedCount }) :
                        this.t('button.buy.single');
                    break;
                case 'mass-buy':
                    buttonText = this.t('button.buy.mass', { count: selectedCount });
                    break;
                case 'edit':
                    buttonText = selectedCount > 1 ? 
                        this.t('button.edit') :
                        this.t('button.edit.single');
                    break;
            }
            
            actionButton.textContent = buttonText;
        }
    }
    
    getCurrentModeText() {
        if (window.miniApp) {
            const mode = window.miniApp.getCurrentMode();
            return this.t('header.mode.' + mode);
        }
        return this.t('header.mode.view');
    }
    
    formatCurrency(amount, currency = 'TON') {
        return `${amount} ${currency}`;
    }
    
    formatCount(count) {
        return count.toString();
    }
    
    formatDate(dateString) {
        if (!dateString) return this.t('pixel.unknown_date');
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = now - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return this.t('time.today');
            } else if (diffDays === 1) {
                return this.t('time.yesterday');
            } else if (diffDays < 7) {
                return this.t('time.days_ago', { count: diffDays });
            } else {
                // Для более старых дат возвращаем обычный формат
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}.${month}.${year}`;
            }
        } catch (error) {
            return this.t('pixel.unknown_date');
        }
    }
    
    getCategoryIcon(category) {
        const icons = {
            'crypto': '💰',
            'games': '🎮',
            'news': '📰',
            'tech': '💻',
            'business': '💼',
            'education': '📚',
            'sports': '⚽',
            'entertainment': '🎬',
            'demo': '🧪',
            'general': '📁'
        };
        return icons[category.toLowerCase()] || '📁';
    }
    
    getCategoryName(category) {
        return this.t('category.' + category.toLowerCase());
    }
    
    // Методы для обновления конкретных элементов
    updateModalTitle(modalId, titleKey) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const title = modal.querySelector('h3');
            if (title) {
                title.textContent = this.t(titleKey);
            }
        }
    }
    
    updateModalContent(modalId, contentMap) {
        const modal = document.getElementById(modalId);
        if (modal) {
            Object.entries(contentMap).forEach(([elementId, translationKey]) => {
                const element = document.getElementById(elementId);
                if (element) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = this.t(translationKey);
                    } else {
                        element.textContent = this.t(translationKey);
                    }
                }
            });
        }
    }
    
    // Специальные методы для различных компонентов
    updateChannelCard(channelData) {
        return {
            name: channelData.name,
            description: channelData.description,
            category: this.getCategoryName(channelData.category),
            subscribers: this.formatCount(channelData.subscribers) + ' ' + this.t('channels.subscribers'),
            myLabel: this.t('channels.my'),
            noPixelLabel: this.t('channels.no_pixel'),
            rateLabel: this.t('channels.rating'),
            openLabel: this.t('channels.open')
        };
    }
    
    updateWalletInfo(walletData) {
        return {
            connected: this.t('wallet.connected'),
            notConnected: this.t('wallet.not_connected'),
            balance: this.t('wallet.balance'),
            demo: this.t('wallet.demo'),
            copy: this.t('wallet.copy'),
            disconnect: this.t('wallet.disconnect')
        };
    }
    
    // Метод для получения переводов категорий
    getCategoryTranslations() {
        return {
            'Крипта': this.t('category.crypto'),
            'Игры': this.t('category.games'),
            'Новости': this.t('category.news'),
            'Технологии': this.t('category.tech'),
            'Бизнес': this.t('category.business'),
            'Образование': this.t('category.education'),
            'Спорт': this.t('category.sports'),
            'Развлечения': this.t('category.entertainment'),
            'Демо': this.t('category.demo'),
            'Общее': this.t('category.general')
        };
    }
    
    // Метод для получения текстов уведомлений
    getNotificationText(key, params = {}) {
        return this.t('notification.' + key, params);
    }
    
    // Метод для получения текстов ошибок
    getErrorText(key, params = {}) {
        return this.t('error.' + key, params);
    }
    
    // Метод для получения текстов кнопок
    getButtonText(key, params = {}) {
        return this.t('button.' + key, params);
    }
    
    // Дебаг информация
    getDebugInfo() {
        return {
            currentLanguage: this.currentLanguage,
            availableLanguages: this.getAvailableLanguages(),
            translationsCount: {
                ru: Object.keys(this.translations.ru).length,
                en: Object.keys(this.translations.en).length
            }
        };
    }
}

// Создаем глобальный экземпляр
window.MiniI18n = new MiniI18n();

// Экспортируем для использования в других модулях
window.t = (key, params) => window.MiniI18n.t(key, params);

console.log('✅ MiniI18n system initialized with language:', window.MiniI18n.getCurrentLanguage());