import { supabase } from '../lib/supabase';
import { historyService } from './history';

const PAGE_SIZE = 20;

export const servicosService = {
  list: async ({ page = 0, search = '', dateFilter = 'todas', technicianId = null, status = null } = {}) => {
    let query = supabase
      .from('servicos')
      .select('*, users(nome)', { count: 'exact' });

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
      .from('servicos')
      .select('*, users(nome)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (payload) => {
    const { data, error } = await supabase
      .from('servicos')
      .insert({ ...payload, status: 'pendente' })
      .select('id')
      .single();
    if (error) throw error;

    if (data?.id) {
      await historyService.log(data.id, payload.user_id || payload.created_by,
        historyService.ACTIONS.CREATED,
        `OS criada para ${payload.cliente} - ${payload.veiculo}`
      );
      if (payload.technician_id) {
        await historyService.log(data.id, payload.user_id || payload.created_by,
          historyService.ACTIONS.TECHNICIAN_ASSIGNED,
          `Técnico atribuído`
        );
      }
    }
    return data;
  },

  update: async (id, payload) => {
    const { data: old } = await supabase
      .from('servicos')
      .select('technician_id, priority, status')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('servicos')
      .update(payload)
      .eq('id', id);
    if (error) throw error;

    const userId = payload.user_id || payload.updated_by;

    if (old && payload.status && payload.status !== old.status) {
      await historyService.log(id, userId,
        historyService.ACTIONS.STATUS_CHANGED,
        `Status alterado de ${old.status} para ${payload.status}`
      );
    }
    if (old && payload.technician_id && payload.technician_id !== old.technician_id) {
      await historyService.log(id, userId,
        historyService.ACTIONS.TECHNICIAN_CHANGED,
        `Técnico alterado`
      );
    }
    if (old && payload.priority && payload.priority !== old.priority) {
      await historyService.log(id, userId,
        historyService.ACTIONS.PRIORITY_CHANGED,
        `Prioridade alterada para ${payload.priority}`
      );
    }

    await historyService.log(id, userId,
      historyService.ACTIONS.EDITED,
      'OS atualizada'
    );
  },

  startService: async (id) => {
    const { error } = await supabase
      .from('servicos')
      .update({ status: 'em_andamento', tempo_inicio: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  finishService: async (id, data) => {
    const { error } = await supabase
      .from('servicos')
      .update({
        status: 'concluido',
        tempo_fim: new Date().toISOString(),
        ...data,
      })
      .eq('id', id);
    if (error) throw error;
  },

  updateChecklist: async (id, checklist) => {
    const { error } = await supabase
      .from('servicos')
      .update({ checklist })
      .eq('id', id);
    if (error) throw error;
  },

  updateObservations: async (id, observations) => {
    const { error } = await supabase
      .from('servicos')
      .update({ observations })
      .eq('id', id);
    if (error) throw error;
  },

  addPhoto: async (id, fotos) => {
    const { error } = await supabase
      .from('servicos')
      .update({ fotos })
      .eq('id', id);
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
