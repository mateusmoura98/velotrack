import { useTheme } from './index';

export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

export default useThemeColors;
