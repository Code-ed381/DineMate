import * as React from 'react';
import { ThemeProvider, createTheme, Components, Theme } from '@mui/material/styles';
import { inputsCustomizations } from '../customizations/inputs';
import { dataDisplayCustomizations } from '../customizations/dataDisplay';
import { feedbackCustomizations } from '../customizations/feedback';
import { navigationCustomizations } from '../customizations/navigation';
import { surfacesCustomizations } from '../customizations/surfaces';
import { getDesignTokens } from '../themePrimitives';

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: Components<Theme>;
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;
  const theme = React.useMemo(() => {
    if (disableCustomTheme) return createTheme();
    
    return createTheme({
      cssVariables: {
        colorSchemeSelector: 'data-mui-color-scheme',
        cssVarPrefix: 'template',
      },
      ...getDesignTokens('light'), // Base tokens
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
      },
    });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) return <>{children}</>;

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
