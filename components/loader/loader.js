/**
 * ChronoX - Loader Component Logic
 * Manages loading states, skeleton screens, and progress tracking
 * @version 1.0.0
 */

class LoaderComponent {
    constructor() {
        this.globalLoader = null;
        this.progressBar = null;
        this.messageElement = null;
        this.initialized = false;
    }

    /**
     * Initialize loader
     */
    init() {
        this.globalLoader = document.getElementById('globalLoader');
        this.progressBar = document.getElementById('loaderProgressBar');
        this.messageElement = document.getElementById('loaderMessage');
        
        if (this.globalLoader) {
            this.initialized = true;
        }
    }

    /**
     * Show global loader
     * @param {string} message - Loading message
     */
    show(message = 'Loading...') {
        if (!this.globalLoader) return;
        
        this.globalLoader.style.display = 'flex';
        this.setMessage(message);
        this.resetProgress();
    }

    /**
     * Hide global loader
     */
    hide() {
        if (!this.globalLoader) return;
        
        // Fade out animation
        this.globalLoader.style.opacity = '0';
        this.globalLoader.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            this.globalLoader.style.display = 'none';
            this.globalLoader.style.opacity = '1';
        }, 300);
    }

    /**
     * Set loader message
     * @param {string} message
     */
    setMessage(message) {
        if (this.messageElement) {
            this.messageElement.textContent = message;
        }
    }

    /**
     * Update progress bar
     * @param {number} percentage - Progress (0-100)
     */
    setProgress(percentage) {
        if (this.progressBar) {
            // Remove indeterminate animation
            this.progressBar.style.animation = 'none';
            this.progressBar.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
        }
    }

    /**
     * Reset progress bar to indeterminate
     */
    resetProgress() {
        if (this.progressBar) {
            this.progressBar.style.animation = '';
            this.progressBar.style.width = '0%';
        }
    }

    /**
     * Show loading state on button
     * @param {Element} button
     * @param {string} text - Loading text
     */
    showButtonLoader(button, text = 'Loading...') {
        if (!button) return;

        // Save original text
        button.dataset.originalText = button.textContent;
        
        // Disable button
        button.disabled = true;
        button.classList.add('btn-loader');
        
        // Add spinner and text
        button.innerHTML = `
            <span class="btn-spinner"></span>
            <span>${text}</span>
        `;
    }

    /**
     * Hide loading state on button
     * @param {Element} button
     */
    hideButtonLoader(button) {
        if (!button) return;

        // Restore original state
        button.disabled = false;
        button.classList.remove('btn-loader');
        button.textContent = button.dataset.originalText || 'Submit';
        delete button.dataset.originalText;
    }

    /**
     * Create skeleton cards
     * @param {Element} container - Container element
     * @param {number} count - Number of skeleton cards
     */
    createSkeletonCards(container, count = 3) {
        if (!container) return;

        const template = document.getElementById('skeletonCard');
        if (!template) return;

        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const clone = template.content.cloneNode(true);
            container.appendChild(clone);
        }
    }

    /**
     * Create skeleton profile
     * @param {Element} container
     */
    createSkeletonProfile(container) {
        if (!container) return;

        const template = document.getElementById('skeletonProfile');
        if (!template) return;

        container.innerHTML = '';
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
    }

    /**
     * Create skeleton list
     * @param {Element} container
     * @param {number} count
     */
    createSkeletonList(container, count = 5) {
        if (!container) return;

        const template = document.getElementById('skeletonList');
        if (!template) return;

        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const clone = template.content.cloneNode(true);
            container.appendChild(clone);
        }
    }

    /**
     * Show page loader in main content area
     */
    showPageLoader() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="page-loader">
                <div class="loader-spinner"></div>
            </div>
        `;
    }

    /**
     * Simulate loading progress (for demo/testing)
     * @param {number} duration - Total duration in ms
     * @param {Function} callback - Called when complete
     */
    simulateProgress(duration = 2000, callback = null) {
        this.show('Loading ChronoX...');
        
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = (currentStep / steps) * 100;
            
            // Simulate uneven progress
            const unevenProgress = progress + Math.sin(progress / 10) * 20;
            this.setProgress(Math.min(unevenProgress, 100));

            // Update messages based on progress
            if (progress < 30) {
                this.setMessage('Loading assets...');
            } else if (progress < 60) {
                this.setMessage('Setting up workspace...');
            } else if (progress < 90) {
                this.setMessage('Almost ready...');
            } else {
                this.setMessage('Welcome to ChronoX!');
            }

            if (currentStep >= steps) {
                clearInterval(timer);
                this.setProgress(100);
                
                setTimeout(() => {
                    this.hide();
                    if (callback) callback();
                }, 300);
            }
        }, interval);
    }

    /**
     * Show inline loader in any container
     * @param {Element} container
     * @param {string} message
     */
    showInlineLoader(container, message = 'Loading...') {
        if (!container) return;

        container.innerHTML = `
            <div class="page-loader">
                <div class="loader-spinner"></div>
            </div>
            <p class="text-center text-muted mt-4">${message}</p>
        `;
    }

    /**
     * Remove all skeletons and loaders from container
     * @param {Element} container
     */
    clearContainer(container) {
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Create global loader instance
const loader = new LoaderComponent();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loader.init();
});
