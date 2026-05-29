import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import TabBarButton from '../../src/ui/TabBarButton';

export default function TecnicoLayout() {
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="os-do-dia"
        options={{
          title: 'OS do Dia',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'clipboard-text' : 'clipboard-text-outline'} size={18} color={color} />
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
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="servico/[id]" options={{ href: null }} />
      <Tabs.Screen name="suporte" options={{ href: null }} />
    </Tabs>
  );
}
