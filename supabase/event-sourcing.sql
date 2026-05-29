-- ============================================
-- VELOTRACK - Event Sourcing Architecture
-- Tabela: service_events (fonte única da verdade)
-- View:   v_service_metrics (derivada)
-- RPCs:   get_dashboard_metrics + produtividade
-- ============================================

-- ============================================
-- 1. TABELA DE EVENTOS (IMUTÁVEL)
-- ============================================
CREATE TABLE IF NOT EXISTS service_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  technician_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'started', 'finished', 'cancelled', 'progress')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_events_service_id ON service_events(service_id);
CREATE INDEX IF NOT EXISTS idx_service_events_type ON service_events(event_type);
CREATE INDEX IF NOT EXISTS idx_service_events_created_at ON service_events(created_at);

-- RLS policies para usuários autenticados
ALTER TABLE service_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "service_events_select" ON service_events;
  DROP POLICY IF EXISTS "service_events_insert" ON service_events;
END $$;

CREATE POLICY "service_events_select" ON service_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_events_insert" ON service_events
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- 2. VIEW DE ESTADO ATUAL (AGREGAÇÃO PURA)
-- ============================================
CREATE OR REPLACE VIEW v_service_metrics AS
SELECT
  e.service_id,
  e.created_at,
  s.created_at AS started_at,
  f.created_at AS finished_at,
  x.created_at AS cancelled_at,
  e.technician_id,
  e.metadata->>'cliente' AS cliente,
  e.metadata->>'endereco' AS endereco,
  e.metadata->>'veiculo' AS veiculo,
  e.metadata->>'placa' AS placa,
  e.metadata->>'telefone' AS telefone,
  e.metadata->>'tipo' AS tipo,
  e.metadata->>'descricao' AS descricao,
  e.metadata->>'priority' AS priority,
  COALESCE(p.metadata->'checklist', f.metadata->'checklist', e.metadata->'checklist') AS checklist,
  COALESCE(p.metadata->>'observations', f.metadata->>'observations', e.metadata->>'observations') AS observations,
  COALESCE(p.metadata->'fotos', e.metadata->'fotos') AS fotos,
  CASE
    WHEN f.service_id IS NOT NULL THEN 'concluido'
    WHEN x.service_id IS NOT NULL THEN 'cancelled'
    WHEN s.service_id IS NOT NULL THEN 'em_andamento'
    ELSE 'pendente'
  END AS status,
  u.nome AS technician_name
FROM service_events e
LEFT JOIN public.users u ON u.id = e.technician_id
LEFT JOIN LATERAL (
  SELECT service_id, created_at, technician_id
  FROM service_events
  WHERE service_id = e.service_id AND event_type = 'started'
  ORDER BY created_at LIMIT 1
) s ON true
LEFT JOIN LATERAL (
  SELECT service_id, created_at, metadata
  FROM service_events
  WHERE service_id = e.service_id AND event_type = 'finished'
  ORDER BY created_at LIMIT 1
) f ON true
LEFT JOIN LATERAL (
  SELECT service_id, created_at
  FROM service_events
  WHERE service_id = e.service_id AND event_type = 'cancelled'
  ORDER BY created_at LIMIT 1
) x ON true
LEFT JOIN LATERAL (
  SELECT metadata
  FROM service_events
  WHERE service_id = e.service_id AND event_type = 'progress'
  ORDER BY created_at DESC LIMIT 1
) p ON true
WHERE e.event_type = 'created';

-- ============================================
-- 3. BACKFILL: MIGRAR servicos → service_events
-- ============================================
DO $$
DECLARE
  r RECORD;
  v_metadata JSONB;
  v_count INT := 0;
BEGIN
  RAISE NOTICE 'Migrando dados existentes para service_events...';

  FOR r IN SELECT * FROM servicos LOOP
    -- Evento 'created'
    v_metadata := jsonb_build_object(
      'cliente', r.cliente,
      'endereco', COALESCE(r.endereco, ''),
      'veiculo', COALESCE(r.veiculo, ''),
      'placa', COALESCE(r.placa, ''),
      'telefone', COALESCE(r.telefone, ''),
      'tipo', COALESCE(r.tipo, 'Instalação'),
      'descricao', COALESCE(r.descricao, ''),
      'priority', COALESCE(r.priority, 'media'),
      'checklist', COALESCE(r.checklist, '[]'::jsonb),
      'observations', COALESCE(r.observations, ''),
      'fotos', COALESCE(r.fotos, '{}')
    );

    INSERT INTO service_events (service_id, technician_id, event_type, metadata, created_at)
    VALUES (r.id, r.technician_id, 'created', v_metadata, r.created_at);
    v_count := v_count + 1;

    -- Evento 'started' (se tempo_inicio existe)
    IF r.tempo_inicio IS NOT NULL THEN
      INSERT INTO service_events (service_id, technician_id, event_type, metadata, created_at)
      VALUES (r.id, r.technician_id, 'started', '{}', r.tempo_inicio);
      v_count := v_count + 1;
    END IF;

    -- Evento 'finished' (se tempo_fim existe)
    IF r.tempo_fim IS NOT NULL THEN
      v_metadata := jsonb_build_object(
        'checklist', COALESCE(r.checklist, '[]'::jsonb),
        'observations', COALESCE(r.observations, '')
      );
      INSERT INTO service_events (service_id, technician_id, event_type, metadata, created_at)
      VALUES (r.id, r.technician_id, 'finished', v_metadata, r.tempo_fim);
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migração concluída: % eventos inseridos.', v_count;
END;
$$;

