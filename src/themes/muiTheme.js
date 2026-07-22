import { createTheme } from '@mui/material/styles';

export function createMuiTheme(isDark) {
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#7ab8ff' : '#2196F3',
        dark: isDark ? '#9ecaff' : '#1976D2',
        light: isDark ? 'rgba(122,184,255,0.18)' : 'rgba(33,150,243,0.1)',
      },
      background: {
        default: isDark ? '#1a1f2e' : '#f5f7fa',
        paper: isDark ? '#222838' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f0f2f5' : '#1f2937',
        secondary: isDark ? '#a0aab8' : '#6b7280',
        disabled: isDark ? '#7a8498' : '#9ca3af',
      },
      divider: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      error: { main: isDark ? '#f87171' : '#f44336' },
      success: { main: isDark ? '#4ade80' : '#4CAF50' },
      warning: { main: isDark ? '#fbbf24' : '#e67e22' },
    },
  });
}