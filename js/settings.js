// js/settings.js
/**
 * Vision Mail - Настройки
 * Управление настройками интерфейса и аккаунта
 */

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация настроек
    initSettings();
    
    // Восстановление сохраненных настроек
    restoreSettings();
    
    // Применение текущих настроек при загрузке
    applyCurrentSettings();
    
    // Установка обработчиков событий
    setupEventListeners();
});

/**
 * Инициализация настроек
 */
function initSettings() {
    console.log('Vision Mail: Инициализация настроек');
    
    // Установка начальных значений для ползунков
    updateSliderValue('animationIntensity', 75);
    updateSliderValue('blurIntensity', 15);
    
    // Инициализация кастомного цвета
    initCustomColor();
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    // Переключение между разделами настроек
    document.querySelectorAll('.menu-item[data-section]').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            switchSettingsSection(sectionId);
        });
    });
    
    // Выбор темы
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            selectTheme(theme);
        });
    });
    
    // Выбор акцентного цвета
    document.querySelectorAll('.accent-color').forEach(colorBtn => {
        colorBtn.addEventListener('click', function() {
            const color = this.dataset.color;
            const hexColor = getComputedStyle(this).backgroundColor;
            selectAccentColor(color, hexColor);
        });
    });
    
    // Кастомный цвет
    const customColorInput = document.getElementById('customColor');
    const customColorHex = document.getElementById('customColorHex');
    
    if (customColorInput) {
        customColorInput.addEventListener('input', function() {
            customColorHex.value = this.value;
            selectCustomColor(this.value);
        });
    }
    
    if (customColorHex) {
        customColorHex.addEventListener('input', function() {
            const value = this.value;
            if (isValidHexColor(value)) {
                customColorInput.value = value;
                selectCustomColor(value);
            }
        });
        
        customColorHex.addEventListener('change', function() {
            const value = this.value;
            if (!isValidHexColor(value)) {
                this.value = '#8a2be2';
                customColorInput.value = '#8a2be2';
            }
        });
    }
    
    // Настройки стиля интерфейса
    document.querySelectorAll('.style-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveStyleSetting(this.id, this.checked);
        });
    });
    
    // Ползунки
    document.querySelectorAll('.slider').forEach(slider => {
        slider.addEventListener('input', function() {
            updateSliderValue(this.id, this.value);
            saveSliderSetting(this.id, this.value);
        });
    });
    
    // Выбор плотности интерфейса
    document.querySelectorAll('.density-option').forEach(option => {
        option.addEventListener('click', function() {
            const density = this.dataset.density;
            selectDensity(density);
        });
    });
    
    // Кнопка сохранения
    const saveButton = document.querySelector('.save-button[data-action="save-settings"]');
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveAllSettings();
        });
    }
    
    // Переключатель темы в боковой панели
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
    
    // Безопасность - действия
    document.querySelectorAll('.security-action').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            handleSecurityAction(action);
        });
    });
    
    // Членство - кнопки
    document.querySelectorAll('.membership-button').forEach(button => {
        button.addEventListener('click', function() {
            const isUpgrade = this.classList.contains('upgrade');
            handleMembershipAction(isUpgrade);
        });
    });
    
    // Изменение аватара
    const avatarChange = document.querySelector('.avatar-change');
    if (avatarChange) {
        avatarChange.addEventListener('click', function() {
            changeAvatar();
        });
    }
    
    // Сохранение профиля
    const profileInputs = document.querySelectorAll('#profileName, #profileEmail, #profileBio');
    profileInputs.forEach(input => {
        input.addEventListener('change', function() {
            saveProfileSetting(this.id, this.value);
        });
    });
}

/**
 * Переключение между разделами настроек
 */
function switchSettingsSection(sectionId) {
    // Удаляем активный класс у всех пунктов меню
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Добавляем активный класс к выбранному пункту
    const activeMenuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Скрываем все секции
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Показываем выбранную секцию
    const activeSection = document.getElementById(`${sectionId}Section`);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
        
        // Плавное появление
        setTimeout(() => {
            activeSection.style.opacity = '1';
            activeSection.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Сохраняем выбранную секцию
    localStorage.setItem('vision_last_settings_section', sectionId);
}

/**
 * Выбор темы
 */
function selectTheme(theme) {
    // Обновляем визуальное состояние
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        const status = option.querySelector('.theme-status');
        if (status) status.textContent = '';
    });
    
    const selectedOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
        const status = selectedOption.querySelector('.theme-status');
        if (status) status.textContent = 'Активна';
    }
    
    // Применяем тему
    if (theme === 'auto') {
        // Автоматическое определение темы системы
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
        localStorage.setItem('vision_theme_mode', 'auto');
    } else {
        applyTheme(theme);
        localStorage.setItem('vision_theme_mode', theme);
    }
    
    // Сохраняем выбор
    localStorage.setItem('vision_theme', theme);
}

