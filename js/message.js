// js/message.js - Функциональность страницы просмотра письма
document.addEventListener('DOMContentLoaded', function() {
    // Получаем ID письма из URL
    const urlParams = new URLSearchParams(window.location.search);
    const emailId = urlParams.get('id') || 'demo';
    
    let currentEmail = null;
    
    // Инициализация
    function init() {
        loadEmail();
        initReplyForm();
        initActions();
        initAttachments();
        initSimilarEmails();
        initTooltips();
        initPrint();
    }
    
    // Загрузка письма
    function loadEmail() {
        // Попробуем загрузить из localStorage или использовать демо-данные
        const allEmails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        const sentEmails = JSON.parse(localStorage.getItem('vision_sent_emails') || '[]');
        
        const email = allEmails.find(e => e.id == emailId) || 
                     sentEmails.find(e => e.id == emailId) ||
                     getDemoEmail();
        
        currentEmail = email;
        renderEmail(email);
        
        // Отмечаем как прочитанное
        if (emailId !== 'demo' && !email.read) {
            markAsRead(emailId);
        }
    }
    
    function getDemoEmail() {
        return {
            id: 'demo',
            from: 'Vision Team',
            fromEmail: 'support@vision.com',
            to: 'Алексей Иванов <alex@vision.com>',
            subject: 'Добро пожаловать в Vision Mail: Футуристический почтовый клиент будущего',
            body: document.querySelector('.message-content-body').innerHTML,
            date: new Date().toISOString(),
            important: true,
            tags: ['важное', 'работа'],
            attachments: [
                { name: 'welcome_guide.pdf', size: '2.4 MB', type: 'application/pdf' },
                { name: 'vision_interface.png', size: '1.8 MB', type: 'image/png' },
                { name: 'features_overview.xlsx', size: '1.0 MB', type: 'application/vnd.ms-excel' }
            ],
            read: true
        };
    }
    
    function markAsRead(id) {
        let emails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        const index = emails.findIndex(e => e.id == id);
        if (index !== -1) {
            emails[index].read = true;
            localStorage.setItem('vision_inbox_emails', JSON.stringify(emails));
            
            // Обновляем счетчик непрочитанных в сайдбаре
            updateUnreadCount();
        }
    }
    
    function updateUnreadCount() {
        const emails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        const unreadCount = emails.filter(e => !e.read).length;
        
        // Обновляем бейдж в сайдбаре
        const badge = document.querySelector('.unread-count');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }
    
    function renderEmail(email) {
        // Заголовок
        document.querySelector('.message-subject').textContent = email.subject;
        document.querySelector('.sender-name').textContent = email.from;
        document.querySelector('.sender-email').textContent = email.fromEmail;
        
        // Дата
        const date = new Date(email.date);
        const dateStr = formatDate(date);
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        document.querySelector('.message-date').textContent = dateStr;
        document.querySelector('.message-time').textContent = timeStr;
        
        // Получатели
        document.querySelector('.recipient-item .recipient-email').textContent = email.to;
        
        // Теги
        const tagsContainer = document.querySelector('.message-tags');
        tagsContainer.innerHTML = '';
        
        if (email.important) {
            const tag = document.createElement('span');
            tag.className = 'message-tag important';
            tag.textContent = 'Важное';
            tagsContainer.appendChild(tag);
        }
        
        if (email.tags && email.tags.includes('работа')) {
            const tag = document.createElement('span');
            tag.className = 'message-tag work';
            tag.textContent = 'Работа';
            tagsContainer.appendChild(tag);
        }
        
        // Тело письма
        const bodyContainer = document.querySelector('.message-content-body');
        if (email.body) {
            bodyContainer.innerHTML = email.body;
        }
        
        // Вложения
        if (email.attachments && email.attachments.length > 0) {
            renderAttachments(email.attachments);
        } else {
            document.querySelector('.message-attachments-section').style.display = 'none';
        }
        
        // Информация о письме
        updateEmailInfo(email);
    }
    
    function formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }
    
    // Форма ответа
    function initReplyForm() {
        const editor = document.querySelector('.reply-editor');
        const sendButton = document.querySelector('.reply-button.send');
        const cancelButton = document.querySelector('.reply-button.cancel');
        
        // Кнопка отправки
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const replyText = editor.textContent.trim();
            if (!replyText) {
                showNotification('Введите текст ответа', 'error');
                return;
            }
            
            // Создаем ответное письмо
            const reply = {
                id: Date.now(),
                to: currentEmail.fromEmail,
                subject: `Re: ${currentEmail.subject}`,
                body: `<p>${replyText.replace(/\n/g, '<br>')}</p>`,
                date: new Date().toISOString(),
                inReplyTo: currentEmail.id
            };
            
            // Сохраняем
            saveReply(reply);
            
            // Анимация отправки
            this.classList.add('send-animation');
            showNotification('Ответ отправлен', 'success');
            
            // Очистка формы
            setTimeout(() => {
                editor.innerHTML = '';
                this.classList.remove('send-animation');
            }, 600);
        });
        
        // Кнопка отмены
        cancelButton.addEventListener('click', function() {
            editor.innerHTML = '';
            showNotification('Ответ отменен', 'info');
        });
        
        // Кнопки форматирования
        document.querySelectorAll('.reply-form-action').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.dataset.action;
                
                if (action === 'attach') {
                    // Симуляция прикрепления файла
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.style.display = 'none';
                    input.addEventListener('change', function() {
                        if (this.files.length > 0) {
                            showNotification(`Файл ${this.files[0].name} прикреплен`, 'success');
                        }
                    });
                    document.body.appendChild(input);
                    input.click();
                    setTimeout(() => input.remove(), 100);
                }
            });
        });
    }
    
    function saveReply(reply) {
        let sentEmails = JSON.parse(localStorage.getItem('vision_sent_emails') || '[]');
        sentEmails.unshift(reply);
        localStorage.setItem('vision_sent_emails', JSON.stringify(sentEmails.slice(0, 100)));
    }
    
    // Действия с письмом
    function initActions() {
        // Ответить
        document.querySelector('[data-action="reply"]').addEventListener('click', function() {
            document.querySelector('.reply-editor').focus();
            document.querySelector('.reply-editor').innerHTML = `<p>${currentEmail.from}, </p><p><br></p>`;
        });
        
        // Ответить всем
        document.querySelector('[data-action="reply-all"]').addEventListener('click', function() {
            document.querySelector('.reply-editor').focus();
            document.querySelector('.reply-editor').innerHTML = `<p>${currentEmail.from}, </p><p><br></p>`;
            showNotification('Ответ будет отправлен всем получателям', 'info');
        });
        
        // Переслать
        document.querySelector('[data-action="forward"]').addEventListener('click', function() {
            window.location.href = `compose.html?forward=${currentEmail.id}`;
        });
        
        // Архивировать
        document.querySelector('[data-action="archive"]').addEventListener('click', function() {
            archiveEmail(currentEmail.id);
        });
        
        // Удалить
        document.querySelector('[data-action="delete"]').addEventListener('click', function() {
            if (confirm('Удалить это письмо?')) {
                deleteEmail(currentEmail.id);
            }
        });
        
        // Пометить как спам
        document.querySelector('[data-action="spam"]').addEventListener('click', function() {
            markAsSpam(currentEmail.id);
        });
        
        // Пометить как непрочитанное
        document.querySelector('[data-action="mark-unread"]').addEventListener('click', function() {
            markAsUnread(currentEmail.id);
        });
    }
    
    function archiveEmail(id) {
        let emails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        emails = emails.filter(e => e.id != id);
        localStorage.setItem('vision_inbox_emails', JSON.stringify(emails));
        
        showNotification('Письмо архивировано', 'success');
        setTimeout(() => window.location.href = 'inbox.html', 1000);
    }
    
    function deleteEmail(id) {
        let emails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        emails = emails.filter(e => e.id != id);
        localStorage.setItem('vision_inbox_emails', JSON.stringify(emails));
        
        showNotification('Письмо удалено', 'success');
        setTimeout(() => window.location.href = 'inbox.html', 1000);
    }
    
    function markAsSpam(id) {
        showNotification('Письмо помечено как спам', 'success');
        setTimeout(() => window.location.href = 'inbox.html', 1000);
    }
    
    function markAsUnread(id) {
        let emails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        const index = emails.findIndex(e => e.id == id);
        if (index !== -1) {
            emails[index].read = false;
            localStorage.setItem('vision_inbox_emails', JSON.stringify(emails));
            showNotification('Письмо помечено как непрочитанное', 'success');
            updateUnreadCount();
        }
    }
    
    // Вложения
    function initAttachments() {
        document.querySelectorAll('.attachment-action').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.title;
                const attachmentName = this.closest('.attachment-card').querySelector('h4').textContent;
                
                if (action === 'Скачать') {
                    showNotification(`Скачивание ${attachmentName}...`, 'info');
                    // Симуляция скачивания
                    setTimeout(() => {
                        showNotification(`${attachmentName} скачан`, 'success');
                    }, 1500);
                } else if (action === 'Предпросмотр') {
                    showNotification(`Предпросмотр ${attachmentName}`, 'info');
                }
            });
        });
    }
    
    function renderAttachments(attachments) {
        const container = document.querySelector('.attachments-grid');
        container.innerHTML = '';
        
        attachments.forEach(attachment => {
            const card = document.createElement('div');
            card.className = 'attachment-card';
            
            const icon = getFileIcon(attachment.type, attachment.name);
            
            card.innerHTML = `
                <div class="attachment-card-header">
                    <div class="attachment-icon">${icon}</div>
                    <div class="attachment-actions">
                        <button class="attachment-action" title="Предпросмотр">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </button>
                        <button class="attachment-action" title="Скачать">
                            <svg viewBox="0 0 24 24">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="attachment-card-body">
                    <h4>${attachment.name}</h4>
                    <p class="attachment-size">${attachment.size}</p>
                    <div class="attachment-progress">
                        <div class="progress-bar" style="width: 100%"></div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Обновляем заголовок
        const totalSize = attachments.reduce((sum, a) => {
            const size = parseFloat(a.size);
            const unit = a.size.split(' ')[1];
            let multiplier = 1;
            if (unit === 'KB') multiplier = 1024;
            if (unit === 'MB') multiplier = 1024 * 1024;
            if (unit === 'GB') multiplier = 1024 * 1024 * 1024;
            return sum + (size * multiplier);
        }, 0);
        
        const title = document.querySelector('.attachments-title');
        title.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
            Вложения (${attachments.length} файл(ов), ${formatFileSize(totalSize)})
        `;
    }
    
    function getFileIcon(type, name) {
        if (type.startsWith('image/')) return '🖼️';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
        if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
        if (type.includes('audio')) return '🎵';
        if (type.includes('video')) return '🎬';
        return '📎';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Похожие письма
    function initSimilarEmails() {
        const emails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        
        // Берем 2 последних письма от того же отправителя (кроме текущего)
        const similar = emails
            .filter(e => e.from === currentEmail.from && e.id !== currentEmail.id)
            .slice(0, 2);
        
        const container = document.querySelector('.similar-emails');
        
        if (similar.length === 0) {
            container.innerHTML = '<p class="no-similar">Нет похожих писем</p>';
            return;
        }
        
        container.innerHTML = '';
        similar.forEach(email => {
            const date = new Date(email.date);
            const dateStr = formatDate(date);
            
            const item = document.createElement('div');
            item.className = 'similar-email';
            item.innerHTML = `
                <div class="similar-email-sender">${email.from}</div>
                <div class="similar-email-subject">${email.subject}</div>
                <div class="similar-email-date">${dateStr}</div>
            `;
            
            item.addEventListener('click', function() {
                window.location.href = `message.html?id=${email.id}`;
            });
            
            container.appendChild(item);
        });
    }
    
    // Информация о письме
    function updateEmailInfo(email) {
        const bodySize = new Blob([email.body]).size;
        
        const infoHTML = `
            <div class="info-row">
                <span class="info-label">Размер:</span>
                <span class="info-value">${formatFileSize(bodySize)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Шифрование:</span>
                <span class="info-value">Квантовое TLS 1.3</span>
            </div>
            <div class="info-row">
                <span class="info-label">Получено:</span>
                <span class="info-value">${new Date(email.date).toLocaleTimeString('ru-RU')} GMT+3</span>
            </div>
            <div class="info-row">
                <span class="info-label">ID письма:</span>
                <span class="info-value">VM-${email.id.toString().slice(-8)}</span>
            </div>
        `;
        
        document.querySelector('.message-info').innerHTML = infoHTML;
    }
    
    // Тулутипы
    function initTooltips() {
        // Используем нативный title для простоты
    }
    
    // Печать
    function initPrint() {
        document.querySelector('[data-action="print"]').addEventListener('click', function() {
            const printContent = document.querySelector('.message-container').cloneNode(true);
            
            // Удаляем ненужные элементы
            printContent.querySelectorAll('.message-actions-quick, .reply-form, .message-sidebar, button, [onclick]').forEach(el => el.remove());
            
            // Создаем временное окно для печати
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${document.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .message-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                        .message-subject { font-size: 24px; margin-bottom: 10px; }
                        .message-tag { display: inline-block; padding: 4px 8px; margin-right: 5px; border-radius: 4px; font-size: 12px; }
                        .message-tag.important { background: #ffebee; color: #c62828; }
                        .message-tag.work { background: #e8eaf6; color: #3949ab; }
                        .attachments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
                        .attachment-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <div class="no-print" style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                        Напечатано из Vision Mail - ${new Date().toLocaleString('ru-RU')}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        });
    }
    
    // Уведомления
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
            <div class="notification-content">${message}</div>
            <button class="notification-close">×</button>
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    init();
});