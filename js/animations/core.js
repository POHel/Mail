/**
 * Core Animation System for VISION Mail 2026
 * Модульная система анимаций с проверкой производительности
 */

// Конфигурация производительности
const PERFORMANCE_CONFIG = {
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highEndDevice: (() => {
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        return memory >= 8 && cores >= 4;
    })(),
    
    // Настройки качества анимаций
    animationQuality: 'high', // high | medium | low
    particleCount: 150,
    blurIntensity: 12,
    neonIntensity: 1.0
};

class AnimationCore {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupPerformanceMode();
        this.registerAnimations();
        this.setupIntersectionObserver();
        this.setupScrollEffects();
        
        console.log('🎬 Animation Core initialized');
    }
    
    setupPerformanceMode() {
        // Автоматическое определение производительности
        if (!PERFORMANCE_CONFIG.highEndDevice) {
            PERFORMANCE_CONFIG.animationQuality = 'medium';
            PERFORMANCE_CONFIG.particleCount = 50;
            PERFORMANCE_CONFIG.blurIntensity = 8;
        }
        
        // Уважение пользовательских настроек
        if (PERFORMANCE_CONFIG.reduceMotion) {
            PERFORMANCE_CONFIG.animationQuality = 'low';
            this.disableIntensiveAnimations();
        }
        
        // Сохранение в localStorage для настроек пользователя
        const userQuality = localStorage.getItem('vision-animation-quality');
        if (userQuality) {
            PERFORMANCE_CONFIG.animationQuality = userQuality;
        }
    }
    
    registerAnimations() {
        // Регистрация кастомных CSS-анимаций
        this.registerCustomProperties();
        this.registerSpringAnimations();
        this.registerTactileFeedback();
    }
    
    registerCustomProperties() {
        // Динамические CSS-переменные для анимаций
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --animation-quality: ${PERFORMANCE_CONFIG.animationQuality};
                --spring-tension: ${PERFORMANCE_CONFIG.animationQuality === 'high' ? 0.6 : 0.8};
                --spring-friction: ${PERFORMANCE_CONFIG.animationQuality === 'high' ? 0.7 : 0.9};
            }
            
            .high-performance .glass-panel {
                --glass-blur: blur(${PERFORMANCE_CONFIG.blurIntensity}px);
            }
            
            .low-performance .glass-panel {
                --glass-blur: blur(4px);
                backdrop-filter: none;
            }
        `;
        document.head.appendChild(style);
        
        // Добавление класса в зависимости от производительности
        document.documentElement.classList.add(
            PERFORMANCE_CONFIG.animationQuality === 'low' ? 'low-performance' :
            PERFORMANCE_CONFIG.animationQuality === 'medium' ? 'medium-performance' :
            'high-performance'
        );
    }
    
    setupIntersectionObserver() {
        // Ленивая загрузка анимаций для элементов в viewport
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateOnScroll(entry.target);
                        this.intersectionObserver.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            }
        );
        
        // Наблюдение за всеми элементами с атрибутами анимации
        document.querySelectorAll('[data-animate], .glass-panel, .neomorphic-btn').forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }
    
    setupScrollEffects() {
        // Параллакс и динамическое размытие при скролле
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Инициализация
        this.updateScrollEffects();
    }
    
    updateScrollEffects() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        // Динамическое размытие для стеклянных панелей
        const blurIntensity = Math.min(20, scrollY * 0.02);
        document.documentElement.style.setProperty(
            '--scroll-blur',
            `blur(${PERFORMANCE_CONFIG.animationQuality === 'high' ? blurIntensity : 0}px)`
        );
        
        // Параллакс для фонов
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
    
    // Spring-анимации (физика Apple)
    springAnimation(element, property, targetValue) {
        let currentValue = parseFloat(getComputedStyle(element)[property]);
        let velocity = 0;
        const tension = 0.6;
        const friction = 0.7;
        
        function animate() {
            const diff = targetValue - currentValue;
            velocity += diff * tension;
            velocity *= friction;
            currentValue += velocity;
            
            element.style[property] = currentValue + 'px';
            
            if (Math.abs(diff) > 0.1 || Math.abs(velocity) > 0.1) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    // Тактильная обратная связь
    registerTactileFeedback() {
        document.addEventListener('mousedown', (e) => {
            const target = e.target.closest('[data-tactile-animation]');
            if (target) {
                this.applyTactileFeedback(target);
            }
        });
        
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('[data-tactile-animation]');
            if (target) {
                this.applyTactileFeedback(target);
            }
        }, { passive: true });
    }
    
    applyTactileFeedback(element) {
        // Мгновенная реакция
        element.style.transform = 'scale(0.98)';
        element.style.opacity = '0.9';
        
        // Плавный возврат с физикой
        setTimeout(() => {
            element.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease';
            element.style.transform = '';
            element.style.opacity = '';
            
            // Удаление transition после завершения
            setTimeout(() => {
                element.style.transition = '';
            }, 300);
        }, 100);
    }
    
    disableIntensiveAnimations() {
        // Отключение ресурсоёмких анимаций
        document.documentElement.style.setProperty('--glass-blur', 'none');
        document.documentElement.style.setProperty('--neon-intensity', '0.3');
        
        // Отключение частиц
        const particleCanvas = document.getElementById('particleCanvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'none';
        }
    }
    
    // API для других модулей
    static getConfig() {
        return PERFORMANCE_CONFIG;
    }
    
    static animate(element, animationType, options = {}) {
        const instance = AnimationCore.instance || new AnimationCore();
        return instance[animationType](element, options);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.AnimationCore = new AnimationCore();
});

export default AnimationCore;