// ============================================================
// LUSALES ARCHIVE — ADMIN SCRIPT (Firebase Compat Edition)
// ============================================================

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBnsU904MyOFhK3zLJB02U39e9f2UnGWio",
    authDomain: "lusales-archive.firebaseapp.com",
    projectId: "lusales-archive",
    storageBucket: "lusales-archive.firebasestorage.app",
    messagingSenderId: "56870938100",
    appId: "1:56870938100:web:28aa9c471f24e3f9ee05a1"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Access control
const SECRET_ADMIN_KEY    = "deep-speed-2005";
const ADMIN_ACCESS_COOKIE = "admin_access_granted";

// State
let books    = [];
let chapters = [];

const adminSections = document.querySelectorAll('.admin-section');
const sidebarBtns   = document.querySelectorAll('.sidebar-btn');

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    setupEventListeners();
});

// ============================================================
// ACCESS CONTROL
// ============================================================
function checkAdminAccess() {
    const urlParams    = new URLSearchParams(window.location.search);
    const key          = urlParams.get('key');
    const storedAccess = localStorage.getItem(ADMIN_ACCESS_COOKIE);
    const loginTime    = localStorage.getItem('admin_login_time');
    const isLoginValid = loginTime && (Date.now() - parseInt(loginTime)) < (24 * 60 * 60 * 1000);

    if (key === SECRET_ADMIN_KEY || (storedAccess === 'true' && isLoginValid)) {
        localStorage.setItem(ADMIN_ACCESS_COOKIE, 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        document.getElementById('adminDashboard').style.display = 'block';
        loadBooksForAdmin();
    } else {
        showAccessDenied();
    }
}

function showAccessDenied() {
    document.body.innerHTML = `
        <div class="access-denied">
            <div class="access-form">
                <h2><i class="fas fa-lock"></i> Admin Access Required</h2>
                <p>This area is restricted to authorized personnel only.</p>
                <div class="input-group">
                    <input type="password" id="accessCode" placeholder="Enter admin access code">
                    <button onclick="verifyAccess()"><i class="fas fa-sign-in-alt"></i> Enter</button>
                </div>
                <p class="error-msg" id="errorMsg"><i class="fas fa-exclamation-circle"></i> Invalid access code</p>
                <p class="hint">Contact the site administrator if you need access.</p>
            </div>
        </div>`;
}

function verifyAccess() {
    const code     = document.getElementById('accessCode').value;
    const errorMsg = document.getElementById('errorMsg');
    if (code === SECRET_ADMIN_KEY) {
        localStorage.setItem(ADMIN_ACCESS_COOKIE, 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        location.reload();
    } else {
        errorMsg.style.display = 'flex';
        document.getElementById('accessCode').style.animation = 'shake 0.5s';
        setTimeout(() => document.getElementById('accessCode').style.animation = '', 500);
    }
}

function logout() {
    localStorage.removeItem(ADMIN_ACCESS_COOKIE);
    localStorage.removeItem('admin_login_time');
    location.href = '../index.html';
}

// ============================================================
// SIDEBAR
// ============================================================
function showSection(sectionId) {
    adminSections.forEach(s => s.style.display = 'none');
    const target = document.getElementById(`${sectionId}Section`);
    if (target) target.style.display = 'block';
    sidebarBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) btn.classList.add('active');
    });
    if (sectionId === 'books')    loadBooksForAdmin();
    if (sectionId === 'chapters') loadChaptersForAdmin();
}

