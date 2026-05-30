import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Switch,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/theme/colors';
import { servicosService } from '../../src/services/servicos';
import { tecnicosService } from '../../src/services/tecnicos';
import { Card, CardSection } from '../../src/ui/Card';
import Header from '../../src/ui/Header';
import Input from '../../src/ui/Input';
import Button from '../../src/ui/Button';

const TIPOS_TAREFA = [
  'Instalação',
  'Instalação com Bloqueio',
  'Manutenção',
  'Retirada',
];

const REPETECOS = ['Não se repete', 'Diário', 'Semanal', 'Mensal'];
const FORMAS_PAGAMENTO = ['Pix', 'Cartão de Crédito', 'Boleto Bancário', 'Dinheiro'];

const DEF_EQUIPAMENTOS = [
  { id: 'eq-1', name: 'Rastreador OBD-II (VT200)', serial: 'OBD20241022A', active: false },
  { id: 'eq-2', name: 'Rastreador GPS Wired (VT400)', serial: 'GPS400-8831B', active: false },
  { id: 'eq-3', name: 'Rastreador de Ativos (VT800)', serial: 'ATV800-9902X', active: false },
  { id: 'eq-4', name: 'Bloqueador e Rele de Ignição', serial: 'REL-40A-00213', active: false },
  { id: 'eq-5', name: 'Limitador de Velocidade Integrado', serial: 'GOV-V2-88411', active: false },
];

const DEF_CLIENTES_PRESET = [
  { id: 'c-1', nome: 'TransLatina Logística S/A', cnpj: '11.222.333/0001-44', endereco: 'Av. Paulista, 1200 - Bela Vista', telefone: '(11) 98888-1111', cidade: 'São Paulo' },
  { id: 'c-2', nome: 'Expresso Rent-a-Car', cnpj: '44.555.666/0001-22', endereco: 'Rua das Flores, 88 - Jardins', telefone: '(11) 97777-2222', cidade: 'São Paulo' },
  { id: 'c-3', nome: 'VIP Soluções de Rastreamento', cnpj: '99.888.777/0001-88', endereco: 'Rua Chile, 45 - Centro', telefone: '(71) 96666-3333', cidade: 'Salvador' },
];

const alert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else {
    const { Alert } = require('react-native');
    Alert.alert(title, msg);
  }
};

