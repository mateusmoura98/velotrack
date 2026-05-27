import { supabase } from '../lib/supabase';

export const tecnicosService = {
  list: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'tecnico')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  listActive: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, nome, telefone')
      .eq('role', 'tecnico')
      .eq('active', true);
    if (error) throw error;
    return data || [];
  },

  create: async ({ nome, email, password, telefone }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { role: 'tecnico' } },
    });

    if (authError) throw authError;
    if (!authData?.user?.id) throw new Error('Usuário não foi criado.');

    const { error: dbError } = await supabase.from('users').upsert({
      id: authData.user.id,
      nome,
      telefone: telefone || '',
      email: email.trim(),
      role: 'tecnico',
      active: true,
    }, { onConflict: 'id' });

    if (dbError) throw dbError;
    return { user: authData.user, needsConfirmation: !authData.session };
  },

  update: async (id, { nome, telefone }) => {
    const { error } = await supabase
      .from('users')
      .update({ nome, telefone })
      .eq('id', id);
    if (error) throw error;
  },

  toggleActive: async (id, currentActive) => {
    const { error } = await supabase
      .from('users')
      .update({ active: !currentActive })
      .eq('id', id);
    if (error) throw error;
  },
};
