// ============================================================
// LUSALES ARCHIVE — MAIN SITE SCRIPT
// ============================================================

// Load data saved by the admin panel
let books    = JSON.parse(localStorage.getItem('lusales_books'))    || [];
let chapters = JSON.parse(localStorage.getItem('lusales_chapters')) || [];

let currentChapterIndex = 0;
let currentBookChapters = [];
let readerFontSize = 1.15;

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedBooks();
    renderRecentChapters();
    setupReader();
    setupSearch();
});

// ============================================================
// FEATURED BOOKS
// ============================================================
function renderFeaturedBooks() {
    const grid = document.getElementById('featuredBooks');
    if (!grid) return;

    if (books.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>No books yet — check back soon.</p>
            </div>`;
        return;
    }

    grid.innerHTML = '';
    books.forEach(book => {
        const bookChapters = chapters.filter(c => c.bookId === book.id);
        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => openBook(book.id);
        card.innerHTML = `
            <div class="book-cover" style="background: ${book.coverColor || defaultCover()}">
                <i class="fas fa-book" style="position:relative;z-index:1;color:rgba(255,255,255,0.3)"></i>
            </div>
            <div class="book-info">
                <h3>${escHtml(book.title)}</h3>
                <p class="author">by ${escHtml(book.author)}</p>
                <span class="chapter-count">${bookChapters.length} chapter${bookChapters.length !== 1 ? 's' : ''}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function defaultCover() {
    const gradients = [
        'linear-gradient(135deg, #1a1a2e, #16213e)',
        'linear-gradient(135deg, #0f3460, #533483)',
        'linear-gradient(135deg, #2d1b69, #11998e)',
        'linear-gradient(135deg, #373b44, #4286f4)',
        'linear-gradient(135deg, #3d0c02, #8a1a0a)',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

// ============================================================
// RECENT CHAPTERS
// ============================================================
function renderRecentChapters() {
    const list = document.getElementById('recentChapters');
    if (!list) return;

    if (chapters.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="grid-column:unset">
                <i class="fas fa-scroll"></i>
                <p>No chapters yet — come back soon.</p>
            </div>`;
        return;
    }

    // Sort newest first, show last 10
    const recent = [...chapters]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    list.innerHTML = '';
    recent.forEach(chapter => {
        const book = books.find(b => b.id === chapter.bookId);
        const entry = document.createElement('div');
        entry.className = 'chapter-entry';
        entry.onclick = () => openChapter(chapter.id);
        entry.innerHTML = `
            <div class="chapter-entry-info">
                <h4>${escHtml(chapter.title)}</h4>
                <span class="book-name">${book ? escHtml(book.title) : 'Unknown Book'}</span>
            </div>
            <div class="chapter-entry-meta">${formatDate(chapter.date)}</div>
        `;
        list.appendChild(entry);
    });
}

// ============================================================
// READER
// ============================================================
function openBook(bookId) {
    const bookChaps = chapters
        .filter(c => c.bookId === bookId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (bookChaps.length === 0) {
        alert('This book has no chapters yet.');
        return;
    }

    currentBookChapters = bookChaps;
    currentChapterIndex = 0;
    showChapterInReader(currentBookChapters[0]);
}

function openChapter(chapterId) {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const bookChaps = chapters
        .filter(c => c.bookId === chapter.bookId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    currentBookChapters = bookChaps;
    currentChapterIndex = bookChaps.findIndex(c => c.id === chapterId);
    showChapterInReader(chapter);
}

function showChapterInReader(chapter) {
    const modal   = document.getElementById('readerModal');
    const title   = document.getElementById('chapterTitle');
    const content = document.getElementById('readerContent');
    const prev    = document.getElementById('prevChapter');
    const next    = document.getElementById('nextChapter');

    title.textContent = chapter.title;

    // Wrap paragraphs for nice reading layout
    const paragraphs = chapter.content
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p>${escHtml(p)}</p>`)
        .join('');

    content.innerHTML = paragraphs || `<p>${escHtml(chapter.content)}</p>`;
    content.style.fontSize = `${readerFontSize}rem`;
    content.scrollTop = 0;

    prev.disabled = currentChapterIndex === 0;
    next.disabled = currentChapterIndex === currentBookChapters.length - 1;

    modal.classList.add('open');
    modal.style.display = 'flex';
}

function setupReader() {
    const modal    = document.getElementById('readerModal');
    const closeBtn = document.querySelector('.close-reader');
    const prev     = document.getElementById('prevChapter');
    const next     = document.getElementById('nextChapter');
    const zoomIn   = document.querySelector('[data-action="zoom-in"]');
    const zoomOut  = document.querySelector('[data-action="zoom-out"]');
    const content  = document.getElementById('readerContent');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            modal.classList.remove('open');
        };
    }

    // Close on backdrop click
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.classList.remove('open');
            }
        };
    }

    if (prev) {
        prev.onclick = () => {
            if (currentChapterIndex > 0) {
                currentChapterIndex--;
                showChapterInReader(currentBookChapters[currentChapterIndex]);
            }
        };
    }

    if (next) {
        next.onclick = () => {
            if (currentChapterIndex < currentBookChapters.length - 1) {
                currentChapterIndex++;
                showChapterInReader(currentBookChapters[currentChapterIndex]);
            }
        };
    }

    if (zoomIn) {
        zoomIn.onclick = () => {
            readerFontSize = Math.min(readerFontSize + 0.1, 1.8);
            if (content) content.style.fontSize = `${readerFontSize}rem`;
        };
    }

    if (zoomOut) {
        zoomOut.onclick = () => {
            readerFontSize = Math.max(readerFontSize - 0.1, 0.8);
            if (content) content.style.fontSize = `${readerFontSize}rem`;
        };
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal || modal.style.display !== 'flex') return;
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            modal.classList.remove('open');
        }
        if (e.key === 'ArrowRight' && next && !next.disabled) next.click();
        if (e.key === 'ArrowLeft' && prev && !prev.disabled) prev.click();
    });
}

// ============================================================
// SEARCH
// ============================================================
function setupSearch() {
    const input  = document.querySelector('.search-box input');
    const button = document.querySelector('.search-box button');

    function doSearch() {
        const query = input.value.trim().toLowerCase();
        if (!query) {
            renderFeaturedBooks();
            return;
        }

        const results = books.filter(b =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            (b.description && b.description.toLowerCase().includes(query))
        );

        const grid = document.getElementById('featuredBooks');
        if (!grid) return;

        if (results.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No books found for "<strong>${escHtml(query)}</strong>"</p>
                </div>`;
            return;
        }

        grid.innerHTML = '';
        results.forEach(book => {
            const bookChapters = chapters.filter(c => c.bookId === book.id);
            const card = document.createElement('div');
            card.className = 'book-card';
            card.onclick = () => openBook(book.id);
            card.innerHTML = `
                <div class="book-cover" style="background: ${book.coverColor || defaultCover()}">
                    <i class="fas fa-book" style="position:relative;z-index:1;color:rgba(255,255,255,0.3)"></i>
                </div>
                <div class="book-info">
                    <h3>${escHtml(book.title)}</h3>
                    <p class="author">by ${escHtml(book.author)}</p>
                    <span class="chapter-count">${bookChapters.length} chapter${bookChapters.length !== 1 ? 's' : ''}</span>
                </div>
            `;
            grid.appendChild(card);
        });

        // Scroll to results
        document.getElementById('featuredBooks').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (button) button.onclick = doSearch;
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
}

// ============================================================
// UTILITIES
// ============================================================
function escHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
