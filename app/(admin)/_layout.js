import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import TabBarButton from '../../src/ui/TabBarButton';

const TABS = [
  { name: 'index', title: 'Início', icon: 'home-outline', active: 'home' },
  { name: 'criar-servico', title: 'Criar', icon: 'plus-circle-outline', active: 'plus-circle' },
  { name: 'tecnicos', title: 'Equipe', icon: 'account-group-outline', active: 'account-group' },
  { name: 'produtividade', title: 'Prod.', icon: 'chart-bar', active: 'chart-bar' },
  { name: 'historico', title: 'Hist.', icon: 'clock-outline', active: 'clock' },
  { name: 'suporte', title: 'Suporte', icon: 'lifebuoy', active: 'lifebuoy' },
];

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 8;

  return (
    <Tabs
      lazy={false}
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 54 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 4,
          elevation: 0,
          shadowOpacity: 0,
          maxWidth: 500,
          alignSelf: 'center',
          width: '100%',
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIconStyle: { marginBottom: 2 },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', letterSpacing: 0.4 },
        tabBarButton: TabBarButton,
        tabBarHideOnKeyboard: true,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? tab.active : tab.icon} size={18} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
