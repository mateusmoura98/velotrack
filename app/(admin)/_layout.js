import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

const TABS = [
  { name: 'index', title: 'Dashboard', icon: 'home-outline', active: 'home' },
  { name: 'criar-servico', title: 'Novo', icon: 'plus-circle-outline', active: 'plus-circle' },
  { name: 'tecnicos', title: 'Técnicos', icon: 'account-group-outline', active: 'account-group' },
  { name: 'historico', title: 'Histórico', icon: 'clock-outline', active: 'clock' },
  { name: 'suporte', title: 'Suporte', icon: 'lifebuoy', active: 'lifebuoy' },
];

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 54,
          paddingBottom: 6,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
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
