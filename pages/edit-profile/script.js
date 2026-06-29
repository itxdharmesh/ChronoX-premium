/**
 * ChronoX - Edit Profile Page Logic
 * Handles profile editing, image uploads, and settings
 * @version 1.0.0
 */

let newBanner = null;
let newAvatar = null;

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initEditProfilePage();
});

/**
 * Initialize edit profile page
 */
function initEditProfilePage() {
    // Check auth
    if (!auth.isLoggedIn()) {
        router.navigate('/login');
        return;
    }

    // Load current user data
    loadUserData();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Load current user data into form
 */
function loadUserData() {
    const user = auth.getCurrentUser();
    if (!user) return;

    // Set basic info
    setInputValue('editDisplayName', user.displayName || '');
    setInputValue('editUsername', user.username || '');
    setInputValue('editEmail', user.email || '');
    setInputValue('editBio', user.bio || '');
    setInputValue('editWebsite', user.website || '');
    setInputValue('editTwitter', user.twitter || '');
    setInputValue('editGithub', user.github || '');

    // Set banner preview
    const bannerPreview = document.getElementById('editBannerPreview');
    if (bannerPreview) {
        bannerPreview.src = user.banner || 'assets/backgrounds/default-banner.png';
    }

    // Set avatar preview
    const avatarPreview = document.getElementById('editAvatarPreview');
    if (avatarPreview) {
        avatarPreview.src = user.avatar || 'assets/avatars/default.png';
    }

    // Set privacy settings
    setCheckboxValue('editPrivateProfile', user.isPrivate || false);
    setCheckboxValue('editShowGameActivity', user.showGameActivity !== false);
    setCheckboxValue('editShowOnlineStatus', user.showOnlineStatus !== false);

    // Set game genres
    if (user.gameGenres) {
        user.gameGenres.forEach(genre => {
            const checkbox = document.querySelector(`#gameGenres input[value="${genre}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Update character count
    updateBioCharCount();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', handleSaveProfile);
    }

    // Banner change
    const changeBannerBtn = document.getElementById('changeBannerEditBtn');
    const bannerFileInput = document.getElementById('bannerFileInput');
    
    changeBannerBtn?.addEventListener('click', () => bannerFileInput?.click());
    bannerFileInput?.addEventListener('change', handleBannerSelect);

    // Avatar change
    const changeAvatarBtn = document.getElementById('changeAvatarEditBtn');
    const removeAvatarBtn = document.getElementById('removeAvatarEditBtn');
    const avatarFileInput = document.getElementById('avatarFileInput');
    
    changeAvatarBtn?.addEventListener('click', () => avatarFileInput?.click());
    removeAvatarBtn?.addEventListener('click', handleRemoveAvatar);
    avatarFileInput?.addEventListener('change', handleAvatarSelect);

    // Bio character counter
    const bioTextarea = document.getElementById('editBio');
    bioTextarea?.addEventListener('input', updateBioCharCount);

    // Real-time validation
    const displayNameInput = document.getElementById('editDisplayName');
    displayNameInput?.addEventListener('input', () => {
        validateField('editDisplayName', displayNameInput.value.trim().length >= 2, 
            'Display name must be at least 2 characters');
    });
}

/**
 * Handle banner image selection
 * @param {Event} e
 */
function handleBannerSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        newBanner = event.target.result;
        const preview = document.getElementById('editBannerPreview');
        if (preview) {
            preview.src = newBanner;
            animator.fadeIn(preview, 300);
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Handle avatar image selection
 * @param {Event} e
 */
function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        newAvatar = event.target.result;
        const preview = document.getElementById('editAvatarPreview');
        if (preview) {
            preview.src = newAvatar;
            animator.bounce(preview);
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Handle remove avatar
 */
function handleRemoveAvatar() {
    newAvatar = 'assets/avatars/default.png';
    const preview = document.getElementById('editAvatarPreview');
    if (preview) {
        preview.src = newAvatar;
        toast.info('Avatar removed');
    }
}

/**
 * Update bio character count
 */
function updateBioCharCount() {
    const bioTextarea = document.getElementById('editBio');
    const charCount = document.getElementById('bioCharCount');
    
    if (bioTextarea && charCount) {
        const count = bioTextarea.value.length;
        charCount.textContent = count;
        
        // Change color when near limit
        if (count > 180) {
            charCount.style.color = 'var(--warning)';
        } else if (count > 195) {
            charCount.style.color = 'var(--error)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    }
}

/**
 * Handle save profile
 * @param {Event} e
 */
async function handleSaveProfile(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Show loading state
    setSavingState(true);

    try {
        // Collect form data
        const updates = {
            displayName: getInputValue('editDisplayName').trim(),
            bio: getInputValue('editBio').trim(),
            website: getInputValue('editWebsite').trim(),
            twitter: getInputValue('editTwitter').trim(),
            github: getInputValue('editGithub').trim(),
            isPrivate: getCheckboxValue('editPrivateProfile'),
            showGameActivity: getCheckboxValue('editShowGameActivity'),
            showOnlineStatus: getCheckboxValue('editShowOnlineStatus'),
            gameGenres: getSelectedGenres()
        };

        // Add new banner if changed
        if (newBanner) {
            updates.banner = newBanner;
        }

        // Add new avatar if changed
        if (newAvatar) {
            updates.avatar = newAvatar;
        }

        // Update profile
        const updatedUser = await auth.updateProfile(updates);

        if (updatedUser) {
            toast.success('Profile updated successfully!');
            
            // Update all avatar displays
            if (newAvatar) {
                updateAllAvatars(newAvatar);
            }

            // Redirect back to profile
            setTimeout(() => {
                router.navigate(`/profile/${auth.getCurrentUser().id}`);
            }, 500);
        }

    } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error(error.message || 'Failed to update profile');
    } finally {
        setSavingState(false);
    }
}

/**
 * Validate entire form
 * @returns {boolean}
 */
function validateForm() {
    let isValid = true;

    // Validate display name
    const displayName = getInputValue('editDisplayName').trim();
    if (!displayName) {
        showFieldError('editDisplayName', 'Display name is required');
        isValid = false;
    } else if (displayName.length < 2) {
        showFieldError('editDisplayName', 'Display name must be at least 2 characters');
        isValid = false;
    } else {
        clearFieldError('editDisplayName');
    }

    // Validate bio length
    const bio = getInputValue('editBio').trim();
    if (bio.length > 200) {
        showFieldError('editBio', 'Bio must be under 200 characters');
        isValid = false;
    } else {
        clearFieldError('editBio');
    }

    // Validate website URL
    const website = getInputValue('editWebsite').trim();
    if (website && !isValidUrl(website)) {
        showFieldError('editWebsite', 'Please enter a valid URL');
        isValid = false;
    } else {
        clearFieldError('editWebsite');
    }

    return isValid;
}

/**
 * Validate a single field
 * @param {string} fieldId
 * @param {boolean} condition
 * @param {string} errorMessage
 */
function validateField(fieldId, condition, errorMessage) {
    if (!condition) {
        showFieldError(fieldId, errorMessage);
    } else {
        clearFieldError(fieldId);
    }
}

/**
 * Show field error
 * @param {string} fieldId
 * @param {string} message
 */
function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.style.borderColor = 'var(--error)';
    }

    // Create or update error message
    let errorEl = input?.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('field-error')) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.style.cssText = `
            display: block;
            font-size: var(--text-xs);
            color: var(--error);
            margin-top: var(--space-1);
        `;
        input?.parentNode?.insertBefore(errorEl, input.nextSibling);
    }
    errorEl.textContent = message;
}

/**
 * Clear field error
 * @param {string} fieldId
 */
function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.style.borderColor = '';
    }

    // Remove error message
    const errorEl = input?.parentNode?.querySelector('.field-error');
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Get selected game genres
 * @returns {string[]}
 */
function getSelectedGenres() {
    const checkboxes = document.querySelectorAll('#gameGenres input:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Update all avatar displays
 * @param {string} avatarUrl
 */
function updateAllAvatars(avatarUrl) {
    const avatarElements = document.querySelectorAll('#profileAvatar, #sidebarAvatar, #navbarAvatar, #homeAvatar');
    avatarElements.forEach(img => {
        if (img) img.src = avatarUrl;
    });
}

/**
 * Set saving state
 * @param {boolean} saving
 */
function setSavingState(saving) {
    const btn = document.getElementById('saveProfileBtn');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoader = btn?.querySelector('.btn-loader');

    if (btn) {
        btn.disabled = saving;
        if (btnText) btnText.style.display = saving ? 'none' : 'block';
        if (btnLoader) btnLoader.style.display = saving ? 'flex' : 'none';
    }
}

/**
 * Helper: Get input value
 * @param {string} id
 * @returns {string}
 */
function getInputValue(id) {
    return document.getElementById(id)?.value || '';
}

/**
 * Helper: Set input value
 * @param {string} id
 * @param {string} value
 */
function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value;
}

/**
 * Helper: Get checkbox value
 * @param {string} id
 * @returns {boolean}
 */
function getCheckboxValue(id) {
    return document.getElementById(id)?.checked || false;
}

/**
 * Helper: Set checkbox value
 * @param {string} id
 * @param {boolean} checked
 */
function setCheckboxValue(id, checked) {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.checked = checked;
}

/**
 * Validate URL
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Handle page unload warning
 */
window.addEventListener('beforeunload', (e) => {
    const form = document.getElementById('editProfileForm');
    if (form && form.dataset.modified === 'true') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Mark form as modified when any input changes
document.addEventListener('input', (e) => {
    if (e.target.closest('#editProfileForm')) {
        const form = document.getElementById('editProfileForm');
        if (form) form.dataset.modified = 'true';
    }
});
