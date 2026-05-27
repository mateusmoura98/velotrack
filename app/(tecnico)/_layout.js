import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

export default function TecnicoLayout() {
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
          height: 52,
          paddingBottom: 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wrench' : 'wrench-outline'} size={16} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'refresh' : 'refresh-outline'} size={16} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="suporte"
        options={{
          title: 'Suporte',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'lifebuoy' : 'lifebuoy-outline'} size={16} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="servico/[id]" options={{ href: null }} />
    </Tabs>
  );
}
