import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import { theme } from '../theme.js';

export function renderWithProviders(ui) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

export * from '@testing-library/react';
