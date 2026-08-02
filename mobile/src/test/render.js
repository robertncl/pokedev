import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme.js';

const insetsFrame = { x: 0, y: 0, width: 320, height: 640 };
const insets = { top: 0, left: 0, right: 0, bottom: 0 };

export function renderWithProviders(ui) {
  return render(
    <SafeAreaProvider initialMetrics={{ frame: insetsFrame, insets }}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );
}

export * from '@testing-library/react-native';
