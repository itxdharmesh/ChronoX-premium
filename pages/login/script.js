/**
 * ChronoX - Login Page Logic
 * Handles user authentication and form validation
 * @version 1.0.0
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
});

/**
 * Initialize login page
 */
function initLoginPage() {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    const passwordToggle = document.getElementById('passwordToggle');
    const rememberMe = document.getElementById('rememberMe');

    // If user is already logged in, redirect to home
    if (auth.isLoggedIn()) {
        router.navigate('/');
        return;
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Demo login
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', handleDemoLogin);
    }

    // Password visibility toggle
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePasswordVisibility);
    }

    // Check for saved credentials
    loadSavedCredentials();
}

/**
 * Handle login form submission
 * @param {Event} e - Submit event
 */
async function handleLogin(e) {
    e.preventDefault();

    // Get form values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    // Clear previous errors
    clearErrors();

    // Validate inputs
    if (!validateLoginForm(email, password)) {
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        // Attempt login
        const result = await auth.login(email, password, remember);

        if (result && result.user) {
            // Success
            toast.success('Welcome back, ' + (result.user.displayName || result.user.username) + '!');
            
            // Redirect to home or saved redirect
            const redirectUrl = storage.get('redirectAfterLogin', '/');
            storage.remove('redirectAfterLogin');
            
            setTimeout(() => {
                router.navigate(redirectUrl);
            }, 500);
        }
    } catch (error) {
        // Handle errors
        toast.error(error.message || 'Login failed. Please try again.');
        showError('loginEmail', error.message);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handle demo account login
 */
async function handleDemoLogin() {
    // Set demo credentials
    document.getElementById('loginEmail').value = 'demo@chronox.app';
    document.getElementById('loginPassword').value = 'Demo@123';
    
    // Trigger form submission
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

/**
 * Validate login form
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
function validateLoginForm(email, password) {
    let isValid = true;

    // Validate email/username
    if (!email) {
        showError('loginEmail', 'Email or username is required');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('loginPassword', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('loginPassword', 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const icon = document.querySelector('#passwordToggle svg');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Show "eye-off" icon
        icon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        // Show "eye" icon
        icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

/**
 * Show error message for a field
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
        inputElement.classList.add('animate-shake');
        inputElement.addEventListener('animationend', () => {
            inputElement.classList.remove('animate-shake');
        }, { once: true });
    }
}

/**
 * Clear all form errors
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.textContent = '');

    const inputElements = document.querySelectorAll('.form-input');
    inputElements.forEach(el => el.style.borderColor = '');
}

/**
 * Set loading state for submit button
 * @param {boolean} loading
 */
function setLoadingState(loading) {
    const btn = document.getElementById('loginBtn');
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
 * Load saved credentials if "Remember Me" was checked
 */
function loadSavedCredentials() {
    const savedEmail = storage.get('savedEmail');
    const savedRemember = storage.get('rememberMe');

    if (savedEmail && savedRemember) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

/**
 * Save credentials if "Remember Me" is checked
 * @param {string} email
 */
function saveCredentials(email) {
    const remember = document.getElementById('rememberMe').checked;
    
    if (remember) {
        storage.set('savedEmail', email);
        storage.set('rememberMe', true);
    } else {
        storage.remove('savedEmail');
        storage.set('rememberMe', false);
    }
}

/**
 * Handle Enter key press
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && window.location.hash === '#/login') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});
