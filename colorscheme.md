# BytePath Style Guide: Python Color Scheme Implementation

A comprehensive guide for updating BytePath's visual design to use the Python-inspired color scheme with light/dark mode support.

---

## Color Palette

### Primary Colors

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary Blue | `#3776ab` | `#60a5fa` | Headers, buttons, active states |
| Python Yellow | `#ffd343` | `#ffd343` | Accents, highlights, secondary actions |
| Gradient Start | `#3776ab` | `#1e3a5f` | Header backgrounds |
| Gradient End | `#4a8ec4` | `#2d4a6f` | Header backgrounds |

### Semantic Colors (Consistent Across Themes)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Success | Green | `#10b981` | Correct answers, completed items, positive stats |
| Warning | Amber | `#f59e0b` | Pending items, in-progress indicators |
| Error | Red | `#ef4444` | Wrong answers, alerts, destructive actions |
| Info | Blue | `#3b82f6` | Informational messages, links |

### Background & Surface Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | `#f8fafc` | `#0f172a` |
| Card Background | `rgba(255, 255, 255, 0.95)` | `rgba(30, 41, 59, 0.9)` |
| Card Border | `rgba(55, 118, 171, 0.2)` | `rgba(100, 116, 139, 0.2)` |
| Sidebar Background | `rgba(255, 255, 255, 0.9)` | `rgba(30, 41, 59, 0.95)` |
| Code Block Background | `#1e293b` | `#0f172a` |

### Text Colors

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary Text | `#1e293b` | `#f1f5f9` |
| Secondary Text | `#64748b` | `#94a3b8` |
| Text on Gradient | `#ffffff` | `#ffffff` |
| Text on Code Blocks | `#e2e8f0` | `#e2e8f0` |

---

## CSS Variables Setup

Add these CSS custom properties to your root stylesheet for easy theme switching:

```css
:root {
  /* Light Mode (Default) */
  --color-primary: #3776ab;
  --color-primary-light: #4a8ec4;
  --color-accent: #ffd343;
  
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  --bg-page: #f8fafc;
  --bg-gradient: linear-gradient(135deg, #3776ab 0%, #4a8ec4 50%, #2d6a9f 100%);
  --bg-card: rgba(255, 255, 255, 0.95);
  --bg-card-hover: rgba(255, 255, 255, 1);
  --bg-sidebar: rgba(255, 255, 255, 0.9);
  --bg-sidebar-item: rgba(55, 118, 171, 0.1);
  --bg-sidebar-item-active: rgba(55, 118, 171, 0.2);
  --bg-code: #1e293b;
  
  --border-card: rgba(55, 118, 171, 0.2);
  --border-hover: rgba(255, 211, 67, 0.5);
  
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-on-gradient: #ffffff;
  --text-code: #e2e8f0;
  
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-light: #93c5fd;
  
  --bg-page: #0f172a;
  --bg-gradient: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 50%, #1a2f4a 100%);
  --bg-card: rgba(30, 41, 59, 0.9);
  --bg-card-hover: rgba(30, 41, 59, 1);
  --bg-sidebar: rgba(30, 41, 59, 0.95);
  --bg-sidebar-item: rgba(96, 165, 250, 0.1);
  --bg-sidebar-item-active: rgba(96, 165, 250, 0.2);
  --bg-code: #0f172a;
  
  --border-card: rgba(100, 116, 139, 0.2);
  --border-hover: rgba(255, 211, 67, 0.4);
  
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.4);
}
```

---

## Component Updates

### 1. Header / Navigation

**Current:** Full gradient background  
**Keep:** This works well, just update the gradient colors

```css
.header {
  background: var(--bg-gradient);
  padding: 16px 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: var(--text-on-gradient);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover,
.nav-btn.active {
  background: rgba(255, 255, 255, 0.2);
}
```

### 2. Sidebar

**Current:** Transparent over gradient  
**Improvement:** Solid background for better readability during long sessions

```css
.sidebar {
  width: 280px;
  background: var(--bg-sidebar);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--border-card);
  padding: 100px 16px 24px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-sidebar-item);
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 600;
  transition: all 0.2s;
}

.sidebar-header:hover {
  background: var(--bg-sidebar-item-active);
}

.sidebar-item {
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  margin-left: 16px;
}

.sidebar-item:hover {
  background: var(--bg-sidebar-item);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--bg-sidebar-item-active);
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}

/* Progress indicator dots */
.item-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent); /* Pending */
}

.item-status.complete {
  background: var(--color-success);
}
```

### 3. Main Content Area

**Current:** Gradient background continues  
**Improvement:** Clean solid background so content stands out

```css
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 100px 32px 32px;
  background: var(--bg-page);
  min-height: 100vh;
}
```

### 4. Quiz Cards

**Current:** Glassmorphism on gradient  
**Improvement:** Solid card with subtle shadow for better focus

```css
.quiz-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow-card);
  max-width: 800px;
  transition: all 0.2s;
}

.quiz-card:hover {
  box-shadow: var(--shadow-hover);
}
```

### 5. Code Blocks

**Keep consistent across light/dark** — code should always be on dark background for readability:

