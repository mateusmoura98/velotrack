import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { typography, radii, spacing } from '../../src/theme/colors';
import { useThemeColors } from '../../src/theme';

import { dashboardService } from '../../src/services/dashboard';
import { clearQueryCache } from '../../src/hooks/useQuery';
import { Card, CardSection } from '../../src/ui/Card';
import Button from '../../src/ui/Button';

const alert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else {
    const { Alert } = require('react-native');
    Alert.alert(title, msg);
  }
};

export default function ConfigsScreen() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { signOut, isDark, toggleTheme, profile } = useAuth();
  const [clearingTest, setClearingTest] = useState(false);
  const [resettingMonth, setResettingMonth] = useState(false);
  const [targetGoal, setTargetGoal] = useState('100');

  const handleRestartTestEnv = async () => {
    setClearingTest(true);
    try {
      await dashboardService.restartTestEnvironment();
      clearQueryCache();
      alert('Sucesso', 'Ambiente de teste reiniciado com sucesso! Todos os dados de teste foram removidos e a dashboard administrativa e operacional foi zerada.');
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      alert('Erro', err.message || 'Falha ao reiniciar ambiente de teste.');
    } finally {
      setClearingTest(false);
    }
  };

  const handleSmartResetMonth = async () => {
    setResettingMonth(true);
    try {
      await dashboardService.resetMonthlyKPIs();
      clearQueryCache();
      setTargetGoal('100');
      alert('Inteligente', 'Metas mensais, KPIs e rankings deste período foram redefinidos para os valores base com sucesso. O histórico de auditoria e logs foi mantido 100% intacto no período anterior!');
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      alert('Erro', err.message || 'Falha no reset inteligente.');
    } finally {
      setResettingMonth(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
        <Text style={styles.sub}>Ajustes de metas, modo teste e preferências globais</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE INFO CARD */}
        <Card style={styles.card}>
          <CardSection label="Perfil do Administrador">
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.nome?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={[styles.profileName, { color: colors.text }]}>{profile?.nome || 'Administrador Velotrack'}</Text>
                <Text style={styles.profileEmail}>{profile?.email || 'admin@velotrack.com'}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>ADMINISTRADOR PRINCIPAL</Text>
                </View>
              </View>
            </View>
          </CardSection>
        </Card>

        {/* TEMA CARD */}
        <Card style={styles.card}>
          <CardSection label="Aparência Visual & Tema">
            <View style={styles.row}>
              <View style={styles.metaRow}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Mesa Premium Escura</Text>
                  <Text style={styles.rowDesc}>Alternar entre modo escuro premium e claro minimalista</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </CardSection>
        </Card>

        {/* METAS CARD */}
        <Card style={styles.card}>
          <CardSection label="Metas de Produtividade Mensal">
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Meta de OS do Mês</Text>
              <Text style={styles.configDesc}>Número de serviços finalizados que serve de base para o progresso do painel comercial</Text>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputText, { color: colors.text }]}>{targetGoal} OS / Mês</Text>
                <View style={styles.adjustRow}>
                  <Pressable 
                    onPress={() => setTargetGoal(prev => String(Math.max(10, parseInt(prev) - 10)))}
                    style={[styles.adjustBtn, { borderColor: colors.border }]}
                  >
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </Pressable>
                  <Pressable 
                    onPress={() => setTargetGoal(prev => String(parseInt(prev) + 10))}
                    style={[styles.adjustBtn, { borderColor: colors.border }]}
                  >
                    <Ionicons name="add" size={16} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            </View>
          </CardSection>
        </Card>

        {/* RESET INTELIGENTE CARD */}
        <Card style={styles.card}>
          <CardSection label="Resets & Eventos Periódicos">
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Reset Mensal Inteligente</Text>
              <Text style={styles.configDesc}>
                Redefinir metas mensais e zerar o ranking de líderes técnicos de faturamento. Esta ação NÃO apaga histórico, eventos auditáveis, usuários cadastrados ou logs de timeline.
              </Text>
              <Button
                title="REALIZAR RESET MENSAL"
                onPress={handleSmartResetMonth}
                loading={resettingMonth}
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </CardSection>
        </Card>

        {/* AMBIENTE DE TESTE CARD */}
        <Card style={styles.card}>
          <CardSection label="Zona Sandbox (Segurança Operacional)">
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Ambiente de Teste</Text>
              <Text style={styles.configDesc}>
                Limpar agendamentos, ordens de serviço e métricas geradas por transações de teste (`is_test = true`). Esta ação garante a integridade e precisão dos dados comerciais do Velotrack.
              </Text>
              <View style={styles.warningBox}>
                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                <Text style={styles.warningBoxText}>
                  Esta ação preserva usuários, autenticações e timelogs de auditoria reais de forma retrocompatível.
                </Text>
              </View>
              <Button
                title="REINICIAR AMBIENTE DE TESTE"
                onPress={handleRestartTestEnv}
                loading={clearingTest}
                variant="primary"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </CardSection>
        </Card>

        {/* LOGOUT SYSTEM */}
        <Button
          title="ENCERRAR SESSÃO NO VELOTRACK"
          onPress={async () => { await signOut(); }}
          variant="outline"
          style={styles.signOutBtn}
        />

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  scroll: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(230,0,80,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230,0,80,0.15)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '850',
    color: colors.primary,
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  configItem: {
    paddingVertical: spacing.sm,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  configDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputText: {
    fontSize: 14,
    fontWeight: '800',
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.06)',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.1)',
  },
  warningBoxText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  signOutBtn: {
    marginTop: spacing.sm,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  bottomSpace: { height: 60 },
});
