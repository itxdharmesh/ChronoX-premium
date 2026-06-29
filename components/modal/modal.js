/**
 * ChronoX - Modal Component Logic
 * Manages modal dialogs, confirmations, and custom content
 * @version 1.0.0
 */

class ModalComponent {
    constructor() {
        this.overlay = null;
        this.container = null;
        this.title = null;
        this.body = null;
        this.footer = null;
        this.closeBtn = null;
        this.cancelBtn = null;
        this.confirmBtn = null;
        
        this.isOpen = false;
        this.onConfirm = null;
        this.onCancel = null;
        this.initialized = false;
    }

    /**
     * Initialize modal component
     */
    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.container = document.getElementById('modalContainer');
        this.title = document.getElementById('modalTitle');
        this.body = document.getElementById('modalBody');
        this.footer = document.getElementById('modalFooter');
        this.closeBtn = document.getElementById('modalClose');
        this.cancelBtn = document.getElementById('modalCancelBtn');
        this.confirmBtn = document.getElementById('modalConfirmBtn');

        if (!this.overlay || !this.container) return;

        // Setup close handlers
        this.setupCloseHandlers();
        
        this.initialized = true;
    }

    /**
     * Setup modal close handlers
     */
    setupCloseHandlers() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Click overlay to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Cancel button
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                if (this.onCancel) this.onCancel();
                this.close();
            });
        }

        // Confirm button
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => {
                if (this.onConfirm) this.onConfirm();
                this.close();
            });
        }
    }

    /**
     * Open modal
     * @param {Object} options
     */
    open(options = {}) {
        if (!this.initialized) {
            console.warn('Modal not initialized');
            return;
        }

        const config = {
            title: options.title || 'Modal',
            content: options.content || '',
            showFooter: options.showFooter !== undefined ? options.showFooter : false,
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            confirmClass: options.confirmClass || 'btn-primary',
            cancelClass: options.cancelClass || 'btn-secondary',
            size: options.size || '',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            onClose: options.onClose || null,
            closable: options.closable !== undefined ? options.closable : true
        };

        // Set callbacks
        this.onConfirm = config.onConfirm;
        this.onCancel = config.onCancel;

        // Set title
        if (this.title) {
            this.title.textContent = config.title;
        }

        // Set content
        if (this.body) {
            if (typeof config.content === 'string') {
                this.body.innerHTML = config.content;
            } else if (config.content instanceof Element) {
                this.body.innerHTML = '';
                this.body.appendChild(config.content);
            }
        }

        // Show/hide close button
        if (this.closeBtn) {
            this.closeBtn.style.display = config.closable ? 'flex' : 'none';
        }

        // Show/hide footer
        if (this.footer) {
            this.footer.style.display = config.showFooter ? 'flex' : 'none';
        }

        // Set button text
        if (this.confirmBtn) {
            this.confirmBtn.textContent = config.confirmText;
            this.confirmBtn.className = `btn ${config.confirmClass}`;
        }

        if (this.cancelBtn) {
            this.cancelBtn.textContent = config.cancelText;
            this.cancelBtn.className = `btn ${config.cancelClass}`;
        }

        // Set size
        if (this.container) {
            this.container.className = 'modal-container glass';
            if (config.size) {
                this.container.classList.add(`modal-${config.size}`);
            }
        }

        // Show modal
        this.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.isOpen = true;

        // Focus trap
        this.container.focus();
    }

    /**
     * Close modal
     */
    close() {
        if (!this.isOpen) return;

        // Add closing animation
        this.overlay.classList.add('closing');
        this.container.classList.add('closing');

        // Remove after animation
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.overlay.classList.remove('closing');
            this.container.classList.remove('closing');
            document.body.style.overflow = '';
            this.isOpen = false;
            this.onConfirm = null;
            this.onCancel = null;
        }, 200);
    }

    /**
     * Show confirm dialog
     * @param {Object} options
     */
    confirm(options = {}) {
        const template = document.getElementById('confirmTemplate');
        let content = '';
        
        if (template) {
            const clone = template.content.cloneNode(true);
            const message = clone.querySelector('.modal-message');
            message.textContent = options.message || 'Are you sure?';
            
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(clone);
            content = tempDiv.innerHTML;
        }

        this.open({
            title: options.title || 'Confirm',
            content: content,
            showFooter: true,
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            confirmClass: options.confirmClass || 'btn-primary',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null
        });
    }

    /**
     * Show alert dialog
     * @param {Object} options
     */
    alert(options = {}) {
        const template = document.getElementById('alertTemplate');
        let content = '';
        
        if (template) {
            const clone = template.content.cloneNode(true);
            const message = clone.querySelector('.modal-message');
            message.textContent = options.message || 'Alert message';
            
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(clone);
            content = tempDiv.innerHTML;
        }

        this.open({
            title: options.title || 'Alert',
            content: content,
            showFooter: true,
            confirmText: options.confirmText || 'OK',
            cancelText: '',
            confirmClass: options.confirmClass || 'btn-primary',
            onConfirm: options.onConfirm || null
        });

        // Hide cancel button for alerts
        if (this.cancelBtn) {
            this.cancelBtn.style.display = 'none';
        }
    }

    /**
     * Show custom HTML content
     * @param {Object} options
     */
    custom(options = {}) {
        this.open({
            title: options.title || '',
            content: options.content || '',
            showFooter: options.showFooter || false,
            confirmText: options.confirmText || 'Save',
            cancelText: options.cancelText || 'Cancel',
            size: options.size || '',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            closable: options.closable !== undefined ? options.closable : true
        });
    }

    /**
     * Show image preview modal
     * @param {string} imageSrc
     * @param {Object} options
     */
    previewImage(imageSrc, options = {}) {
        const template = document.getElementById('imagePreviewTemplate');
        
        if (template) {
            const clone = template.content.cloneNode(true);
            const img = clone.querySelector('#modalPreviewImage');
            img.src = imageSrc;
            img.alt = options.alt || 'Preview';

            // Add event listeners after modal opens
            const onOpen = () => {
                const zoomBtn = document.getElementById('modalZoomIn');
                const downloadBtn = document.getElementById('modalDownload');
                
                if (zoomBtn) {
                    zoomBtn.addEventListener('click', () => {
                        window.open(imageSrc, '_blank');
                    });
                }
                
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', () => {
                        const link = document.createElement('a');
                        link.href = imageSrc;
                        link.download = options.filename || 'image';
                        link.click();
                    });
                }
            };

            const tempDiv = document.createElement('div');
            tempDiv.appendChild(clone);
            
            this.open({
                title: options.title || 'Image Preview',
                content: tempDiv.innerHTML,
                size: 'lg',
                onConfirm: onOpen
            });
        }
    }

    /**
     * Show loading state in modal
     * @param {string} message
     */
    showLoading(message = 'Loading...') {
        this.open({
            title: 'Please Wait',
            content: `
                <div class="text-center py-8">
                    <div class="loader-spinner mx-auto mb-4"></div>
                    <p class="text-muted">${message}</p>
                </div>
            `,
            closable: false
        });
    }

    /**
     * Update modal content
     * @param {string|Element} content
     */
    updateContent(content) {
        if (!this.isOpen || !this.body) return;

        if (typeof content === 'string') {
            this.body.innerHTML = content;
        } else if (content instanceof Element) {
            this.body.innerHTML = '';
            this.body.appendChild(content);
        }
    }

    /**
     * Update modal title
     * @param {string} title
     */
    updateTitle(title) {
        if (this.title) {
            this.title.textContent = title;
        }
    }

    /**
     * Set footer buttons
     * @param {Array} buttons
     */
    setButtons(buttons) {
        if (!this.footer) return;

        this.footer.innerHTML = '';
        this.footer.style.display = 'flex';

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class || 'btn-secondary'}`;
            button.textContent = btn.text;
            button.addEventListener('click', () => {
                if (btn.onClick) btn.onClick();
                if (btn.closeOnClick !== false) this.close();
            });
            this.footer.appendChild(button);
        });
    }
}

// Create global modal instance
const modal = new ModalComponent();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    modal.init();
});