/**
 * Применение темы
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Обновляем переключатель в боковой панели
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        if (theme === 'dark') {
            themeToggle.classList.add('dark');
        } else {
            themeToggle.classList.remove('dark');
        }
    }
    
    // Анимация перехода
    document.documentElement.style.transition = 'background-color 0.3s ease';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

/**
 * Выбор акцентного цвета
 */
function selectAccentColor(colorName, hexColor) {
    // Обновляем визуальное состояние
    document.querySelectorAll('.accent-color').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedColor = document.querySelector(`.accent-color[data-color="${colorName}"]`);
    if (selectedColor) {
        selectedColor.classList.add('active');
    }
    
    // Применяем цвет
    applyAccentColor(hexColor);
    
    // Сохраняем выбор
    localStorage.setItem('vision_accent_color', colorName);
    localStorage.setItem('vision_accent_hex', hexColor);
    
    // Обновляем кастомный цвет
    const customColorInput = document.getElementById('customColor');
    const customColorHex = document.getElementById('customColorHex');
    if (customColorInput && customColorHex) {
        customColorInput.value = hexToRgb(hexColor);
        customColorHex.value = hexToRgb(hexColor);
    }
}

/**
 * Выбор кастомного цвета
 */
function selectCustomColor(hexColor) {
    if (!isValidHexColor(hexColor)) return;
    
    // Снимаем выделение с предустановленных цветов
    document.querySelectorAll('.accent-color').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Добавляем свой цвет в начало палитры
    const customColorBtn = document.querySelector('.accent-color[data-color="custom"]');
    if (!customColorBtn) {
        const accentColors = document.querySelector('.accent-colors');
        if (accentColors) {
            const newColorBtn = document.createElement('button');
            newColorBtn.className = 'accent-color active';
            newColorBtn.dataset.color = 'custom';
            newColorBtn.style.background = hexColor;
            newColorBtn.innerHTML = `
                <span class="accent-check">
                    <svg viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                </span>
            `;
            newColorBtn.addEventListener('click', function() {
                selectAccentColor('custom', hexColor);
            });
            
            accentColors.insertBefore(newColorBtn, accentColors.firstChild);
        }
    } else {
        customColorBtn.style.background = hexColor;
        customColorBtn.classList.add('active');
    }
    
    // Применяем цвет
    applyAccentColor(hexColor);
    
    // Сохраняем выбор
    localStorage.setItem('vision_accent_color', 'custom');
    localStorage.setItem('vision_accent_hex', hexColor);
}

/**
 * Инициализация кастомного цвета
 */
function initCustomColor() {
    const savedColor = localStorage.getItem('vision_accent_hex');
    const savedColorName = localStorage.getItem('vision_accent_color');
    
    if (savedColor && savedColorName === 'custom') {
        const customColorInput = document.getElementById('customColor');
        const customColorHex = document.getElementById('customColorHex');
        
        if (customColorInput && customColorHex) {
            const hexValue = rgbToHex(savedColor);
            customColorInput.value = hexValue;
            customColorHex.value = hexValue;
            selectCustomColor(hexValue);
        }
    }
}

/**
 * Применение акцентного цвета
 */
