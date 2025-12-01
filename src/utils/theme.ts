// Theme management utilities

export type Theme = 'light' | 'dark';

export function getThemePreference(): Theme {
  const saved = localStorage.getItem('bytepath-theme');
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

export function setTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('bytepath-theme', theme);
}

export function toggleTheme(): Theme {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

// Initialize theme on load
export function initTheme() {
  setTheme(getThemePreference());
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem('bytepath-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
}

