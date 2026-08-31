import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(colorName: keyof typeof Colors.light) {
  return Colors[useColorScheme()][colorName];
}
