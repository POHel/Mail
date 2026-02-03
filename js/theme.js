class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentAccent = localStorage.getItem('accent') || 'purple';
        this.isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.init();
    }
    
    init() {
        // Применяем сохраненную тему
        this.applyTheme(this.currentTheme);
        this.applyAccent(this.currentAccent);
        
        // Слушаем изменения системной темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.isSystemDark = e.matches;
            if (!localStorage.getItem('theme')) {
                this.applyTheme(this.isSystemDark ? 'dark' : 'light');
            }
        });
        
        // Инициализируем переключатель темы
        this.initThemeToggle();
        this.initAccentPicker();
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        // Обновляем переключатель темы
        this.updateThemeToggle();
    }
    
    applyAccent(accent) {
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem('accent', accent);
        this.currentAccent = accent;
    }
    
    initThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        
        toggle.addEventListener('click', () => {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            
            // Анимация переключения
            this.playToggleAnimation();
        });
        
        this.updateThemeToggle();
    }
    
    updateThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        
        const isDark = this.currentTheme === 'dark';
        toggle.setAttribute('aria-label', 
            isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'
        );
        toggle.setAttribute('data-theme', this.currentTheme);
    }
    
    initAccentPicker() {
        const picker = document.querySelector('.accent-picker');
        if (!picker) return;
        
        const colors = ['purple', 'red', 'orange', 'yellow', 'green', 'cyan'];
        
        colors.forEach(color => {
            const button = document.createElement('button');
            button.className = `accent-color ${color}`;
            button.setAttribute('data-color', color);
            button.setAttribute('aria-label', `Выбрать ${color} цвет`);
            
            button.innerHTML = `
                <span class="accent-preview" style="background-color: var(--neon-${color})"></span>
                <span class="accent-glow"></span>
            `;
            
            button.addEventListener('click', () => {
                this.applyAccent(color);
                this.updateActiveAccent(color);
                
                // Анимация выбора
                this.playAccentAnimation(button);
            });
            
            picker.appendChild(button);
        });
        
        this.updateActiveAccent(this.currentAccent);
    }
    
    updateActiveAccent(accent) {
        document.querySelectorAll('.accent-color').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-color') === accent);
        });
    }
    
    playToggleAnimation() {
        // Создаем эффект вспышки
        const flash = document.createElement('div');
        flash.className = 'theme-transition-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 500);
    }
    
    playAccentAnimation(button) {
        const ripple = document.createElement('span');
        ripple.className = 'accent-ripple';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Методы для других страниц
    static getCurrentTheme() {
        return localStorage.getItem('theme') || 'dark';
    }
    
    static getCurrentAccent() {
        return localStorage.getItem('accent') || 'purple';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});