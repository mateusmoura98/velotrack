-- ============================================
-- VELOTRACK - RPCs de Produtividade
-- Cole tudo no SQL Editor do Supabase e clique em RUN.
-- Pode rodar várias vezes sem problema.
-- ============================================

-- ============================================
-- 1. Overview — KPIs globais (OS Hoje, Tempo Médio, etc.)
-- ============================================
CREATE OR REPLACE FUNCTION get_productivity_overview(p_dias int DEFAULT 7)
RETURNS TABLE (
  concluidas_hoje bigint,
  andamento bigint,
  tempo_medio_segundos numeric,
  concluidas_periodo bigint,
  checklists_completos bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COUNT(*) FILTER (
      WHERE status = 'concluido'
        AND tempo_fim IS NOT NULL
        AND (tempo_fim AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
    )::bigint,
    COUNT(*) FILTER (WHERE status = 'em_andamento')::bigint,
    ROUND(
      AVG(EXTRACT(EPOCH FROM (tempo_fim - tempo_inicio)))
      FILTER (WHERE status = 'concluido' AND tempo_fim IS NOT NULL AND tempo_inicio IS NOT NULL)
    )::numeric,
    COUNT(*) FILTER (
      WHERE status = 'concluido'
        AND tempo_fim >= NOW() - (p_dias * INTERVAL '1 day')
    )::bigint,
    COUNT(*) FILTER (
      WHERE status = 'concluido'
        AND tempo_fim >= NOW() - (p_dias * INTERVAL '1 day')
        AND NOT checklist @> '[{"checked": false}]'::jsonb
    )::bigint
  FROM servicos;
$$;

-- ============================================
-- 2. Ranking por técnico
-- ============================================
CREATE OR REPLACE FUNCTION get_tecnico_ranking(p_dias int DEFAULT 7)
RETURNS TABLE (
  id uuid,
  nome text,
  total_os bigint,
  concluidas bigint,
  tempo_medio_segundos numeric,
  ultima_atividade timestamptz
) LANGUAGE sql STABLE AS $$
  SELECT
    u.id,
    u.nome,
    COUNT(s.id)::bigint AS total_os,
    COUNT(s.id) FILTER (WHERE s.status = 'concluido')::bigint AS concluidas,
    ROUND(AVG(EXTRACT(EPOCH FROM (s.tempo_fim - s.tempo_inicio))) FILTER (WHERE s.status = 'concluido'))::numeric,
    MAX(sh.created_at)
  FROM users u
  LEFT JOIN servicos s ON s.technician_id = u.id
    AND s.created_at >= NOW() - (p_dias * INTERVAL '1 day')
  LEFT JOIN service_history sh ON sh.user_id = u.id
  WHERE u.role = 'tecnico'
  GROUP BY u.id, u.nome
  ORDER BY concluidas DESC, total_os DESC;
$$;

-- ============================================
-- 3. Tendência diária (para o gráfico)
-- ============================================
CREATE OR REPLACE FUNCTION get_daily_trend(p_dias int DEFAULT 30)
RETURNS TABLE (
  data date,
  concluidas bigint,
  tempo_medio_segundos numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    (tempo_fim AT TIME ZONE 'America/Sao_Paulo')::date AS data,
    COUNT(*)::bigint AS concluidas,
    ROUND(AVG(EXTRACT(EPOCH FROM (tempo_fim - tempo_inicio))))::numeric AS tempo_medio_segundos
  FROM servicos
  WHERE status = 'concluido'
    AND tempo_fim >= NOW() - (p_dias * INTERVAL '1 day')
  GROUP BY (tempo_fim AT TIME ZONE 'America/Sao_Paulo')::date
  ORDER BY data;
$$;
