// ============================================================
// LUSALES ARCHIVE — MAIN SITE SCRIPT (UPDATED)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBnsU904MyOFhK3zLJB02U39e9f2UnGWio",
    authDomain: "lusales-archive.firebaseapp.com",
    projectId: "lusales-archive",
    storageBucket: "lusales-archive.firebasestorage.app",
    messagingSenderId: "56870938100",
    appId: "1:56870938100:web:28aa9c471f24e3f9ee05a1"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let books = [];
let chapters = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    loadSavedTheme();
    buildThemeSwitcher('themeSwitcherMount');

    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateAuthUI(user);
        updateDashboardLink();
    });

    await loadData();
    renderRecentChapters();
    setupSearchRedirect();
});

async function loadData() {
    try {
        const [booksSnap, chaptersSnap] = await Promise.all([
            db.collection('books').get(),
            db.collection('chapters').get()
        ]);
        books = booksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

function renderRecentChapters() {
    const list = document.getElementById('recentChapters');
    if (!list) return;
    if (!chapters.length) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-scroll"></i><p>No chapters yet — come back soon.</p></div>';
        return;
    }
    list.innerHTML = '';
    chapters.slice(0, 10).forEach(ch => {
        const book = books.find(b => b.id === ch.bookId);
        const entry = document.createElement('div');
        entry.className = 'chapter-entry';
        entry.onclick = () => window.location.href = `reader.html?chapter=${ch.id}`;
        entry.innerHTML = `
            <div class="chapter-entry-info">
                <h4>${escapeHtml(ch.title)}</h4>
                <span class="book-name">${book ? escapeHtml(book.title) : 'Unknown Book'}</span>
            </div>
            <div class="chapter-entry-meta">${formatDate(ch.date)}</div>
        `;
        list.appendChild(entry);
    });
}

function setupSearchRedirect() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    const doSearch = () => {
        const q = input.value.trim();
        if (q) window.location.href = `library.html?search=${encodeURIComponent(q)}`;
        else window.location.href = 'library.html';
    };
    if (btn) btn.onclick = doSearch;
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// Auth UI
function updateAuthUI(user) {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;
    if (user) {
        authBtn.innerHTML = user.photoURL
            ? `<img src="${user.photoURL}" alt=""> ${user.displayName?.split(' ')[0] || 'User'}`
            : `<i class="fas fa-user-circle"></i> ${user.displayName?.split(' ')[0] || 'User'}`;
    } else {
        authBtn.innerHTML = '<i class="fab fa-google"></i> Sign in';
    }
}

function updateDashboardLink() {
    const link = document.getElementById('dashboardLink');
    if (link) link.style.display = currentUser ? 'flex' : 'none';
}

// Expose globally for onclick
window.handleAuthClick = function() {
    if (currentUser) {
        document.getElementById('userMenu')?.classList.toggle('open');
    } else {
        auth.signInWithPopup(provider).catch(() => alert('Sign in failed. Please try again.'));
    }
};

window.signOut = function() {
    auth.signOut().then(() => {
        document.getElementById('userMenu')?.classList.remove('open');
        window.location.href = 'index.html';
    });
};

document.addEventListener('click', e => {
    const menu = document.getElementById('userMenu');
    if (menu && !menu.contains(e.target)) menu.classList.remove('open');
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
