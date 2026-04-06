// ADMIN PANEL - LUSALES ARCHIVE
const SECRET_ADMIN_KEY = "deep-speed-2005";
const ADMIN_ACCESS_COOKIE = "admin_access_granted";

// DOM Elements
const adminSections = document.querySelectorAll('.admin-section');
const sidebarBtns = document.querySelectorAll('.sidebar-btn');

// Data storage (in production, use a database)
let books = JSON.parse(localStorage.getItem('lusales_books')) || [];
let chapters = JSON.parse(localStorage.getItem('lusales_chapters')) || [];  // FIX: added quotes around key

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    setupEventListeners();
});

// =============================================
// SECURITY & ACCESS CONTROL
// =============================================

function checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);  // FIX: ur1Params -> urlParams
    const key = urlParams.get('key');

    const storedAccess = localStorage.getItem(ADMIN_ACCESS_COOKIE);
    const loginTime = localStorage.getItem('admin_login_time');
    const isLoginValid = loginTime &&
        (Date.now() - parseInt(loginTime)) < (24 * 60 * 60 * 1000);

    if (key === SECRET_ADMIN_KEY || (storedAccess === 'true' && isLoginValid)) {
        localStorage.setItem(ADMIN_ACCESS_COOKIE, 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        showDashboard();
        loadBooksForAdmin();  // FIX: localBooksForAdmin -> loadBooksForAdmin
    } else {
        showAccessDenied();
    }
}

function showDashboard() {
    const loginForm = document.getElementById('loginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    if (loginForm) loginForm.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
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
                body {
                    margin: 0;
                    padding: 0;                              /* FIX: 'o' -> '0' */
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Roboto', sans-serif;
                }
                .access-denied {
                    width: 100%;
                    max-width: 500px;
                    padding: 20px;
                }
                .access-form {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 15px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);  /* FIX: 0,3 -> 0.3 */
                    text-align: center;
                }
                .access-form h2 {
                    color: #2c3e50;
                    margin-bottom: 1rem;                     /* FIX: margin-buttom typo */
                    font-family: 'Merriweather', serif;
                }
                .access-form > p {
                    color: #7f8c8d;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                .input-group {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 1.5rem;                   /* FIX: missing colon */
                }
                .input-group input {                         /* FIX: 'inout' typo */
                    flex: 1;
                    padding: 1rem;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;           /* FIX: missing colon */
                    outline: none;
                }
                .input-group input:focus {
                    border-color: #3498db;                   /* FIX: was applying button styles to input focus */
                }
                .input-group button {                        /* FIX: 'input-ground buttom' typos */
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;                     /* FIX: align-item -> align-items */
                    gap: 8px;
                    transition: background 0.3s;
                }
                .input-group button:hover {
                    background: #2980b9;
                }
                .error-msg {
                    color: #e74c3c;
                    display: none;                           /* FIX: 'dispaly' typo */
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 0.9rem;
                }
                .hint {
                    font-size: 0.85rem;
                    color: #95a5a6;
                    margin-top: 1.5rem;
                    border-top: 1px solid #eee;
                    padding-top: 1rem;
                }
                @keyframes shake {                           /* FIX: @Keyframes -> @keyframes */
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }                                            /* FIX: added missing closing brace */
            </style>
        </div>
    `;
}

function verifyAccess() {
    const code = document.getElementById('accessCode').value;
    const errorMsg = document.getElementById('errorMsg');

    if (code === SECRET_ADMIN_KEY) {
        localStorage.setItem(ADMIN_ACCESS_COOKIE, 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        location.reload();
    } else {
        errorMsg.style.display = 'flex';
        document.getElementById('accessCode').style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.getElementById('accessCode').style.animation = '';
        }, 500);

        if (!document.querySelector('#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ========================================
// ADMIN DASHBOARD FUNCTIONS
// ========================================

function logout() {
    localStorage.removeItem(ADMIN_ACCESS_COOKIE);
    localStorage.removeItem('admin_login_time');  // FIX: 'admin_login_item' -> 'admin_login_time'
    location.href = '../index.html';
}

function showSection(sectionId) {
    // Hide all sections
    adminSections.forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const target = document.getElementById(`${sectionId}Section`);
    if (target) target.style.display = 'block';

    // Update active button  FIX: was removing 'active' instead of adding it
    sidebarBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });

    // Load appropriate data
    if (sectionId === 'books') {
        loadBooksForAdmin();
    } else if (sectionId === 'chapters') {
        loadChaptersForAdmin();
    }
}

// ============================================
// BOOK MANAGEMENT
// ============================================

function loadBooksForAdmin() {                             // FIX: renamed from 'localBooksForAdmin'
    const booksList = document.getElementById('booksList');
    if (!booksList) return;
    booksList.innerHTML = '';

    if (books.length === 0) {                              // FIX: 'lenght' -> 'length'
        booksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No books yet. Add your first book!</p>
            </div>
        `;
        return;
    }

    books.forEach((book, index) => {                       // FIX: (books, index) -> (book, index)
        const bookItem = document.createElement('div');   // FIX: 'BookItem' -> 'bookItem'
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <div>
                <h4>${book.title}</h4>                    <!-- FIX: $(book.title) -> \${book.title}, fixed closing tag -->
                <p class="book-meta">by ${book.author}</p>  <!-- FIX: $ -> \${ } -->
                <p class="book-desc">${book.description || 'No description'}</p>  <!-- FIX: missing closing quote -->
                <small>Created: ${new Date(book.createdAt).toLocaleDateString()}</small>  <!-- FIX: toLocalDateString -> toLocaleDateString -->
            </div>
            <div class="book-actions">
                <button class="edit-btn" onclick="editBook(${index})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteBook(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        booksList.appendChild(bookItem);
    });
}

