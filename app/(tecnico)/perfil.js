import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, typography, radii, spacing } from '../../src/theme/colors';

export default function Perfil() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Tem certeza que deseja sair?')) return;
    }
    await signOut();
  };

  const menuItems = [
    {
      icon: 'lifebuoy',
      label: 'Suporte',
      desc: 'Fale com o administrador',
      route: '/(tecnico)/suporte',
    },
    {
      icon: 'settings-outline',
      label: 'Configurações',
      desc: 'Em breve',
      route: null,
    },
    {
      icon: 'log-out-outline',
      label: 'Sair',
      desc: 'Encerrar sessão',
      action: handleLogout,
      danger: true,
    },
  ];

  const initials = profile?.nome
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'T';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.nome || 'Técnico'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="construct-outline" size={12} color={colors.primary} />
            <Text style={styles.roleText}>Técnico</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
                item.danger && styles.menuItemDanger,
              ]}
              onPress={() => {
                if (item.action) item.action();
                else if (item.route) router.push(item.route);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.danger ? colors.error : colors.primary}
                />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, item.danger && { color: colors.error }]}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl },
  header: {
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text },
  profileCard: {
    alignItems: 'center', backgroundColor: colors.card, borderRadius: radii.xl,
    padding: spacing['2xl'], borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.primary },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 2 },
  email: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  menu: {
    backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemDanger: { backgroundColor: colors.error + '04' },
  menuIcon: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  menuIconDanger: { backgroundColor: colors.error + '10' },
  menuInfo: { flex: 1, marginLeft: spacing.md },
  menuLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  menuDesc: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
});
