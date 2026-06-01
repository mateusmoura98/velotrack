import { supabase } from '../lib/supabase';
import { historyService } from './history';

const PAGE_SIZE = 20;

export function parseMetadata(dbRow) {
  if (!dbRow) return null;
  let meta = dbRow.metadata;

  if (!meta || Object.keys(meta).length === 0) {
    if (dbRow.checklist && !Array.isArray(dbRow.checklist)) {
      const c = dbRow.checklist;
      meta = {
        schedule: {
          date: c.date || (dbRow.created_at ? new Date(dbRow.created_at).toLocaleDateString('pt-BR') : ''),
          time: c.time || '14:00',
          duration: c.duration || '01:30',
          repType: c.repType || 'Não se repete',
          repDays: c.repDays || [],
        },
        location: {
          endereco: dbRow.endereco || c.endereco || '',
          cidade: c.cidade || '',
          googleMapsUrl: c.googleMapsUrl || '',
          latitude: c.latitude || '-23.55052',
          longitude: c.longitude || '-46.63330',
        },
        billing: {
          valServico: c.valServico || '0,00',
          formaPagamento: c.formaPagamento || 'Pix',
          isFaturado: c.isFaturado ?? true,
          isPago: c.isPago ?? false,
        },
        notifications: {
          satisfactionSurvey: c.satisfactionSurvey ?? true,
          whatsappOS: c.whatsappOS ?? true,
          notifAgendamento: c.notifAgendamento ?? true,
          notifConclusao: c.notifConclusao ?? true,
          notifPush: c.notifPush ?? true,
          externalCode: c.externalCode || '',
          keyword: c.keyword || '',
        },
        attachments: c.attachments || [],
        equipment: c.equipments || c.equipment || [],
      };
    } else {
      meta = {
        schedule: { date: '', time: '14:00', duration: '01:30', repType: 'Não se repete', repDays: [] },
        location: { endereco: dbRow.endereco || '', cidade: '', googleMapsUrl: '', latitude: '-23.55052', longitude: '-46.63330' },
        billing: { valServico: '0,00', formaPagamento: 'Pix', isFaturado: true, isPago: false },
        notifications: { satisfactionSurvey: true, whatsappOS: true, notifAgendamento: true, notifConclusao: true, notifPush: true, externalCode: '', keyword: '' },
        attachments: [],
        equipment: [],
      };
    }
  }
  return meta;
}

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

    const formattedData = (data || []).map(item => ({
      ...item,
      metadata: parseMetadata(item)
    }));

    return { data: formattedData, count: count || 0, hasMore: (count || 0) > to + 1 };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('servicos')
      .select('*, users(nome)')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (data) {
      data.metadata = parseMetadata(data);
    }
    return data;
  },

  create: async (payload) => {
    const metaObj = payload.metadata || (payload.checklist && !Array.isArray(payload.checklist) ? {
      schedule: {
        date: payload.checklist.date || '',
        time: payload.checklist.time || '14:00',
        duration: payload.checklist.duration || '01:30',
        repType: payload.checklist.repType || 'Não se repete',
        repDays: payload.checklist.repDays || []
      },
      location: {
        endereco: payload.endereco || payload.checklist.endereco || '',
        cidade: payload.checklist.cidade || '',
        googleMapsUrl: payload.checklist.googleMapsUrl || '',
        latitude: payload.checklist.latitude || '-23.55052',
        longitude: payload.checklist.longitude || '-46.63330'
      },
      billing: {
        valServico: payload.checklist.valServico || '0,00',
        formaPagamento: payload.checklist.formaPagamento || 'Pix',
        isFaturado: payload.checklist.isFaturado ?? true,
        isPago: payload.checklist.isPago ?? false
      },
      notifications: {
        satisfactionSurvey: payload.checklist.satisfactionSurvey ?? true,
        whatsappOS: payload.checklist.whatsappOS ?? true,
        notifAgendamento: payload.checklist.notifAgendamento ?? true,
        notifConclusao: payload.checklist.notifConclusao ?? true,
        notifPush: payload.checklist.notifPush ?? true,
        externalCode: payload.checklist.externalCode || '',
        keyword: payload.checklist.keyword || ''
      },
      attachments: payload.checklist.attachments || [],
      equipment: payload.checklist.equipments || payload.checklist.equipment || []
    } : {
      schedule: { date: '', time: '14:00', duration: '01:30', repType: 'Não se repete', repDays: [] },
      location: { endereco: payload.endereco || '', cidade: '', googleMapsUrl: '', latitude: '-23.55052', longitude: '-46.63330' },
      billing: { valServico: '0,00', formaPagamento: 'Pix', isFaturado: true, isPago: false },
      notifications: { satisfactionSurvey: true, whatsappOS: true, notifAgendamento: true, notifConclusao: true, notifPush: true, externalCode: '', keyword: '' },
      attachments: [],
      equipment: []
    });

    const checkObj = (payload.checklist && Array.isArray(payload.checklist)) ? payload.checklist : [];

    const insertPayload = { ...payload };
    insertPayload.metadata = metaObj;
    insertPayload.checklist = checkObj;

    let result;
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert({ ...insertPayload, status: 'pendente' })
        .select('id')
        .single();
      if (error) throw error;
      result = data;
    } catch (dbErr) {
      if (metaObj) {
        const oldChecklistPayload = {
          ...metaObj.schedule,
          ...metaObj.location,
          ...metaObj.billing,
          ...metaObj.notifications,
          attachments: metaObj.attachments,
          equipments: metaObj.equipment
        };
        const fallbackPayload = { ...payload };
        fallbackPayload.checklist = oldChecklistPayload;
        delete fallbackPayload.metadata;

        const { data, error } = await supabase
          .from('servicos')
          .insert({ ...fallbackPayload, status: 'pendente' })
          .select('id')
          .single();
        if (error) throw error;
        result = data;
      } else {
        throw dbErr;
      }
    }

    if (result?.id) {
      await historyService.log(result.id, payload.user_id || payload.created_by,
        historyService.ACTIONS.CREATED,
        `OS criada para ${payload.cliente} - ${payload.veiculo}`
      );
      if (payload.technician_id) {
        await historyService.log(result.id, payload.user_id || payload.created_by,
          historyService.ACTIONS.TECHNICIAN_ASSIGNED,
          `Técnico atribuído`
        );
      }
    }
    return result;
  },

  update: async (id, payload) => {
    const { data: old } = await supabase
      .from('servicos')
      .select('technician_id, priority, status')
      .eq('id', id)
      .single();

    const metaObj = payload.metadata || (payload.checklist && !Array.isArray(payload.checklist) ? {
      schedule: {
        date: payload.checklist.date || '',
        time: payload.checklist.time || '14:00',
        duration: payload.checklist.duration || '01:30',
        repType: payload.checklist.repType || 'Não se repete',
        repDays: payload.checklist.repDays || []
      },
      location: {
        endereco: payload.endereco || payload.checklist.endereco || '',
        cidade: payload.checklist.cidade || '',
        googleMapsUrl: payload.checklist.googleMapsUrl || '',
        latitude: payload.checklist.latitude || '-23.55052',
        longitude: payload.checklist.longitude || '-46.63330'
      },
      billing: {
        valServico: payload.checklist.valServico || '0,00',
        formaPagamento: payload.checklist.formaPagamento || 'Pix',
        isFaturado: payload.checklist.isFaturado ?? true,
        isPago: payload.checklist.isPago ?? false
      },
      notifications: {
        satisfactionSurvey: payload.checklist.satisfactionSurvey ?? true,
        whatsappOS: payload.checklist.whatsappOS ?? true,
        notifAgendamento: payload.checklist.notifAgendamento ?? true,
        notifConclusao: payload.checklist.notifConclusao ?? true,
        notifPush: payload.checklist.notifPush ?? true,
        externalCode: payload.checklist.externalCode || '',
        keyword: payload.checklist.keyword || ''
      },
      attachments: payload.checklist.attachments || [],
      equipment: payload.checklist.equipments || payload.checklist.equipment || []
    } : null);

    const updatePayload = { ...payload };
    if (metaObj) {
      updatePayload.metadata = metaObj;
      if (!Array.isArray(payload.checklist)) {
        delete updatePayload.checklist;
      }
    }

    try {
      const { error } = await supabase
        .from('servicos')
        .update(updatePayload)
        .eq('id', id);
      if (error) throw error;
    } catch (dbErr) {
      if (metaObj) {
        const oldChecklistPayload = {
          ...metaObj.schedule,
          ...metaObj.location,
          ...metaObj.billing,
          ...metaObj.notifications,
          attachments: metaObj.attachments,
          equipments: metaObj.equipment
        };
        const fallbackPayload = { ...payload };
        fallbackPayload.checklist = oldChecklistPayload;
        delete fallbackPayload.metadata;

        const { error } = await supabase
          .from('servicos')
          .update(fallbackPayload)
          .eq('id', id);
        if (error) throw error;
      } else {
        throw dbErr;
      }
    }

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
