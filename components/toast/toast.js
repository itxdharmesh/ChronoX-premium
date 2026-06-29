/**
 * ChronoX - Toast Notification Component Logic
 * Manages toast notifications with different types and auto-dismiss
 * @version 1.0.0
 */

class ToastComponent {
    constructor() {
        this.wrapper = null;
        this.template = null;
        this.toasts = [];
        this.maxToasts = 5;
        this.defaultDuration = 4000;
        this.initialized = false;
    }

    /**
     * Initialize toast component
     */
    init() {
        this.wrapper = document.getElementById('toastWrapper');
        this.template = document.getElementById('toastTemplate');
        
        if (this.wrapper && this.template) {
            this.initialized = true;
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {Object} options - Additional options
     * @returns {string} Toast ID
     */
    show(message, type = 'info', options = {}) {
        if (!this.initialized) {
            console.warn('Toast component not initialized');
            return null;
        }

        const config = {
            title: options.title || this.getDefaultTitle(type),
            message: message,
            type: type,
            duration: options.duration || this.defaultDuration,
            closable: options.closable !== undefined ? options.closable : true,
            progress: options.progress !== undefined ? options.progress : true,
            action: options.action || null,
            actionText: options.actionText || 'Action',
            onAction: options.onAction || null,
            position: options.position || 'top-right'
        };

        // Create toast element
        const toastElement = this.createToastElement(config);
        
        // Add to wrapper
        this.addToast(toastElement, config);

        // Auto remove after duration
        if (config.duration > 0 && config.type !== 'loading') {
            this.startAutoRemove(toastElement, config.duration, config.progress);
        }

        return toastElement.id;
    }

    /**
     * Show success toast
     * @param {string} message
     * @param {Object} options
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Show error toast
     * @param {string} message
     * @param {Object} options
     */
    error(message, options = {}) {
        return this.show(message, 'error', { ...options, duration: options.duration || 6000 });
    }

    /**
     * Show warning toast
     * @param {string} message
     * @param {Object} options
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Show info toast
     * @param {string} message
     * @param {Object} options
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Show loading toast
     * @param {string} message
     * @param {Object} options
     * @returns {string} Toast ID
     */
    loading(message, options = {}) {
        return this.show(message, 'loading', {
            ...options,
            duration: 0, // Don't auto dismiss
            closable: false,
            progress: false
        });
    }

    /**
     * Dismiss a specific toast
     * @param {string} toastId
     */
    dismiss(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;

        this.removeToast(toast);
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        const toasts = this.wrapper.querySelectorAll('.toast');
        toasts.forEach(toast => this.removeToast(toast));
    }

    /**
     * Create toast DOM element
     * @param {Object} config
     * @returns {Element}
     */
    createToastElement(config) {
        const clone = this.template.content.cloneNode(true);
        const toast = clone.querySelector('.toast');
        
        // Set ID
        const toastId = `toast_${generateUniqueId()}`;
        toast.id = toastId;

        // Set type class
        toast.classList.add(`toast-${config.type}`);

        // Set title
        const title = toast.querySelector('.toast-title');
        title.textContent = config.title;

        // Set message
        const message = toast.querySelector('.toast-message');
        message.textContent = config.message;

        // Show/hide close button
        const closeBtn = toast.querySelector('.toast-close');
        if (!config.closable) {
            closeBtn.style.display = 'none';
        } else {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeToast(toast);
            });
        }

        // Add action button if needed
        if (config.action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'toast-action';
            actionBtn.textContent = config.actionText;
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (config.onAction) config.onAction();
                this.removeToast(toast);
            });
            toast.appendChild(actionBtn);
        }

        // Click to dismiss
        toast.addEventListener('click', () => {
            if (config.closable) {
                this.removeToast(toast);
            }
        });

        return toast;
    }

    /**
     * Add toast to wrapper
     * @param {Element} toast
     * @param {Object} config
     */
    addToast(toast, config) {
        // Set wrapper position
        if (config.position) {
            this.wrapper.className = `toast-wrapper ${config.position}`;
        }

        // Remove oldest toast if max reached
        const existingToasts = this.wrapper.querySelectorAll('.toast');
        if (existingToasts.length >= this.maxToasts) {
            this.removeToast(existingToasts[0]);
        }

        // Add to wrapper
        this.wrapper.appendChild(toast);
        this.toasts.push(toast);
    }

    /**
     * Remove toast with animation
     * @param {Element} toast
     */
    removeToast(toast) {
        if (!toast || toast.classList.contains('removing')) return;

        // Add removing class for animation
        toast.classList.add('removing');

        // Remove after animation
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) {
                toast.remove();
            }
            // Remove from array
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, { once: true });
    }

    /**
     * Start auto-remove timer with progress bar
     * @param {Element} toast
     * @param {number} duration
     * @param {boolean} showProgress
     */
    startAutoRemove(toast, duration, showProgress) {
        if (duration <= 0) return;

        const progressBar = toast.querySelector('.toast-progress-bar');
        let remaining = duration;
        const interval = 50;
        
        if (showProgress && progressBar) {
            progressBar.style.width = '100%';
            
            const timer = setInterval(() => {
                remaining -= interval;
                const progress = (remaining / duration) * 100;
                progressBar.style.width = `${Math.max(progress, 0)}%`;
                
                if (remaining <= 0) {
                    clearInterval(timer);
                    this.removeToast(toast);
                }
            }, interval);
            
            // Pause on hover
            toast.addEventListener('mouseenter', () => {
                clearInterval(timer);
            });
            
            toast.addEventListener('mouseleave', () => {
                // Resume timer logic here if needed
            });
            
        } else {
            // Simple timeout without progress
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }
    }

    /**
     * Get default title based on type
     * @param {string} type
     * @returns {string}
     */
    getDefaultTitle(type) {
        const titles = {
            success: 'Success!',
            error: 'Error!',
            warning: 'Warning!',
            info: 'Info',
            loading: 'Loading...'
        };
        return titles[type] || 'Notification';
    }

    /**
     * Update existing toast
     * @param {string} toastId
     * @param {Object} updates
     */
    update(toastId, updates) {
        const toast = document.getElementById(toastId);
        if (!toast) return;

        if (updates.message) {
            const message = toast.querySelector('.toast-message');
            if (message) message.textContent = updates.message;
        }

        if (updates.title) {
            const title = toast.querySelector('.toast-title');
            if (title) title.textContent = updates.title;
        }

        if (updates.type) {
            toast.className = toast.className.replace(/toast-\w+/, `toast-${updates.type}`);
        }
    }
}

// Create global toast instance
const toast = new ToastComponent();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    toast.init();
});
