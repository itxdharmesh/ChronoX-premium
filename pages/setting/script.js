let currentSection = 'appearance';

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadSettings();
    
    document.querySelectorAll('.settings-nav').forEach(btn => btn.addEventListener('click', (e) => {
        currentSection = e.currentTarget.dataset.section;
        document.querySelectorAll('.settings-nav').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.settings-section').forEach(s => s.style.display = 'none');
        document.getElementById(`section-${currentSection}`).style.display = 'block';
    }));

    document.getElementById('themeSelect')?.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
        storage.set('theme', e.target.value);
        toast.success(`${capitalize(e.target.value)} mode activated`);
    });

    document.querySelectorAll('.color-option').forEach(btn => btn.addEventListener('click', (e) => {
        document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        storage.set('colorScheme', e.target.dataset.color);
    }));

    document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
        modal.custom({
            title: 'Change Password',
            content: `
                <div class="form-group"><label class="form-label">Current Password</label><input type="password" id="currentPass" class="form-input"></div>
                <div class="form-group"><label class="form-label">New Password</label><input type="password" id="newPass" class="form-input"></div>
                <div class="form-group"><label class="form-label">Confirm Password</label><input type="password" id="confirmPass" class="form-input"></div>`,
            showFooter: true,
            confirmText: 'Update Password',
            onConfirm: async () => {
                const curr = document.getElementById('currentPass')?.value;
                const news = document.getElementById('newPass')?.value;
                const conf = document.getElementById('confirmPass')?.value;
                if (news !== conf) { toast.error('Passwords do not match'); return; }
                try {
                    await auth.changePassword(curr, news);
                    toast.success('Password updated!');
                    modal.close();
                } catch(e) { toast.error(e.message); }
            }
        });
    });
});

function loadSettings() {
    const theme = storage.get('theme', 'dark');
    document.getElementById('themeSelect').value = theme;
    document.documentElement.setAttribute('data-theme', theme);
            }