function showAddBookForm() {
    document.getElementById('addBookModal').style.display = 'flex';
}

function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const description = document.getElementById('bookDescription').value.trim();

    if (!title || !author) {
        alert('Please fill in the title and author fields');
        return;
    }

    const newBook = {
        id: Date.now(),                                    // FIX: date.now() -> Date.now()
        title,
        author,
        description,
        coverColor: `linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`,  // FIX: missing .toString(16) and closing paren
        createdAt: new Date().toISOString()
    };

    books.push(newBook);
    localStorage.setItem('lusales_books', JSON.stringify(books));
    closeModal('addBookModal');                            // FIX: closedModal -> closeModal
    loadBooksForAdmin();
    alert(`Book "${title}" added successfully!`);          // FIX: single quotes -> backticks for interpolation

    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookDescription').value = '';
}

function editBook(index) {                                 // FIX: aditBook -> editBook
    const book = books[index];
    const newTitle = prompt('Edit book title:', book.title);
    if (newTitle) {
        const newAuthor = prompt('Edit author:', book.author);
        const newDesc = prompt('Edit description:', book.description);

        books[index] = {
            ...book,
            title: newTitle,
            author: newAuthor,
            description: newDesc
        };

        localStorage.setItem('lusales_books', JSON.stringify(books));
        loadBooksForAdmin();
        alert('Book updated successfully!');
    }
}

function deleteBook(index) {
    if (confirm(`Are you sure you want to delete "${books[index].title}"? This will also delete all its chapters!`)) {  // FIX: backticks for interpolation
        const bookId = books[index].id;                    // FIX: 'BookId' -> 'bookId' (consistent casing)

        books.splice(index, 1);

        // Delete associated chapters  FIX: chapter.BookId -> chapter.bookId
        chapters = chapters.filter(chapter => chapter.bookId !== bookId);

        localStorage.setItem('lusales_books', JSON.stringify(books));
        localStorage.setItem('lusales_chapters', JSON.stringify(chapters));

        loadBooksForAdmin();
        alert('Book deleted successfully!');
    }
}

// ============================================
// CHAPTER MANAGEMENT
// ============================================

function loadChaptersForAdmin() {
    const bookSelect = document.getElementById('bookSelect');
    if (!bookSelect) return;
    bookSelect.innerHTML = '<option value="">Select a book...</option>';

    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.title;
        bookSelect.appendChild(option);
    });

    loadChapterList();                                     // FIX: loadchapterList -> loadChapterList (consistent naming)
}

function loadChapterList() {                               // FIX: renamed consistently
    const bookSelect = document.getElementById('bookSelect');
    const chaptersList = document.getElementById('adminChaptersList');
    if (!chaptersList) return;
    chaptersList.innerHTML = '';

    const selectedBookId = bookSelect ? parseInt(bookSelect.value) : null;  // FIX: 'bookselect' -> 'bookSelect'

    if (!selectedBookId) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>Select a book to view its chapters</p>
            </div>
        `;
        return;
    }

    const bookChapters = chapters.filter(ch => ch.bookId === selectedBookId);

    if (bookChapters.length === 0) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>No chapters yet for this book.</p>
            </div>
        `;
        return;
    }

    bookChapters.forEach((chapter, index) => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.innerHTML = `
            <div>
                <h4>${chapter.title}</h4>
                <p class="chapter-preview">${chapter.content.substring(0, 150)}...</p>
                <small>Date: ${chapter.date}</small>
            </div>
            <div class="chapter-actions">
                <button class="edit-btn" onclick="editChapter(${index})" title="Edit">
                    <i class="fas fa-edit"></i>             <!-- FIX: 'fas fas-edit' -> 'fas fa-edit', missing quote -->
                </button>
                <button class="delete-btn" onclick="deleteChapter(${index})" title="Delete">
                    <i class="fas fa-trash"></i>            <!-- FIX: same icon class fix -->
                </button>
            </div>
        `;
        chaptersList.appendChild(chapterItem);
    });
}

