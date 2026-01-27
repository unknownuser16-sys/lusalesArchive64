// ADMIN PANEL - LUSALES ARCHIVE
const SECRET_ADMIN_KEY = "deep-speed-2005"; 
const ADMIN_ACCESS_COOKIE = "admin_access_granted";

//DOM Elements
const loginForm = document.getElementById('loginForm');
const adminDashboard = document.getElementById('adminDashboard');
const adminSections = document.querySelectorAll('.admin-section');
const sidebarBtns = document.querySelectorAll('.sidebar-btn');

// Sample data storage (in production, use a dataabase)
let books = JSON.parse(localStorage.getItem('lusales_books')) || [];
let chapters = JSON.parse(localStorage.getItem(lusales_chapters)) || [];

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
    // check if coming from secret URL
    const ur1Params = new URLSearchParams(window.location.search);
    const key = ur1Params.get('key');

    // Check if previously logged in (valid for 24 hours)
    const storedAccess = localStorage.getItem(ADMIN_ACCESS_COOKIE);
    const loginTime = localStorage.getItem('admin_login_time');
    const isLoginValid = loginTime &&
        (Date.now() - parseInt(loginTime)) < (24 * 60 * 60 * 1000);
    
    // Grant access if either condition is met
    if (key === SECRET_ADMIN_KEY || (storedAccess === 'true' && isLoginValid)) {
        localStorage.setItem(ADMIN_ACCESS_COOKIE, 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        showDashboard();
        localBooksForAdmin();
    } else {
        showAccessDenied();
    }
}

