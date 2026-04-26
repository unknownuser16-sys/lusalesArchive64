// ============================================================
// LUSALES ARCHIVE — THEME ENGINE
// ============================================================

const THEMES = {
    dark: {
        name: 'Dark',
        icon: '🌑',
        vars: {
            '--bg':          '#0d0d0f',
            '--bg-card':     '#13131a',
            '--bg-hover':    '#1a1a24',
            '--border':      '#2a2a3a',
            '--accent':      '#c8973a',
            '--accent-dim':  '#7a5820',
            '--accent-glow': 'rgba(200,151,58,0.15)',
            '--text':        '#e8e4d9',
            '--text-muted':  '#7a7568',
            '--text-dim':    '#3a3830',
            '--nav-bg':      'rgba(13,13,15,0.92)',
            '--shadow':      '0 8px 32px rgba(0,0,0,0.5)',
        }
    },
    light: {
        name: 'Light',
        icon: '☀️',
        vars: {
            '--bg':          '#f5f0e8',
            '--bg-card':     '#fffdf7',
            '--bg-hover':    '#f0ebe0',
            '--border':      '#ddd8cc',
            '--accent':      '#b8821a',
            '--accent-dim':  '#8a6010',
            '--accent-glow': 'rgba(184,130,26,0.12)',
            '--text':        '#1a1610',
            '--text-muted':  '#6b6358',
            '--text-dim':    '#b0a898',
            '--nav-bg':      'rgba(245,240,232,0.95)',
            '--shadow':      '0 8px 32px rgba(0,0,0,0.12)',
        }
    },
    royal: {
        name: 'Royal',
        icon: '🌊',
        vars: {
            '--bg':          '#0a0e1a',
            '--bg-card':     '#0f1525',
            '--bg-hover':    '#151d30',
            '--border':      '#1e2a45',
            '--accent':      '#4d9fff',
            '--accent-dim':  '#2563b0',
            '--accent-glow': 'rgba(77,159,255,0.15)',
            '--text':        '#d0dff5',
            '--text-muted':  '#6888b0',
            '--text-dim':    '#2a3a58',
            '--nav-bg':      'rgba(10,14,26,0.95)',
            '--shadow':      '0 8px 32px rgba(0,0,80,0.4)',
        }
    },
    custom: {
        name: 'Custom',
        icon: '🎨',
        vars: null // built dynamically
    }
};

const DEFAULT_CUSTOM = {
    '--bg':          '#1a0a2e',
    '--bg-card':     '#24103d',
    '--bg-hover':    '#2e1550',
    '--border':      '#3d1f6b',
    '--accent':      '#bf5fff',
    '--accent-dim':  '#8a35cc',
    '--accent-glow': 'rgba(191,95,255,0.15)',
    '--text':        '#f0e0ff',
    '--text-muted':  '#9070b8',
    '--text-dim':    '#4a2a70',
    '--nav-bg':      'rgba(26,10,46,0.95)',
    '--shadow':      '0 8px 32px rgba(80,0,120,0.4)',
};

// ── Apply theme to document ───────────────────────────────
function applyTheme(themeKey, customVars) {
    const theme = THEMES[themeKey];
    if (!theme) return;

    let vars = theme.vars;

    if (themeKey === 'custom') {
        const saved = localStorage.getItem('lusales_custom_theme');
        vars = saved ? JSON.parse(saved) : (customVars || DEFAULT_CUSTOM);
    }

    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
    });

    // Store active theme
    localStorage.setItem('lusales_theme', themeKey);
    document.documentElement.setAttribute('data-theme', themeKey);

    // Update toggle buttons if they exist
    updateThemeUI(themeKey);
}

function updateThemeUI(activeKey) {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === activeKey);
    });
}

// ── Load saved theme on page load ────────────────────────
function loadSavedTheme() {
    const saved = localStorage.getItem('lusales_theme') || 'dark';
    applyTheme(saved);
}

