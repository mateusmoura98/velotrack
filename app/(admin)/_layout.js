import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../src/theme/colors';

const TABS = [
  { name: 'index', title: 'Dashboard', icon: 'grid-outline', focusedIcon: 'grid' },
  { name: 'criar-servico', title: 'Novo', icon: 'add-circle-outline', focusedIcon: 'add-circle' },
  { name: 'tecnicos', title: 'Técnicos', icon: 'people-outline', focusedIcon: 'people' },
  { name: 'historico', title: 'Histórico', icon: 'time-outline', focusedIcon: 'time' },
  { name: 'suporte', title: 'Suporte', icon: 'chatbubble-outline', focusedIcon: 'chatbubble' },
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
          height: 58,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },
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
              <Ionicons name={focused ? tab.focusedIcon : tab.icon} size={20} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