-- ============================================
-- 4. RPC: DASHBOARD MÉTRICAS (FONTE ÚNICA)
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_dias int DEFAULT 7)
RETURNS TABLE (
  total_os bigint,
  concluidas bigint,
  em_andamento bigint,
  taxa_conclusao numeric,
  tempo_medio_segundos numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE status = 'concluido')::bigint,
    COUNT(*) FILTER (WHERE status = 'em_andamento')::bigint,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'concluido')::numeric
      / NULLIF(COUNT(*) FILTER (WHERE status IN ('concluido', 'em_andamento', 'pendente')), 0)
      * 100, 1
    ),
    ROUND(
      AVG(EXTRACT(EPOCH FROM (finished_at - started_at)))
      FILTER (WHERE status = 'concluido' AND started_at IS NOT NULL AND finished_at IS NOT NULL)
    )::numeric
  FROM v_service_metrics
  WHERE created_at >= NOW() - (p_dias * INTERVAL '1 day');
$$;

-- ============================================
-- 5. RPCs DE PRODUTIVIDADE (RECONSTRUÍDAS)
-- ============================================

-- 5a. Overview
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
        AND (finished_at AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
    )::bigint,
    COUNT(*) FILTER (WHERE status = 'em_andamento')::bigint,
    ROUND(
      AVG(EXTRACT(EPOCH FROM (finished_at - started_at)))
      FILTER (WHERE status = 'concluido' AND started_at IS NOT NULL AND finished_at IS NOT NULL)
    )::numeric,
    COUNT(*) FILTER (WHERE status = 'concluido' AND finished_at >= NOW() - (p_dias * INTERVAL '1 day'))::bigint,
    COUNT(*) FILTER (
      WHERE status = 'concluido'
        AND finished_at >= NOW() - (p_dias * INTERVAL '1 day')
        AND NOT checklist @> '[{"checked": false}]'::jsonb
    )::bigint
  FROM v_service_metrics;
$$;

-- 5b. Ranking
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
    COUNT(v.service_id)::bigint AS total_os,
    COUNT(v.service_id) FILTER (WHERE v.status = 'concluido')::bigint AS concluidas,
    ROUND(
      AVG(EXTRACT(EPOCH FROM (v.finished_at - v.started_at)))
      FILTER (WHERE v.status = 'concluido' AND v.started_at IS NOT NULL AND v.finished_at IS NOT NULL)
    )::numeric,
    MAX(e.created_at)
  FROM public.users u
  LEFT JOIN v_service_metrics v ON v.technician_id = u.id
    AND v.created_at >= NOW() - (p_dias * INTERVAL '1 day')
  LEFT JOIN LATERAL (
    SELECT created_at FROM service_events
    WHERE technician_id = u.id
    ORDER BY created_at DESC LIMIT 1
  ) e ON true
  WHERE u.role = 'tecnico'
  GROUP BY u.id, u.nome
  ORDER BY concluidas DESC, total_os DESC;
$$;

-- 5c. Tendência Diária
CREATE OR REPLACE FUNCTION get_daily_trend(p_dias int DEFAULT 30)
RETURNS TABLE (
  data date,
  concluidas bigint,
  tempo_medio_segundos numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    (finished_at AT TIME ZONE 'America/Sao_Paulo')::date AS data,
    COUNT(*)::bigint AS concluidas,
    ROUND(AVG(EXTRACT(EPOCH FROM (finished_at - started_at))))::numeric AS tempo_medio_segundos
  FROM v_service_metrics
  WHERE status = 'concluido'
    AND finished_at >= NOW() - (p_dias * INTERVAL '1 day')
  GROUP BY (finished_at AT TIME ZONE 'America/Sao_Paulo')::date
  ORDER BY data;
$$;
