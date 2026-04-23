// ============================================================
// LUSALES ARCHIVE — ADMIN SCRIPT (Firebase Edition)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query }
    from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ── Firebase config ──────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBnsU904MyOFhK3zLJB02U39e9f2UnGWio",
    authDomain: "lusales-archive.firebaseapp.com",
    projectId: "lusales-archive",
    storageBucket: "lusales-archive.firebasestorage.app",
    messagingSenderId: "56870938100",
    appId: "1:56870938100:web:28aa9c471f24e3f9ee05a1"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Access control ───────────────────────────────────────
const SECRET_ADMIN_KEY   = "deep-speed-2005";
const ADMIN_ACCESS_COOKIE = "admin_access_granted";

// ── State ────────────────────────────────────────────────
let books    = [];
let chapters = [];

const adminSections = document.querySelectorAll('.admin-section');
const sidebarBtns   = document.querySelectorAll('.sidebar-btn');

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    setupEventListeners();
});

// ============================================================
// ACCESS CONTROL
// ============================================================
function checkAdminAccess() {
    const urlParams  = new URLSearchParams(window.location.search);
    const key        = urlParams.get('key');
    const storedAccess = localStorage.getItem(ADMIN_ACCESS_COOKIE);
    const loginTime    = localStorage.getItem('admin_login_time');
    const isLoginValid = loginTime && (Date.now() - parseInt(loginTime)) < (24 * 60 * 60 * 1000);

    if (key === SECRET_ADMIN_KEY || (storedAccess === 'true' && isLoginValid)) {
        localStorage.setItem(ADMIN_ACCESS_COOKIE, 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        showDashboard();
        loadBooksForAdmin();
    } else {
        showAccessDenied();
    }
}

function showDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) dashboard.style.display = 'block';
}

function showAccessDenied() {
    document.body.innerHTML = `
        <div class="access-denied">
            <div class="access-form">
                <h2><i class="fas fa-lock"></i> Admin Access Required</h2>
                <p>This area is restricted to authorized personnel only.</p>
                <div class="input-group">
                    <input type="password" id="accessCode" placeholder="Enter admin access code">
                    <button onclick="verifyAccess()">
                        <i class="fas fa-sign-in-alt"></i> Enter
                    </button>
                </div>
                <p class="error-msg" id="errorMsg">
                    <i class="fas fa-exclamation-circle"></i> Invalid access code
                </p>
                <p class="hint">Contact the site administrator if you need access.</p>
            </div>
            <style>
                body { margin:0; padding:0; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Roboto',sans-serif; }
                .access-denied { width:100%; max-width:500px; padding:20px; }
                .access-form { background:white; padding:2.5rem; border-radius:15px; box-shadow:0 20px 40px rgba(0,0,0,0.3); text-align:center; }
                .access-form h2 { color:#2c3e50; margin-bottom:1rem; }
                .access-form > p { color:#7f8c8d; margin-bottom:2rem; line-height:1.6; }
                .input-group { display:flex; gap:10px; margin-bottom:1.5rem; }
                .input-group input { flex:1; padding:1rem; border:2px solid #ddd; border-radius:8px; font-size:1rem; outline:none; }
                .input-group input:focus { border-color:#3498db; }
                .input-group button { background:#3498db; color:white; border:none; padding:0 2rem; border-radius:8px; cursor:pointer; font-size:1rem; transition:background 0.3s; }
                .input-group button:hover { background:#2980b9; }
                .error-msg { color:#e74c3c; display:none; align-items:center; justify-content:center; gap:8px; font-size:0.9rem; }
                .hint { font-size:0.85rem; color:#95a5a6; margin-top:1.5rem; border-top:1px solid #eee; padding-top:1rem; }
                @keyframes shake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-5px)} 20%,40%,60%,80%{transform:translateX(5px)} }
            </style>
        </div>
    `;
}

