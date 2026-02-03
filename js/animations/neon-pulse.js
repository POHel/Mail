/**
 * Neon Pulse Animation System
 * Анимация свечения и пульсации неоновых элементов
 */

class NeonPulse {
    constructor() {
        this.neonElements = [];
        this.pulseIntervals = new Map();
        this.init();
    }
    
    init() {
        this.collectNeonElements();
        this.setupPulseEffects();
        this.setupHoverEffects();
        this.setupThemeListeners();
        
        console.log('💡 Neon Pulse initialized');
    }
    
    collectNeonElements() {
        // Сбор всех элементов с неоновыми эффектами
        this.neonElements = Array.from(document.querySelectorAll(
            '[data-neon-accent], .neon-glow, .neon-border, [data-neon-pulse]'
        ));
        
        // Инициализация каждого элемента
        this.neonElements.forEach(element => {
            this.initializeNeonElement(element);
        });
    }
    
    initializeNeonElement(element) {
        // Получение цвета неона из данных или вычисление
        const neonColor = this.getNeonColorForElement(element);
        
        // Установка CSS-переменных
        element.style.setProperty('--neon-element-color', neonColor);
        
        // Добавление базовых стилей
        if (!element.classList.contains('neon-initialized')) {
            element.classList.add('neon-initialized');
            
            // Создание эффекта свечения через псевдоэлемент
            this.createGlowEffect(element, neonColor);
        }
    }
    
    getNeonColorForElement(element) {
        // Приоритеты: data-атрибут > родительский атрибут > глобальный цвет
        const elementColor = element.dataset.neonColor;
        if (elementColor) {
            return `var(--neon-${elementColor})`;
        }
        
        const parentColor = element.closest('[data-neon-color]')?.dataset.neonColor;
        if (parentColor) {
            return `var(--neon-${parentColor})`;
        }
        
        return 'var(--neon-active)';
    }
    
    createGlowEffect(element, color) {
        // Создание динамического свечения через фильтры
        const styleId = `neon-style-${Math.random().toString(36).substr(2, 9)}`;
        const style = document.createElement('style');
        
        style.id = styleId;
        style.textContent = `
            .neon-initialized {
                position: relative;
                z-index: 1;
            }
            
            .neon-initialized::after {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border-radius: inherit;
                background: ${color};
                filter: blur(12px);
                opacity: 0;
                z-index: -1;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .neon-initialized:hover::after {
                opacity: 0.3;
            }
            
            .neon-pulse::after {
                animation: neonPulse 1s ease-in-out;
            }
            
            @keyframes neonPulse {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.5; }
            }
        `;
        
        document.head.appendChild(style);
        element.dataset.neonStyleId = styleId;
    }
    
    setupPulseEffects() {
        // Автоматическая пульсация для некоторых элементов
        const autoPulseElements = this.neonElements.filter(el => 
            el.hasAttribute('data-neon-pulse')
        );
        
        autoPulseElements.forEach(element => {
            const interval = element.dataset.neonPulseInterval || '2000';
            this.startPulseAnimation(element, parseInt(interval));
        });
    }
    
    startPulseAnimation(element, interval) {
        // Запуск интервальной пульсации
        if (this.pulseIntervals.has(element)) {
            clearInterval(this.pulseIntervals.get(element));
        }
        
        const pulseInterval = setInterval(() => {
            this.triggerPulse(element);
        }, interval);
        
        this.pulseIntervals.set(element, pulseInterval);
    }
    
    triggerPulse(element) {
        // Активация одиночной пульсации
        element.classList.add('neon-pulse');
        
        // Удаление класса после анимации
        setTimeout(() => {
            element.classList.remove('neon-pulse');
        }, 1000);
    }
    
    setupHoverEffects() {
        // Интерактивные эффекты при наведении
        this.neonElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.enhanceNeon(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.reduceNeon(element);
            });
            
            // Touch-события
            element.addEventListener('touchstart', () => {
                this.enhanceNeon(element);
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                this.reduceNeon(element);
            });
        });
    }
    
    enhanceNeon(element) {
        // Усиление свечения при наведении
        const intensity = element.dataset.neonIntensity || '1.0';
        
        element.style.filter = `
            drop-shadow(0 0 8px var(--neon-element-color))
            drop-shadow(0 0 16px var(--neon-element-color))
            brightness(${intensity})
        `;
        
        // Анимация текста
        if (element.classList.contains('neon-glow')) {
            element.style.textShadow = `
                0 0 10px var(--neon-element-color),
                0 0 20px var(--neon-element-color),
                0 0 30px var(--neon-element-color)
            `;
        }
    }
    
    reduceNeon(element) {
        // Возврат к нормальному состоянию
        element.style.filter = '';
        
        if (element.classList.contains('neon-glow')) {
            element.style.textShadow = `
                0 0 5px var(--neon-element-color),
                0 0 10px var(--neon-element-color)
            `;
        }
    }
    
    setupThemeListeners() {
        // Реакция на смену темы
        document.addEventListener('themechange', (e) => {
            this.adjustForTheme(e.detail.theme);
        });
        
        // Реакция на смену неонового цвета
        document.addEventListener('neonchange', (e) => {
            this.updateAllNeonColors();
        });
    }
    
    adjustForTheme(theme) {
        // Настройка интенсивности для разных тем
        const intensity = theme === 'dark' ? '1.0' : '0.7';
        
        this.neonElements.forEach(element => {
            element.style.setProperty('--neon-intensity', intensity);
        });
    }
    
    updateAllNeonColors() {
        // Обновление цветов всех элементов
        this.neonElements.forEach(element => {
            const newColor = this.getNeonColorForElement(element);
            element.style.setProperty('--neon-element-color', newColor);
            
            // Обновление стилей
            const styleId = element.dataset.neonStyleId;
            if (styleId) {
                const style = document.getElementById(styleId);
                if (style) {
                    // Обновление цвета в стилях
                    const newStyles = style.textContent.replace(
                        /background: [^;]+;/,
                        `background: ${newColor};`
                    );
                    style.textContent = newStyles;
                }
            }
        });
    }
    
    // Добавление нового элемента для анимации
    static registerElement(element) {
        const instance = NeonPulse.instance || new NeonPulse();
        instance.neonElements.push(element);
        instance.initializeNeonElement(element);
    }
    
    // Удаление элемента
    static unregisterElement(element) {
        const instance = NeonPulse.instance || new NeonPulse();
        const index = instance.neonElements.indexOf(element);
        if (index > -1) {
            instance.neonElements.splice(index, 1);
        }
        
        // Остановка пульсации
        if (instance.pulseIntervals.has(element)) {
            clearInterval(instance.pulseIntervals.get(element));
            instance.pulseIntervals.delete(element);
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.NeonPulse = new NeonPulse();
});

export default NeonPulse;