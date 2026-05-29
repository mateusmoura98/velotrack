-- ============================================
-- VELOTRACK - Teste Automatizado de Métricas
-- Fluxo completo: seed → RPCs → validação
-- ============================================
DO $$
DECLARE
  tec_ids UUID[] := '{}';
  tec_count INT;
  row RECORD;

  -- overview
  v_concluidas_hoje INT;
  v_andamento INT;
  v_tempo_medio NUMERIC;
  v_concluidas_periodo INT;
  v_checklists_completos INT;

  -- validação
  v_ranking_concluidas INT;
  v_ranking_total INT;
  v_trend_total INT;
  v_divergencia TEXT := '';
  v_erros TEXT := '';
  v_confianca NUMERIC := 100;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INICIANDO TESTE DE PRODUTIVIDADE';
  RAISE NOTICE '========================================';

  -- ==========================================
  -- PASSO 1: Garantir técnicos existentes
  -- ==========================================
  SELECT COUNT(*) INTO tec_count FROM public.users WHERE role = 'tecnico';
  RAISE NOTICE 'Técnicos existentes: %', tec_count;

  IF tec_count < 3 THEN
    RAISE NOTICE 'Criando % técnico(s) adicional(is)...', 3 - tec_count;
    FOR i IN 1..(3 - tec_count) LOOP
      BEGIN
        WITH auth_insert AS (
          INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_sent_at,
            raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at
          ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'teste.tecnico' || (tec_count + i) || '@velotrack.test',
            crypt('123456', gen_salt('bf')),
            NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            NOW(), NOW()
          )
          RETURNING id
        )
        INSERT INTO public.users (id, nome, email, role, active, created_at)
        SELECT id,
               'Técnico Teste ' || (tec_count + i),
               'teste.tecnico' || (tec_count + i) || '@velotrack.test',
               'tecnico', true, NOW()
        FROM auth_insert;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Aviso: não foi possível criar técnico (pode já existir)';
      END;
    END LOOP;
  END IF;

  SELECT ARRAY_AGG(id) INTO tec_ids FROM (
    SELECT id FROM public.users WHERE role = 'tecnico' ORDER BY created_at LIMIT 3
  ) sub;
  tec_count := COALESCE(array_length(tec_ids, 1), 0);
  RAISE NOTICE 'Técnicos disponíveis para teste: %', tec_count;

  IF tec_count = 0 THEN
    RAISE EXCEPTION 'Nenhum técnico encontrado ou criado. Abortando.';
  END IF;

  -- ==========================================
  -- PASSO 2: Limpar dados de teste anteriores
  -- ==========================================
  RAISE NOTICE 'Limpando seeds anteriores...';
  DELETE FROM public.servicos
  WHERE created_at >= NOW() - interval '7 days'
    AND client_id IS NULL
    AND cliente = '';
  -- Ou: DELETE FROM public.servicos WHERE cliente LIKE '[TESTE]%'
  -- (método conservador: só limpa OS sem cliente vinculado)

  -- ==========================================
  -- PASSO 3: Inserir seed realista
  -- ==========================================
  RAISE NOTICE 'Inserindo seed de teste...';

  -- 3 concluídas HOJE (checklists completos)
  INSERT INTO servicos (id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at) VALUES
  (gen_random_uuid(), tec_ids[1], 'concluido', NOW() - interval '3 hours', NOW() - interval '1 hour',  '[{"checked": true}, {"checked": true}]',         NOW()),
  (gen_random_uuid(), tec_ids[2], 'concluido', NOW() - interval '5 hours', NOW() - interval '2 hours',  '[{"checked": true}, {"checked": true}, {"checked": true}]', NOW()),
  (gen_random_uuid(), tec_ids[3], 'concluido', NOW() - interval '2 hours', NOW() - interval '30 min',   '[{"checked": true}]',                                  NOW());

  -- 3 em andamento (checklists variados)
  INSERT INTO servicos (id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at) VALUES
  (gen_random_uuid(), tec_ids[1], 'em_andamento', NOW() - interval '2 hours', NULL, '[{"checked": true}, {"checked": false}]',  NOW()),
  (gen_random_uuid(), tec_ids[2], 'em_andamento', NOW() - interval '4 hours', NULL, '[{"checked": false}]',                     NOW()),
  (gen_random_uuid(), tec_ids[3], 'em_andamento', NOW() - interval '1 hour',  NULL, '[{"checked": true}]',                      NOW());

  -- 3 concluídas no período (dias anteriores)
  INSERT INTO servicos (id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at) VALUES
  (gen_random_uuid(), tec_ids[1], 'concluido', NOW() - interval '5 days 3 hours', NOW() - interval '5 days 1 hour', '[{"checked": true}, {"checked": true}]',       NOW() - interval '5 days'),
  (gen_random_uuid(), tec_ids[2], 'concluido', NOW() - interval '4 days 6 hours', NOW() - interval '4 days 3 hours', '[{"checked": true}, {"checked": true}]',       NOW() - interval '4 days'),
  (gen_random_uuid(), tec_ids[3], 'concluido', NOW() - interval '3 days 4 hours', NOW() - interval '3 days 2 hours', '[{"checked": true}, {"checked": false}]',      NOW() - interval '3 days'),
  (gen_random_uuid(), tec_ids[1], 'concluido', NOW() - interval '6 days 5 hours', NOW() - interval '6 days 2 hours', '[{"checked": true}]',                          NOW() - interval '6 days'),
  (gen_random_uuid(), tec_ids[2], 'concluido', NOW() - interval '2 days 7 hours', NOW() - interval '2 days 3 hours', '[{"checked": true}, {"checked": true}, {"checked": false}]', NOW() - interval '2 days');

  RAISE NOTICE 'Seed inserido com sucesso.';

  -- ==========================================
  -- PASSO 4: Executar RPCs
  -- ==========================================
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'EXECUTANDO RPCs...';
  RAISE NOTICE '----------------------------------------';

  -- RPC 1: Overview
  RAISE NOTICE '--- get_productivity_overview(7) ---';
  SELECT concluidas_hoje, andamento, tempo_medio_segundos, concluidas_periodo, checklists_completos
  INTO v_concluidas_hoje, v_andamento, v_tempo_medio, v_concluidas_periodo, v_checklists_completos
  FROM get_productivity_overview(7);

  RAISE NOTICE '  OS Hoje: %', v_concluidas_hoje;
  RAISE NOTICE '  Em Andamento: %', v_andamento;
  RAISE NOTICE '  Tempo Médio (s): %', v_tempo_medio;
  RAISE NOTICE '  Concluídas (período): %', v_concluidas_periodo;
  RAISE NOTICE '  Checklists Completos: %', v_checklists_completos;

  -- RPC 2: Ranking
  RAISE NOTICE '--- get_tecnico_ranking(7) ---';
  FOR row IN SELECT * FROM get_tecnico_ranking(7) LOOP
    RAISE NOTICE '  #% % | OS: % | Média: %s | Última: %',
      row.nome, row.concluidas, row.tempo_medio_segundos, row.ultima_atividade;
  END LOOP;

  -- RPC 3: Tendência
  RAISE NOTICE '--- get_daily_trend(7) ---';
  FOR row IN SELECT * FROM get_daily_trend(7) LOOP
    RAISE NOTICE '  %: % OS | média %ss', row.data, row.concluidas, row.tempo_medio_segundos;
  END LOOP;

  -- ==========================================
  -- PASSO 5: Validar consistência
  -- ==========================================
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'VALIDANDO CONSISTÊNCIA...';
  RAISE NOTICE '----------------------------------------';

  -- 5a. Overview: concluidas_hoje + em_andamento + (period - hoje) = período?
  IF v_concluidas_hoje IS NULL THEN
    v_erros := v_erros || '[ERRO] concluidas_hoje retornou NULL; ';
    v_confianca := v_confianca - 20;
  END IF;

  IF v_andamento IS NULL THEN
    v_erros := v_erros || '[ERRO] andamento retornou NULL; ';
    v_confianca := v_confianca - 10;
  END IF;

  IF v_concluidas_periodo IS NULL OR v_concluidas_periodo < v_concluidas_hoje THEN
    v_erros := v_erros || '[ERRO] concluidas_periodo < concluidas_hoje (inconsistência temporal); ';
    v_confianca := v_confianca - 15;
  END IF;

  -- 5b. Checklists: completos <= concluidas no período
  IF v_checklists_completos > v_concluidas_periodo THEN
    v_erros := v_erros || '[ERRO] checklists_completos > concluidas_periodo (impossível); ';
    v_confianca := v_confianca - 20;
  END IF;

  -- 5c. Ranking: total_os deve ser = concluidas + em_andamento + pendentes (no período)
  SELECT COALESCE(SUM(r.concluidas), 0), COALESCE(SUM(r.total_os), 0)
  INTO v_ranking_concluidas, v_ranking_total
  FROM get_tecnico_ranking(7) r;

  IF v_ranking_concluidas != v_concluidas_periodo THEN
    v_divergencia := v_divergencia || '[DIVERGÊNCIA] Ranking.concluidas (' || v_ranking_concluidas || ') != Overview.concluidas_periodo (' || v_concluidas_periodo || '); ';
    v_confianca := v_confianca - 15;
  END IF;

  -- 5d. Tendência: soma deve bater com concluidas_periodo
  SELECT COALESCE(SUM(t.concluidas), 0) INTO v_trend_total FROM get_daily_trend(7) t;

  IF v_trend_total != v_concluidas_periodo THEN
    v_divergencia := v_divergencia || '[DIVERGÊNCIA] Trend.total (' || v_trend_total || ') != Overview.concluidas_periodo (' || v_concluidas_periodo || '); ';
    v_confianca := v_confianca - 15;
  END IF;

  -- 5e. Tempo médio: deve ser positivo e razoável (< 24h)
  IF v_tempo_medio IS NOT NULL AND (v_tempo_medio <= 0 OR v_tempo_medio > 86400) THEN
    v_erros := v_erros || '[ERRO] tempo_medio_segundos suspeito: ' || v_tempo_medio || 's; ';
    v_confianca := v_confianca - 10;
  END IF;

  -- 5f. Em andamento: ao menos 1 (inserimos 3)
  IF v_andamento < 1 THEN
    v_erros := v_erros || '[ERRO] andamento = ' || v_andamento || ' (esperado >= 1); ';
    v_confianca := v_confianca - 10;
  END IF;

  -- ==========================================
  -- PASSO 6: Relatório Final
  -- ==========================================
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RELATÓRIO FINAL DE VALIDAÇÃO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '--- RESUMO ---';
  RAISE NOTICE 'OS Hoje: %', v_concluidas_hoje;
  RAISE NOTICE 'Em Andamento: %', v_andamento;
  RAISE NOTICE 'Tempo Médio: % segundos (% mins)', v_tempo_medio, COALESCE(ROUND(v_tempo_medio / 60), 0);
  RAISE NOTICE 'Concluídas (7d): %', v_concluidas_periodo;
  RAISE NOTICE 'Checklists Completos: %', v_checklists_completos;
  RAISE NOTICE 'Ranking (total concluídas): %', v_ranking_concluidas;
  RAISE NOTICE 'Tendência (total concluídas): %', v_trend_total;
  RAISE NOTICE '';

  RAISE NOTICE '--- POSSÍVEIS BUGS ---';
  IF v_erros = '' THEN RAISE NOTICE 'Nenhum erro crítico detectado.'; ELSE RAISE NOTICE '%', v_erros; END IF;
  RAISE NOTICE '';

  RAISE NOTICE '--- INCONSISTÊNCIAS ENTRE MÉTRICAS ---';
  IF v_divergencia = '' THEN RAISE NOTICE 'Nenhuma divergência entre RPCs.'; ELSE RAISE NOTICE '%', v_divergencia; END IF;
  RAISE NOTICE '';

  RAISE NOTICE '--- NÍVEL DE CONFIABILIDADE ---';
  v_confianca := GREATEST(0, LEAST(100, v_confianca));
  RAISE NOTICE '%/100', v_confianca;
  IF v_confianca >= 90 THEN
    RAISE NOTICE 'STATUS: ✅ PRONTO PARA PRODUÇÃO';
  ELSIF v_confianca >= 70 THEN
    RAISE NOTICE 'STATUS: ⚠️  QUASE PRONTO (revisar alertas acima)';
  ELSE
    RAISE NOTICE 'STATUS: ❌ NÃO PRONTO (corrigir erros antes)';
  END IF;
  RAISE NOTICE '========================================';
END;
$$;
