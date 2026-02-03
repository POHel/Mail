class AnimationsManager {
    constructor() {
        this.scrollY = 0;
        this.scrollDirection = 'down';
        this.isScrolling = false;
        this.lastScrollTime = 0;
        this.scrollDebounce = 100;
        
        this.init();
    }
    
    init() {
        // Инициализация частиц
        this.initParticles();
        
        // Параллакс эффекты
        this.initParallax();
        
        // Анимации при скролле
        this.initScrollAnimations();
        
        // Интерактивные эффекты
        this.initInteractiveEffects();
        
        // Анимации загрузки
        this.initLoadingAnimations();
    }
    
    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const particleCount = window.innerWidth < 768 ? 50 : 100;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(container);
        }
    }
    
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайные свойства
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        // Цвет в зависимости от темы
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? 
            `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})` :
            `rgba(${Math.random() * 100}, ${Math.random() * 100}, 255, ${Math.random() * 0.2 + 0.05})`;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            box-shadow: 0 0 ${size * 2}px ${color};
            animation: float ${duration}s ease-in-out ${delay}s infinite;
        `;
        
        container.appendChild(particle);
    }
    
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallaxSpeed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    initScrollAnimations() {
        // Обновление glass эффекта при скролле
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // Lazy loading анимации
        this.initLazyAnimations();
    }
    
    handleScroll() {
        const currentScroll = window.pageYOffset;
        const currentTime = Date.now();
        
        // Определяем направление скролла
        this.scrollDirection = currentScroll > this.scrollY ? 'down' : 'up';
        this.scrollY = currentScroll;
        
        // Debounce для производительности
        if (currentTime - this.lastScrollTime > this.scrollDebounce) {
            this.lastScrollTime = currentTime;
            this.updateGlassEffect();
            this.animateOnScroll();
        }
    }
    
    updateGlassEffect() {
        const glassElements = document.querySelectorAll('.scroll-glass');
        const scrollTop = window.pageYOffset;
        
        glassElements.forEach(element => {
            const intensity = Math.min(scrollTop * 0.01, 1);
            element.style.backdropFilter = `blur(${8 + intensity * 8}px)`;
            element.style.opacity = 1 - intensity * 0.1;
            
            if (scrollTop > 50) {
                element.classList.add('scrolled');
            } else {
                element.classList.remove('scrolled');
            }
        });
    }
    
    animateOnScroll() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animated');
            }
        });
    }
    
    initLazyAnimations() {
        // Создаем Intersection Observer для ленивой загрузки анимаций
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Наблюдаем за элементами с атрибутом data-lazy-animate
        document.querySelectorAll('[data-lazy-animate]').forEach(el => {
            observer.observe(el);
        });
    }
    
    initInteractiveEffects() {
        // Эффект нажатия для neumorphic элементов
        document.addEventListener('mousedown', (e) => {
            const target = e.target.closest('.neumorphic-element, .neumorphic-button');
            if (target) {
                target.classList.add('pressed');
            }
        });
        
        document.addEventListener('mouseup', () => {
            document.querySelectorAll('.pressed').forEach(el => {
                el.classList.remove('pressed');
            });
        });
        
        // Эффект волны при клике
        document.addEventListener('click', (e) => {
            this.createRippleEffect(e);
        });
        
        // Анимация при наведении на интерактивные элементы
        this.initHoverAnimations();
    }
    
    createRippleEffect(event) {
        const target = event.target.closest('[data-ripple]');
        if (!target) return;
        
        const ripple = document.createElement('span');
        const rect = target.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(var(--neon-primary-rgb), 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;
        
        target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    initHoverAnimations() {
        // Анимация масштаба при наведении
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-hover-scale]');
            if (target) {
                target.style.transform = 'scale(1.05)';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-hover-scale]');
            if (target) {
                target.style.transform = 'scale(1)';
            }
        });
        
        // Свечение при наведении
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-hover-glow]');
            if (target) {
                target.classList.add('hover-glow');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-hover-glow]');
            if (target) {
                target.classList.remove('hover-glow');
            }
        });
    }
    
    initLoadingAnimations() {
        // Анимация появления страницы
        this.playPageEnterAnimation();
        
        // Анимация загрузки
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hideLoading();
            }, 500);
        });
    }
    
    playPageEnterAnimation() {
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    // Продвинутые анимации
    springAnimation(element, property, targetValue) {
        let currentValue = parseFloat(getComputedStyle(element)[property]);
        let velocity = 0;
        const stiffness = 180;
        const damping = 12;
        const precision = 0.01;
        
        const animate = () => {
            const force = (targetValue - currentValue) * stiffness;
            velocity += force * 0.016; // 60fps
            velocity *= (1 - damping * 0.016);
            currentValue += velocity * 0.016;
            
            element.style[property] = currentValue + 'px';
            
            if (Math.abs(targetValue - currentValue) > precision || Math.abs(velocity) > precision) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // Анимация морфинга
    morphElement(fromElement, toElement, duration = 300) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        const clone = fromElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = fromRect.top + 'px';
        clone.style.left = fromRect.left + 'px';
        clone.style.width = fromRect.width + 'px';
        clone.style.height = fromRect.height + 'px';
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none';
        
        document.body.appendChild(clone);
        
        // Анимация
        clone.animate([
            {
                top: fromRect.top + 'px',
                left: fromRect.left + 'px',
                width: fromRect.width + 'px',
                height: fromRect.height + 'px',
                borderRadius: '16px'
            },
            {
                top: toRect.top + 'px',
                left: toRect.left + 'px',
                width: toRect.width + 'px',
                height: toRect.height + 'px',
                borderRadius: '8px'
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }).onfinish = () => {
            clone.remove();
        };
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.animationsManager = new AnimationsManager();
    
    // Добавляем CSS для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .theme-transition-flash {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            opacity: 0;
            animation: flash 0.5s ease;
            pointer-events: none;
            z-index: 9999;
        }
        
        @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 0.3; }
            100% { opacity: 0; }
        }
        
        .accent-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(var(--neon-primary-rgb), 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
        }
        
        .hover-glow {
            box-shadow: 0 0 20px rgba(var(--neon-primary-rgb), 0.3);
        }
        
        [data-lazy-animate] {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        [data-lazy-animate].animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});