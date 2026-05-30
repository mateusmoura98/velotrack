import { Tabs, useRouter, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Platform } from 'react-native';
import { colors, spacing, radii } from '../../src/theme/colors';
import { useAuth } from '../../src/contexts/AuthContext';

const TABS = [
  { name: 'index', title: 'Dashboard', icon: 'view-dashboard-outline', active: 'view-dashboard' },
  { name: 'criar-servico', title: 'Novo Serviço', icon: 'plus-circle-outline', active: 'plus-circle' },
  { name: 'tecnicos', title: 'Técnicos', icon: 'account-group-outline', active: 'account-group' },
  { name: 'historico', title: 'Histórico', icon: 'clock-outline', active: 'clock' },
  { name: 'suporte', title: 'Suporte', icon: 'lifebuoy', active: 'lifebuoy' },
];

export default function AdminLayout() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const segments = useSegments();
  const { profile, signOut } = useAuth();

  const isDesktop = Platform.OS === 'web' && width > 768;

  // Detect which tab is currently active
  const currentTab = segments.includes('criar-servico') ? 'criar-servico' :
                     segments.includes('tecnicos') ? 'tecnicos' :
                     segments.includes('historico') ? 'historico' :
                     segments.includes('suporte') ? 'suporte' : 'index';

  const handleTabPress = (name) => {
    if (name === 'index') {
      router.replace('/(admin)');
    } else {
      router.replace(`/(admin)/${name}`);
    }
  };

  return (
    <View style={styles.container}>
      {isDesktop && (
        <View style={styles.sidebar}>
          {/* Logo Branding */}
          <View style={styles.brandBox}>
            <Text style={styles.brandText}>
              <Text style={{ color: colors.text }}>VELO</Text>
              <Text style={{ color: colors.primary }}>TRACK</Text>
            </Text>
            <View style={styles.badgeEnterprise}>
              <Text style={styles.badgeEnterpriseText}>ENTERPRISE</Text>
            </View>
          </View>

          {/* Nav List */}
          <View style={styles.navList}>
            {TABS.map((tab) => {
              const active = currentTab === tab.name;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => handleTabPress(tab.name)}
                  style={({ pressed, hovered }) => [
                    styles.navItem,
                    active && styles.navItemActive,
                    (pressed || hovered) && !active && styles.navItemHover,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={active ? tab.active : tab.icon}
                    size={20}
                    color={active ? colors.text : colors.textMuted}
                  />
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                    {tab.title}
                  </Text>
                  {active && <View style={styles.activeDot} />}
                </Pressable>
              );
            })}
          </View>

          {/* User Profile Info Footer */}
          <View style={styles.profileBox}>
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>
                  {profile?.nome?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.profileName} numberOfLines={1}>{profile?.nome || 'Administrador'}</Text>
                <Text style={styles.profileRole} numberOfLines={1}>{profile?.email || 'admin@velotrack.com'}</Text>
              </View>
            </View>
            <Pressable
              onPress={async () => { await signOut(); }}
              style={({ pressed, hovered }) => [
                styles.btnSignOut,
                (pressed || hovered) && { backgroundColor: colors.errorSoft }
              ]}
            >
              <MaterialCommunityIcons name="logout" size={16} color={colors.error} />
              <Text style={styles.signOutText}>Encerrar Sessão</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Main content viewport containing the Tab router */}
      <View style={styles.mainContent}>
        <Tabs
          screenOptions={{
            headerShown: false,
            // Hide bottom tab bar in desktop web mode
            tabBarStyle: {
              display: isDesktop ? 'none' : 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              height: 56,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
  },
  sidebar: {
    width: 250,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    height: '100%',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  brandBox: {
    marginBottom: spacing['2xl'],
    gap: spacing.xs,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '950',
    letterSpacing: 4,
  },
  badgeEnterprise: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeEnterpriseText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  navList: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: colors.primarySoft,
  },
  navItemHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    flex: 1,
  },
  navLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  profileBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,91,255,0.15)',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  profileRole: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  btnSignOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.md,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
});