function applyAccentColor(hexColor) {
    // Преобразуем hex в RGB для CSS переменных
    const rgb = hexToRgb(hexColor);
    if (!rgb) return;
    
    // Устанавливаем CSS переменные
    document.documentElement.style.setProperty('--neon-primary', hexColor);
    document.documentElement.style.setProperty('--neon-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    
    // Анимация изменения цвета
    const root = document.documentElement;
    root.style.transition = '--neon-primary 0.3s ease';
    setTimeout(() => {
        root.style.transition = '';
    }, 300);
    
    // Обновляем градиенты и тени
    updateNeonEffects();
}

/**
 * Обновление неоновых эффектов
 */
function updateNeonEffects() {
    // Эта функция будет реализована в animations.js
    // Здесь мы только инициируем обновление
    if (window.updateNeonGlow) {
        window.updateNeonGlow();
    }
}

/**
 * Выбор плотности интерфейса
 */
function selectDensity(density) {
    // Обновляем визуальное состояние
    document.querySelectorAll('.density-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.density-option[data-density="${density}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Применяем плотность
    applyDensity(density);
    
    // Сохраняем выбор
    localStorage.setItem('vision_ui_density', density);
}

/**
 * Применение плотности интерфейса
 */
function applyDensity(density) {
    const root = document.documentElement;
    
    // Удаляем предыдущие классы плотности
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    
    // Добавляем новый класс
    root.classList.add(`density-${density}`);
    
    // Устанавливаем CSS переменные
    switch(density) {
        case 'compact':
            root.style.setProperty('--space-unit', '4px');
            root.style.setProperty('--border-radius-sm', '8px');
            root.style.setProperty('--border-radius-md', '12px');
            break;
        case 'comfortable':
            root.style.setProperty('--space-unit', '8px');
            root.style.setProperty('--border-radius-sm', '12px');
            root.style.setProperty('--border-radius-md', '16px');
            break;
        case 'spacious':
            root.style.setProperty('--space-unit', '12px');
            root.style.setProperty('--border-radius-sm', '16px');
            root.style.setProperty('--border-radius-md', '20px');
            break;
    }
}

/**
 * Обновление значения ползунка
 */
function updateSliderValue(sliderId, value) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const valueContainer = slider.closest('.slider-container').querySelector('.slider-value');
    if (!valueContainer) return;
    
    const percentElement = valueContainer.querySelector('.value-percent');
    const pxElement = valueContainer.querySelector('.value-px');
    const labelElement = valueContainer.querySelector('.value-label');
    
    if (sliderId === 'animationIntensity') {
        if (percentElement) percentElement.textContent = `${value}%`;
        
        // Обновляем текстовое описание
        if (labelElement) {
            if (value < 30) labelElement.textContent = 'Низкая';
            else if (value < 70) labelElement.textContent = 'Средняя';
            else labelElement.textContent = 'Высокая';
        }
    } else if (sliderId === 'blurIntensity') {
        if (pxElement) pxElement.textContent = `${value}px`;
        
        // Обновляем текстовое описание
        if (labelElement) {
            if (value < 10) labelElement.textContent = 'Слабое';
            else if (value < 20) labelElement.textContent = 'Среднее';
            else labelElement.textContent = 'Сильное';
        }
    }
}

/**
 * Сохранение настройки стиля
 */
function saveStyleSetting(settingId, value) {
    localStorage.setItem(`vision_${settingId}`, value);
    applyStyleSetting(settingId, value);
}

/**
 * Применение настройки стиля
 */
function applyStyleSetting(settingId, value) {
    const root = document.documentElement;
    
    switch(settingId) {
        case 'glassEffect':
            if (value) {
                root.style.setProperty('--glass-blur', '20px');
                document.querySelectorAll('.glass-panel').forEach(panel => {
                    panel.classList.add('active');
                });
            } else {
                root.style.setProperty('--glass-blur', '0px');
                document.querySelectorAll('.glass-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
            }
            break;
            
        case 'neonEffects':
            if (value) {
                document.body.classList.add('neon-enabled');
            } else {
                document.body.classList.remove('neon-enabled');
            }
            break;
            
        case 'animations':
            if (value) {
                document.body.classList.add('animations-enabled');
            } else {
                document.body.classList.remove('animations-enabled');
            }
            break;
    }
}

/**
 * Сохранение настройки ползунка
 */
function saveSliderSetting(sliderId, value) {
    localStorage.setItem(`vision_${sliderId}`, value);
    
    // Применяем настройку
    if (sliderId === 'blurIntensity') {
        document.documentElement.style.setProperty('--glass-blur', `${value}px`);
    } else if (sliderId === 'animationIntensity') {
        // Применяем интенсивность анимаций
        document.documentElement.style.setProperty('--animation-intensity', `${value}%`);
    }
}

/**
 * Сохранение настройки профиля
 */
function saveProfileSetting(settingId, value) {
    localStorage.setItem(`vision_profile_${settingId}`, value);
}

/**
 * Восстановление сохраненных настроек
 */
function restoreSettings() {
    // Восстанавливаем последнюю открытую секцию
    const lastSection = localStorage.getItem('vision_last_settings_section') || 'appearance';
    switchSettingsSection(lastSection);
    
    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('vision_theme') || 'dark';
    selectTheme(savedTheme);
    
    // Восстанавливаем акцентный цвет
    const savedColorName = localStorage.getItem('vision_accent_color') || 'purple';
    const savedColorHex = localStorage.getItem('vision_accent_hex') || '#8a2be2';
    
    if (savedColorName === 'custom') {
        selectCustomColor(savedColorHex);
    } else {
        const colorBtn = document.querySelector(`.accent-color[data-color="${savedColorName}"]`);
        if (colorBtn) {
            colorBtn.click();
        }
    }
    
    // Восстанавливаем настройки стиля
    document.querySelectorAll('.style-option input[type="checkbox"]').forEach(checkbox => {
        const savedValue = localStorage.getItem(`vision_${checkbox.id}`);
        if (savedValue !== null) {
            checkbox.checked = savedValue === 'true';
            applyStyleSetting(checkbox.id, checkbox.checked);
        }
    });
    
    // Восстанавливаем ползунки
    document.querySelectorAll('.slider').forEach(slider => {
        const savedValue = localStorage.getItem(`vision_${slider.id}`);
        if (savedValue !== null) {
            slider.value = savedValue;
            updateSliderValue(slider.id, savedValue);
            saveSliderSetting(slider.id, savedValue);
        }
    });
    
    // Восстанавливаем плотность
    const savedDensity = localStorage.getItem('vision_ui_density') || 'comfortable';
    selectDensity(savedDensity);
    
    // Восстанавливаем профиль
    document.querySelectorAll('#profileName, #profileEmail, #profileBio').forEach(input => {
        const savedValue = localStorage.getItem(`vision_profile_${input.id}`);
        if (savedValue !== null) {
            input.value = savedValue;
        }
    });
    
    // Восстанавливаем настройки безопасности
    const twoFactorAuth = document.getElementById('twoFactorAuth');
    if (twoFactorAuth) {
        const savedValue = localStorage.getItem('vision_twoFactorAuth');
        if (savedValue !== null) {
            twoFactorAuth.checked = savedValue === 'true';
        }
    }
}

/**
 * Применение текущих настроек
 */
function applyCurrentSettings() {
    // Применяем все настройки из localStorage
    const themeMode = localStorage.getItem('vision_theme_mode') || 'dark';
    if (themeMode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    } else {
        applyTheme(themeMode);
    }
    
    // Применяем акцентный цвет
    const savedColorHex = localStorage.getItem('vision_accent_hex') || '#8a2be2';
    applyAccentColor(savedColorHex);
    
    // Применяем плотность
    const savedDensity = localStorage.getItem('vision_ui_density') || 'comfortable';
    applyDensity(savedDensity);
}

/**
 * Сохранение всех настроек
 */
function saveAllSettings() {
    // Собираем все настройки
    const settings = {
        theme: localStorage.getItem('vision_theme') || 'dark',
        accentColor: localStorage.getItem('vision_accent_color') || 'purple',
        accentHex: localStorage.getItem('vision_accent_hex') || '#8a2be2',
        uiDensity: localStorage.getItem('vision_ui_density') || 'comfortable',
        glassEffect: localStorage.getItem('vision_glassEffect') === 'true',
        neonEffects: localStorage.getItem('vision_neonEffects') === 'true',
        animations: localStorage.getItem('vision_animations') === 'true',
        animationIntensity: localStorage.getItem('vision_animationIntensity') || '75',
        blurIntensity: localStorage.getItem('vision_blurIntensity') || '15',
        profileName: localStorage.getItem('vision_profile_profileName') || 'Алексей Иванов',
        profileEmail: localStorage.getItem('vision_profile_profileEmail') || 'alex@vision.com',
        twoFactorAuth: localStorage.getItem('vision_twoFactorAuth') === 'true'
    };
    
    // Сохраняем в localStorage как объект (для резервного копирования)
    localStorage.setItem('vision_settings_backup', JSON.stringify(settings));
    
    // Показываем уведомление об успешном сохранении
    showSaveNotification();
}

/**
 * Показ уведомления о сохранении
 */
function showSaveNotification() {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'save-notification glass-panel';
    notification.innerHTML = `
        <div class="notification-content">
            <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>Настройки сохранены</span>
        </div>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        box-shadow: var(--glass-shadow);
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Переключение темы (быстрое)
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Применяем тему
    applyTheme(newTheme);
    
    // Сохраняем выбор
    localStorage.setItem('vision_theme', newTheme);
    localStorage.setItem('vision_theme_mode', newTheme);
    
    // Обновляем переключатель
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        if (newTheme === 'dark') {
            themeToggle.classList.add('dark');
        } else {
            themeToggle.classList.remove('dark');
        }
    }
}

/**
 * Обработка действий безопасности
 */
function handleSecurityAction(action) {
    switch(action) {
        case 'change-password':
            showChangePasswordModal();
            break;
        case 'view-sessions':
            showActiveSessionsModal();
            break;
        case 'backup-codes':
            showBackupCodesModal();
            break;
    }
}

/**
 * Показ модального окна смены пароля
 */
function showChangePasswordModal() {
    // Создаем модальное окно
    const modal = createModal({
        title: 'Смена пароля',
        content: `
            <div class="form-group">
                <label for="currentPassword">Текущий пароль</label>
                <input type="password" id="currentPassword" class="neumorphic-input" placeholder="Введите текущий пароль">
            </div>
            <div class="form-group">
                <label for="newPassword">Новый пароль</label>
                <input type="password" id="newPassword" class="neumorphic-input" placeholder="Введите новый пароль">
            </div>
            <div class="form-group">
                <label for="confirmPassword">Подтвердите пароль</label>
                <input type="password" id="confirmPassword" class="neumorphic-input" placeholder="Повторите новый пароль">
            </div>
        `,
        buttons: [
            { text: 'Отмена', className: 'cancel', action: 'close' },
            { text: 'Изменить', className: 'confirm', action: 'changePassword' }
        ]
    });
    
    // Показываем модальное окно
    showModal(modal);
}

/**
 * Обработка действия членства
 */
function handleMembershipAction(isUpgrade) {
    if (isUpgrade) {
        // Обновление до Ultimate
        showMembershipModal('Обновление до Ultimate', `
            <p>Вы собираетесь обновить вашу подписку до <strong>Ultimate</strong> за <strong>$19.99/месяц</strong>.</p>
            <p><strong>Дополнительные возможности:</strong></p>
            <ul>
                <li>Расширенная аналитика</li>
                <li>Приоритетная поддержка 24/7</li>
                <li>Неограниченные пользовательские домены</li>
                <li>Расширенные инструменты безопасности</li>
            </ul>
        `);
    } else {
        // Отмена подписки
        showMembershipModal('Отмена подписки', `
            <p>Вы уверены, что хотите отменить вашу <strong>Premium</strong> подписку?</p>
            <p>Доступ к премиум-функциям будет прекращён с 15 февраля 2026.</p>
            <p>Вы можете повторно активировать подписку в любое время.</p>
        `);
    }
}

/**
 * Показ модального окна членства
 */
function showMembershipModal(title, content) {
    const modal = createModal({
        title: title,
        content: content,
        buttons: [
            { text: 'Отмена', className: 'cancel', action: 'close' },
            { text: 'Подтвердить', className: 'confirm', action: 'confirmMembership' }
        ]
    });
    
    showModal(modal);
}

/**
 * Создание модального окна
 */
function createModal(config) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container glass-panel">
            <div class="modal-header">
                <h2>${config.title}</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-content">
                ${config.content}
            </div>
            <div class="modal-footer">
                ${config.buttons.map(btn => `
                    <button class="modal-button ${btn.className}" data-action="${btn.action}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * Показ модального окна
 */
function showModal(modal) {
    document.body.appendChild(modal);
    
    // Анимация появления
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Обработчики событий для модального окна
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    modal.querySelectorAll('.modal-button').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action === 'close') {
                closeModal(modal);
            } else if (action === 'changePassword') {
                handlePasswordChange(modal);
            } else if (action === 'confirmMembership') {
                handleMembershipConfirmation(modal);
            }
        });
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(modal);
        }
    });
}

/**
 * Закрытие модального окна
 */
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

/**
 * Смена аватара
 */
function changeAvatar() {
    // В реальном приложении здесь была бы загрузка файла
    // Для демо просто меняем цвет аватара
    
    const avatar = document.querySelector('.profile-avatar img');
    if (avatar) {
        // Генерируем случайный цвет
        const colors = ['#8a2be2', '#ff3366', '#ff6600', '#ffcc00', '#00cc66', '#00ffff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Обновляем аватар
        avatar.src = `https://ui-avatars.com/api/?name=Alexey+Ivanov&background=${randomColor.substring(1)}&color=fff`;
        
        // Сохраняем в localStorage
        localStorage.setItem('vision_avatar_color', randomColor);
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.textContent = 'Аватар обновлён';
        notification.className = 'avatar-notification';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
}

/**
 * Вспомогательные функции
 */

// Проверка hex цвета
function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Преобразование hex в RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Преобразование RGB в hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    return '#8a2be2';
}

/**
 * Экспорт функций для использования в других модулях
 */
window.VisionSettings = {
    switchSettingsSection,
    selectTheme,
    selectAccentColor,
    saveAllSettings,
    toggleTheme
};