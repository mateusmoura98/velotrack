import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors, typography, radii, spacing } from '../../src/theme/colors';
import { servicosService } from '../../src/services/servicos';
import { tecnicosService } from '../../src/services/tecnicos';
import { Card, CardSection } from '../../src/ui/Card';
import Header from '../../src/ui/Header';
import Input from '../../src/ui/Input';
import Button from '../../src/ui/Button';
import { PriorityBadge } from '../../src/ui/Badge';
import { SkeletonCard } from '../../src/ui/Skeleton';

const TIPOS = ['Instalação', 'Manutenção', 'Retirada', 'Outro'];
const PRIORIDADES = [
  { key: 'baixa', label: 'Baixa', color: colors.success },
  { key: 'media', label: 'Média', color: colors.warning },
  { key: 'alta', label: 'Alta', color: colors.error },
];

const alert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else { const { Alert } = require('react-native'); Alert.alert(title, msg); }
};

export default function CriarServico() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [pageLoading, setPageLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [loadingTecnicos, setLoadingTecnicos] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [form, setForm] = useState({
    cliente: '', endereco: '', telefone: '', veiculo: '', placa: '',
    tipo: 'Instalação', tipoOutro: '', observacoes: '',
    tecnico_id: null, priority: 'media',
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useFocusEffect(useCallback(() => {
    let mounted = true;
    loadTecnicos();
    if (isEditing) loadService();
    return () => { mounted = false; };
  }, [id]));

  const loadService = async () => {
    setPageLoading(true);
    try {
      const data = await servicosService.getById(id);
      setForm({
        cliente: data.cliente || '',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        veiculo: data.veiculo || '',
        placa: data.placa || '',
        tipo: TIPOS.includes(data.tipo) ? data.tipo : 'Outro',
        tipoOutro: TIPOS.includes(data.tipo) ? '' : data.tipo || '',
        observacoes: data.observacoes || '',
        tecnico_id: data.technician_id,
        priority: data.priority || 'media',
      });
    } catch (err) {
      alert('Erro', err.message || 'Não foi possível carregar o serviço.');
      router.back();
    } finally {
      setPageLoading(false);
    }
  };

  const loadTecnicos = async () => {
    setLoadingTecnicos(true);
    try {
      const data = await tecnicosService.listActive();
      setTecnicos(data || []);
    } catch {} finally {
      setLoadingTecnicos(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!form.cliente || !form.endereco || !form.veiculo || !form.tecnico_id) {
      alert('Atenção', 'Preencha cliente, endereço, veículo e selecione um técnico.');
      return;
    }
    const tipoFinal = form.tipo === 'Outro' ? form.tipoOutro : form.tipo;
    if (!tipoFinal) { alert('Atenção', 'Informe o tipo de serviço.'); return; }

    setSubmitting(true);
    const payload = {
      cliente: form.cliente, endereco: form.endereco,
      telefone: form.telefone || '', veiculo: form.veiculo,
      placa: form.placa || '', tipo: tipoFinal,
      descricao: form.observacoes || '',
      technician_id: form.tecnico_id, priority: form.priority,
    };

    try {
      if (isEditing) {
        await servicosService.update(id, payload);
        alert('Sucesso', 'Serviço atualizado com sucesso!');
      } else {
        await servicosService.create(payload);
        alert('Sucesso', 'Serviço criado com sucesso!');
      }
      router.back();
    } catch (err) {
      setErrorMsg(err.message || 'Falha ao salvar serviço.');
      alert('Erro', err.message || 'Falha ao salvar serviço.');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} lines={3} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title={isEditing ? 'Editar Serviço' : 'Novo Serviço'}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card>
          <CardSection label="Dados do Cliente">
            <Input label="Nome" placeholder="João da Silva" value={form.cliente} onChangeText={(v) => updateForm('cliente', v)} icon="person-outline" />
            <Input label="Endereço" placeholder="Rua, número, bairro" value={form.endereco} onChangeText={(v) => updateForm('endereco', v)} icon="location-outline" />
            <View style={styles.row}>
              <Input label="Telefone" placeholder="(00) 00000-0000" value={form.telefone} onChangeText={(v) => updateForm('telefone', v)} keyboardType="phone-pad" icon="call-outline" style={{ flex: 1 }} />
            </View>
            <View style={styles.row}>
              <Input label="Veículo" placeholder="Gol" value={form.veiculo} onChangeText={(v) => updateForm('veiculo', v)} style={{ flex: 1, marginRight: 8 }} />
              <Input label="Placa" placeholder="ABC-1234" value={form.placa} onChangeText={(v) => updateForm('placa', v)} style={{ flex: 1 }} />
            </View>
          </CardSection>
        </Card>

        <Card>
          <CardSection label="Tipo de Serviço">
            <View style={styles.chipRow}>
              {TIPOS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, form.tipo === t && styles.chipActive]}
                  onPress={() => updateForm('tipo', t)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, form.tipo === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {form.tipo === 'Outro' && (
              <Input placeholder="Especifique o tipo" value={form.tipoOutro} onChangeText={(v) => updateForm('tipoOutro', v)} style={{ marginTop: 8 }} />
            )}
          </CardSection>
        </Card>

        <Card>
          <CardSection label="Prioridade">
            <View style={styles.chipRow}>
              {PRIORIDADES.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.chip, form.priority === p.key && { backgroundColor: p.color + '20', borderColor: p.color }]}
                  onPress={() => updateForm('priority', p.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dot, { backgroundColor: p.color }]} />
                  <Text style={[styles.chipText, form.priority === p.key && { color: p.color, fontWeight: '700' }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isEditing && (
              <View style={{ marginTop: spacing.md }}>
                <PriorityBadge priority={form.priority} size="lg" />
              </View>
            )}
          </CardSection>
        </Card>

        <Card>
          <CardSection label="Técnico Responsável">
            {loadingTecnicos ? (
              <ActivityIndicator color={colors.primary} />
            ) : tecnicos.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum técnico ativo. Cadastre em "Técnicos".</Text>
            ) : (
              tecnicos.map((tec) => (
                <TouchableOpacity
                  key={tec.id}
                  style={[styles.techCard, form.tecnico_id === tec.id && styles.techCardActive]}
                  onPress={() => updateForm('tecnico_id', form.tecnico_id === tec.id ? null : tec.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.techLeft}>
                    <View style={[styles.techAvatar, form.tecnico_id === tec.id && styles.techAvatarActive]}>
                      <Ionicons name="person" size={18} color={form.tecnico_id === tec.id ? colors.primary : colors.textMuted} />
                    </View>
                    <View>
                      <Text style={styles.techName}>{tec.nome}</Text>
                      <Text style={styles.techPhone}>{tec.telefone || 'Sem telefone'}</Text>
                    </View>
                  </View>
                  {form.tecnico_id === tec.id && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </TouchableOpacity>
              ))
            )}
          </CardSection>
        </Card>

        <Card>
          <CardSection label="Observações">
            <Input
              placeholder="Detalhes adicionais..."
              value={form.observacoes}
              onChangeText={(v) => updateForm('observacoes', v)}
              multiline
            />
          </CardSection>
        </Card>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <Button
          title={isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR SERVIÇO'}
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          fullWidth
          style={{ marginTop: spacing.xs }}
        />
        {isEditing && (
          <Button
            title="CANCELAR"
            variant="ghost"
            onPress={() => router.back()}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  scroll: { padding: spacing.xl },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  techCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surfaceElevated, padding: spacing.md, borderRadius: radii.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: 'transparent',
  },
  techCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  techLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  techAvatar: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center',
  },
  techAvatarActive: { backgroundColor: colors.primarySoft },
  techName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  techPhone: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  emptyText: { color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', fontSize: 13 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.errorSoft, padding: spacing.md, borderRadius: radii.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.error,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600', flex: 1 },
});
