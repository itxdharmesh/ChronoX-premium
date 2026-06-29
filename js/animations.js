/**
 * ChronoX - Animation Manager
 * Handles scroll animations, page transitions, and micro-interactions
 * @version 1.0.0
 */

class AnimationManager {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
        this.initIntersectionObserver();
    }

    /**
     * Initialize Intersection Observer for scroll animations
     */
    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.animation || 'fadeInUp';
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add(`animate-${animation}`);
                        element.style.opacity = '1';
                    }, delay);
                    
                    this.observer.unobserve(element);
                    this.animatedElements.add(element);
                }
            });
        }, options);
    }

    /**
     * Observe elements for scroll animation
     * @param {string} selector - CSS selector for elements to animate
     */
    observeElements(selector = '[data-animation]') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.opacity = '0';
            this.observer.observe(element);
        });
    }

    /**
     * Fade in element
     * @param {Element} element
     * @param {number} duration
     * @returns {Promise}
     */
    fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        });
    }

    /**
     * Fade out element
     * @param {Element} element
     * @param {number} duration
     * @returns {Promise}
     */
    fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    /**
     * Slide in from direction
     * @param {Element} element
     * @param {string} direction - 'left', 'right', 'up', 'down'
     * @param {number} duration
     */
    slideIn(element, direction = 'left', duration = 300) {
        const directionMap = {
            left: { transform: 'translateX(-100%)' },
            right: { transform: 'translateX(100%)' },
            up: { transform: 'translateY(-100%)' },
            down: { transform: 'translateY(100%)' }
        };

        element.style.transition = `transform ${duration}ms ease`;
        Object.assign(element.style, directionMap[direction]);
        
        requestAnimationFrame(() => {
            element.style.transform = 'translate(0)';
        });
    }

    /**
     * Slide out to direction
     * @param {Element} element
     * @param {string} direction
     * @param {number} duration
     */
    slideOut(element, direction = 'right', duration = 300) {
        const directionMap = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };

        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = directionMap[direction];
    }

    /**
     * Scale element
     * @param {Element} element
     * @param {number} scale
     * @param {number} duration
     */
    scale(element, scale = 1.1, duration = 200) {
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `scale(${scale})`;
    }

    /**
     * Reset element transform
     * @param {Element} element
     */
    resetTransform(element) {
        element.style.transform = '';
        element.style.transition = '';
    }

    /**
     * Shake element (for error states)
     * @param {Element} element
     */
    shake(element) {
        element.classList.add('animate-shake');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate-shake');
        }, { once: true });
    }

    /**
     * Pulse element
     * @param {Element} element
     * @param {boolean} infinite
     */
    pulse(element, infinite = false) {
        if (infinite) {
            element.classList.add('animate-pulse');
        } else {
            element.classList.add('animate-pulse');
            element.addEventListener('animationend', () => {
                element.classList.remove('animate-pulse');
            }, { once: true });
        }
    }

    /**
     * Bounce element
     * @param {Element} element
     */
    bounce(element) {
        element.classList.add('animate-bounce-in');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate-bounce-in');
        }, { once: true });
    }

    /**
     * Ripple effect on click
     * @param {Event} event
     * @param {string} color
     */
    createRipple(event, color = 'rgba(255, 255, 255, 0.3)') {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = color;
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    /**
     * Typewriter effect
     * @param {Element} element
     * @param {string} text
     * @param {number} speed
     * @returns {Promise}
     */
    async typeWriter(element, text, speed = 50) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    /**
     * Number counter animation
     * @param {Element} element
     * @param {number} target
     * @param {number} duration
     */
    countUp(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * (target - start) + start);
            
            element.textContent = formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = formatNumber(target);
            }
        };

        requestAnimationFrame(update);
    }

    /**
     * Smooth scroll to element
     * @param {Element|string} target
     * @param {number} offset
     */
    scrollTo(target, offset = 0) {
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }

        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Stagger animation for list items
     * @param {string} selector
     * @param {string} animation
     * @param {number} staggerDelay
     */
    staggerAnimation(selector, animation = 'fadeInUp', staggerDelay = 100) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.dataset.animation = animation;
            element.dataset.delay = index * staggerDelay;
            this.observer.observe(element);
        });
    }

    /**
     * Page transition effect
     * @param {string} type - 'fade', 'slide', 'scale'
     * @returns {Promise}
     */
    async pageTransition(type = 'fade') {
        const content = document.getElementById('main-content');
        
        switch (type) {
            case 'fade':
                await this.fadeOut(content, 200);
                await this.fadeIn(content, 200);
                break;
            case 'slide':
                this.slideOut(content, 'right', 200);
                await new Promise(resolve => setTimeout(resolve, 200));
                this.slideIn(content, 'left', 200);
                break;
            case 'scale':
                this.scale(content, 0.95, 200);
                await new Promise(resolve => setTimeout(resolve, 200));
                this.scale(content, 1, 200);
                break;
        }
    }
}

// Create global animation instance
const animator = new AnimationManager();