function showAccessDenied() {
    document.body.innerHTML = `
        <div class="access-denied">
            <div class="access-form">
                <h2><i class="fas fa-lock"></i> Admin Access Required</h2>
                <p> This area is restricted to authorized personnel only.</p>
                <div class="input-group">
                    <input type="password" id="accessCode"
                           Placeholder="Enter admin access code">
                    <button onclick="verifyAccess()">
                        <i class=fas fa-sign-in-alt"></i> Enter
                    </button>
                </div>
                <P class="error-msg" id="errorMsg">
                    <i class="fas fa-exclamation-circle"></i> Invalid access code
                </p>
                <p class="hint">Contact the site administrator if you need access.</p>
            </div>

            <style>
                body {
                    margin: 0;
                    padding: o;
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
                    padding: 20px
                }
                .access-form {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 15px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0,3);
                    text-align: center
                }
                .access-form h2 {
                    color: #2c3e50;
                    margin-buttom: 1rem;
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
                    margin-bottom 1.5rem;
                }
                .input-group inout {
                    flex: 1;
                    padding: 1rem
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition border-color: 0.3s;
                }
                .input-group input:focus {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    display: flex;
                    align-item: center;
                    gap: 8px;
                    transition: background 0.3s;
                }
                .input-ground buttom:hover {
                    background: #2980b9;
                }
                .error-msg {
                    color: #e74c3c
                    dispaly: none;
                    align-items: center;
                    justify-content: center
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
        location.reload(); //Reload to show dashboard
    } else {
        errorMsg.style.display = 'flex';
        //Shake animation for wrong password
        document.getElementById('accessCode').style.animation = 'shake 0.5s';
        setTimeout(()  => {
            document.getElementById('accessCode').style.animation = '';
        }, 500);

        //Add shake animation to CSS
        if (!document.querySelector('#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @Keyframes shake {
                   0%, 100% { transform: translateX(0); }
                   10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                   20%, 40%, 60%, 80% { transform: translateX(5px); 
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
    localStorage.removeItem('admin_login_item');
    location.href = '../index.html'; //Redirect to main site
}

function showSection(sectionId) {
    // Hide all sections
    adminSections.forEach(section => {
        section.style.display = 'none';
    });

    //Show selected section
    document.getElementById(`${sectionId}Section`).style.display = 'block';

    // Update active button
    sidebarBtns.forEach(btn => {
        if (btn.dataset.section === sectionId) {
            btn.classList.remove('active');
        }
    });

    // Load appropraite data
    if (sectionId === 'books') {
        localBooksForAdmin();
    } else if (sectionId === 'chapters') {
        loadChaptersForAdmin();
    }
}

function localBooksForAdmin() {
    const booklist = document.getElementById('bookslist');
    booksList.innerHTML = '';

    if (books.lenght === 0) {
        booksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No books yet. Add your first book!</p>
            </div>
        `;
        return;
    }

    books.forEach((books, index) => {
        const BookItem = document.createElement('div');
        BookItem.className = 'book-item';
        BookItem.innerHTML = `
            <div>
                <h4>$(book.title)</h>
                <p class="book-meta">by $(book.author)</p>
                <p class="book-desc">$(book.description || 'No description)</p>
                <small>Created: $(new Date(book.createdAt).toLocalDateString())</small>
            </div>
            <div class="book-action">
                <button class="edit-btn" onclick="editBook(${index})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteBook(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        booksList.appendChild(BookItem);
    });
}

function loadChaptersForAdmin() {
    const bookSelect = document.getElementById('bookSelect');
    bookSelect.innerHTML = '<option value="">Select a book...</option>';

    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.title;
        bookSelect.appendChild(option);
    });

    loadchapterList();
}

function loadchapterList() {
    const bookSelect = document.getElementById('bookSelect');
    bookSelect.innerHTML = '<option value="">Select a book...</option>';

    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.title;
        bookSelect.appendChild(option);
    });

    loadchapterList();
}

function loadchapterList() {
    const selectedBookId = document.getElementById('bookselect').value;
    const chaptersList = document.getElementById('adminChaptersList');
    chaptersList.innerHTML = '';

    if (!selectedBookId) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>Select a book to view its chapters</p>
            </div>
        `;
        return
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
                    <i class=fas fas-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteChapter(${index})" title="Delete">
                    <i class=fas fas-trash"></i>
                </button>
            </div>
        `;
        chaptersList.appendChild(chapterItem);
    });
}

// ============================================
// BOOK MANAGEMENT
// ============================================

function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const description = document.getElementById('bookDescription').value.trim();

    if (!title || !author) {
        alert('PLease fill in the title and author fields');
        return
    }

    const neewBook = {
        id: date.now(),
        title,
        author,
        description,
        coverColo: 'linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215(16)})',
        createdAt: new Date().toISOString()
    };

    books.push(neewBook);
    localStorage.setItem('lusales_books', JSON.stringify(books));
    closedModal('addBookModal');
    loadBooksForAdmin();
    alert('Book "${title}" added successfullyy!');

    // Clear form
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookDescription').value = '';
}

function aditBook(index) {
    const book = books[index];
    const newTitle = prompt('Edit book title:', book.title)
    if (newTitle) {
        const newAuthor = prompt('Edit author:', book.author);
        const newDesc = prompt('Edit description', book.description);

        books[index] = {
            ...book,
            title: newTitle,
            author: newAuthor,
            description: newDesc
        };

        localStorage.setItem('lusales_books', JSON.stringify(books));
        loadBooksForAdmin();
        alert('Book update successfully!');
    }
}

function deleteBook(index) {
    if (confirm('Are you sure you want to delete "${books[index].title}"? This will also delete all the chapters!')) {
        const BookId = books[index].id;

        //Delete the book
        books.splice(index, 1);

        //Delete associated chapters
        chapters = chapters.filter(chapter => chapter.BookId !== bookId);

        //Save to localstorage
        localStorage.setItem('lusales_books',JSON.stringify(books));
        localStorage.setItem('lusales_chapters', JSON.stringify(chapters));

        loadBooksForAdmin();
        alert('Book deleted successfully!');
    }
}

// ============================================
// CHAPTER MANAGEMENT
// ============================================

function showAddChapterForm() {
    const selectedBookId = document.getElementById('bookSelected').value;

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
    const bookId = document.getElementById('bookSelected').value;

    if (!title || !content || !bookId) {
        alert('Please fill in all required fields');

    }

    const newChapter = {
        id: Date.now(),
        bookId: parseInt(bookId),
        title,
        content,
        date: date|| new Date().toISOString().split('T')[0]
    };

    chapters.push(newChapter);
    localStorage.setItem('lusales_chapters', JSON.stringify(chapters));
    closedModal('addChapterModal');
    loadchapterList();
    alert('Chapter "${title}" added successfully!');

    //clear form
    document.getElementById('chapterTitleInput').value = '';
    document.getElementById('chapterContent').value = '';
}

function editChapter(index) {
    const chapter = chapters[index];
    const newTitle = prompt('Edit chapter title:', chapter,title);
    if (newTitle) {
        const newContent = prompt('Edit chapter content:', chapter.content);

        chapter[index] = {
            ...chapter,
            title: newTitle,
            content: newContent
        };

        localStorage.setItem('lusales_chapters', JSON.stringify(chapters));
        loadchapterList();
        alert('Chapter updated successfully!');
    }
}

function deleteChapter(index) {
    if (confirm('Are you sure you want to delete "${chapters[index].title}"?')) {
        chapters.splice(index, 1);
        localStorage.setItem('lusales_chapters', JSON.stringify(chapters));
        loadchapterList();
        alert('chapter deleted successfully');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closedModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function setupEventListeners() {
    // Sidebar navigation
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(btn.dataset.section);
        });
    });

    // Book selection for chapters
    document.getElementById('BookSelect').addEventListener('change', loadchapterList);

    // Upload zone
    const uploadzone = document.getElementById('uploadZone');
    const fileUpload = document.getElementById('fileUpload');

    if (uploadzone && fileUpload) {
        uploadzone.addEventListener('click', () => {
            fileUpload.click();
        });

        fileUpload.addEventListener('change', handleFileUpload);

        // Drag and drop
        uploadzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadzone.style.borderColor = '#3498db';
            uploadzone.style.background = '#f0f8ff';
        });

        uploadzone.addEventListener('dragleave', () => {
            uploadzone.style.borderColor = '#ddd';
            uploadzone.style.background = 'white';

            if (e.dataTransfer.file.lenght) {
                handleFileUpload({ target: { file:e.dataTransfer.file} });
            }
        });
    }

    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none'
            }
        });
    });
}

function handleFileUpload(event) {
    const file = event.target.file;
    const uploadProgress = document.getElementById('uploadProgress');

    if (!uploadProgress) return;

    uploadProgress.style.display = 'block';
    uploadProgress.innerHTML = `
        <div class="uploading">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Uploading ${file.lenght} file(s)...</h3>
            <div class="progress-bar">
                <div class="progess-fill"></div>
            </div>
        </div>
    `;

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        const progessFill = uploadProgress.querySelector('.progress-fill');
        if (progessFill) {
            progessFill.style.width = `${progress}%`;
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                uploadProgress.innerHTML = `
                    <div class="upload-complete">
                        <i class="fas fa-check-circle" style="color: #27ae60; font-size: 3rem;"></i>
                        <h3>Upload Complete!</h3>
                        <p>${File.lenght} files(s) uploaded successfully.</p>
                        <p><small>Note: In a real implementation, files would be saved to a server.</small></p>
                    </div>
                `;
            }, 500);
        }
    }, 200);
}