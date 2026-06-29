/**
 * ChronoX - Forgot Password Page Logic
 * Handles password reset request flow
 * @version 1.0.0
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initForgotPasswordPage();
});

/**
 * Initialize forgot password page
 */
function initForgotPasswordPage() {
    const forgotForm = document.getElementById('forgotForm');
    const resetBtn = document.getElementById('resetBtn');
    const resendBtn = document.getElementById('resendBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');

    // If already logged in, redirect
    if (auth.isLoggedIn()) {
        router.navigate('/');
        return;
    }

    // Form submission
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleResetRequest);
    }

    // Resend button
    if (resendBtn) {
        resendBtn.addEventListener('click', handleResend);
    }

    // Back to login
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            router.navigate('/login');
        });
    }

    // Add subtle animation
    animatePage();
}

/**
 * Handle password reset request
 * @param {Event} e
 */
async function handleResetRequest(e) {
    e.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();

    // Clear errors
    clearErrors();

    // Validate email
    if (!validateEmail(email)) {
        return;
    }

    // Show loading
    setLoadingState(true);

    try {
        // Attempt to send reset email
        await auth.resetPassword(email);

        // Show success message
        showSuccessMessage(email);

        // Log the action (for demo)
        console.log(`Password reset requested for: ${email}`);
        
    } catch (error) {
        // Handle errors gracefully
        if (error.message.includes('No account')) {
            // Don't reveal if account exists or not (security best practice)
            // Still show success message to prevent email enumeration
            showSuccessMessage(email);
        } else {
            toast.error(error.message || 'Failed to send reset link');
            showError('forgotEmail', error.message);
        }
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handle resend button click
 */
async function handleResend() {
    const email = document.getElementById('sentEmail').textContent;
    
    if (!email) return;

    const resendBtn = document.getElementById('resendBtn');
    const originalText = resendBtn.textContent;
    
    // Update button state
    resendBtn.disabled = true;
    resendBtn.textContent = 'Resending...';

    try {
        await auth.resetPassword(email);
        toast.success('Reset link resent successfully');
        
        // Start cooldown timer
        startResendCooldown(resendBtn);
        
    } catch (error) {
        toast.error('Failed to resend. Please try again.');
        resendBtn.disabled = false;
        resendBtn.textContent = originalText;
    }
}

/**
 * Validate email address
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
    if (!email) {
        showError('forgotEmail', 'Email address is required');
        return false;
    }

    if (!isValidEmail(email)) {
        showError('forgotEmail', 'Please enter a valid email address');
        return false;
    }

    return true;
}

/**
 * Show success message after request
 * @param {string} email
 */
function showSuccessMessage(email) {
    const forgotForm = document.getElementById('forgotForm');
    const successMessage = document.getElementById('successMessage');
    const sentEmail = document.getElementById('sentEmail');

    // Hide form
    if (forgotForm) {
        forgotForm.style.display = 'none';
    }

    // Show success
    if (successMessage) {
        successMessage.style.display = 'block';
    }

    // Set email
    if (sentEmail) {
        sentEmail.textContent = email;
    }

    // Start resend cooldown
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
        startResendCooldown(resendBtn);
    }
}

/**
 * Start cooldown timer for resend button
 * @param {Element} button
 */
function startResendCooldown(button) {
    let cooldown = 30;
    button.disabled = true;

    const timer = setInterval(() => {
        cooldown--;
        button.textContent = `Resend in ${cooldown}s`;

        if (cooldown <= 0) {
            clearInterval(timer);
            button.textContent = 'click here to resend';
            button.disabled = false;
        }
    }, 1000);
}

/**
 * Show error for a field
 * @param {string} fieldId
 * @param {string} message
 */
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
    }

    if (inputElement) {
        inputElement.style.borderColor = 'var(--error)';
        animator.shake(inputElement);
    }
}

/**
 * Clear all form errors
 */
function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.style.borderColor = '');
}

/**
 * Set loading state for submit button
 * @param {boolean} loading
 */
function setLoadingState(loading) {
    const btn = document.getElementById('resetBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    if (loading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/**
 * Animate page elements on load
 */
function animatePage() {
    const elements = document.querySelectorAll('.auth-icon, .auth-title, .auth-subtitle, .auth-form');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    });
}

/**
 * Handle Enter key press
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && window.location.hash === '#/forgot-password') {
        const form = document.getElementById('forgotForm');
        if (form && form.style.display !== 'none') {
            form.dispatchEvent(new Event('submit'));
        }
    }
});
