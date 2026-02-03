class ComposeManager {
    constructor() {
        this.attachments = [];
        this.isSending = false;
        this.editor = null;
        
        this.init();
    }
    
    init() {
        this.initEditor();
        this.initAttachments();
        this.initForm();
        this.initToolbar();
        this.initDragAndDrop();
    }
    
    initEditor() {
        this.editor = document.getElementById('emailBody');
        if (!this.editor) return;
        
        // Обработка placeholder
        this.editor.addEventListener('focus', () => {
            if (this.editor.textContent === '') {
                this.editor.innerHTML = '';
            }
        });
        
        this.editor.addEventListener('blur', () => {
            if (this.editor.textContent === '') {
                this.editor.innerHTML = '<div><br></div>';
            }
        });
        
        // Сохранение черновика при изменении
        let saveTimeout;
        this.editor.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveDraft();
            }, 1000);
        });
    }
    
    initAttachments() {
        const dropzone = document.getElementById('attachmentsDropzone');
        const fileInput = dropzone.querySelector('input[type="file"]');
        const browseLink = dropzone.querySelector('.browse-link');
        
        // Клик по зоне загрузки
        dropzone.addEventListener('click', (e) => {
            if (e.target !== browseLink) {
                fileInput.click();
            }
        });
        
        // Клик по ссылке "выберите файлы"
        browseLink.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
        
        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        
        // Выбор файлов через input
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }
    
    async handleFiles(files) {
        const container = document.getElementById('attachmentsList');
        
        for (let file of files) {
            // Проверка размера
            if (file.size > 25 * 1024 * 1024) { // 25MB
                this.showNotification(`Файл ${file.name} слишком большой (макс. 25MB)`, 'error');
                continue;
            }
            
            // Проверка типа
            const allowedTypes = [
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
            ];
            
            if (!allowedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.split('/*')[0]);
                }
                return file.type === type;
            })) {
                this.showNotification(`Тип файла ${file.name} не поддерживается`, 'error');
                continue;
            }
            
            // Добавление файла
            const attachment = {
                id: Date.now() + Math.random(),
                file: file,
                uploaded: false,
                progress: 0
            };
            
            this.attachments.push(attachment);
            this.renderAttachment(attachment, container);
            
            // Имитация загрузки
            await this.simulateUpload(attachment);
        }
    }
    
    renderAttachment(attachment, container) {
        const element = document.createElement('div');
        element.className = 'attachment-item';
        element.dataset.id = attachment.id;
        
        element.innerHTML = `
            <div class="attachment-icon">
                ${this.getFileIcon(attachment.file.type)}
            </div>
            <div class="attachment-info">
                <div class="attachment-name">${attachment.file.name}</div>
                <div class="attachment-details">
                    <span class="attachment-size">${this.formatFileSize(attachment.file.size)}</span>
                    <span class="attachment-status">Загрузка...</span>
                </div>
            </div>
            <div class="attachment-progress">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <button class="attachment-remove" type="button" title="Удалить">×</button>
        `;
        
        // Кнопка удаления
        element.querySelector('.attachment-remove').addEventListener('click', () => {
            this.removeAttachment(attachment.id);
            element.remove();
        });
        
        container.appendChild(element);
        return element;
    }
    
    async simulateUpload(attachment) {
        const element = document.querySelector(`[data-id="${attachment.id}"]`);
        if (!element) return;
        
        const progressBar = element.querySelector('.progress-bar');
        const statusText = element.querySelector('.attachment-status');
        
        for (let i = 0; i <= 100; i += 5) {
            await new Promise(resolve => setTimeout(resolve, 100));
            progressBar.style.width = `${i}%`;
            
            if (i === 100) {
                attachment.uploaded = true;
                statusText.textContent = 'Загружено';
                element.classList.add('uploaded');
                
                // Анимация успешной загрузки
                element.style.animation = 'success-pulse 0.6s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 600);
            }
        }
    }
    
    removeAttachment(id) {
        this.attachments = this.attachments.filter(a => a.id !== id);
    }
    
    initForm() {
        const form = document.getElementById('composeForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendEmail();
        });
        
        // Сохранение черновика при изменении полей
        const inputs = form.querySelectorAll('input, [contenteditable]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveDraft();
            });
        });
    }
    
    initToolbar() {
        const toolbar = document.querySelector('.compose-toolbar');
        if (!toolbar) return;
        
        // Кнопки форматирования
        const formatButtons = toolbar.querySelectorAll('[data-command]');
        formatButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.dataset.command;
                const value = button.dataset.value;
                
                if (command === 'foreColor') {
                    this.showColorPicker(button);
                } else if (command === 'insertLink') {
                    this.insertLink();
                } else {
                    document.execCommand(command, false, value);
                    this.editor.focus();
                }
            });
        });
        
        // Кнопка вставки изображения
        const imageButton = toolbar.querySelector('[data-action="insertImage"]');
        if (imageButton) {
            imageButton.addEventListener('click', () => {
                this.insertImage();
            });
        }
        
        // Кнопка смайликов
        const emojiButton = toolbar.querySelector('[data-action="emoji"]');
        if (emojiButton) {
            emojiButton.addEventListener('click', () => {
                this.showEmojiPicker(emojiButton);
            });
        }
    }
    
    initDragAndDrop() {
        // Глобальный обработчик drag and drop
        document.addEventListener('dragover', (e) => {
            if (e.dataTransfer.types.includes('Files')) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0 && 
                e.target.closest('.compose-content')) {
                e.preventDefault();
                this.handleFiles(e.dataTransfer.files);
            }
        });
    }
    
    async sendEmail() {
        if (this.isSending) return;
        
        const form = document.getElementById('composeForm');
        const to = form.querySelector('#to').value;
        const subject = form.querySelector('#subject').value;
        const body = this.editor.innerHTML;
        
        // Валидация
        if (!to || !subject || !body || body === '<div><br></div>') {
            this.showNotification('Заполните все обязательные поля', 'error');
            return;
        }
        
        this.isSending = true;
        const sendButton = document.getElementById('sendButton');
        const originalText = sendButton.querySelector('.button-text').textContent;
        
        try {
            // Анимация отправки
            sendButton.querySelector('.button-text').textContent = 'Отправка...';
            sendButton.disabled = true;
            sendButton.querySelector('.button-progress').style.width = '100%';
            
            // Имитация отправки (в реальном приложении здесь был бы fetch)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Анимация успеха
            sendButton.querySelector('.button-text').textContent = 'Отправлено!';
            sendButton.style.background = 'linear-gradient(135deg, var(--success-color), #00cc66)';
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Очистка черновика
            this.clearDraft();
            
            // Возврат к списку писем
            window.location.href = 'inbox.html';
            
        } catch (error) {
            console.error('Send error:', error);
            this.showNotification('Ошибка отправки письма', 'error');
            
            // Восстановление кнопки
            sendButton.querySelector('.button-text').textContent = originalText;
            sendButton.disabled = false;
            sendButton.querySelector('.button-progress').style.width = '0%';
        } finally {
            this.isSending = false;
        }
    }
    
    saveDraft() {
        const form = document.getElementById('composeForm');
        const draft = {
            to: form.querySelector('#to').value,
            cc: form.querySelector('#cc').value,
            bcc: form.querySelector('#bcc').value,
            subject: form.querySelector('#subject').value,
            body: this.editor.innerHTML,
            attachments: this.attachments.map(a => ({
                name: a.file.name,
                size: a.file.size,
                type: a.file.type
            })),
            timestamp: Date.now()
        };
        
        localStorage.setItem('mail_draft', JSON.stringify(draft));
        
        // Показать индикатор сохранения
        this.showAutoSaveIndicator();
    }
    
    loadDraft() {
        const draft = localStorage.getItem('mail_draft');
        if (!draft) return;
        
        try {
            const data = JSON.parse(draft);
            const form = document.getElementById('composeForm');
            
            form.querySelector('#to').value = data.to || '';
            form.querySelector('#cc').value = data.cc || '';
            form.querySelector('#bcc').value = data.bcc || '';
            form.querySelector('#subject').value = data.subject || '';
            
            if (data.body && data.body !== '<div><br></div>') {
                this.editor.innerHTML = data.body;
            }
            
            this.showNotification('Черновик восстановлен', 'info');
            
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
    
    clearDraft() {
        localStorage.removeItem('mail_draft');
    }
    
    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.textContent = 'Сохранено';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            color: var(--text-secondary);
            animation: fade-out 2s forwards;
            z-index: 1000;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }
    
    showColorPicker(button) {
        // Создаем палитру цветов
        const colors = [
            '#000000', '#434343', '#666666', '#999999',
            '#ff3366', '#ff6600', '#ffcc00', '#00cc66',
            '#0066ff', '#8a2be2', '#ff00ff', '#00ffff'
        ];
        
        const picker = document.createElement('div');
        picker.className = 'color-picker glass-panel';
        picker.style.cssText = `
            position: absolute;
            top: ${button.offsetTop + button.offsetHeight}px;
            left: ${button.offsetLeft}px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            padding: 16px;
            z-index: 1000;
        `;
        
        colors.forEach(color => {
            const colorButton = document.createElement('button');
            colorButton.className = 'color-option';
            colorButton.style.cssText = `
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${color};
                border: none;
                cursor: pointer;
                transition: transform 0.2s;
            `;
            
            colorButton.addEventListener('click', () => {
                document.execCommand('foreColor', false, color);
                picker.remove();
                this.editor.focus();
            });
            
            colorButton.addEventListener('mouseenter', () => {
                colorButton.style.transform = 'scale(1.2)';
            });
            
            colorButton.addEventListener('mouseleave', () => {
                colorButton.style.transform = 'scale(1)';
            });
            
            picker.appendChild(colorButton);
        });
        
        document.body.appendChild(picker);
        
        // Закрытие при клике вне палитры
        setTimeout(() => {
            const closePicker = (e) => {
                if (!picker.contains(e.target) && e.target !== button) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            };
            document.addEventListener('click', closePicker);
        });
    }
    
    insertLink() {
        const url = prompt('Введите URL ссылки:', 'https://');
        if (url) {
            const text = prompt('Введите текст ссылки:', url);
            document.execCommand('createLink', false, url);
            this.editor.focus();
        }
    }
    
    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                document.execCommand('insertHTML', false, img.outerHTML);
                this.editor.focus();
            };
            reader.readAsDataURL(file);
        });
        
        input.click();
    }
    
    showEmojiPicker(button) {
        const emojis = ['😀', '😂', '😍', '🤔', '😎', '👍', '👏', '🎉', '🚀', '💡', '📧', '🔒'];
        
        const picker = document.createElement('div');
        picker.className = 'emoji-picker glass-panel';
        picker.style.cssText = `
            position: absolute;
            top: ${button.offsetTop + button.offsetHeight}px;
            left: ${button.offsetLeft}px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            padding: 16px;
            z-index: 1000;
        `;
        
        emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-option';
            emojiButton.textContent = emoji;
            emojiButton.style.cssText = `
                font-size: 20px;
                background: none;
                border: none;
                cursor: pointer;
                transition: transform 0.2s;
            `;
            
            emojiButton.addEventListener('click', () => {
                document.execCommand('insertText', false, emoji);
                picker.remove();
                this.editor.focus();
            });
            
            emojiButton.addEventListener('mouseenter', () => {
                emojiButton.style.transform = 'scale(1.2)';
            });
            
            emojiButton.addEventListener('mouseleave', () => {
                emojiButton.style.transform = 'scale(1)';
            });
            
            picker.appendChild(emojiButton);
        });
        
        document.body.appendChild(picker);
        
        // Закрытие при клике вне палитры
        setTimeout(() => {
            const closePicker = (e) => {
                if (!picker.contains(e.target) && e.target !== button) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            };
            document.addEventListener('click', closePicker);
        });
    }
    
    getFileIcon(mimeType) {
        const icons = {
            'image/': '🖼️',
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'text/': '📄',
            'application/zip': '📦',
            'application/x-rar-compressed': '📦',
            'default': '📎'
        };
        
        for (const [key, icon] of Object.entries(icons)) {
            if (key.endsWith('/*')) {
                if (mimeType.startsWith(key.slice(0, -2))) {
                    return icon;
                }
            } else if (mimeType === key) {
                return icon;
            }
        }
        
        return icons.default;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `compose-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(type)}</div>
            <div class="notification-content">${message}</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: var(--glass-border);
            border-radius: var(--border-radius-md);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: notification-slide 0.3s ease;
            z-index: 1000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fade-out 0.3s forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.composeManager = new ComposeManager();
    window.composeManager.loadDraft();
});