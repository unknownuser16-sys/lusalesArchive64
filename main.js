// ============================================================
// LUSALES ARCHIVE — MAIN SITE SCRIPT (with Auth)
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
const db       = firebase.firestore();
const auth     = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let books    = [];
let chapters = [];
let currentUser = null;

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderFeaturedBooks();
    renderRecentChapters();
    setupSearch();
    setupAuth();
});

// ============================================================
// AUTH
// ============================================================
function setupAuth() {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateAuthUI(user);
    });
}

function updateAuthUI(user) {
    const authBtn     = document.getElementById('authBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (!authBtn) return;

    if (user) {
        // Show user avatar and name
        authBtn.innerHTML = `
            ${user.photoURL
                ? `<img src="${user.photoURL}" alt="avatar">`
                : `<i class="fas fa-user-circle"></i>`}
            ${user.displayName ? user.displayName.split(' ')[0] : 'Account'}
        `;
        // Add bookmarks link to dropdown
        if (userDropdown && !userDropdown.querySelector('.bookmarks-link')) {
            const bookmarksLink = document.createElement('a');
            bookmarksLink.href = '#recent';
            bookmarksLink.className = 'bookmarks-link';
            bookmarksLink.innerHTML = '<i class="fas fa-bookmark"></i> My Bookmarks';
            userDropdown.insertBefore(bookmarksLink, userDropdown.firstChild);
        }
    } else {
        authBtn.innerHTML = '<i class="fab fa-google"></i> Sign in';
        // Remove bookmarks link if present
        if (userDropdown) {
            const bl = userDropdown.querySelector('.bookmarks-link');
            if (bl) bl.remove();
        }
    }
}

function handleAuthClick() {
    if (currentUser) {
        // Toggle dropdown
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.toggle('open');
    } else {
        signIn();
    }
}

function signIn() {
    auth.signInWithPopup(provider).catch(err => {
        console.error('Sign in error:', err);
        alert('Sign in failed. Please try again.');
    });
}

function signOut() {
    auth.signOut().then(() => {
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.remove('open');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
    const menu = document.getElementById('userMenu');
    if (menu && !menu.contains(e.target)) {
        menu.classList.remove('open');
    }
});

// ============================================================
// LOAD DATA
// ============================================================
async function loadData() {
    try {
        const [booksSnap, chaptersSnap] = await Promise.all([
            db.collection('books').get(),
            db.collection('chapters').get()
        ]);
        books    = booksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        chapters = chaptersSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
        console.error('Failed to load data:', err);
    }
}

// ============================================================
// FEATURED BOOKS
// ============================================================
function renderFeaturedBooks() {
    const grid = document.getElementById('featuredBooks');
    if (!grid) return;

    if (books.length === 0) {
        grid.innerHTML = `<div class="empty-state"><i class="fas fa-book-open"></i><p>No books yet — check back soon.</p></div>`;
        return;
    }

    grid.innerHTML = '';
    books.forEach(book => {
        const bookChapters = chapters.filter(c => c.bookId === book.id);
        const firstChapter = bookChapters.length > 0
            ? [...bookChapters].sort((a,b) => new Date(a.date)-new Date(b.date))[0]
            : null;

        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => {
            if (firstChapter) window.location.href = `reader.html?chapter=${firstChapter.id}`;
            else alert('This book has no chapters yet.');
        };
        card.innerHTML = `
            <div class="book-cover" style="background:${book.coverColor || randomCover()}">
                <i class="fas fa-book" style="position:relative;z-index:1;color:rgba(255,255,255,0.2)"></i>
            </div>
            <div class="book-info">
                <h3>${escHtml(book.title)}</h3>
                <p class="author">by ${escHtml(book.author)}</p>
                <span class="chapter-count">${bookChapters.length} chapter${bookChapters.length !== 1 ? 's' : ''}</span>
            </div>`;
        grid.appendChild(card);
    });
}

// ============================================================
// RECENT CHAPTERS
// ============================================================
function renderRecentChapters() {
    const list = document.getElementById('recentChapters');
    if (!list) return;

    if (chapters.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-scroll"></i><p>No chapters yet — come back soon.</p></div>`;
        return;
    }

    list.innerHTML = '';
    chapters.slice(0, 10).forEach(chapter => {
        const book = books.find(b => b.id === chapter.bookId);
        const entry = document.createElement('div');
        entry.className = 'chapter-entry';
        entry.onclick = () => window.location.href = `reader.html?chapter=${chapter.id}`;
        entry.innerHTML = `
            <div class="chapter-entry-info">
                <h4>${escHtml(chapter.title)}</h4>
                <span class="book-name">${book ? escHtml(book.title) : 'Unknown Book'}</span>
            </div>
            <div class="chapter-entry-meta">${formatDate(chapter.date)}</div>`;
        list.appendChild(entry);
    });
}

// ============================================================
// SEARCH
// ============================================================
function setupSearch() {
    const input  = document.querySelector('.search-box input');
    const button = document.querySelector('.search-box button');

    function doSearch() {
        const q = input.value.trim().toLowerCase();
        if (!q) { renderFeaturedBooks(); return; }

        const results = books.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.description && b.description.toLowerCase().includes(q))
        );

        const grid = document.getElementById('featuredBooks');
        if (!grid) return;

        if (results.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>No books found for "<strong>${escHtml(q)}</strong>"</p></div>`;
            return;
        }

        grid.innerHTML = '';
        results.forEach(book => {
            const bookChapters = chapters.filter(c => c.bookId === book.id);
            const firstChapter = bookChapters.length > 0
                ? [...bookChapters].sort((a,b) => new Date(a.date)-new Date(b.date))[0]
                : null;

            const card = document.createElement('div');
            card.className = 'book-card';
            card.onclick = () => {
                if (firstChapter) window.location.href = `reader.html?chapter=${firstChapter.id}`;
                else alert('This book has no chapters yet.');
            };
            card.innerHTML = `
                <div class="book-cover" style="background:${book.coverColor || randomCover()}">
                    <i class="fas fa-book" style="position:relative;z-index:1;color:rgba(255,255,255,0.2)"></i>
                </div>
                <div class="book-info">
                    <h3>${escHtml(book.title)}</h3>
                    <p class="author">by ${escHtml(book.author)}</p>
                    <span class="chapter-count">${bookChapters.length} chapter${bookChapters.length !== 1 ? 's' : ''}</span>
                </div>`;
            grid.appendChild(card);
        });

        grid.scrollIntoView({ behavior: 'smooth' });
    }

    if (button) button.onclick = doSearch;
    if (input)  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ============================================================
// UTILITIES
// ============================================================
function randomCover() {
    const g = [
        'linear-gradient(135deg,#1a1a2e,#16213e)',
        'linear-gradient(135deg,#0f3460,#533483)',
        'linear-gradient(135deg,#2d1b69,#11998e)',
        'linear-gradient(135deg,#373b44,#4286f4)',
        'linear-gradient(135deg,#3d0c02,#8a1a0a)',
    ];
    return g[Math.floor(Math.random() * g.length)];
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