// ============================================================
// BOOKS
// ============================================================
async function loadBooksForAdmin() {
    const booksList = document.getElementById('booksList');
    if (!booksList) return;
    booksList.innerHTML = '<p style="color:#7f8c8d;padding:1rem">Loading...</p>';

    try {
        const snap = await db.collection('books').get();
        books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        booksList.innerHTML = `<p style="color:#e74c3c">Error: ${err.message}</p>`;
        return;
    }

    if (books.length === 0) {
        booksList.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><p>No books yet. Add your first book!</p></div>`;
        return;
    }

    booksList.innerHTML = '';
    books.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item';
        item.innerHTML = `
            <div>
                <h4>${escHtml(book.title)}</h4>
                <p class="book-meta">by ${escHtml(book.author)}</p>
                <p class="book-meta">${escHtml(book.description || '')}</p>
                <small>Added: ${formatDate(book.createdAt)}</small>
            </div>
            <div class="book-actions">
                <button class="edit-btn" onclick="editBook('${book.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteBook('${book.id}','${escHtml(book.title)}')"><i class="fas fa-trash"></i></button>
            </div>`;
        booksList.appendChild(item);
    });
}

function showAddBookForm() {
    document.getElementById('addBookModal').style.display = 'flex';
}

async function addBook() {
    const title       = document.getElementById('bookTitle').value.trim();
    const author      = document.getElementById('bookAuthor').value.trim();
    const description = document.getElementById('bookDescription').value.trim();

    if (!title || !author) { alert('Please fill in the title and author fields'); return; }

    const colors = [
        'linear-gradient(135deg,#1a1a2e,#16213e)',
        'linear-gradient(135deg,#0f3460,#533483)',
        'linear-gradient(135deg,#2d1b69,#11998e)',
        'linear-gradient(135deg,#373b44,#4286f4)',
        'linear-gradient(135deg,#3d0c02,#8a1a0a)',
    ];

    try {
        await db.collection('books').add({
            title,
            author,
            description,
            coverColor: colors[Math.floor(Math.random() * colors.length)],
            createdAt: new Date().toISOString()
        });
        closeModal('addBookModal');
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookDescription').value = '';
        alert(`Book "${title}" added successfully!`);
        loadBooksForAdmin();
    } catch (err) {
        alert('Error adding book: ' + err.message);
    }
}

async function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const newTitle  = prompt('Edit book title:', book.title);
    if (!newTitle) return;
    const newAuthor = prompt('Edit author:', book.author);
    const newDesc   = prompt('Edit description:', book.description);
    try {
        await db.collection('books').doc(bookId).update({
            title: newTitle,
            author: newAuthor || book.author,
            description: newDesc || ''
        });
        alert('Book updated!');
        loadBooksForAdmin();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function deleteBook(bookId, bookTitle) {
    if (!confirm(`Delete "${bookTitle}" and all its chapters?`)) return;
    try {
        await db.collection('books').doc(bookId).delete();
        const snap = await db.collection('chapters').where('bookId', '==', bookId).get();
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        alert('Book deleted!');
        loadBooksForAdmin();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ============================================================
// CHAPTERS
// ============================================================
async function loadChaptersForAdmin() {
    const bookSelect = document.getElementById('bookSelect');
    if (!bookSelect) return;
    bookSelect.innerHTML = '<option value="">Select a book...</option>';

    try {
        const snap = await db.collection('books').get();
        books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        books.forEach(book => {
            const opt = document.createElement('option');
            opt.value = book.id;
            opt.textContent = book.title;
            bookSelect.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
    }
    loadChapterList();
}

async function loadChapterList() {
    const bookSelect   = document.getElementById('bookSelect');
    const chaptersList = document.getElementById('adminChaptersList');
    if (!chaptersList) return;

    const selectedBookId = bookSelect ? bookSelect.value : null;
    if (!selectedBookId) {
        chaptersList.innerHTML = `<div class="empty-state"><i class="fas fa-file-alt"></i><p>Select a book to view its chapters</p></div>`;
        return;
    }

    chaptersList.innerHTML = '<p style="color:#7f8c8d;padding:1rem">Loading...</p>';

    try {
        const snap = await db.collection('chapters').where('bookId', '==', selectedBookId).get();
        const bookChapters = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (bookChapters.length === 0) {
            chaptersList.innerHTML = `<div class="empty-state"><i class="fas fa-file-alt"></i><p>No chapters yet for this book.</p></div>`;
            return;
        }

        chaptersList.innerHTML = '';
        bookChapters.forEach(chapter => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            item.innerHTML = `
                <div>
                    <h4>${escHtml(chapter.title)}</h4>
                    <p class="chapter-preview">${escHtml(chapter.content.substring(0, 120))}...</p>
                    <small>Date: ${chapter.date}</small>
                </div>
                <div class="chapter-actions">
                    <button class="edit-btn" onclick="editChapter('${chapter.id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteChapter('${chapter.id}','${escHtml(chapter.title)}')"><i class="fas fa-trash"></i></button>
                </div>`;
            chaptersList.appendChild(item);
        });
    } catch (err) {
        chaptersList.innerHTML = `<p style="color:#e74c3c">Error: ${err.message}</p>`;
    }
}

function showAddChapterForm() {
    const selectedBookId = document.getElementById('bookSelect').value;
    if (!selectedBookId) { alert('Please select a book first'); return; }
    document.getElementById('addChapterModal').style.display = 'flex';
    document.getElementById('chapterDate').valueAsDate = new Date();
}

async function addChapter() {
    const title   = document.getElementById('chapterTitleInput').value.trim();
    const content = document.getElementById('chapterContent').value.trim();
    const date    = document.getElementById('chapterDate').value;
    const bookId  = document.getElementById('bookSelect').value;

    if (!title || !content || !bookId) { alert('Please fill in all required fields'); return; }

    try {
        await db.collection('chapters').add({
            bookId,
            title,
            content,
            date: date || new Date().toISOString().split('T')[0]
        });
        closeModal('addChapterModal');
        document.getElementById('chapterTitleInput').value = '';
        document.getElementById('chapterContent').value = '';
        alert(`Chapter "${title}" added!`);
        loadChapterList();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function editChapter(chapterId) {
    const snap    = await db.collection('chapters').doc(chapterId).get();
    const chapter = snap.data();
    if (!chapter) return;
    const newTitle   = prompt('Edit title:', chapter.title);
    if (!newTitle) return;
    const newContent = prompt('Edit content:', chapter.content);
    try {
        await db.collection('chapters').doc(chapterId).update({ title: newTitle, content: newContent || chapter.content });
        alert('Chapter updated!');
        loadChapterList();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function deleteChapter(chapterId, chapterTitle) {
    if (!confirm(`Delete "${chapterTitle}"?`)) return;
    try {
        await db.collection('chapters').doc(chapterId).delete();
        alert('Chapter deleted!');
        loadChapterList();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ============================================================
// UTILITIES
// ============================================================
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function setupEventListeners() {
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => showSection(btn.dataset.section));
    });
    const bookSelect = document.getElementById('bookSelect');
    if (bookSelect) bookSelect.addEventListener('change', loadChapterList);
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    });
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
