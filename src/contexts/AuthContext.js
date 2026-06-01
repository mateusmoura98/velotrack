import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const mountedRef = useRef(true);


  const loadProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      if (!mountedRef.current) return;
      if (data && !data.active) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch {
      if (mountedRef.current) setProfile(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mountedRef.current) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;

    const { data: profileData } = await supabase
      .from('users')
      .select('active')
      .eq('id', data.user.id)
      .single();

    if (profileData && !profileData.active) {
      await supabase.auth.signOut();
      throw new Error('Conta desativada. Procure o administrador.');
    }

    return data;
  };

  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
    } catch {}
    if (Platform.OS === 'web') {
      try {
        const keys = Object.keys(localStorage);
        keys.filter(k => k.includes('supabase') || k.includes('sb-'))
          .forEach(k => localStorage.removeItem(k));
      } catch {}
      window.location.href = window.location.origin;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isDark, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
