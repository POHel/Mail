class VisionMailApp {
    constructor() {
        this.currentPage = 'login';
        this.user = null;
        this.emails = [];
        this.contacts = [];
        
        this.init();
    }
    
    init() {
        // Проверяем авторизацию
        this.checkAuth();
        
        // Инициализируем компоненты
        this.initComponents();
        
        // Загружаем данные
        this.loadInitialData();
        
        // Настраиваем маршрутизацию
        this.initRouting();
        
        // Настройка Service Worker (PWA)
        this.initServiceWorker();
    }
    
    checkAuth() {
        const token = localStorage.getItem('auth_token');
        const currentPage = window.location.pathname.split('/').pop() || '';
        const isFileProtocol = window.location.protocol === 'file:';
        
        console.log('Auth check:', {
            token: !!token,
            currentPage,
            isFileProtocol,
            fullPath: window.location.pathname
        });
        
        // Если нет токена и мы НЕ на странице входа
        if (!token && currentPage !== 'index.html' && currentPage !== '') {
            console.log('Not authenticated, redirecting to login');
            // Используем относительный путь для file://
            window.location.href = 'index.html';
            return false;
        }
        
        // Если есть токен и мы на странице входа
        if (token && (currentPage === 'index.html' || currentPage === '')) {
            console.log('Already authenticated, redirecting to inbox');
            window.location.href = 'inbox.html';
            return true;
        }
        
        return !!token;
    }
    
    initComponents() {
        // Инициализация формы входа
        this.initLoginForm();
        
        // Инициализация навигации
        this.initNavigation();
        
        // Инициализация поиска
        this.initSearch();
        
        // Инициализация компоновщика писем
        this.initComposer();
        
        // Инициализация настроек
        this.initSettings();

        this.initLogoutHandler();
    }

    initLogoutHandler() {
        const logoutButton = document.getElementById('logoutButton');
        
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                this.handleLogout();
            });
        }
    }
    
    // Добавьте этот метод для обработки выхода:
    async handleLogout() {
        if (!confirm('Вы уверены, что хотите выйти?')) {
            return;
        }
        
        try {
            console.log('Starting logout process...');
            
            // 1. Сохраняем тему
            const currentTheme = localStorage.getItem('theme') || 'dark';
            const currentAccent = localStorage.getItem('accent') || '#8a2be2';
            
            // 2. Удаляем только auth данные
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('remember_email');
            
            // 3. Восстанавливаем тему
            localStorage.setItem('theme', currentTheme);
            localStorage.setItem('accent', currentAccent);
            
            // 4. Очищаем sessionStorage
            sessionStorage.clear();
            
            // 5. Принудительно устанавливаем флаг выхода
            sessionStorage.setItem('logging_out', 'true');
            
            console.log('Auth data cleared, redirecting...');
            
            // 6. Даем время на очистку
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 7. Абсолютная принудительная переадресация
            // Для file:// протокола используем относительный путь
            const loginUrl = window.location.protocol === 'file:' 
                ? 'index.html' 
                : window.location.origin + '/index.html';
                
            console.log('Redirecting to:', loginUrl);
            
            // Используем replace чтобы не сохранять в истории
            window.location.replace(loginUrl);
            
            // Дублирующий вызов для надежности
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 50);
            
        } catch (error) {
            console.error('Logout failed:', error);
            // Даже если ошибка, пытаемся перенаправить
            window.location.href = 'index.html';
        }
    }
    
    // Метод для анимации выхода:
    async playLogoutAnimation() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.style.transform = 'scale(0.9)';
            logoutButton.style.opacity = '0.7';
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            await this.handleLogin(email, password, rememberMe);
        });
        
        // Переключение видимости пароля
        const toggleBtn = document.querySelector('.password-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                
                // Анимация иконки
                toggleBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    toggleBtn.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }
    
    async handleLogin(email, password, rememberMe) {
        try {
            // Показываем индикатор загрузки
            window.animationsManager?.showLoading();
            
            // Имитация API запроса
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // В реальном приложении здесь был бы запрос к серверу
            const mockUser = {
                id: 'user_001',
                email: email,
                name: email.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=${ThemeManager.getCurrentAccent()}&color=fff`,
                settings: {
                    theme: ThemeManager.getCurrentTheme(),
                    accent: ThemeManager.getCurrentAccent(),
                    notifications: true
                }
            };
            
            // Сохраняем токен (в реальном приложении с сервера)
            localStorage.setItem('auth_token', 'mock_jwt_token');
            localStorage.setItem('user_data', JSON.stringify(mockUser));
            
            if (rememberMe) {
                localStorage.setItem('remember_email', email);
            }
            
            // Анимация успешного входа
            await this.playLoginSuccess();
            
            // Перенаправляем в почту
            window.location.href = 'inbox.html';
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Ошибка входа. Проверьте данные.', 'error');
        } finally {
            window.animationsManager?.hideLoading();
        }
    }
    
    async playLoginSuccess() {
        const button = document.getElementById('loginButton');
        if (!button) return;
        
        button.disabled = true;
        button.querySelector('.button-progress').style.width = '100%';
        
        // Анимация успеха
        button.style.background = 'linear-gradient(135deg, var(--success-color), #00cc66)';
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    initNavigation() {
        // Инициализация боковой панели
        this.initSidebar();
        
        // Инициализация панели инструментов
        this.initToolbar();
        
        // Инициализация хлебных крошек
        //this.initBreadcrumbs();
    }
    
    initSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        const toggleBtn = sidebar.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                
                // Анимация переключения
                this.animateSidebarToggle(sidebar);
            });
        }
        
        // Инициализация активного пункта меню
        this.setActiveNavItem();
    }
    
    animateSidebarToggle(sidebar) {
        const isCollapsing = sidebar.classList.contains('collapsed');
        
        if (isCollapsing) {
            // Анимация сворачивания
            sidebar.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                sidebar.style.transform = 'translateX(0)';
            }, 10);
        } else {
            // Анимация разворачивания
            sidebar.style.transform = 'translateX(0)';
        }
    }
    
    setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop();
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
                
                // Анимация активного состояния
                const indicator = item.querySelector('.nav-indicator');
                if (indicator) {
                    indicator.style.width = '4px';
                    indicator.style.opacity = '1';
                }
            }
        });
    }
    
    initToolbar() {
        const toolbar = document.querySelector('.toolbar');
        if (!toolbar) return;
        
        // Кнопка написания письма
        const composeBtn = toolbar.querySelector('.compose-button');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                window.location.href = 'compose.html';
            });
        }
        
        // Кнопки действий с письмами
        const actionButtons = toolbar.querySelectorAll('.action-button');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleEmailAction(e.target.dataset.action);
            });
        });
    }
    
    async handleEmailAction(action) {
        const selectedEmails = this.getSelectedEmails();
        
        if (selectedEmails.length === 0) {
            this.showNotification('Выберите письма для выполнения действия', 'warning');
            return;
        }
        
        switch (action) {
            case 'archive':
                await this.archiveEmails(selectedEmails);
                break;
            case 'delete':
                await this.deleteEmails(selectedEmails);
                break;
            case 'mark-read':
                await this.markEmailsAsRead(selectedEmails);
                break;
            case 'mark-unread':
                await this.markEmailsAsUnread(selectedEmails);
                break;
        }
    }
    
    initSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        // Анимация фокуса
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', () => {
            if (!searchInput.value) {
                searchInput.parentElement.classList.remove('focused');
            }
        });
    }
    
    async performSearch(query) {
        if (query.length < 2) {
            this.clearSearchResults();
            return;
        }
        
        try {
            // Показываем индикатор загрузки
            const searchResults = document.querySelector('.search-results');
            if (searchResults) {
                searchResults.classList.add('loading');
            }
            
            // Имитация поиска
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Фильтрация писем
            const results = this.emails.filter(email => 
                email.subject.toLowerCase().includes(query.toLowerCase()) ||
                email.from.toLowerCase().includes(query.toLowerCase()) ||
                email.body.toLowerCase().includes(query.toLowerCase())
            );
            
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Ошибка поиска', 'error');
        } finally {
            const searchResults = document.querySelector('.search-results');
            if (searchResults) {
                searchResults.classList.remove('loading');
            }
        }
    }
    
    displaySearchResults(results, query) {
        const container = document.querySelector('.search-results');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>По запросу "${query}" ничего не найдено</p>
                </div>
            `;
            return;
        }
        
        results.forEach(result => {
            const element = this.createEmailElement(result, true);
            container.appendChild(element);
        });
    }
    
    initComposer() {
        const form = document.querySelector('.compose-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendEmail();
        });
        
        // Редактор текста
        this.initTextEditor();
        
        // Вложения
        this.initAttachments();
    }
    
    initTextEditor() {
        const editor = document.querySelector('.email-editor');
        if (!editor) return;
        
        // Простой редактор с форматированием
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.innerHTML = `
            <button type="button" data-command="bold" title="Жирный">B</button>
            <button type="button" data-command="italic" title="Курсив">I</button>
            <button type="button" data-command="underline" title="Подчеркнутый">U</button>
            <button type="button" data-command="insertLink" title="Ссылка">🔗</button>
            <button type="button" data-command="insertImage" title="Изображение">🖼️</button>
        `;
        
        editor.parentElement.insertBefore(toolbar, editor);
        
        // Обработчики команд
        toolbar.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.execEditorCommand(btn.dataset.command);
            });
        });
    }
    
    execEditorCommand(command) {
        document.execCommand(command, false, null);
    }
    
    initAttachments() {
        const dropZone = document.querySelector('.attachments-dropzone');
        if (!dropZone) return;
        
        const fileInput = dropZone.querySelector('input[type="file"]');
        
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }
    
    async handleFileUpload(files) {
        const container = document.querySelector('.attachments-list');
        if (!container) return;
        
        for (let file of files) {
            // Проверка размера (макс 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showNotification(`Файл ${file.name} слишком большой (макс. 10MB)`, 'error');
                continue;
            }
            
            // Создаем элемент вложения
            const attachment = this.createAttachmentElement(file);
            container.appendChild(attachment);
            
            // Имитация загрузки
            await this.simulateUpload(file, attachment);
        }
    }
    
    createAttachmentElement(file) {
        const element = document.createElement('div');
        element.className = 'attachment-item';
        element.innerHTML = `
            <div class="attachment-icon">
                ${this.getFileIcon(file.type)}
            </div>
            <div class="attachment-info">
                <div class="attachment-name">${file.name}</div>
                <div class="attachment-size">${this.formatFileSize(file.size)}</div>
            </div>
            <div class="attachment-progress">
                <div class="progress-bar"></div>
            </div>
            <button class="attachment-remove" type="button">×</button>
        `;
        
        // Кнопка удаления
        element.querySelector('.attachment-remove').addEventListener('click', () => {
            element.remove();
        });
        
        return element;
    }
    
    async simulateUpload(file, element) {
        const progressBar = element.querySelector('.progress-bar');
        
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            progressBar.style.width = `${i}%`;
            
            if (i === 100) {
                element.classList.add('uploaded');
                progressBar.style.display = 'none';
            }
        }
    }
    
    async sendEmail() {
        const form = document.querySelector('.compose-form');
        if (!form) return;
        
        const to = form.querySelector('#to').value;
        const subject = form.querySelector('#subject').value;
        const body = form.querySelector('#body').innerHTML;
        
        if (!to || !subject || !body) {
            this.showNotification('Заполните все обязательные поля', 'warning');
            return;
        }
        
        try {
            // Показываем индикатор отправки
            const sendButton = form.querySelector('.send-button');
            const originalText = sendButton.innerHTML;
            sendButton.innerHTML = '<span class="sending-spinner"></span> Отправка...';
            sendButton.disabled = true;
            
            // Имитация отправки
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Анимация успешной отправки
            sendButton.innerHTML = '<span class="send-success">✓</span> Отправлено!';
            sendButton.style.background = 'linear-gradient(135deg, var(--success-color), #00cc66)';
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Возврат на предыдущую страницу
            window.history.back();
            
        } catch (error) {
            console.error('Send error:', error);
            this.showNotification('Ошибка отправки письма', 'error');
            
            const sendButton = form.querySelector('.send-button');
            sendButton.innerHTML = originalText;
            sendButton.disabled = false;
        }
    }
    
    initSettings() {
        // Переключение настроек
        const toggles = document.querySelectorAll('.settings-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.saveSetting(e.target.name, e.target.checked);
            });
        });
        
        // Слайдеры
        const sliders = document.querySelectorAll('.settings-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                const output = e.target.nextElementSibling;
                if (output) {
                    output.textContent = value;
                }
                this.saveSetting(e.target.name, value);
            });
        });
    }
    
    saveSetting(key, value) {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        if (!userData.settings) {
            userData.settings = {};
        }
        userData.settings[key] = value;
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Применяем настройки в реальном времени
        this.applySetting(key, value);
    }
    
    applySetting(key, value) {
        switch (key) {
            case 'theme':
                window.themeManager?.applyTheme(value);
                break;
            case 'accent':
                window.themeManager?.applyAccent(value);
                break;
            case 'notifications':
                // В реальном приложении здесь была бы настройка уведомлений
                break;
        }
    }
    
    initRouting() {
        // Обработка кликов по ссылкам
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                this.navigateTo(link.href);
            }
        });
        
    }
    
    async navigateTo(url) {
        // Анимация перехода
        await this.playPageTransition();
        
        // Переход на страницу
        window.location.href = url;
    }
    
    async playPageTransition() {
        // Создаем overlay для анимации перехода
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--neon-primary);
            z-index: 9998;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        document.body.appendChild(overlay);
        
        // Запускаем анимацию
        await new Promise(resolve => setTimeout(resolve, 10));
        overlay.style.transform = 'scaleX(1)';
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    initServiceWorker() {
        // Проверяем, что работаем по HTTPS или localhost (не file://)
        const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        
        if ('serviceWorker' in navigator && 
            (window.location.protocol === 'https:' || isLocalhost)) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
            });
        }
    }
    
    loadInitialData() {
        // Загрузка писем
        this.loadEmails();
        
        // Загрузка контактов
        this.loadContacts();
        
        // Загрузка настроек пользователя
        this.loadUserSettings();
    }
    
    async loadEmails() {
        try {
            // Имитация загрузки
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock данные
            this.emails = [
                {
                    id: '1',
                    from: 'support@vision.com',
                    to: 'user@example.com',
                    subject: 'Добро пожаловать в Vision Mail',
                    body: 'Мы рады приветствовать вас в нашем футуристическом почтовом клиенте...',
                    date: '2024-01-15T10:30:00',
                    read: false,
                    starred: true,
                    attachments: 0,
                    labels: ['welcome', 'important']
                },
                // ... больше писем
            ];
            
            this.renderEmails();
            
        } catch (error) {
            console.error('Failed to load emails:', error);
            this.showNotification('Не удалось загрузить письма', 'error');
        }
    }
    
    renderEmails() {
        const container = document.querySelector('.emails-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.emails.forEach(email => {
            const element = this.createEmailElement(email);
            container.appendChild(element);
        });
    }
    
    createEmailElement(email, isSearchResult = false) {
        const element = document.createElement('div');
        element.className = `email-item ${email.read ? 'read' : 'unread'} ${isSearchResult ? 'search-result' : ''}`;
        element.dataset.id = email.id;
        
        element.innerHTML = `
            <div class="email-checkbox">
                <input type="checkbox" id="email-${email.id}">
                <label for="email-${email.id}" class="checkbox-custom"></label>
            </div>
            <div class="email-star ${email.starred ? 'starred' : ''}">
                <button class="star-button" data-id="${email.id}">
                    ${email.starred ? '★' : '☆'}
                </button>
            </div>
            <div class="email-sender">
                <div class="sender-avatar" style="background-color: var(--neon-primary)">
                    ${email.from.charAt(0).toUpperCase()}
                </div>
                <span class="sender-name">${email.from}</span>
            </div>
            <div class="email-content">
                <div class="email-subject">
                    ${email.subject}
                    ${email.labels.map(label => `<span class="email-label">${label}</span>`).join('')}
                </div>
                <div class="email-preview">${email.body.substring(0, 100)}...</div>
            </div>
            <div class="email-meta">
                <div class="email-date">${this.formatDate(email.date)}</div>
                ${email.attachments > 0 ? `<div class="email-attachments">📎 ${email.attachments}</div>` : ''}
            </div>
            <div class="email-actions">
                <button class="email-action" data-action="archive" title="Архивировать">📁</button>
                <button class="email-action" data-action="delete" title="Удалить">🗑️</button>
            </div>
        `;
        
        // Обработчики событий
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.email-checkbox, .email-star, .email-actions')) {
                this.openEmail(email.id);
            }
        });
        
        // Звездочка
        const starBtn = element.querySelector('.star-button');
        starBtn.addEventListener('click', () => {
            this.toggleStar(email.id);
        });
        
        // Действия
        element.querySelectorAll('.email-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEmailAction(btn.dataset.action, [email.id]);
            });
        });
        
        return element;
    }
    
    async loadContacts() {
        // Загрузка контактов
    }
    
    loadUserSettings() {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        if (userData.settings) {
            // Применяем настройки
            Object.entries(userData.settings).forEach(([key, value]) => {
                this.applySetting(key, value);
            });
        }
    }
    
    // Вспомогательные методы
    getSelectedEmails() {
        const checkboxes = document.querySelectorAll('.email-checkbox input:checked');
        return Array.from(checkboxes).map(cb => cb.id.replace('email-', ''));
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) { // 24 часа
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // 7 дней
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString();
        }
    }
    
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
    
    getFileIcon(mimeType) {
        const icons = {
            'image/': '🖼️',
            'video/': '🎬',
            'audio/': '🎵',
            'application/pdf': '📄',
            'application/zip': '📦',
            'text/': '📝',
            'default': '📎'
        };
        
        for (const [key, icon] of Object.entries(icons)) {
            if (mimeType.startsWith(key)) {
                return icon;
            }
        }
        
        return icons.default;
    }
    
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(type)}</div>
            <div class="notification-content">${message}</div>
            <button class="notification-close">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
        
        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || icons.info;
    }
    
    // Методы для работы с письмами
    async openEmail(id) {
        window.location.href = `message.html?id=${id}`;
    }
    
    async toggleStar(id) {
        const email = this.emails.find(e => e.id === id);
        if (email) {
            email.starred = !email.starred;
            
            // Обновляем UI
            const starBtn = document.querySelector(`.star-button[data-id="${id}"]`);
            if (starBtn) {
                starBtn.textContent = email.starred ? '★' : '☆';
                starBtn.parentElement.classList.toggle('starred', email.starred);
                
                // Анимация
                starBtn.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    starBtn.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }
    
    async archiveEmails(ids) {
        // Имитация архивации
        await new Promise(resolve => setTimeout(resolve, 500));
        this.showNotification(`Архивировано писем: ${ids.length}`, 'success');
        
        // Удаляем из списка
        this.emails = this.emails.filter(email => !ids.includes(email.id));
        this.renderEmails();
    }
    
    async deleteEmails(ids) {
        // Подтверждение
        if (!confirm(`Удалить ${ids.length} писем?`)) return;
        
        // Имитация удаления
        await new Promise(resolve => setTimeout(resolve, 500));
        this.showNotification(`Удалено писем: ${ids.length}`, 'success');
        
        // Удаляем из списка
        this.emails = this.emails.filter(email => !ids.includes(email.id));
        this.renderEmails();
    }
    
    async markEmailsAsRead(ids) {
        this.emails.forEach(email => {
            if (ids.includes(email.id)) {
                email.read = true;
            }
        });
        
        this.renderEmails();
        this.showNotification(`Отмечено как прочитанное: ${ids.length}`, 'info');
    }
    
    async markEmailsAsUnread(ids) {
        this.emails.forEach(email => {
            if (ids.includes(email.id)) {
                email.read = false;
            }
        });
        
        this.renderEmails();
        this.showNotification(`Отмечено как непрочитанное: ${ids.length}`, 'info');
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VisionMailApp();
});