window.verifyAccess = function() {
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

window.logout = function() {
    localStorage.removeItem(ADMIN_ACCESS_COOKIE);
    localStorage.removeItem('admin_login_time');
    location.href = '../index.html';
}

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
window.showSection = function(sectionId) {
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
// BOOKS — FIREBASE
// ============================================================
async function loadBooksForAdmin() {
    const booksList = document.getElementById('booksList');
    if (!booksList) return;
    booksList.innerHTML = '<p style="color:#7f8c8d;padding:1rem">Loading...</p>';

    try {
        const snap = await getDocs(collection(db, 'books'));
        books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        booksList.innerHTML = `<p style="color:#e74c3c">Failed to load books: ${err.message}</p>`;
        return;
    }

    if (books.length === 0) {
        booksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No books yet. Add your first book!</p>
            </div>`;
        return;
    }

    booksList.innerHTML = '';
    books.forEach((book, index) => {
        const item = document.createElement('div');
        item.className = 'book-item';
        item.innerHTML = `
            <div>
                <h4>${escHtml(book.title)}</h4>
                <p class="book-meta">by ${escHtml(book.author)}</p>
                <p class="book-desc">${escHtml(book.description || 'No description')}</p>
                <small>Added: ${formatDate(book.createdAt)}</small>
            </div>
            <div class="book-actions">
                <button class="edit-btn" onclick="editBook('${book.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteBook('${book.id}','${escHtml(book.title)}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        booksList.appendChild(item);
    });
}

window.showAddBookForm = function() {
    document.getElementById('addBookModal').style.display = 'flex';
}

window.addBook = async function() {
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

    const newBook = {
        title,
        author,
        description,
        coverColor: colors[Math.floor(Math.random() * colors.length)],
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, 'books'), newBook);
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

window.editBook = async function(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const newTitle  = prompt('Edit book title:', book.title);
    if (!newTitle) return;
    const newAuthor = prompt('Edit author:', book.author);
    const newDesc   = prompt('Edit description:', book.description);

    try {
        await updateDoc(doc(db, 'books', bookId), {
            title: newTitle,
            author: newAuthor || book.author,
            description: newDesc || ''
        });
        alert('Book updated successfully!');
        loadBooksForAdmin();
    } catch (err) {
        alert('Error updating book: ' + err.message);
    }
}

window.deleteBook = async function(bookId, bookTitle) {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This will also delete all its chapters!`)) return;

    try {
        // Delete book
        await deleteDoc(doc(db, 'books', bookId));

        // Delete associated chapters
        const chapSnap = await getDocs(collection(db, 'chapters'));
        const deletes  = chapSnap.docs
            .filter(d => d.data().bookId === bookId)
            .map(d => deleteDoc(doc(db, 'chapters', d.id)));
        await Promise.all(deletes);

        alert('Book deleted successfully!');
        loadBooksForAdmin();
    } catch (err) {
        alert('Error deleting book: ' + err.message);
    }
}

// ============================================================
// CHAPTERS — FIREBASE
// ============================================================
async function loadChaptersForAdmin() {
    const bookSelect = document.getElementById('bookSelect');
    if (!bookSelect) return;
    bookSelect.innerHTML = '<option value="">Select a book...</option>';

    try {
        const snap = await getDocs(collection(db, 'books'));
        books = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        books.forEach(book => {
            const opt = document.createElement('option');
            opt.value = book.id;
            opt.textContent = book.title;
            bookSelect.appendChild(opt);
        });
    } catch (err) {
        console.error('Error loading books for chapter section:', err);
    }

    loadChapterList();
}

async function loadChapterList() {
    const bookSelect  = document.getElementById('bookSelect');
    const chaptersList = document.getElementById('adminChaptersList');
    if (!chaptersList) return;

    const selectedBookId = bookSelect ? bookSelect.value : null;

    if (!selectedBookId) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>Select a book to view its chapters</p>
            </div>`;
        return;
    }

    chaptersList.innerHTML = '<p style="color:#7f8c8d;padding:1rem">Loading...</p>';

    try {
        const snap = await getDocs(query(collection(db, 'chapters'), orderBy('date', 'asc')));
        const bookChapters = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(c => c.bookId === selectedBookId);

        if (bookChapters.length === 0) {
            chaptersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>No chapters yet for this book.</p>
                </div>`;
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
                    <button class="edit-btn" onclick="editChapter('${chapter.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteChapter('${chapter.id}','${escHtml(chapter.title)}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;
            chaptersList.appendChild(item);
        });
    } catch (err) {
        chaptersList.innerHTML = `<p style="color:#e74c3c">Error loading chapters: ${err.message}</p>`;
    }
}

window.showAddChapterForm = function() {
    const selectedBookId = document.getElementById('bookSelect').value;
    if (!selectedBookId) { alert('Please select a book first'); return; }
    document.getElementById('addChapterModal').style.display = 'flex';
    document.getElementById('chapterDate').valueAsDate = new Date();
}

window.addChapter = async function() {
    const title   = document.getElementById('chapterTitleInput').value.trim();
    const content = document.getElementById('chapterContent').value.trim();
    const date    = document.getElementById('chapterDate').value;
    const bookId  = document.getElementById('bookSelect').value;

    if (!title || !content || !bookId) { alert('Please fill in all required fields'); return; }

    const newChapter = {
        bookId,
        title,
        content,
        date: date || new Date().toISOString().split('T')[0]
    };

    try {
        await addDoc(collection(db, 'chapters'), newChapter);
        closeModal('addChapterModal');
        document.getElementById('chapterTitleInput').value = '';
        document.getElementById('chapterContent').value = '';
        alert(`Chapter "${title}" added successfully!`);
        loadChapterList();
    } catch (err) {
        alert('Error adding chapter: ' + err.message);
    }
}

window.editChapter = async function(chapterId) {
    const snap = await getDocs(collection(db, 'chapters'));
    const chapter = snap.docs.find(d => d.id === chapterId)?.data();
    if (!chapter) return;

    const newTitle   = prompt('Edit chapter title:', chapter.title);
    if (!newTitle) return;
    const newContent = prompt('Edit chapter content:', chapter.content);

    try {
        await updateDoc(doc(db, 'chapters', chapterId), {
            title: newTitle,
            content: newContent || chapter.content
        });
        alert('Chapter updated successfully!');
        loadChapterList();
    } catch (err) {
        alert('Error updating chapter: ' + err.message);
    }
}

window.deleteChapter = async function(chapterId, chapterTitle) {
    if (!confirm(`Are you sure you want to delete "${chapterTitle}"?`)) return;
    try {
        await deleteDoc(doc(db, 'chapters', chapterId));
        alert('Chapter deleted successfully!');
        loadChapterList();
    } catch (err) {
        alert('Error deleting chapter: ' + err.message);
    }
}

// ============================================================
// UTILITIES
// ============================================================
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function setupEventListeners() {
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => showSection(btn.dataset.section));
    });

    const bookSelect = document.getElementById('bookSelect');
    if (bookSelect) bookSelect.addEventListener('change', loadChapterList);

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = 'none';
        });
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