function showAddChapterForm() {
    const selectedBookId = document.getElementById('bookSelect').value;  // FIX: 'bookSelected' -> 'bookSelect'

    if (!selectedBookId) {
        alert('Please select a book first');
        return;
    }

    document.getElementById('addChapterModal').style.display = 'flex';
    document.getElementById('chapterDate').valueAsDate = new Date();
}

function addChapter() {
    const title = document.getElementById('chapterTitleInput').value.trim();
    const content = document.getElementById('chapterContent').value.trim();
    const date = document.getElementById('chapterDate').value;
    const bookId = document.getElementById('bookSelect').value;  // FIX: 'bookSelected' -> 'bookSelect'

    if (!title || !content || !bookId) {
        alert('Please fill in all required fields');
        return;                                             // FIX: was missing return after alert
    }

    const newChapter = {
        id: Date.now(),
        bookId: parseInt(bookId),
        title,
        content,
        date: date || new Date().toISOString().split('T')[0]
    };

    chapters.push(newChapter);
    localStorage.setItem('lusales_chapters', JSON.stringify(chapters));
    closeModal('addChapterModal');                         // FIX: closedModal -> closeModal
    loadChapterList();
    alert(`Chapter "${title}" added successfully!`);       // FIX: backticks for interpolation

    document.getElementById('chapterTitleInput').value = '';
    document.getElementById('chapterContent').value = '';
}

function editChapter(index) {
    const chapter = chapters[index];
    const newTitle = prompt('Edit chapter title:', chapter.title);  // FIX: chapter,title -> chapter.title
    if (newTitle) {
        const newContent = prompt('Edit chapter content:', chapter.content);

        chapters[index] = {                                // FIX: chapter[index] -> chapters[index]
            ...chapter,
            title: newTitle,
            content: newContent
        };

        localStorage.setItem('lusales_chapters', JSON.stringify(chapters));
        loadChapterList();
        alert('Chapter updated successfully!');
    }
}

function deleteChapter(index) {
    if (confirm(`Are you sure you want to delete "${chapters[index].title}"?`)) {  // FIX: backticks
        chapters.splice(index, 1);
        localStorage.setItem('lusales_chapters', JSON.stringify(chapters));
        loadChapterList();
        alert('Chapter deleted successfully!');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeModal(modalId) {                             // FIX: renamed from 'closedModal'
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function setupEventListeners() {
    // Sidebar navigation
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(btn.dataset.section);
        });
    });

    // Book selection for chapters
    const bookSelect = document.getElementById('bookSelect');  // FIX: 'BookSelect' -> 'bookSelect'
    if (bookSelect) {
        bookSelect.addEventListener('change', loadChapterList);
    }

    // Upload zone
    const uploadZone = document.getElementById('uploadZone');
    const fileUpload = document.getElementById('fileUpload');

    if (uploadZone && fileUpload) {
        uploadZone.addEventListener('click', () => {
            fileUpload.click();
        });

        fileUpload.addEventListener('change', handleFileUpload);

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#3498db';
            uploadZone.style.background = '#f0f8ff';
        });

        uploadZone.addEventListener('dragleave', () => {   // FIX: removed misplaced file-drop logic from dragleave
            uploadZone.style.borderColor = '#ddd';
            uploadZone.style.background = 'white';
        });

        uploadZone.addEventListener('drop', (e) => {       // FIX: moved drop logic to the correct 'drop' event
            e.preventDefault();
            uploadZone.style.borderColor = '#ddd';
            uploadZone.style.background = 'white';
            if (e.dataTransfer.files.length) {             // FIX: .file -> .files, lenght -> length
                handleFileUpload({ target: { files: e.dataTransfer.files } });  // FIX: file -> files
            }
        });
    }

    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function handleFileUpload(event) {
    const files = event.target.files;                      // FIX: .file -> .files
    const uploadProgress = document.getElementById('uploadProgress');

    if (!uploadProgress || !files || files.length === 0) return;

    uploadProgress.style.display = 'block';
    uploadProgress.innerHTML = `
        <div class="uploading">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Uploading ${files.length} file(s)...</h3>   <!-- FIX: file.lenght -> files.length -->
            <div class="progress-bar">
                <div class="progress-fill"></div>           <!-- FIX: 'progess-fill' typo -->
            </div>
        </div>
    `;

    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        const progressFill = uploadProgress.querySelector('.progress-fill');  // FIX: 'progessFill' -> 'progressFill'
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                uploadProgress.innerHTML = `
                    <div class="upload-complete">
                        <i class="fas fa-check-circle" style="color: #27ae60; font-size: 3rem;"></i>
                        <h3>Upload Complete!</h3>
                        <p>${files.length} file(s) uploaded successfully.</p>   <!-- FIX: File.lenght -> files.length -->
                        <p><small>Note: In a real implementation, files would be saved to a server.</small></p>
                    </div>
                `;
            }, 500);
        }
    }, 200);
}