// ── Build theme switcher UI ───────────────────────────────
function buildThemeSwitcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.innerHTML = `
        <button class="theme-toggle-btn" id="themeToggleBtn" onclick="toggleThemePanel()" title="Change theme">
            <i class="fas fa-palette"></i>
        </button>
        <div class="theme-panel" id="themePanel">
            <div class="theme-panel-header">Theme</div>
            <div class="theme-options">
                ${Object.entries(THEMES).map(([key, t]) => `
                    <button class="theme-option" data-theme="${key}" onclick="selectTheme('${key}')">
                        <span class="theme-icon">${t.icon}</span>
                        <span class="theme-name">${t.name}</span>
                    </button>
                `).join('')}
            </div>
            <div class="custom-theme-editor" id="customThemeEditor" style="display:none">
                <div class="color-row">
                    <label>Background</label>
                    <input type="color" id="customBg" value="#1a0a2e">
                </div>
                <div class="color-row">
                    <label>Accent</label>
                    <input type="color" id="customAccent" value="#bf5fff">
                </div>
                <div class="color-row">
                    <label>Text</label>
                    <input type="color" id="customText" value="#f0e0ff">
                </div>
                <button class="apply-custom-btn" onclick="applyCustomTheme()">Apply</button>
            </div>
        </div>
    `;

    container.appendChild(switcher);

    // Close panel when clicking outside
    document.addEventListener('click', e => {
        const panel = document.getElementById('themePanel');
        const btn   = document.getElementById('themeToggleBtn');
        if (panel && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            panel.classList.remove('open');
        }
    });

    // Mark active theme
    const saved = localStorage.getItem('lusales_theme') || 'dark';
    updateThemeUI(saved);

    // Show custom editor if custom is active
    if (saved === 'custom') {
        const editor = document.getElementById('customThemeEditor');
        if (editor) editor.style.display = 'block';
    }
}

function toggleThemePanel() {
    const panel = document.getElementById('themePanel');
    if (panel) panel.classList.toggle('open');
}

function selectTheme(key) {
    applyTheme(key);
    const editor = document.getElementById('customThemeEditor');
    if (editor) editor.style.display = key === 'custom' ? 'block' : 'none';
    if (key !== 'custom') {
        const panel = document.getElementById('themePanel');
        if (panel) setTimeout(() => panel.classList.remove('open'), 300);
    }
}

function applyCustomTheme() {
    const bg     = document.getElementById('customBg')?.value     || '#1a0a2e';
    const accent = document.getElementById('customAccent')?.value || '#bf5fff';
    const text   = document.getElementById('customText')?.value   || '#f0e0ff';

    // Derive supporting colors from base picks
    const customVars = {
        '--bg':          bg,
        '--bg-card':     lightenDarken(bg, 15),
        '--bg-hover':    lightenDarken(bg, 25),
        '--border':      lightenDarken(bg, 40),
        '--accent':      accent,
        '--accent-dim':  lightenDarken(accent, -30),
        '--accent-glow': hexToRgba(accent, 0.15),
        '--text':        text,
        '--text-muted':  hexToRgba(text, 0.6).replace('rgba', 'rgba').replace(/[\d.]+\)$/, '0.6)'),
        '--text-dim':    hexToRgba(text, 0.25).replace(/[\d.]+\)$/, '0.25)'),
        '--nav-bg':      hexToRgba(bg, 0.95),
        '--shadow':      `0 8px 32px ${hexToRgba(accent, 0.2)}`,
    };

    localStorage.setItem('lusales_custom_theme', JSON.stringify(customVars));
    applyTheme('custom', customVars);
}

// ── Color utilities ───────────────────────────────────────
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function lightenDarken(hex, amount) {
    let r = parseInt(hex.slice(1,3), 16);
    let g = parseInt(hex.slice(3,5), 16);
    let b = parseInt(hex.slice(5,7), 16);
    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
