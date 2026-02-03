// js/search.js - Функциональность страницы поиска
document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const searchInput = document.getElementById('mainSearchInput');
    const searchButton = document.getElementById('searchButton');
    const searchClear = document.getElementById('searchClear');
    const searchVoice = document.getElementById('searchVoice');
    const suggestions = document.getElementById('searchSuggestions');
    const resultsContainer = document.getElementById('searchResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');
    const filtersPanel = document.getElementById('resultsFilters');
    
    let searchResults = [];
    let currentQuery = '';
    let isSearching = false;
    
    // Инициализация
    function init() {
        initSearch();
        initFilters();
        initSuggestions();
        initVoiceSearch();
        
        // Загрузка последних поисковых запросов
        loadRecentSearches();
        
        // Попробовать выполнить поиск из URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
            performSearch(query);
        }
    }
    
    // Поиск
    function initSearch() {
        // Поиск при нажатии Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value.trim());
            }
        });
        
        // Поиск при нажатии кнопки
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value.trim());
        });
        
        // Очистка поиска
        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
            hideResults();
            this.style.display = 'none';
        });
        
        // Показать/скрыть кнопку очистки
        searchInput.addEventListener('input', function() {
            searchClear.style.display = this.value ? 'block' : 'none';
            
            // Автоподсказки
            if (this.value.length >= 2) {
                showAutocomplete(this.value);
            } else {
                hideAutocomplete();
            }
        });
        
        // Фокус на поле поиска при загрузке
        setTimeout(() => searchInput.focus(), 100);
    }
    
    function performSearch(query) {
        if (!query || isSearching) return;
        
        currentQuery = query;
        isSearching = true;
        
        // Показать состояние загрузки
        showLoading();
        
        // Сохранить запрос в истории
        saveToSearchHistory(query);
        
        // Обновить URL
        updateSearchURL(query);
        
        // Симуляция поиска с задержкой
        setTimeout(() => {
            searchResults = simulateSearch(query);
            isSearching = false;
            displayResults(searchResults, query);
        }, 800);
    }
    
    function simulateSearch(query) {
        // Получаем данные из localStorage
        const inboxEmails = JSON.parse(localStorage.getItem('vision_inbox_emails') || '[]');
        const sentEmails = JSON.parse(localStorage.getItem('vision_sent_emails') || '[]');
        const contacts = JSON.parse(localStorage.getItem('vision_contacts') || '[]');
        
        const allData = [
            ...inboxEmails.map(email => ({ ...email, type: 'email', source: 'inbox' })),
            ...sentEmails.map(email => ({ ...email, type: 'email', source: 'sent' })),
            ...contacts.map(contact => ({ ...contact, type: 'contact' }))
        ];
        
        // Если нет данных, используем демо-данные
        if (allData.length === 0) {
            allData.push(...getDemoData());
        }
        
        // Фильтрация по запросу
        const lowerQuery = query.toLowerCase();
        
        return allData.filter(item => {
            if (item.type === 'email') {
                return (
                    item.subject.toLowerCase().includes(lowerQuery) ||
                    item.from.toLowerCase().includes(lowerQuery) ||
                    (item.body && item.body.toLowerCase().includes(lowerQuery))
                );
            } else if (item.type === 'contact') {
                return (
                    item.name.toLowerCase().includes(lowerQuery) ||
                    item.email.toLowerCase().includes(lowerQuery) ||
                    (item.company && item.company.toLowerCase().includes(lowerQuery))
                );
            }
            return false;
        });
    }
    
    function getDemoData() {
        return [
            {
                id: 1,
                type: 'email',
                from: 'Vision Team',
                fromEmail: 'support@vision.com',
                subject: 'Добро пожаловать в Vision Mail',
                body: 'Рады приветствовать вас в нашем футуристическом почтовом клиенте',
                date: new Date().toISOString(),
                read: true
            },
            {
                id: 2,
                type: 'email',
                from: 'Анна Петрова',
                fromEmail: 'anna@vision.com',
                subject: 'Встреча завтра в 15:00',
                body: 'Не забудьте подготовить презентацию к нашей встрече',
                date: new Date(Date.now() - 86400000).toISOString(), // Вчера
                read: false
            },
            {
                id: 3,
                type: 'contact',
                name: 'Алексей Иванов',
                email: 'alex@vision.com',
                company: 'Vision Technologies',
                title: 'Senior Developer'
            },
            {
                id: 4,
                type: 'contact',
                name: 'Михаил Сидоров',
                email: 'mikhail@vision.com',
                company: 'Vision Technologies',
                title: 'Lead Designer'
            }
        ];
    }
    
    // Отображение результатов
    function displayResults(results, query) {
        // Обновить заголовок и счетчик
        resultsTitle.querySelector('.title-text').textContent = `Результаты поиска: "${query}"`;
        resultsCount.textContent = `(${results.length})`;
        
        if (results.length === 0) {
            showNoResults(query);
            return;
        }
        
        // Скрыть пустое состояние
        emptyState.style.display = 'none';
        
        // Очистить результаты
        resultsContainer.innerHTML = '';
        
        // Группировать по типу
        const emails = results.filter(r => r.type === 'email');
        const contacts = results.filter(r => r.type === 'contact');
        
        // Показать результаты
        if (emails.length > 0) {
            renderEmailResults(emails);
        }
        
        if (contacts.length > 0) {
            renderContactResults(contacts);
        }
        
        // Показать панель фильтров
        filtersPanel.style.display = 'block';
        updateFiltersCount(results);
    }
    
    function renderEmailResults(emails) {
        const section = document.createElement('div');
        section.className = 'results-section';
        
        section.innerHTML = `
            <h3 class="section-title">
                <svg viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                </svg>
                Письма (${emails.length})
            </h3>
            <div class="results-list" id="emailResults"></div>
        `;
        
        resultsContainer.appendChild(section);
        
        const list = section.querySelector('.results-list');
        
        emails.forEach(email => {
            const date = new Date(email.date);
            const dateStr = formatDate(date);
            
            const item = document.createElement('div');
            item.className = `result-item email-result ${email.read ? 'read' : 'unread'}`;
            item.innerHTML = `
                <div class="result-checkbox">
                    <input type="checkbox" id="result-${email.id}">
                    <label for="result-${email.id}" class="checkbox-custom"></label>
                </div>
                <div class="result-content">
                    <div class="result-sender">
                        <div class="sender-avatar-small" style="background-color: var(--neon-primary)">
                            ${email.from.charAt(0)}
                        </div>
                        <div class="sender-info">
                            <div class="sender-name">${email.from}</div>
                            <div class="sender-email">${email.fromEmail}</div>
                        </div>
                    </div>
                    <div class="result-subject">${highlightText(email.subject, currentQuery)}</div>
                    <div class="result-preview">${highlightText(truncate(email.body || '', 150), currentQuery)}</div>
                    <div class="result-meta">
                        <span class="result-date">${dateStr}</span>
                        ${email.source === 'inbox' ? '<span class="result-badge inbox">Входящие</span>' : ''}
                        ${email.source === 'sent' ? '<span class="result-badge sent">Отправленные</span>' : ''}
                    </div>
                </div>
                <div class="result-actions">
                    <button class="result-action" title="Ответить">↩️</button>
                    <button class="result-action" title="Архивировать">📁</button>
                </div>
            `;
            
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.result-checkbox') && !e.target.closest('.result-action')) {
                    window.location.href = `message.html?id=${email.id}`;
                }
            });
            
            list.appendChild(item);
        });
    }
    
    function renderContactResults(contacts) {
        const section = document.createElement('div');
        section.className = 'results-section';
        
        section.innerHTML = `
            <h3 class="section-title">
                <svg viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Контакты (${contacts.length})
            </h3>
            <div class="results-grid" id="contactResults"></div>
        `;
        
        resultsContainer.appendChild(section);
        
        const grid = section.querySelector('.results-grid');
        
        contacts.forEach(contact => {
            const item = document.createElement('div');
            item.className = 'result-card contact-card';
            item.innerHTML = `
                <div class="contact-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=${getRandomColor()}&color=fff" alt="${contact.name}">
                </div>
                <div class="contact-info">
                    <h4 class="contact-name">${highlightText(contact.name, currentQuery)}</h4>
                    <p class="contact-email">${highlightText(contact.email, currentQuery)}</p>
                    ${contact.company ? `<p class="contact-company">${highlightText(contact.company, currentQuery)}</p>` : ''}
                    ${contact.title ? `<p class="contact-title">${contact.title}</p>` : ''}
                </div>
                <div class="contact-actions">
                    <button class="contact-action" title="Написать">📧</button>
                    <button class="contact-action" title="Позвонить">📞</button>
                </div>
            `;
            
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.contact-action')) {
                    // Перейти к контакту
                    showNotification(`Открыт контакт: ${contact.name}`, 'info');
                }
            });
            
            grid.appendChild(item);
        });
    }
    
    function highlightText(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    function truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
    
    function formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        }
    }
    
    function getRandomColor() {
        const colors = ['8a2be2', 'ff3366', '0066ff', '00cc66', 'ffcc00'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Нет результатов
    function showNoResults(query) {
        emptyState.innerHTML = `
            <div class="empty-state-icon">🔍</div>
            <h3>По запросу "${query}" ничего не найдено</h3>
            <p>Попробуйте изменить запрос или использовать другие ключевые слова</p>
            
            <div class="empty-state-tips">
                <h4>Рекомендации:</h4>
                <ul>
                    <li>Проверьте правильность написания</li>
                    <li>Используйте более общие термины</li>
                    <li>Ищите в разных разделах (письма, контакты, вложения)</li>
                </ul>
            </div>
        `;
        emptyState.style.display = 'flex';
    }
    
    // Загрузка
    function showLoading() {
        emptyState.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-glow"></div>
            </div>
            <h3>Идет поиск...</h3>
            <p>Пожалуйста, подождите</p>
        `;
        emptyState.style.display = 'flex';
        resultsContainer.innerHTML = '';
    }
    
    function hideResults() {
        emptyState.style.display = 'flex';
        resultsContainer.innerHTML = '';
        resultsTitle.querySelector('.title-text').textContent = 'Введите запрос для поиска';
        resultsCount.textContent = '';
        filtersPanel.style.display = 'none';
    }
    
    // URL и история
    function updateSearchURL(query) {
        const url = new URL(window.location);
        url.searchParams.set('q', query);
        window.history.pushState({}, '', url);
    }
    
    function saveToSearchHistory(query) {
        let history = JSON.parse(localStorage.getItem('vision_search_history') || '[]');
        history = [query, ...history.filter(q => q !== query)].slice(0, 10);
        localStorage.setItem('vision_search_history', JSON.stringify(history));
    }
    
    function loadRecentSearches() {
        const history = JSON.parse(localStorage.getItem('vision_search_history') || '[]');
        if (history.length > 0) {
            // Можно показать в интерфейсе
        }
    }
    
    // Фильтры
    function initFilters() {
        // Очистка фильтров
        document.getElementById('clearFilters').addEventListener('click', function() {
            document.querySelectorAll('#resultsFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('#resultsFilters input[type="date"]').forEach(input => input.value = '');
        });
        
        // Применение фильтров
        document.querySelector('.filters-apply').addEventListener('click', function() {
            applyFilters();
        });
        
        // Переключение фильтров
        document.querySelectorAll('#resultsFilters input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', function() {
                applyFilters();
            });
        });
    }
    
    function applyFilters() {
        if (!searchResults.length) return;
        
        const typeFilters = Array.from(document.querySelectorAll('input[name="resultType"]:checked')).map(cb => cb.value);
        const senderFilters = Array.from(document.querySelectorAll('input[name="sender"]:checked')).map(cb => cb.value);
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const sizeFilters = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(cb => cb.value);
        
        let filtered = searchResults;
        
        // Фильтр по типу
        if (typeFilters.length > 0) {
            filtered = filtered.filter(item => typeFilters.includes(item.type));
        }
        
        // Фильтр по отправителю (для писем)
        if (senderFilters.length > 0) {
            filtered = filtered.filter(item => {
                if (item.type !== 'email') return true;
                return senderFilters.some(filter => 
                    item.from.toLowerCase().includes(filter) ||
                    item.fromEmail.toLowerCase().includes(filter)
                );
            });
        }
        
        // Фильтр по дате
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filtered = filtered.filter(item => new Date(item.date) >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59);
            filtered = filtered.filter(item => new Date(item.date) <= toDate);
        }
        
        // Фильтр по размеру (упрощенный)
        if (sizeFilters.length > 0) {
            filtered = filtered.filter(item => {
                if (item.type !== 'email') return true;
                // Здесь должна быть логика определения размера
                return true;
            });
        }
        
        // Перерисовываем результаты
        displayResults(filtered, currentQuery);
    }
    
    function updateFiltersCount(results) {
        const emailCount = results.filter(r => r.type === 'email').length;
        const contactCount = results.filter(r => r.type === 'contact').length;
        
        // Обновляем счетчики в фильтрах
        document.querySelectorAll('.filter-count').forEach(span => {
            const type = span.closest('label').querySelector('input').value;
            if (type === 'email') span.textContent = `(${emailCount})`;
            if (type === 'contact') span.textContent = `(${contactCount})`;
        });
    }
    
    // Подсказки
    function initSuggestions() {
        // Клик по подсказкам
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                const query = this.dataset.query;
                searchInput.value = query;
                performSearch(query);
            });
        });
        
        // Автоподсказки
        searchInput.addEventListener('input', debounce(function() {
            if (this.value.length >= 2) {
                showAutocomplete(this.value);
            }
        }, 300));
    }
    
    function showAutocomplete(query) {
        // Получаем подсказки из истории и популярных запросов
        const history = JSON.parse(localStorage.getItem('vision_search_history') || '[]');
        const popular = ['важные письма', 'с вложениями', 'непрочитанные', 'за последнюю неделю'];
        
        const suggestions = [...history, ...popular]
            .filter(s => s.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
        
        if (suggestions.length === 0) return;
        
        // Показываем подсказки
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.innerHTML = suggestions.map(s => `
            <div class="autocomplete-item" data-suggestion="${s}">
                <svg viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                ${highlightText(s, query)}
            </div>
        `).join('');
        
        // Удаляем старый дропдаун
        const oldDropdown = document.querySelector('.autocomplete-dropdown');
        if (oldDropdown) oldDropdown.remove();
        
        // Добавляем новый
        searchInput.parentNode.appendChild(dropdown);
        
        // Обработка кликов
        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', function() {
                const suggestion = this.dataset.suggestion;
                searchInput.value = suggestion;
                performSearch(suggestion);
                dropdown.remove();
            });
        });
        
        // Закрытие при клике вне
        document.addEventListener('click', function closeAutocomplete(e) {
            if (!dropdown.contains(e.target) && e.target !== searchInput) {
                dropdown.remove();
                document.removeEventListener('click', closeAutocomplete);
            }
        });
    }
    
    function hideAutocomplete() {
        const dropdown = document.querySelector('.autocomplete-dropdown');
        if (dropdown) dropdown.remove();
    }
    
    // Голосовой поиск
    function initVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            searchVoice.addEventListener('click', function() {
                if (isSearching) return;
                
                recognition.start();
                searchVoice.classList.add('listening');
                showNotification('Слушаю...', 'info');
            });
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                searchInput.value = transcript;
                performSearch(transcript);
                searchVoice.classList.remove('listening');
            };
            
            recognition.onerror = function(event) {
                console.error('Ошибка распознавания речи:', event.error);
                searchVoice.classList.remove('listening');
                showNotification('Ошибка распознавания речи', 'error');
            };
            
            recognition.onend = function() {
                searchVoice.classList.remove('listening');
            };
        } else {
            searchVoice.style.display = 'none';
        }
    }
    
    // Вспомогательные функции
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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