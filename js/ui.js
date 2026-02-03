class UIManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.initNotifications();
        this.initDropdowns();
        this.initModals();
        this.initTooltips();
        this.initContextMenus();
        this.initKeyboardShortcuts();
    }
    
    initNotifications() {
        const notificationsBtn = document.getElementById('notificationsButton');
        const notificationsPanel = document.getElementById('notificationsPanel');
        
        if (!notificationsBtn || !notificationsPanel) return;
        
        // Переключение панели уведомлений
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsPanel.classList.toggle('show');
            notificationsBtn.classList.toggle('active');
        });
        
        // Закрытие при клике вне панели
        document.addEventListener('click', (e) => {
            if (!notificationsPanel.contains(e.target) && e.target !== notificationsBtn) {
                notificationsPanel.classList.remove('show');
                notificationsBtn.classList.remove('active');
            }
        });
        
        // Закрытие панели
        const closeBtn = notificationsPanel.querySelector('.notifications-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notificationsPanel.classList.remove('show');
                notificationsBtn.classList.remove('active');
            });
        }
        
        // Отметить все как прочитанные
        const markAllReadBtn = notificationsPanel.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                const unreadItems = notificationsPanel.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                
                // Обновить счетчик
                const badge = notificationsBtn.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = '0';
                    badge.style.display = 'none';
                }
                
                // Показать подтверждение
                this.showToast('Все уведомления отмечены как прочитанные');
            });
        }
        
        // Обработка кликов по уведомлениям
        const notificationItems = notificationsPanel.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('unread')) {
                    item.classList.remove('unread');
                    
                    // Обновить счетчик
                    const unreadCount = notificationsPanel.querySelectorAll('.notification-item.unread').length;
                    const badge = notificationsBtn.querySelector('.notification-badge');
                    if (badge) {
                        badge.textContent = unreadCount;
                        if (unreadCount === 0) {
                            badge.style.display = 'none';
                        }
                    }
                }
                
                // В реальном приложении здесь была бы навигация
                console.log('Notification clicked:', item.querySelector('.notification-title')?.textContent);
            });
        });
    }
    
    initDropdowns() {
        // User dropdown
        const userAvatarBtn = document.querySelector('.user-avatar-button');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userAvatarBtn && userDropdown) {
            userAvatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Закрытие при клике вне dropdown
            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target) && e.target !== userAvatarBtn) {
                    userDropdown.classList.remove('show');
                }
            });
        }
        
        // Action dropdowns
        document.querySelectorAll('.action-dropdown').forEach(dropdown => {
            const button = dropdown.querySelector('.action-button');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (button && menu) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.toggle('show');
                });
                
                // Закрытие при клике вне меню
                document.addEventListener('click', (e) => {
                    if (!menu.contains(e.target) && e.target !== button) {
                        menu.classList.remove('show');
                    }
                });
            }
        });
        
        // Обработка элементов dropdown
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleDropdownAction(action, item);
            });
        });
    }
    
    handleDropdownAction(action, element) {
        switch (action) {
            case 'logout':
                this.handleLogout();
                break;
            case 'mark-read':
                this.handleMarkAsRead();
                break;
            case 'mark-unread':
                this.handleMarkAsUnread();
                break;
            case 'archive':
                this.handleArchive();
                break;
            case 'delete':
                this.handleDelete();
                break;
            default:
                console.log('Dropdown action:', action);
        }
    }
    
    async handleLogout() {
        const confirmed = await this.showConfirmation(
            'Выход из системы',
            'Вы уверены, что хотите выйти?'
        );
        
        if (confirmed) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            window.location.href = 'index.html';
        }
    }
    
    async handleMarkAsRead() {
        const selectedEmails = window.app?.getSelectedEmails() || [];
        
        if (selectedEmails.length === 0) {
            this.showToast('Выберите письма для отметки');
            return;
        }
        
        await window.app?.markEmailsAsRead(selectedEmails);
        this.showToast(`Отмечено как прочитанное: ${selectedEmails.length}`);
    }
    
    async handleMarkAsUnread() {
        const selectedEmails = window.app?.getSelectedEmails() || [];
        
        if (selectedEmails.length === 0) {
            this.showToast('Выберите письма для отметки');
            return;
        }
        
        await window.app?.markEmailsAsUnread(selectedEmails);
        this.showToast(`Отмечено как непрочитанное: ${selectedEmails.length}`);
    }
    
    async handleArchive() {
        const selectedEmails = window.app?.getSelectedEmails() || [];
        
        if (selectedEmails.length === 0) {
            this.showToast('Выберите письма для архивации');
            return;
        }
        
        const confirmed = await this.showConfirmation(
            'Архивация писем',
            `Архивировать ${selectedEmails.length} писем?`
        );
        
        if (confirmed) {
            await window.app?.archiveEmails(selectedEmails);
            this.showToast(`Архивировано: ${selectedEmails.length}`);
        }
    }
    
    async handleDelete() {
        const selectedEmails = window.app?.getSelectedEmails() || [];
        
        if (selectedEmails.length === 0) {
            this.showToast('Выберите письма для удаления');
            return;
        }
        
        const confirmed = await this.showConfirmation(
            'Удаление писем',
            `Удалить ${selectedEmails.length} писем? Это действие нельзя отменить.`
        );
        
        if (confirmed) {
            await window.app?.deleteEmails(selectedEmails);
            this.showToast(`Удалено: ${selectedEmails.length}`);
        }
    }
    
    initModals() {
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close, .modal-button.cancel').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal-overlay');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Закрытие при клике на overlay
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Закрытие при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay.active');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('title');
            element.removeAttribute('title');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            element.addEventListener('mouseenter', (e) => {
                const rect = element.getBoundingClientRect();
                
                tooltip.style.cssText = `
                    position: fixed;
                    top: ${rect.top - 40}px;
                    left: ${rect.left + rect.width / 2}px;
                    transform: translateX(-50%);
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s;
                `;
                
                document.body.appendChild(tooltip);
                
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 10);
            });
            
            element.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            });
        });
    }
    
    initContextMenus() {
        // Контекстное меню для писем
        document.addEventListener('contextmenu', (e) => {
            const emailItem = e.target.closest('.email-item');
            if (emailItem) {
                e.preventDefault();
                this.showEmailContextMenu(e, emailItem);
            }
            
            const editor = e.target.closest('[contenteditable="true"]');
            if (editor) {
                e.preventDefault();
                this.showEditorContextMenu(e, editor);
            }
        });
        
        // Закрытие контекстных меню при клике
        document.addEventListener('click', () => {
            this.closeAllContextMenus();
        });
    }
    
    showEmailContextMenu(e, emailItem) {
        this.closeAllContextMenus();
        
        const emailId = emailItem.dataset.id;
        const isRead = emailItem.classList.contains('read');
        const isStarred = emailItem.querySelector('.starred');
        
        const menu = document.createElement('div');
        menu.className = 'context-menu glass-panel';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            min-width: 200px;
            z-index: 1000;
        `;
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="open">
                <svg viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                Открыть
            </div>
            <div class="context-menu-item" data-action="${isStarred ? 'unstar' : 'star'}">
                <svg viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                ${isStarred ? 'Убрать из избранного' : 'В избранное'}
            </div>
            <div class="context-menu-item" data-action="${isRead ? 'mark-unread' : 'mark-read'}">
                <svg viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                ${isRead ? 'Отметить как непрочитанное' : 'Отметить как прочитанное'}
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="reply">
                <svg viewBox="0 0 24 24">
                    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                </svg>
                Ответить
            </div>
            <div class="context-menu-item" data-action="forward">
                <svg viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
                Переслать
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="archive">
                <svg viewBox="0 0 24 24">
                    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                </svg>
                Архивировать
            </div>
            <div class="context-menu-item text-danger" data-action="delete">
                <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Удалить
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Обработка выбора пунктов меню
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', async () => {
                const action = item.dataset.action;
                await this.handleEmailContextAction(action, emailId, emailItem);
                menu.remove();
            });
        });
        
        // Закрытие при клике вне меню
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        });
    }
    
    async handleEmailContextAction(action, emailId, emailItem) {
        switch (action) {
            case 'open':
                window.location.href = `message.html?id=${emailId}`;
                break;
            case 'star':
            case 'unstar':
                await window.app?.toggleStar(emailId);
                break;
            case 'mark-read':
                await window.app?.markEmailsAsRead([emailId]);
                break;
            case 'mark-unread':
                await window.app?.markEmailsAsUnread([emailId]);
                break;
            case 'reply':
                window.location.href = `compose.html?reply=${emailId}`;
                break;
            case 'forward':
                window.location.href = `compose.html?forward=${emailId}`;
                break;
            case 'archive':
                await window.app?.archiveEmails([emailId]);
                break;
            case 'delete':
                const confirmed = await this.showConfirmation(
                    'Удаление письма',
                    'Удалить это письмо?'
                );
                if (confirmed) {
                    await window.app?.deleteEmails([emailId]);
                }
                break;
        }
    }
    
    showEditorContextMenu(e, editor) {
        // Контекстное меню для редактора
        this.closeAllContextMenus();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu glass-panel';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            min-width: 180px;
            z-index: 1000;
        `;
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="cut">
                <svg viewBox="0 0 24 24">
                    <path d="M19 3l-6 6 6 6V3zM3 21h14v-2H3v2zM5 7v2h10V7H5z"/>
                </svg>
                Вырезать
            </div>
            <div class="context-menu-item" data-action="copy">
                <svg viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Копировать
            </div>
            <div class="context-menu-item" data-action="paste">
                <svg viewBox="0 0 24 24">
                    <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>
                </svg>
                Вставить
            </div>
            <div class="context-divider"></div>
            <div class="context-menu-item" data-action="select-all">
                <svg viewBox="0 0 24 24">
                    <path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"/>
                </svg>
                Выделить все
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Обработка выбора пунктов меню
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                document.execCommand(action);
                menu.remove();
                editor.focus();
            });
        });
        
        // Закрытие при клике вне меню
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        });
    }
    
    closeAllContextMenus() {
        document.querySelectorAll('.context-menu').forEach(menu => {
            menu.remove();
        });
    }
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter - отправить письмо
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const sendButton = document.querySelector('.send-button');
                if (sendButton && !sendButton.disabled) {
                    sendButton.click();
                }
            }
            
            // Ctrl/Cmd + N - новое письмо
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                if (!e.target.matches('input, textarea, [contenteditable="true"]')) {
                    window.location.href = 'compose.html';
                    e.preventDefault();
                }
            }
            
            // Ctrl/Cmd + R - ответить
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                const replyButton = document.querySelector('.reply-button');
                if (replyButton) {
                    replyButton.click();
                }
            }
            
            // Escape - закрыть модальные окна, dropdowns
            if (e.key === 'Escape') {
                this.closeAllContextMenus();
                
                // Закрытие dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                
                // Закрытие панели уведомлений
                const notificationsPanel = document.getElementById('notificationsPanel');
                if (notificationsPanel) {
                    notificationsPanel.classList.remove('show');
                }
            }
        });
    }
    
    // Вспомогательные методы
    async showConfirmation(title, message) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'confirmation-modal';
            
            modal.innerHTML = `
                <div class="modal-overlay active">
                    <div class="modal-container glass-panel">
                        <div class="modal-header">
                            <h3>${title}</h3>
                        </div>
                        <div class="modal-content">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button class="modal-button cancel">Отмена</button>
                            <button class="modal-button confirm">Подтвердить</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const confirmBtn = modal.querySelector('.confirm');
            const cancelBtn = modal.querySelector('.cancel');
            const overlay = modal.querySelector('.modal-overlay');
            
            const cleanup = () => {
                modal.remove();
                document.body.style.overflow = '';
            };
            
            confirmBtn.addEventListener('click', () => {
                resolve(true);
                cleanup();
            });
            
            cancelBtn.addEventListener('click', () => {
                resolve(false);
                cleanup();
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    resolve(false);
                    cleanup();
                }
            });
        });
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: var(--glass-border);
            border-radius: var(--border-radius-md);
            padding: 12px 24px;
            color: var(--text-primary);
            z-index: 1000;
            animation: toast-slide 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fade-out 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Инициализация UI менеджера
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
    
    // Добавление CSS для компонентов
    const style = document.createElement('style');
    style.textContent = `
        .context-menu {
            animation: context-menu 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .context-menu-item {
            padding: 10px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .context-menu-item:hover {
            background-color: rgba(var(--neon-primary-rgb), 0.1);
        }
        
        .context-menu-item svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
        }
        
        .context-divider {
            height: 1px;
            background-color: var(--border-color);
            margin: 4px 0;
        }
        
        .text-danger {
            color: var(--error-color);
        }
        
        .toast-slide {
            animation: notification-slide 0.3s ease;
        }
        
        .confirmation-modal .modal-container {
            max-width: 400px;
        }
        
        .dropdown-menu {
            animation: context-menu 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .notifications-panel {
            position: fixed;
            top: 70px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            overflow-y: auto;
            display: none;
        }
        
        .notifications-panel.show {
            display: block;
            animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .notification-item {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .notification-item:hover {
            background-color: rgba(var(--neon-primary-rgb), 0.05);
        }
        
        .notification-item.unread {
            background-color: rgba(var(--neon-primary-rgb), 0.1);
        }
        
        .notification-item.unread:hover {
            background-color: rgba(var(--neon-primary-rgb), 0.15);
        }
        
        .user-dropdown {
            position: absolute;
            top: 60px;
            right: 20px;
            width: 280px;
            display: none;
        }
        
        .user-dropdown.show {
            display: block;
            animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .action-dropdown .dropdown-menu {
            position: absolute;
            top: 45px;
            right: 0;
            min-width: 200px;
            display: none;
        }
        
        .action-dropdown .dropdown-menu.show {
            display: block;
        }
    `;
    document.head.appendChild(style);
});

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Добавляем эту строку
            
            console.log('Logout button clicked'); // Для отладки
            
            // Удаляем все данные авторизации
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // Очищаем все куки
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // Используем replace вместо href, чтобы не сохранять в истории
            window.location.replace('../mail/index.html');
            
            return false;
        }, true); // Используем capture phase
    }
});