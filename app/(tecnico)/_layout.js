import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'wrench' : 'wrench-outline'} size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'clock' : 'clock-outline'} size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="suporte"
        options={{
          title: 'Suporte',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'lifebuoy' : 'lifebuoy'} size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="servico/[id]" options={{ href: null }} />
    </Tabs>
  );
}
