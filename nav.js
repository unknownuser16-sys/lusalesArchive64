// ============================================================
// LUSALES ARCHIVE — SHARED NAV + AUTH
// ============================================================

let currentUser = null;

function initNav() {
    // Theme
    loadSavedTheme();
    buildThemeSwitcher('themeSwitcherMount');

    // Mobile menu
    const mobileBtn  = document.querySelector('.mobile-menu-btn');
    const navLinks   = document.querySelector('.nav-links');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                icon.className = mobileMenu.classList.contains('open')
                    ? 'fas fa-times'
                    : 'fas fa-bars';
            }
        });

        // Close on outside click
        document.addEventListener('click', e => {
            if (!mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
                mobileMenu.classList.remove('open');
                const icon = mobileBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    }

    // Auth
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateNavAuth(user);
        if (typeof onAuthReady === 'function') onAuthReady(user);
    });
}

function updateNavAuth(user) {
    const authBtn      = document.getElementById('authBtn');
    const userDropdown = document.getElementById('userDropdown');
    const mobileAuth   = document.getElementById('mobileAuth');

    if (!authBtn) return;

    if (user) {
        const name = user.displayName ? user.displayName.split(' ')[0] : 'Account';
        const avatar = user.photoURL
            ? `<img src="${user.photoURL}" alt="" style="width:18px;height:18px;border-radius:50%;">`
            : `<i class="fas fa-user-circle"></i>`;

        authBtn.innerHTML = `${avatar} ${name}`;

        if (mobileAuth) mobileAuth.innerHTML = `
            <a href="dashboard.html"><i class="fas fa-gauge"></i> Dashboard</a>
            <button onclick="signOutUser()" class="mobile-signout"><i class="fas fa-sign-out-alt"></i> Sign out</button>`;
    } else {
        authBtn.innerHTML = `<i class="fab fa-google"></i> Sign in`;
        if (mobileAuth) mobileAuth.innerHTML = `
            <button onclick="signInUser()" class="mobile-signin"><i class="fab fa-google"></i> Sign in</button>`;
    }
}

function handleAuthClick() {
    if (currentUser) {
        document.getElementById('userMenu')?.classList.toggle('open');
    } else {
        signInUser();
    }
}

function signInUser() {
    auth.signInWithPopup(provider).catch(err => {
        console.error(err);
        showToast('Sign in failed. Please try again.');
    });
}

function signOutUser() {
    auth.signOut().then(() => {
        document.getElementById('userMenu')?.classList.remove('open');
    });
}

document.addEventListener('click', e => {
    const menu = document.getElementById('userMenu');
    if (menu && !menu.contains(e.target)) menu.classList.remove('open');
});

// ── Shared utilities ─────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function formatDateLong(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
}

function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function randomCover() {
    const g = [
        'linear-gradient(135deg,#1a1a2e,#16213e)',
        'linear-gradient(135deg,#0f3460,#533483)',
        'linear-gradient(135deg,#2d1b69,#11998e)',
        'linear-gradient(135deg,#1a2a1a,#2d5a27)',
        'linear-gradient(135deg,#3d0c02,#8a1a0a)',
    ];
    return g[Math.floor(Math.random() * g.length)];
}
