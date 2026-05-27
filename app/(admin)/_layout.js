import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

const TABS = [
  { name: 'index', title: 'Dashboard', icon: 'grid-outline', active: 'grid' },
  { name: 'criar-servico', title: 'Novo', icon: 'add-circle-outline', active: 'add-circle' },
  { name: 'tecnicos', title: 'Técnicos', icon: 'people-outline', active: 'people' },
  { name: 'historico', title: 'Histórico', icon: 'time-outline', active: 'time' },
  { name: 'suporte', title: 'Suporte', icon: 'lifebuoy-outline', active: 'lifebuoy' },
];

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 54,
          paddingVertical: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
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
              <Ionicons name={focused ? tab.active : tab.icon} size={18} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
