export type ThemePreference = 'dark' | 'light' | 'system';

const THEME_KEY = 'studioops.theme';

export const getThemePreference = (): ThemePreference => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'dark'; // Default theme is dark
};

export const applyTheme = () => {
  const theme = getThemePreference();
  const root = document.documentElement;

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
};

export const setThemePreference = (theme: ThemePreference) => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
};

// Listen to system prefers-color-scheme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
      applyTheme();
    }
  });
}