export default function CriarServico() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState('geral');
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [loadingTecnicos, setLoadingTecnicos] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modal de Cadastrar Cliente
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCnpj, setNewClientCnpj] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientCity, setNewClientCity] = useState('');
  const [searchingCnpj, setSearchingCnpj] = useState(false);

  // Form State containing all fields shown in the video list
  const [form, setForm] = useState({
    cliente: '',
    endereco: '',
    telefone: '',
    veiculo: '',
    placa: '',
    tipo: 'Instalação',
    tipoOutro: '',
    observacoes: '',
    tecnico_id: null,
    priority: 'media',

    // Geral Tab extra fields
    date: new Date().toLocaleDateString('pt-BR'),
    time: '14:00',
    duration: '01:30',
    satisfactionSurvey: true,
    whatsappOS: true,
    externalCode: '',
    keyword: '',

    // Localização Tab extra fields
    cidade: '',
    googleMapsUrl: '',
    latitude: '-23.55052',
    longitude: '-46.63330',

    // Equipments list
    equipments: [],

    // Attachments grid
    attachments: [
      { id: 'a-1', name: 'foto_checklist_frontal.jpg', size: '280 KB', type: 'image' },
      { id: 'a-2', name: 'termo_instalacao_assinado.pdf', size: '1.4 MB', type: 'doc' },
    ],

    // Repetição Tab
    repType: 'Não se repete',
    repDays: ['Seg', 'Qua', 'Sex'],

    // Valores Tab
    valServico: '180,00',
    formaPagamento: 'Pix',
    isFaturado: true,
    isPago: false,

    // Notificações Tab
    notifAgendamento: true,
    notifConclusao: true,
    notifPush: true,
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useFocusEffect(
    useCallback(() => {
      loadTecnicos();
      if (isEditing) loadService();
    }, [id])
  );

  const loadService = async () => {
    setPageLoading(true);
    try {
      const data = await servicosService.getById(id);
      
      // Decodificar metadados customizados complexos guardados no campo "checklist" ou no campo "metadata"
      const meta = data.metadata || {};
      const jsonMeta = data.checklist && (typeof data.checklist === 'string' ? JSON.parse(data.checklist) : data.checklist);

      setForm({
        cliente: data.cliente || '',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        veiculo: data.veiculo || '',
        placa: data.placa || '',
        tipo: TIPOS_TAREFA.includes(data.tipo) ? data.tipo : 'Outro',
        tipoOutro: TIPOS_TAREFA.includes(data.tipo) ? '' : data.tipo || '',
        observacoes: data.descricao || data.observations || '',
        tecnico_id: data.technician_id || null,
        priority: data.priority || 'media',

        // Carregar campos adicionais persistidos no checklist JSON ou no campo metadata
        date: meta.schedule?.date || jsonMeta?.date || new Date().toLocaleDateString('pt-BR'),
        time: meta.schedule?.time || jsonMeta?.time || '14:00',
        duration: meta.schedule?.duration || jsonMeta?.duration || '01:30',
        satisfactionSurvey: meta.notifications?.satisfactionSurvey ?? jsonMeta?.satisfactionSurvey ?? true,
        whatsappOS: meta.notifications?.whatsappOS ?? jsonMeta?.whatsappOS ?? true,
        externalCode: meta.notifications?.externalCode || jsonMeta?.externalCode || '',
        keyword: meta.notifications?.keyword || jsonMeta?.keyword || '',
        cidade: meta.location?.cidade || jsonMeta?.cidade || '',
        googleMapsUrl: meta.location?.googleMapsUrl || jsonMeta?.googleMapsUrl || '',
        latitude: meta.location?.latitude || jsonMeta?.latitude || '-23.55052',
        longitude: meta.location?.longitude || jsonMeta?.longitude || '-46.63330',
        equipments: meta.equipment || jsonMeta?.equipments || [],
        attachments: meta.attachments || jsonMeta?.attachments || [
          { id: 'a-1', name: 'foto_checklist_frontal.jpg', size: '280 KB', type: 'image' },
        ],
        repType: meta.schedule?.repType || jsonMeta?.repType || 'Não se repete',
        repDays: meta.schedule?.repDays || jsonMeta?.repDays || ['Seg', 'Qua', 'Sex'],
        valServico: meta.billing?.valServico || jsonMeta?.valServico || '180,00',
        formaPagamento: meta.billing?.formaPagamento || jsonMeta?.formaPagamento || 'Pix',
        isFaturado: meta.billing?.isFaturado ?? jsonMeta?.isFaturado ?? true,
        isPago: meta.billing?.isPago ?? jsonMeta?.isPago ?? false,
        notifAgendamento: meta.notifications?.notifAgendamento ?? jsonMeta?.notifAgendamento ?? true,
        notifConclusao: meta.notifications?.notifConclusao ?? jsonMeta?.notifConclusao ?? true,
        notifPush: meta.notifications?.notifPush ?? jsonMeta?.notifPush ?? true,
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
    } catch {
    } finally {
      setLoadingTecnicos(false);
    }
  };

  // Simulação de busca rápida de CNPJ no cadastro de clientes
  const handleCnpjSearch = () => {
    if (!newClientCnpj) {
      alert('Atenção', 'Informe um CPF ou CNPJ para buscar.');
      return;
    }
    setSearchingCnpj(true);
    setTimeout(() => {
      setSearchingCnpj(false);
      setNewClientName('Transportadora Alpha Minas Ltda');
      setNewClientPhone('(31) 98711-2200');
      setNewClientAddress('Av. do Contorno, 4390 - Savassi');
      setNewClientCity('Belo Horizonte - MG');
      alert('Sucesso', 'Empresa carregada com sucesso da base integrada!');
    }, 1200);
  };

  const saveClientModal = () => {
    if (!newClientName || !newClientAddress) {
      alert('Atenção', 'Preencha o nome do cliente e endereço.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      cliente: newClientName,
      endereco: newClientAddress,
      telefone: newClientPhone,
      cidade: newClientCity,
    }));
    setShowClientModal(false);
    alert('Sucesso', `Cliente "${newClientName}" selecionado e integrado à OS!`);
  };

  // Clique rápido para extrair coordenadas da URL do Google Maps
  const handleExtractCoordinates = () => {
    if (!form.googleMapsUrl) {
      alert('Atenção', 'Insira uma URL do Google Maps para extrair as coordenadas.');
      return;
    }
    // Simula regex extraindo lat/lng
    updateForm('latitude', '-23.56168');
    updateForm('longitude', '-46.65604');
    updateForm('cidade', 'São Paulo - SP');
    alert('Extraído', 'Coordenadas e local extraídos diretamente do link do Google Maps!');
  };

  // Gera equipamento mockado no checklist ou remove
  const toggleEquipment = (eqId) => {
    const list = [...form.equipments];
    if (list.includes(eqId)) {
      updateForm('equipments', list.filter((id) => id !== eqId));
    } else {
      updateForm('equipments', [...list, eqId]);
    }
  };

  // Gera novo anexo simulado
  const handleAddMockFile = () => {
    const randomId = `a-${Date.now()}`;
    const newFile = {
      id: randomId,
      name: `velotrack_instalado_${Math.floor(Math.random() * 900) + 100}.jpg`,
      size: '340 KB',
      type: 'image',
    };
    updateForm('attachments', [...form.attachments, newFile]);
    alert('Anexo Adicionado', 'Imagem capturada anexada com sucesso à ordem de serviço.');
  };

  const handleRemoveFile = (fileId) => {
    updateForm('attachments', form.attachments.filter((f) => f.id !== fileId));
  };

  const toggleDay = (day) => {
    const list = [...form.repDays];
    if (list.includes(day)) {
      updateForm('repDays', list.filter((d) => d !== day));
    } else {
      updateForm('repDays', [...list, day]);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!form.cliente || !form.endereco) {
      alert('Atenção', 'Por favor, preencha o Nome do Cliente e o Endereço na aba Localização.');
      return;
    }

    setSubmitting(true);

    const tipoFinal = form.tipo === 'Outro' ? form.tipoOutro : form.tipo;

    // Encapsular campos avançados integrados no payload do "checklist" JSON
    const checklistPayload = {
      date: form.date,
      time: form.time,
      duration: form.duration,
      satisfactionSurvey: form.satisfactionSurvey,
      whatsappOS: form.whatsappOS,
      externalCode: form.externalCode,
      keyword: form.keyword,
      cidade: form.cidade,
      googleMapsUrl: form.googleMapsUrl,
      latitude: form.latitude,
      longitude: form.longitude,
      equipments: form.equipments,
      attachments: form.attachments,
      repType: form.repType,
      repDays: form.repDays,
      valServico: form.valServico,
      formaPagamento: form.formaPagamento,
      isFaturado: form.isFaturado,
      isPago: form.isPago,
      notifAgendamento: form.notifAgendamento,
      notifConclusao: form.notifConclusao,
      notifPush: form.notifPush,
    };

    const payload = {
      cliente: form.cliente,
      endereco: form.endereco,
      telefone: form.telefone || '',
      veiculo: form.veiculo || 'Não informado',
      placa: form.placa || 'Sem placa',
      tipo: tipoFinal || 'Instalação',
      descricao: form.observacoes || '',
      technician_id: form.tecnico_id,
      priority: form.priority,
      checklist: checklistPayload,
    };

    try {
      if (isEditing) {
        await servicosService.update(id, payload);
        alert('Sucesso', 'Serviço atualizado com sucesso no painel Velotrack!');
      } else {
        await servicosService.create(payload);
        alert('Sucesso', 'Serviço cadastrado e técnico notificado instantaneamente!');
      }
      
      // Clear form completely, reset state, and return to creation mode
      setForm({
        cliente: '',
        endereco: '',
        telefone: '',
        veiculo: '',
        placa: '',
        tipo: 'Instalação',
        tipoOutro: '',
        observacoes: '',
        tecnico_id: null,
        priority: 'media',
        date: new Date().toLocaleDateString('pt-BR'),
        time: '14:00',
        duration: '01:30',
        satisfactionSurvey: true,
        whatsappOS: true,
        externalCode: '',
        keyword: '',
        cidade: '',
        googleMapsUrl: '',
        latitude: '-23.55052',
        longitude: '-46.63330',
        equipments: [],
        attachments: [
          { id: 'a-1', name: 'foto_checklist_frontal.jpg', size: '280 KB', type: 'image' },
          { id: 'a-2', name: 'termo_instalacao_assinado.pdf', size: '1.4 MB', type: 'doc' },
        ],
        repType: 'Não se repete',
        repDays: ['Seg', 'Qua', 'Sex'],
        valServico: '180,00',
        formaPagamento: 'Pix',
        isFaturado: true,
        isPago: false,
        notifAgendamento: true,
        notifConclusao: true,
        notifPush: true,
      });
      setActiveTab('geral');
      setErrorMsg(null);

      if (isEditing) {
        router.replace('/(admin)/criar-servico');
      } else {
        router.back();
      }
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
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Carregando Ordem de Serviço...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Lista de Abas baseadas no vídeo do cliente
  const TABS = [
    { id: 'geral', label: 'Geral', icon: 'options-outline' },
    { id: 'localizacao', label: 'Localização', icon: 'map-outline' },
    { id: 'equipamentos', label: 'Equipamentos', icon: 'cube-outline' },
    { id: 'anexos', label: 'Anexos', icon: 'image-outline' },
    { id: 'repeticao', label: 'Repetição', icon: 'repeat-outline' },
    { id: 'valores', label: 'Valores', icon: 'cash-outline' },
    { id: 'notificacoes', label: 'Notificações', icon: 'notifications-outline' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title={isEditing ? 'Configurar Ordem' : 'Cadastrar Nova Tarefa'}
        onBack={() => router.back()}
      />

      {/* Seletor de Abas Horizontal - Idêntico ao menu superior do vídeo */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveTab(t.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={t.icon}
                  size={16}
                  color={active ? colors.text : colors.textMuted}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================= ABA GERAL ================= */}
        {activeTab === 'geral' && (
          <View>
            <Card>
              <CardSection label="Agendamento da Operação">
                {/* Executado por */}
                <Text style={styles.inputTitle}>Tarefa será executada por</Text>
                {loadingTecnicos ? (
                  <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start' }} />
                ) : (
                  <View style={styles.techSelectionList}>
                    {tecnicos.map((tec) => {
                      const sel = form.tecnico_id === tec.id;
                      return (
                        <TouchableOpacity
                          key={tec.id}
                          style={[styles.techChip, sel && styles.techChipSelected]}
                          onPress={() => updateForm('tecnico_id', sel ? null : tec.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="person"
                            size={14}
                            color={sel ? colors.text : colors.textMuted}
                          />
                          <Text style={[styles.techChipText, sel && styles.techChipTextSelected]}>
                            {tec.nome}
                          </Text>
                          {sel && (
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={14}
                              color={colors.text}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                    {tecnicos.length === 0 && (
                      <Text style={styles.infoMutedText}>Nenhum técnico cadastrado ou ativo.</Text>
                    )}
                  </View>
                )}

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label="Data Prevista"
                      placeholder="DD/MM/AAAA"
                      value={form.date}
                      onChangeText={(v) => updateForm('date', v)}
                      icon="calendar-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Horário"
                      placeholder="14:00"
                      value={form.time}
                      onChangeText={(v) => updateForm('time', v)}
                      icon="time-outline"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label="Tempo de duração"
                      placeholder="01:30"
                      value={form.duration}
                      onChangeText={(v) => updateForm('duration', v)}
                      icon="hourglass-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputTitle}>Prioridade</Text>
                    <View style={styles.priorityRow}>
                      {['baixa', 'media', 'alta'].map((p) => {
                        const active = form.priority === p;
                        const pColor =
                          p === 'baixa'
                            ? colors.success
                            : p === 'media'
                            ? colors.warning
                            : colors.error;
                        return (
                          <TouchableOpacity
                            key={p}
                            style={[
                              styles.pBtn,
                              active && { backgroundColor: pColor, borderColor: pColor },
                            ]}
                            onPress={() => updateForm('priority', p)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.pBtnText, active && { color: '#000' }]}>
                              {p.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </CardSection>
            </Card>

            <Card>
              <CardSection label="Detalhamento Técnico">
                <Text style={styles.inputTitle}>Tipo de tarefa</Text>
                <View style={styles.taskTypeGrid}>
                  {TIPOS_TAREFA.map((t) => {
                    const active = form.tipo === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.taskTypeChip, active && styles.taskTypeChipSelected]}
                        onPress={() => updateForm('tipo', t)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.taskTypeChipText,
                            active && styles.taskTypeChipTextSelected,
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {form.tipo === 'Outro' && (
                  <Input
                    placeholder="Descreva o tipo de serviço"
                    value={form.tipoOutro}
                    onChangeText={(v) => updateForm('tipoOutro', v)}
                    style={{ marginTop: 8 }}
                  />
                )}

                <Input
                  label="Descrição da tarefa"
                  placeholder="Instruções para o técnico sobre a instalação ou manutenção do rastreador..."
                  value={form.observacoes}
                  onChangeText={(v) => updateForm('observacoes', v)}
                  multiline
                  style={{ marginTop: spacing.md }}
                />
              </CardSection>
            </Card>

            <Card>
              <CardSection label="Filtros e Configurações de Check-in">
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Usar pesquisa de satisfação</Text>
                    <Text style={styles.switchSub}>
                      Permite coletar o feedback do cliente ao concluir
                    </Text>
                  </View>
                  <Switch
                    value={form.satisfactionSurvey}
                    onValueChange={(v) => updateForm('satisfactionSurvey', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Envio automático de OS</Text>
                    <Text style={styles.switchSub}>
                      Envia o relatório de OS em PDF direto ao finalizar por WhatsApp
                    </Text>
                  </View>
                  <Switch
                    value={form.whatsappOS}
                    onValueChange={(v) => updateForm('whatsappOS', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label="Código Externo (Integração)"
                      placeholder="Cod. Integração"
                      value={form.externalCode}
                      onChangeText={(v) => updateForm('externalCode', v)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Palavra-chave"
                      placeholder="Ex: Urgente"
                      value={form.keyword}
                      onChangeText={(v) => updateForm('keyword', v)}
                    />
                  </View>
                </View>
              </CardSection>
            </Card>
          </View>
        )}

        {/* ================= ABA LOCALIZAÇÃO ================= */}
        {activeTab === 'localizacao' && (
          <View>
            <Card>
              <CardSection label="Busca de Cliente & Endereço">
                <View style={styles.clientPresetHeader}>
                  <Text style={styles.inputTitle}>Dados do Cliente</Text>
                  <TouchableOpacity
                    style={styles.btnAddClient}
                    onPress={() => setShowClientModal(true)}
                  >
                    <Ionicons name="person-add" size={14} color={colors.primary} />
                    <Text style={styles.btnAddClientText}>Novo Cliente</Text>
                  </TouchableOpacity>
                </View>

                {/* Grid Rápida de Clientes Preset para simplificar o clique igual no vídeo */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {DEF_CLIENTES_PRESET.map((c) => {
                    const matched = form.cliente === c.nome;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.presetCard, matched && styles.presetCardActive]}
                        onPress={() => {
                          updateForm('cliente', c.nome);
                          updateForm('endereco', c.endereco);
                          updateForm('telefone', c.telefone);
                          updateForm('cidade', c.cidade);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.presetName}>{c.nome}</Text>
                        <Text style={styles.presetSub}>{c.cnpj}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Input
                  label="Nome do Cliente"
                  placeholder="Nome do cliente cadastrado ou preencha"
                  value={form.cliente}
                  onChangeText={(v) => updateForm('cliente', v)}
                  icon="person-outline"
                />

                <Input
                  label="Telefone Corporativo"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChangeText={(v) => updateForm('telefone', v)}
                  keyboardType="phone-pad"
                  icon="call-outline"
                />

                <View style={styles.mapSearchWrapper}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="URL do Google Maps"
                      placeholder="Cole o link do Google Maps para extrair"
                      value={form.googleMapsUrl}
                      onChangeText={(v) => updateForm('googleMapsUrl', v)}
                      icon="link-outline"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.btnExtract}
                    onPress={handleExtractCoordinates}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnExtractText}>EXTRAIR</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Endereço Completo"
                  placeholder="Avenida, Número, Bairro"
                  value={form.endereco}
                  onChangeText={(v) => updateForm('endereco', v)}
                  icon="location-outline"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 2, marginRight: 8 }}>
                    <Input
                      label="Cidade"
                      placeholder="Ex: São Paulo"
                      value={form.cidade}
                      onChangeText={(v) => updateForm('cidade', v)}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label="Latitude"
                      placeholder="-23.550"
                      value={form.latitude}
                      onChangeText={(v) => updateForm('latitude', v)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Longitude"
                      placeholder="-46.633"
                      value={form.longitude}
                      onChangeText={(v) => updateForm('longitude', v)}
                    />
                  </View>
                </View>
              </CardSection>
            </Card>

            {/* Veículo Card */}
            <Card>
              <CardSection label="Informações do Veículo">
                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label="Veículo / Modelo"
                      placeholder="Chevrolet Onix, Volvo FH, etc."
                      value={form.veiculo}
                      onChangeText={(v) => updateForm('veiculo', v)}
                      icon="car-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Placa do Veículo"
                      placeholder="ABC1D23"
                      value={form.placa}
                      onChangeText={(v) => updateForm('placa', v)}
                      icon="barcode-outline"
                    />
                  </View>
                </View>
              </CardSection>
            </Card>

            {/* Mapa Interativo Pro - Vetorizado para Premium Dark Looks */}
            <Card>
              <CardSection label="Visualização no Mapa">
                <View style={styles.mapMockBox}>
                  {/* Grid Lines Vector Mockup */}
                  <View style={styles.mapLines1} />
                  <View style={styles.mapLines2} />
                  <View style={styles.mapLines3} />
                  <View style={styles.mapLines4} />

                  {/* Pulsing Marker */}
                  <View style={styles.radarPulse} />
                  <View style={styles.markerCircle}>
                    <Ionicons name="location" size={24} color={colors.primary} />
                  </View>

                  <View style={styles.mapOverlayText}>
                    <Text style={styles.mapCoordsText}>
                      Lat: {form.latitude} | Lng: {form.longitude}
                    </Text>
                    <Text style={styles.mapStatusText}>
                      {form.cliente ? `${form.cliente} - Georreferenciamento Ativo` : 'Nenhum local selecionado'}
                    </Text>
                  </View>
                </View>
              </CardSection>
            </Card>
          </View>
        )}

        {/* ================= ABA EQUIPAMENTOS ================= */}
        {activeTab === 'equipamentos' && (
          <View>
            <Card>
              <CardSection label="Equipamentos Associados à OS">
                <Text style={styles.sectionSubtitle}>
                  Selecione os rastreadores e acessórios que serão instalados ou mantidos no veículo do cliente.
                </Text>

                <View style={styles.searchEquipmentBar}>
                  <Ionicons name="search" size={16} color={colors.textMuted} />
                  <Text style={styles.searchBarText}>Buscar equipamento por nome ou identificador...</Text>
                </View>

                {DEF_EQUIPAMENTOS.map((eq) => {
                  const isSelected = form.equipments.includes(eq.id);
                  return (
                    <TouchableOpacity
                      key={eq.id}
                      style={[styles.eqItem, isSelected && styles.eqItemActive]}
                      onPress={() => toggleEquipment(eq.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.eqLeft}>
                        <View style={[styles.eqIconBox, isSelected && styles.eqIconBoxActive]}>
                          <Ionicons
                            name="hardware-chip-outline"
                            size={18}
                            color={isSelected ? colors.primary : colors.textMuted}
                          />
                        </View>
                        <View>
                          <Text style={styles.eqName}>{eq.name}</Text>
                          <Text style={styles.eqSerial}>S/N: {eq.serial}</Text>
                        </View>
                      </View>
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={22}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </CardSection>
            </Card>
          </View>
        )}

        {/* ================= ABA ANEXOS ================= */}
        {activeTab === 'anexos' && (
          <View>
            <Card>
              <CardSection label="Anexar Fotos e Documentos">
                <TouchableOpacity
                  style={styles.uploadZone}
                  onPress={handleAddMockFile}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cloud-upload" size={42} color={colors.primary} />
                  <Text style={styles.uploadPrimaryText}>Toque aqui para capturar foto / anexo</Text>
                  <Text style={styles.uploadSecondaryText}>
                    Tire foto da placa, do chassi ou o certificado do rastreador
                  </Text>
                </TouchableOpacity>

                <View style={styles.attachmentsListHeader}>
                  <Text style={styles.inputTitle}>Arquivos anexados ({form.attachments.length})</Text>
                </View>

                {form.attachments.map((file) => (
                  <View key={file.id} style={styles.fileRow}>
                    <View style={styles.fileLeft}>
                      <Ionicons
                        name={file.type === 'image' ? 'image-outline' : 'document-text-outline'}
                        size={24}
                        color={colors.primary}
                      />
                      <View>
                        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                        <Text style={styles.fileSize}>{file.size}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.btnRemoveFile}
                      onPress={() => handleRemoveFile(file.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </CardSection>
            </Card>
          </View>
        )}

        {/* ================= ABA REPETIÇÃO ================= */}
        {activeTab === 'repeticao' && (
          <View>
            <Card>
              <CardSection label="Padrão de Repetição">
                <Text style={styles.sectionSubtitle}>
                  Defina se esta tarefa será criada de forma recorrente na agenda do técnico para vistorias periódicas.
                </Text>

                {REPETECOS.map((rep) => {
                  const isSelected = form.repType === rep;
                  return (
                    <TouchableOpacity
                      key={rep}
                      style={[styles.repOption, isSelected && styles.repOptionSelected]}
                      onPress={() => updateForm('repType', rep)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                      <Text style={[styles.repOptionText, isSelected && styles.repOptionTextActive]}>
                        {rep}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {form.repType === 'Semanal' && (
                  <View style={styles.weekContainer}>
                    <Text style={styles.inputTitle}>Dias da Semana</Text>
                    <View style={styles.daysRow}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => {
                        const active = form.repDays.includes(day);
                        return (
                          <TouchableOpacity
                            key={day}
                            style={[styles.dayCircle, active && styles.dayCircleActive]}
                            onPress={() => toggleDay(day)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.dayCircleText, active && styles.dayCircleTextActive]}>
                              {day[0]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </CardSection>
            </Card>
          </View>
        )}

        {/* ================= ABA VALORES ================= */}
        {activeTab === 'valores' && (
          <View>
            <Card>
              <CardSection label="Valores do Serviço & Cobrança">
                <Input
                  label="Valor do Serviço (R$)"
                  placeholder="0,00"
                  value={form.valServico}
                  onChangeText={(v) => updateForm('valServico', v)}
                  keyboardType="numeric"
                  icon="cash-outline"
                />

                <Text style={styles.inputTitle}>Forma de Pagamento Preferencial</Text>
                <View style={styles.taskTypeGrid}>
                  {FORMAS_PAGAMENTO.map((f) => {
                    const isSelected = form.formaPagamento === f;
                    return (
                      <TouchableOpacity
                        key={f}
                        style={[styles.taskTypeChip, isSelected && styles.taskTypeChipSelected]}
                        onPress={() => updateForm('formaPagamento', f)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.taskTypeChipText,
                            isSelected && styles.taskTypeChipTextSelected,
                          ]}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Faturamento Processado (Faturado)</Text>
                    <Text style={styles.switchSub}>Diz se a Ordem de Serviço foi faturada ao cliente</Text>
                  </View>
                  <Switch
                    value={form.isFaturado}
                    onValueChange={(v) => updateForm('isFaturado', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Status de Pagamento (Pago)</Text>
                    <Text style={styles.switchSub}>Marca se o valor já foi recebido pela plataforma</Text>
                  </View>
                  <Switch
                    value={form.isPago}
                    onValueChange={(v) => updateForm('isPago', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>
              </CardSection>
            </Card>
          </View>
        )}

        {/* ================= ABA NOTIFICAÇÕES ================= */}
        {activeTab === 'notificacoes' && (
          <View>
            <Card>
              <CardSection label="Notificações Automáticas">
                <Text style={styles.sectionSubtitle}>
                  Configure as réguas de contatos por WhatsApp, Push no aplicativo técnico ou E-mail.
                </Text>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Notificar agendamento via WhatsApp</Text>
                    <Text style={styles.switchSub}>Envia confirmação com data e hora ao cliente</Text>
                  </View>
                  <Switch
                    value={form.notifAgendamento}
                    onValueChange={(v) => updateForm('notifAgendamento', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Notificar conclusão via WhatsApp</Text>
                    <Text style={styles.switchSub}>Envia o relatório com fotos antes e depois</Text>
                  </View>
                  <Switch
                    value={form.notifConclusao}
                    onValueChange={(v) => updateForm('notifConclusao', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Notificar técnico via push instantâneo</Text>
                    <Text style={styles.switchSub}>Alerta o aplicativo do técnico no celular</Text>
                  </View>
                  <Switch
                    value={form.notifPush}
                    onValueChange={(v) => updateForm('notifPush', v)}
                    trackColor={{ false: '#2A2E4B', true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>
              </CardSection>
            </Card>
          </View>
        )}

        {errorMsg && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Ações de salvamento */}
        <View style={styles.actionsContainer}>
          <Button
            title={isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR E DISPARAR TAREFA'}
            onPress={handleSubmit}
            loading={submitting}
            variant="primary"
            fullWidth
          />
          <Button
            title={isEditing ? 'REVERTER ALTERAÇÕES' : 'VOLTAR AO PAINEL'}
            variant="ghost"
            onPress={() => router.back()}
            style={{ marginTop: spacing.sm }}
            fullWidth
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ================= MODAL DE CADASTRO DE NOVO CLIENTE ================= */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showClientModal}
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="person-add" size={20} color={colors.primary} />
                <Text style={styles.modalTitle}>Cadastrar Novo Cliente</Text>
              </View>
              <TouchableOpacity onPress={() => setShowClientModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.cnpjSearchRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Pesquisar por CNPJ ou CPF"
                    placeholder="00.000.000/0001-00"
                    value={newClientCnpj}
                    onChangeText={setNewClientCnpj}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={styles.modalSearchBtn}
                  onPress={handleCnpjSearch}
                  disabled={searchingCnpj}
                >
                  {searchingCnpj ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.modalSearchBtnText}>Buscar</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Input
                label="Nome do Cliente / Razão Social"
                placeholder="Insira o nome do cliente"
                value={newClientName}
                onChangeText={setNewClientName}
              />

              <Input
                label="E-mail de Contato"
                placeholder="email@empresa.com"
                keyboardType="email-address"
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label="Telefone Comercial"
                    placeholder="(00) 00000-0000"
                    value={newClientPhone}
                    onChangeText={setNewClientPhone}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Segmento"
                    placeholder="Logística / Frotas"
                  />
                </View>
              </View>

              <Input
                label="Endereço Completo"
                placeholder="Rua, número, bairo, etc"
                value={newClientAddress}
                onChangeText={setNewClientAddress}
              />

              <Input
                label="Cidade / Estado"
                placeholder="Ex: São Paulo - SP"
                value={newClientCity}
                onChangeText={setNewClientCity}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="SALVAR E SELECIONAR"
                onPress={saveClientModal}
                variant="primary"
                fullWidth
              />
              <Button
                title="CANCELAR"
                variant="ghost"
                onPress={() => setShowClientModal(false)}
                style={{ marginTop: 8 }}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: spacing.xl },
  loadingText: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.md, fontWeight: '500' },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  // Tabs Menus
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tabsContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },

  // Input styling
  inputTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  // Task type selector
  taskTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.sm,
  },
  taskTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskTypeChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  taskTypeChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  taskTypeChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Tech items
  techSelectionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.sm,
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  techChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  techChipTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },

  // Priority Button
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    marginBottom: 6,
  },
  pBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  pBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  // Switch Rows
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  // Localization specific
  clientPresetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  btnAddClient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  btnAddClientText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  presetScroll: {
    marginVertical: spacing.sm,
  },
  presetCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  presetCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  presetName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  presetSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  mapSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 4,
  },
  btnExtract: {
    backgroundColor: colors.primary,
    marginBottom: 4,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnExtractText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Map Mockup Box
  mapMockBox: {
    height: 180,
    backgroundColor: '#0c0d16',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLines1: { position: 'absolute', top: 30, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  mapLines2: { position: 'absolute', top: 110, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  mapLines3: { position: 'absolute', left: 50, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  mapLines4: { position: 'absolute', left: 240, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  radarPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(230,0,80,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(230,0,80,0.3)',
    position: 'absolute',
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  mapOverlayText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9,10,15,0.9)',
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapCoordsText: { color: colors.textMuted, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  mapStatusText: { color: colors.primary, fontSize: 10, fontWeight: '700' },

  // Equipments Tab
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  searchEquipmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchBarText: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
  },
  eqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: spacing.sm,
  },
  eqItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  eqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eqIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eqIconBoxActive: {
    backgroundColor: colors.primarySoft,
  },
  eqName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  eqSerial: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  // Attachments
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    padding: spacing['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  uploadPrimaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  uploadSecondaryText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  attachmentsListHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  fileSize: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  btnRemoveFile: {
    padding: spacing.sm,
  },

  // Repetição
  repOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  repOptionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  repOptionText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  repOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  weekContainer: {
    marginTop: spacing.md,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayCircleText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dayCircleTextActive: {
    color: colors.text,
    fontWeight: '800',
  },

  // Actions
  actionsContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  infoMutedText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Error Card
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorSoft,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '600', flex: 1 },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  modalScroll: {
    padding: spacing.xl,
  },
  cnpjSearchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: spacing.xs,
  },
  modalSearchBtn: {
    backgroundColor: colors.primarySoft,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 4,
  },
  modalSearchBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  modalFooter: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
