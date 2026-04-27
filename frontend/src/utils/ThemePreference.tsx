import React, {
  createContext, ReactNode, useContext, useEffect, useMemo, useState
} from 'react';
import { GlobalTheme } from '@carbon/react';

interface ThemeContextData {
  theme: string,
  setTheme: React.Dispatch<React.SetStateAction<string>>
}

const ThemePreferenceContext = createContext<ThemeContextData>({} as ThemeContextData);

/**
 * Create useThemePreference hook.
 *
 * @returns {ThemeContextData} theme contextS
 */
function useThemePreference() {
  return useContext(ThemePreferenceContext);
}

interface ThemePreferenceProps {
  children?: ReactNode
}

/**
 * Defines the Theme Preference Context and Provider.
 *
 * @param {ReactNode} children with nodes to be rendered
 * @returns {JSX.Element} The Context Provider
 */
function ThemePreference({ children }:ThemePreferenceProps) {
  const [theme, setTheme] = useState('g10');

  const value = useMemo(() => ({
    theme,
    setTheme
  }), [theme, setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-carbon-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedMode = localStorage.getItem('mode');
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark: boolean) => {
      setTheme(isDark ? 'g100' : 'g10');
    };

    if (savedMode === 'dark') {
      setTheme('g100');
    } else if (savedMode === 'light') {
      setTheme('g10');
    } else {
      applyTheme(mediaQuery.matches);
    }

    const onChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('mode')) {
        applyTheme(event.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange);
    } else {
      mediaQuery.addListener(onChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onChange);
      } else {
        mediaQuery.removeListener(onChange);
      }
    };
  }, []);

  return (
    <ThemePreferenceContext.Provider value={value}>
      <GlobalTheme theme={theme}>{children}</GlobalTheme>
    </ThemePreferenceContext.Provider>
  );
}

export { ThemePreference, useThemePreference };
