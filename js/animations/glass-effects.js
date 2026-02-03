/**
 * Dynamic Glass Effects System
 * Реализация динамического glassmorphism с live-эффектами
 */

class GlassEffects {
    constructor() {
        this.glassElements = [];
        this.mousePosition = { x: 0, y: 0 };
        this.scrollIntensity = 0;
        this.init();
    }
    
    init() {
        this.collectGlassElements();
        this.setupMouseTracking();
        this.setupGlassInteractions();
        this.setupDynamicBlur();
        
        console.log('🔮 Glass Effects initialized');
    }
    
    collectGlassElements() {
        this.glassElements = Array.from(document.querySelectorAll('.glass-panel, [data-glass-effect]'));
        
        // Добавление необходимых стилей каждому элементу
        this.glassElements.forEach((element, index) => {
            // Уникальный ID для каждого элемента
            element.dataset.glassId = `glass-${index}`;
            
            // Создание внутреннего свечения
            this.createInnerGlow(element);
            
            // Добавление эффекта глубины через box-shadow
            this.applyDepthShadow(element);
        });
    }
    
    createInnerGlow(element) {
        const glow = document.createElement('div');
        glow.className = 'glass-inner-glow';
        glow.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: inherit;
            pointer-events: none;
            z-index: -1;
            background: radial-gradient(
                circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(var(--neon-active-rgb), 0.15) 0%,
                transparent 70%
            );
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        element.style.position = 'relative';
        element.appendChild(glow);
    }
    
    applyDepthShadow(element) {
        // Динамические тени в зависимости от положения на странице
        const rect = element.getBoundingClientRect();
        const depth = Math.floor((rect.top / window.innerHeight) * 10);
        
        const shadowColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-secondary')
            .trim();
        
        const rgb = this.hexToRgb(shadowColor) || { r: 0, g: 0, b: 0 };
        
        element.style.setProperty('--glass-depth', `${depth}`);
        element.style.boxShadow = `
            0 ${depth * 2}px ${depth * 4}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.05)
        `;
    }
    
    setupMouseTracking() {
        // Отслеживание положения мыши для динамических эффектов
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            this.updateGlassMouseEffects();
        });
        
        // Touch-события для мобильных устройств
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mousePosition.x = e.touches[0].clientX;
                this.mousePosition.y = e.touches[0].clientY;
                
                this.updateGlassMouseEffects();
            }
        }, { passive: true });
    }
    
    updateGlassMouseEffects() {
        this.glassElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            
            // Вычисление относительного положения мыши внутри элемента
            const x = ((this.mousePosition.x - rect.left) / rect.width) * 100;
            const y = ((this.mousePosition.y - rect.top) / rect.height) * 100;
            
            // Обновление CSS-переменных
            element.style.setProperty('--mouse-x', `${x}%`);
            element.style.setProperty('--mouse-y', `${y}%`);
            
            // Эффект при наведении
            const distance = Math.sqrt(
                Math.pow(this.mousePosition.x - (rect.left + rect.width / 2), 2) +
                Math.pow(this.mousePosition.y - (rect.top + rect.height / 2), 2)
            );
            
            const maxDistance = Math.sqrt(
                Math.pow(window.innerWidth, 2) + 
                Math.pow(window.innerHeight, 2)
            );
            
            const intensity = 1 - (distance / maxDistance);
            
            // Активация внутреннего свечения
            const glow = element.querySelector('.glass-inner-glow');
            if (glow) {
                glow.style.opacity = Math.max(0, intensity - 0.7);
            }
        });
    }
    
    setupGlassInteractions() {
        // Эффекты при взаимодействии
        this.glassElements.forEach(element => {
            // Hover эффект
            element.addEventListener('mouseenter', () => {
                this.enhanceGlass(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.resetGlass(element);
            });
            
            // Click эффект
            element.addEventListener('mousedown', () => {
                this.depressGlass(element);
            });
            
            element.addEventListener('mouseup', () => {
                this.releaseGlass(element);
            });
        });
    }
    
    enhanceGlass(element) {
        // Усиление эффектов при наведении
        element.style.transform = 'translateY(-2px) scale(1.01)';
        element.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Усиление свечения
        element.style.boxShadow = `
            var(--shadow-soft),
            0 0 30px rgba(var(--neon-active-rgb), 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.1)
        `;
        
        // Легкое изменение прозрачности
        const bgColor = getComputedStyle(element).backgroundColor;
        const rgba = this.parseRgba(bgColor);
        if (rgba) {
            rgba.a = Math.min(0.85, rgba.a + 0.05);
            element.style.backgroundColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
        }
    }
    
    resetGlass(element) {
        // Возврат к исходному состоянию
        element.style.transform = '';
        element.style.boxShadow = '';
        
        const bgColor = getComputedStyle(element).backgroundColor;
        const rgba = this.parseRgba(bgColor);
        if (rgba) {
            rgba.a = Math.max(0.7, rgba.a - 0.05);
            element.style.backgroundColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
        }
    }
    
    depressGlass(element) {
        // Эффект "вдавливания" при клике
        element.style.transform = 'translateY(2px) scale(0.98)';
        element.style.boxShadow = 'var(--shadow-inset)';
        element.style.transition = 'all 0.1s ease';
    }
    
    releaseGlass(element) {
        // Возврат после клика с пружинной анимацией
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    
    setupDynamicBlur() {
        // Динамическое изменение размытия при скролле
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateBlur = () => {
            const scrollDelta = Math.abs(window.scrollY - lastScrollY);
            lastScrollY = window.scrollY;
            
            // Интенсивность размытия зависит от скорости скролла
            const blurValue = Math.min(20, scrollDelta * 0.1);
            
            this.glassElements.forEach(element => {
                const currentBlur = getComputedStyle(element).backdropFilter;
                const newBlur = currentBlur.replace(/blur\([^)]+\)/, `blur(${blurValue}px)`);
                element.style.backdropFilter = newBlur;
                
                // Плавное возвращение к исходному значению
                setTimeout(() => {
                    element.style.backdropFilter = '';
                }, 300);
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateBlur);
                ticking = true;
            }
        });
    }
    
    // Вспомогательные методы
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    parseRgba(rgbaString) {
        const result = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
        if (result) {
            return {
                r: parseInt(result[1]),
                g: parseInt(result[2]),
                b: parseInt(result[3]),
                a: result[4] ? parseFloat(result[4]) : 1
            };
        }
        return null;
    }
    
    // Обновление элементов при изменении DOM
    static update() {
        const instance = GlassEffects.instance || new GlassEffects();
        instance.collectGlassElements();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.GlassEffects = new GlassEffects();
});

export default GlassEffects;