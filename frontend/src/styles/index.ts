// Export all style tokens and themes
export { colors } from './colors';
;
export { typography } from './typography';
export { 
  spacing, 
  borderRadius, 
   
  breakpoints, 
   
  duration, 
  easing 
} from './tokens';

// Export types;
;
;
;

// Theme mode type
type ThemeMode = 'light' | 'dark';

// Get theme by mode
import { lightTheme, darkTheme } from './theme';
const getTheme = (mode: ThemeMode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