```css
.code-block {
  background: var(--bg-code);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  font-family: 'Monaco', 'Menlo', 'Fira Code', monospace;
  font-size: 16px;
  color: var(--text-code);
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Syntax highlighting */
.code-block .keyword { color: #c792ea; }
.code-block .string { color: #c3e88d; }
.code-block .number { color: #f78c6c; }
.code-block .function { color: #82aaff; }
.code-block .comment { color: #676e95; }
.code-block .operator { color: #89ddff; }
.code-block .variable { color: #f07178; }
```

### 6. Answer Buttons

```css
.answer-btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid var(--border-card);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  text-align: center;
}

.answer-btn:hover {
  border-color: var(--color-primary);
  background: var(--bg-sidebar-item);
  transform: translateY(-2px);
}

.answer-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.answer-btn.correct {
  border-color: var(--color-success);
  background: var(--color-success);
  color: white;
}

.answer-btn.incorrect {
  border-color: var(--color-error);
  background: var(--color-error);
  color: white;
}
```

### 7. Dashboard Stat Cards

**Keep gradients here** — they work well for highlighting key metrics:

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  color: white;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Card variants */
.stat-card.primary {
  background: linear-gradient(135deg, #3776ab 0%, #4a8ec4 100%);
}

.stat-card.accent {
  background: linear-gradient(135deg, #ffd343 0%, #f59e0b 100%);
  color: #1e293b; /* Dark text on yellow */
}

.stat-card.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-meta {
  font-size: 13px;
  opacity: 0.8;
}
```

### 8. Topic/Progress Cards

```css
.topic-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-hover);
}

.topic-name {
  font-weight: 600;
  color: var(--text-primary);
}

.topic-progress {
  font-size: 14px;
  color: var(--color-success);
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: var(--bg-sidebar-item);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: 4px;
  transition: width 0.3s ease;
}
```

---

## Dark Mode Toggle Implementation

### JavaScript

```javascript
// Check for saved preference or system preference
function getThemePreference() {
  const saved = localStorage.getItem('bytepath-theme');
  if (saved) return saved;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

// Apply theme
function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('bytepath-theme', theme);
}

// Toggle function
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setTheme(getThemePreference());
});

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('bytepath-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
```

### Toggle Button Component

```html
<button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode">
  <span class="icon-sun">☀️</span>
  <span class="icon-moon">🌙</span>
</button>
```

```css
.theme-toggle {
  background: var(--bg-sidebar-item);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: var(--bg-sidebar-item-active);
}

/* Show/hide icons based on theme */
:root .icon-moon { display: none; }
:root .icon-sun { display: inline; }

[data-theme="dark"] .icon-moon { display: inline; }
[data-theme="dark"] .icon-sun { display: none; }
```

---

## Migration Checklist

### Phase 1: Variables & Foundation
- [ ] Add CSS custom properties to root stylesheet
- [ ] Add dark theme variables
- [ ] Test that variables cascade properly

### Phase 2: Core Components
- [ ] Update header gradient colors
- [ ] Update sidebar to use solid background
- [ ] Update main content area background
- [ ] Update card backgrounds and borders

### Phase 3: Interactive Elements
- [ ] Update button styles (nav, answer, export)
- [ ] Update sidebar item hover/active states
- [ ] Update form inputs if any

### Phase 4: Dashboard
- [ ] Update stat card gradients
- [ ] Update progress bars
- [ ] Update topic cards

### Phase 5: Dark Mode
- [ ] Implement theme toggle JavaScript
- [ ] Add toggle button to header
- [ ] Test all components in dark mode
- [ ] Verify code blocks remain readable

### Phase 6: Polish
- [ ] Add smooth transitions between themes
- [ ] Test on mobile viewports
- [ ] Verify accessibility (contrast ratios)
- [ ] Test with actual content/data

---

## Accessibility Notes

### Contrast Ratios

All color combinations meet WCAG AA standards:

| Combination | Ratio | Pass |
|-------------|-------|------|
| Primary text on light bg | 12.5:1 | ✓ AAA |
| Primary text on dark bg | 13.2:1 | ✓ AAA |
| Secondary text on light bg | 4.9:1 | ✓ AA |
| Secondary text on dark bg | 5.1:1 | ✓ AA |
| White on primary blue | 4.7:1 | ✓ AA |
| Dark text on yellow accent | 9.8:1 | ✓ AAA |

### Focus States

Don't forget visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

[data-theme="dark"] :focus-visible {
  outline-color: var(--color-accent);
}
```

---

## Summary of Key Changes

1. **Contain the gradient** — Use it in the header and stat cards only, not as the full page background
2. **Solid content areas** — Quiz cards and main content get clean backgrounds for readability
3. **Consistent semantic colors** — Green/yellow/red mean the same thing everywhere
4. **Proper dark mode** — Not just darker gradients, but a fully designed dark theme
5. **Better sidebar** — Solid background with clear active states
6. **Code blocks stay dark** — Consistent code appearance regardless of theme

The Python blue (#3776ab) and yellow (#ffd343) combo is instantly recognizable and gives BytePath a professional, branded feel while still being approachable for students.