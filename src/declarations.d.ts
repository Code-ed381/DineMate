import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    vars?: any;
    applyStyles: (scheme: 'light' | 'dark', styles: any) => any;
  }
  interface ThemeOptions {
    vars?: any;
  }
}
