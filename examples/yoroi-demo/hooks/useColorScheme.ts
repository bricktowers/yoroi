import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  // RN 0.86 may return `unspecified` before the system scheme is known.
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
