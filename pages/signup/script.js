/**
 * ChronoX - Signup Page Logic
 * Handles user registration with validation and password strength
 * @version 1.0.0
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initSignupPage();
});

/**
 * Initialize signup page
 */
function initSignupPage() {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const passwordInput = document.getElementById('signupPassword');
    const usernameInput = document.getElementById('signupUsername');

    // If already logged in, redirect
    if (auth.isLoggedIn()) {
        router.navigate('/');
        return;
    }

    // Form submission
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }

    // Username live validation
    if (usernameInput) {
        usernameInput.addEventListener('input', debounce(checkUsername, 500));
    }

    // Add animation to features
    animateFeatures();
}

/**
 * Handle signup form submission
 * @param {Event} e
 */
async function handleSignup(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('signupName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Clear errors
    clearErrors();

    // Validate
    if (!validateSignupForm(name, username, email, password, confirmPassword, agreeTerms)) {
        return;
    }

    // Show loading
    setLoadingState(true);

    try {
        // Create user
        const result = await auth.signup({
            displayName: name,
            username: username,
            email: email,
            password: password
        });

        if (result && result.user) {
            toast.success('Account created successfully! Welcome to ChronoX! 🎉');
            
            // Auto login after signup
            setTimeout(() => {
                router.navigate('/');
            }, 1000);
        }
    } catch (error) {
        toast.error(error.message || 'Signup failed. Please try again.');
        
        // Show specific errors
        if (error.message.includes('username')) {
            showError('signupUsername', error.message);
        } else if (error.message.includes('email')) {
            showError('signupEmail', error.message);
        } else {
            showError('signupEmail', error.message);
        }
    } finally {
        setLoadingState(false);
    }
}

/**
 * Validate signup form
 */
function validateSignupForm(name, username, email, password, confirmPassword, agreeTerms) {
    let isValid = true;

    // Name validation
    if (!name) {
        showError('signupName', 'Display name is required');
        isValid = false;
    } else if (name.length < 2) {
        showError('signupName', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Username validation
    if (!username) {
        showError('signupUsername', 'Username is required');
        isValid = false;
    } else if (!isValidUsername(username)) {
        showError('signupUsername', 'Username must be 3-20 characters (letters, numbers, underscore)');
        isValid = false;
    }

    // Email validation
    if (!email) {
        showError('signupEmail', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signupEmail', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (!password) {
        showError('signupPassword', 'Password is required');
        isValid = false;
    } else {
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            showError('signupPassword', passwordCheck.message);
            isValid = false;
        }
    }

    // Confirm password
    if (password !== confirmPassword) {
        showError('signupConfirmPassword', 'Passwords do not match');
        isValid = false;
    }

    // Terms agreement
    if (!agreeTerms) {
        showError('agreeTerms', 'You must agree to the terms');
        isValid = false;
    }

    return isValid;
}

/**
 * Check password strength in real-time
 */
function checkPasswordStrength() {
    const password = document.getElementById('signupPassword').value;
    const bars = [
        document.getElementById('strengthBar1'),
        document.getElementById('strengthBar2'),
        document.getElementById('strengthBar3'),
        document.getElementById('strengthBar4')
    ];
    const strengthText = document.getElementById('strengthText');

    // Reset bars
    bars.forEach(bar => {
        bar.className = 'strength-bar';
    });

    if (!password) {
        strengthText.textContent = '';
        strengthText.className = 'strength-text';
        return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength++;
    
    // Number check
    if (/[0-9]/.test(password)) strength++;
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    // Update bars
    for (let i = 0; i < strength; i++) {
        if (strength <= 2) {
            bars[i].classList.add('weak');
        } else if (strength === 3) {
            bars[i].classList.add('medium');
        } else {
            bars[i].classList.add('strong');
        }
    }

    // Update text
    const messages = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'weak', 'medium', 'strong', 'strong'];
    
    strengthText.textContent = messages[strength] || '';
    strengthText.className = 'strength-text ' + (classes[strength] || '');
}

/**
 * Check username availability
 */
async function checkUsername() {
    const username = document.getElementById('signupUsername').value.trim();
    const hintElement = document.getElementById('usernameHint');

    if (!username || username.length < 3) {
        if (hintElement) hintElement.textContent = '';
        return;
    }

    try {
        const existingUsers = await db.query('users', 'username', username);
        
        if (existingUsers.length > 0) {
            if (hintElement) {
                hintElement.textContent = '❌ Taken';
                hintElement.style.color = 'var(--error)';
            }
        } else {
            if (hintElement) {
                hintElement.textContent = '✅ Available';
                hintElement.style.color = 'var(--success)';
            }
        }
    } catch (error) {
        console.warn('Username check failed:', error);
    }
}

/**
 * Show error for a field
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
 * Clear all errors
 */
function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.style.borderColor = '');
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    const btn = document.getElementById('signupBtn');
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
 * Animate feature items
 */
function animateFeatures() {
    const features = document.querySelectorAll('.auth-feature');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateX(-20px)';
        feature.style.transition = `all 0.5s ease ${index * 0.2}s`;
        
        setTimeout(() => {
            feature.style.opacity = '1';
            feature.style.transform = 'translateX(0)';
        }, 200);
    });
}
