import { supabase } from '../lib/supabase';
import { historyService } from './history';

const PAGE_SIZE = 20;

function nowISO() {
  return new Date().toISOString();
}

export const servicosService = {
  list: async ({ page = 0, search = '', dateFilter = 'todas', technicianId = null, status = null } = {}) => {
    let query = supabase
      .from('v_service_metrics')
      .select('*', { count: 'exact' });

    if (technicianId) {
      query = query.eq('technician_id', technicianId);
    }

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    if (search.trim()) {
      const q = search.trim();
      query = query.or(`cliente.ilike.%${q}%,placa.ilike.%${q}%,veiculo.ilike.%${q}%,endereco.ilike.%${q}%`);
    }

    if (dateFilter !== 'todas') {
      const now = new Date();
      let startDate;
      switch (dateFilter) {
        case 'hoje':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'ontem':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'mes':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0, hasMore: (count || 0) > to + 1 };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('v_service_metrics')
      .select('*')
      .eq('service_id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (payload) => {
    const metadata = {
      cliente: payload.cliente || '',
      endereco: payload.endereco || '',
      veiculo: payload.veiculo || '',
      placa: payload.placa || '',
      telefone: payload.telefone || '',
      tipo: payload.tipo || 'Instalação',
      descricao: payload.descricao || '',
      priority: payload.priority || 'media',
      checklist: payload.checklist || [],
      observations: payload.observations || '',
      fotos: payload.fotos || [],
    };

    const { data, error } = await supabase
      .from('service_events')
      .insert({
        service_id: crypto.randomUUID ? crypto.randomUUID() : self.crypto.randomUUID(),
        technician_id: payload.technician_id || null,
        event_type: 'created',
        metadata,
        created_at: nowISO(),
      })
      .select('service_id')
      .single();
    if (error) throw error;

    if (data?.service_id) {
      await historyService.log(data.service_id, payload.user_id || payload.created_by,
        historyService.ACTIONS.CREATED,
        `OS criada para ${payload.cliente} - ${payload.veiculo}`
      );
    }
    return { id: data.service_id };
  },

  update: async (id, payload) => {
    const { data: current } = await supabase
      .from('v_service_metrics')
      .select('status, technician_id, priority')
      .eq('service_id', id)
      .single();

    const userId = payload.user_id || payload.updated_by;

    if (payload.technician_id && payload.technician_id !== current?.technician_id) {
      await supabase.from('service_events').insert({
        service_id: id,
        technician_id: payload.technician_id,
        event_type: 'progress',
        metadata: { technician_changed: true, previous_technician: current?.technician_id },
        created_at: nowISO(),
      });
      await historyService.log(id, userId,
        historyService.ACTIONS.TECHNICIAN_CHANGED, 'Técnico alterado');
    }

    if (payload.status && payload.status !== current?.status) {
      if (payload.status === 'em_andamento') {
        await supabase.from('service_events').insert({
          service_id: id,
          technician_id: payload.technician_id || current?.technician_id,
          event_type: 'started',
          metadata: {},
          created_at: nowISO(),
        });
        await historyService.log(id, userId,
          historyService.ACTIONS.STARTED, 'Serviço iniciado');
      } else if (payload.status === 'concluido') {
        await supabase.from('service_events').insert({
          service_id: id,
          technician_id: payload.technician_id || current?.technician_id,
          event_type: 'finished',
          metadata: {
            checklist: payload.checklist || [],
            observations: payload.observations || '',
          },
          created_at: nowISO(),
        });
        await historyService.log(id, userId,
          historyService.ACTIONS.FINISHED, 'Serviço finalizado');
      }
    }

    if (payload.cliente || payload.priority) {
      const metadataUpdates = {};
      if (payload.cliente) metadataUpdates.cliente = payload.cliente;
      if (payload.endereco) metadataUpdates.endereco = payload.endereco;
      if (payload.veiculo) metadataUpdates.veiculo = payload.veiculo;
      if (payload.placa) metadataUpdates.placa = payload.placa;
      if (payload.telefone) metadataUpdates.telefone = payload.telefone;
      if (payload.tipo) metadataUpdates.tipo = payload.tipo;
      if (payload.descricao) metadataUpdates.descricao = payload.descricao;
      if (payload.priority) metadataUpdates.priority = payload.priority;
      if (Object.keys(metadataUpdates).length > 0) {
        await supabase.from('service_events').insert({
          service_id: id,
          technician_id: userId,
          event_type: 'progress',
          metadata: { ...metadataUpdates, edit: true },
          created_at: nowISO(),
        });
      }
    }

    if (userId && !payload.status) {
      await historyService.log(id, userId,
        historyService.ACTIONS.EDITED, 'OS atualizada');
    }
  },

  startService: async (id, userId) => {
    const { error } = await supabase
      .from('service_events')
      .insert({
        service_id: id,
        technician_id: userId,
        event_type: 'started',
        metadata: {},
        created_at: nowISO(),
      });
    if (error) throw error;
    if (userId) {
      await historyService.log(id, userId, historyService.ACTIONS.STARTED, 'Serviço iniciado');
    }
  },

  finishService: async (id, data, userId) => {
    const { error } = await supabase
      .from('service_events')
      .insert({
        service_id: id,
        technician_id: userId,
        event_type: 'finished',
        metadata: {
          checklist: data.checklist || [],
          observations: data.observations || '',
        },
        created_at: nowISO(),
      });
    if (error) throw error;
    if (userId) {
      await historyService.log(id, userId, historyService.ACTIONS.FINISHED, 'Serviço finalizado');
    }
  },

  updateChecklist: async (id, checklist) => {
    const { error } = await supabase
      .from('service_events')
      .insert({
        service_id: id,
        event_type: 'progress',
        metadata: { checklist },
        created_at: nowISO(),
      });
    if (error) throw error;
  },

  updateObservations: async (id, observations) => {
    const { error } = await supabase
      .from('service_events')
      .insert({
        service_id: id,
        event_type: 'progress',
        metadata: { observations },
        created_at: nowISO(),
      });
    if (error) throw error;
  },

  addPhoto: async (id, fotos) => {
    const { error } = await supabase
      .from('service_events')
      .insert({
        service_id: id,
        event_type: 'progress',
        metadata: { fotos },
        created_at: nowISO(),
      });
    if (error) throw error;
  },
};

export const photoService = {
  upload: async (file) => {
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage
      .from('fotos')
      .upload(fileName, file, { contentType: 'image/jpeg' });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName);
    return urlData.publicUrl;
  },

  uploadBase64: async (base64) => {
    const fileName = `${Date.now()}.jpg`;
    const { decode } = require('base64-arraybuffer');
    const { error } = await supabase.storage
      .from('fotos')
      .upload(fileName, decode(base64), { contentType: 'image/jpeg' });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName);
    return urlData.publicUrl;
  },
};
