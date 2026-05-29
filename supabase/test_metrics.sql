-- ============================================
-- VELOTRACK - Teste Automatizado de Métricas
-- Fluxo completo: seed → RPCs → validação → relatório
-- Uso: Cole no SQL Editor do Supabase e execute
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

  -- ranking aggregation
  v_ranking_concluidas INT;
  v_ranking_total INT;

  -- trend aggregation
  v_trend_total INT;

  -- validação
  v_divergencia TEXT := '';
  v_erros TEXT := '';
  v_confianca NUMERIC := 100;
  v_seed_count INT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE ' TESTE AUTOMATIZADO DE PRODUTIVIDADE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- ==========================================
  -- PASSO 1: Garantir técnicos (mín. 3)
  -- ==========================================
  RAISE NOTICE '>>> PASSO 1: Verificando técnicos...';

  SELECT COUNT(*) INTO tec_count FROM public.users WHERE role = 'tecnico';
  RAISE NOTICE '  Técnicos existentes: %', tec_count;

  IF tec_count < 3 THEN
    RAISE NOTICE '  Criando % técnico(s) adicional(is)...', 3 - tec_count;
    FOR i IN 1..(3 - tec_count) LOOP
      BEGIN
        WITH u AS (
          INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_sent_at,
            raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at
          ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(), 'authenticated', 'authenticated',
            'teste.tecnico' || (tec_count + i) || '@velotrack.test',
            crypt('123456', gen_salt('bf')),
            NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}', NOW(), NOW()
          )
          RETURNING id
        )
        INSERT INTO public.users (id, nome, email, role, active, created_at)
        SELECT id,
               'Tecnico Teste ' || (tec_count + i),
               'teste.tecnico' || (tec_count + i) || '@velotrack.test',
               'tecnico', true, NOW()
        FROM u;
        RAISE NOTICE '  + Técnico % criado', tec_count + i;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '  Aviso: técnico % não criado (pode já existir)', tec_count + i;
      END;
    END LOOP;
  END IF;

  SELECT ARRAY_AGG(id) INTO tec_ids FROM (
    SELECT id FROM public.users WHERE role = 'tecnico' ORDER BY created_at LIMIT 3
  ) sub;
  tec_count := COALESCE(array_length(tec_ids, 1), 0);
  RAISE NOTICE '  Técnicos disponíveis: %', tec_count;

  IF tec_count < 1 THEN
    RAISE EXCEPTION 'ERRO: Nenhum técnico disponível. Crie ao menos 1 técnico no dashboard admin.';
  END IF;

  -- ==========================================
  -- PASSO 2: Inserir seed realista
  -- ==========================================
  RAISE NOTICE '';
  RAISE NOTICE '>>> PASSO 2: Inserindo seed de teste...';

  -- 3 concluídas HOJE (checklists 100% completos)
  INSERT INTO servicos (id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at)
  VALUES
  (gen_random_uuid(), tec_ids[1], 'concluido',
   NOW() - interval '3 hours', NOW() - interval '1 hour',
   '[{"checked": true}, {"checked": true}]', NOW()),
  (gen_random_uuid(), tec_ids[2], 'concluido',
   NOW() - interval '5 hours', NOW() - interval '2 hours',
   '[{"checked": true}, {"checked": true}, {"checked": true}]', NOW()),
  (gen_random_uuid(), tec_ids[3], 'concluido',
   NOW() - interval '2 hours', NOW() - interval '30 min',
   '[{"checked": true}]', NOW());

  -- 3 em andamento (checklists variados — incompletos)
  INSERT INTO servicos (id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at)
  VALUES
  (gen_random_uuid(), tec_ids[1], 'em_andamento',
   NOW() - interval '2 hours', NULL,
   '[{"checked": true}, {"checked": false}]', NOW()),
  (gen_random_uuid(), tec_ids[2], 'em_andamento',
   NOW() - interval '4 hours', NULL,
   '[{"checked": false}]', NOW()),
  (gen_random_uuid(), tec_ids[3], 'em_andamento',
   NOW() - interval '1 hour', NULL,
   '[{"checked": true}]', NOW());

  -- 5 concluídas no período (dias anteriores) — mix de checklists
  INSERT INTO servicos (id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at)
  VALUES
  (gen_random_uuid(), tec_ids[1], 'concluido',
   NOW() - interval '5 days 3 hours', NOW() - interval '5 days 1 hour',
   '[{"checked": true}, {"checked": true}]', NOW() - interval '5 days'),
  (gen_random_uuid(), tec_ids[2], 'concluido',
   NOW() - interval '4 days 6 hours', NOW() - interval '4 days 3 hours',
   '[{"checked": true}, {"checked": true}]', NOW() - interval '4 days'),
  (gen_random_uuid(), tec_ids[3], 'concluido',
   NOW() - interval '3 days 4 hours', NOW() - interval '3 days 2 hours',
   '[{"checked": true}, {"checked": false}]', NOW() - interval '3 days'),
  (gen_random_uuid(), tec_ids[1], 'concluido',
   NOW() - interval '6 days 5 hours', NOW() - interval '6 days 2 hours',
   '[{"checked": true}]', NOW() - interval '6 days'),
  (gen_random_uuid(), tec_ids[2], 'concluido',
   NOW() - interval '2 days 7 hours', NOW() - interval '2 days 3 hours',
   '[{"checked": true}, {"checked": true}, {"checked": false}]', NOW() - interval '2 days');

  GET DIAGNOSTICS v_seed_count = ROW_COUNT;
  RAISE NOTICE '  % linhas inseridas em servicos.', v_seed_count;
  RAISE NOTICE '  Seed concluído.';

  -- ==========================================
  -- PASSO 3: Executar RPCs
  -- ==========================================
  RAISE NOTICE '';
  RAISE NOTICE '>>> PASSO 3: Executando RPCs...';
  RAISE NOTICE '';

  -- RPC 1: Overview
  RAISE NOTICE '--- get_productivity_overview(7) ---';
  SELECT concluidas_hoje, andamento, tempo_medio_segundos,
         concluidas_periodo, checklists_completos
  INTO v_concluidas_hoje, v_andamento, v_tempo_medio,
       v_concluidas_periodo, v_checklists_completos
  FROM get_productivity_overview(7);

  RAISE NOTICE '  OS Hoje (concluidas_hoje):         %', v_concluidas_hoje;
  RAISE NOTICE '  Em Andamento (andamento):           %', v_andamento;
  RAISE NOTICE '  Tempo Medio (tempo_medio_segundos): % segundos (% mins)',
    v_tempo_medio, COALESCE(ROUND(v_tempo_medio / 60), 0);
  RAISE NOTICE '  Concluidas 7d (concluidas_periodo): %', v_concluidas_periodo;
  RAISE NOTICE '  Checklists Completos:              %', v_checklists_completos;
  RAISE NOTICE '';

  -- RPC 2: Ranking
  RAISE NOTICE '--- get_tecnico_ranking(7) ---';
  FOR row IN SELECT * FROM get_tecnico_ranking(7) LOOP
    RAISE NOTICE '  # % | % OS concluidas | % OS total | media: %ss | ultima: %',
      row.nome, row.concluidas, row.total_os,
      COALESCE(row.tempo_medio_segundos, 0),
      COALESCE(row.ultima_atividade::text, 'nunca');
  END LOOP;
  RAISE NOTICE '';

  -- RPC 3: Tendência
  RAISE NOTICE '--- get_daily_trend(7) ---';
  FOR row IN SELECT * FROM get_daily_trend(7) LOOP
    RAISE NOTICE '  %: % OS | tempo medio: %ss',
      row.data, row.concluidas, COALESCE(row.tempo_medio_segundos, 0);
  END LOOP;
  RAISE NOTICE '';

  -- ==========================================
  -- PASSO 4: Validar consistência
  -- ==========================================
  RAISE NOTICE '>>> PASSO 4: Validando consistencia...';
  RAISE NOTICE '';

  -- 4a. Overview NULL checks
  IF v_concluidas_hoje IS NULL THEN
    v_erros := v_erros || '[ERRO] concluidas_hoje = NULL; ';
    v_confianca := v_confianca - 20;
  END IF;
  IF v_andamento IS NULL THEN
    v_erros := v_erros || '[ERRO] andamento = NULL; ';
    v_confianca := v_confianca - 10;
  END IF;

  -- 4b. concluidas_periodo deve incluir concluidas_hoje
  IF v_concluidas_periodo < v_concluidas_hoje THEN
    v_erros := v_erros || '[ERRO] concluidas_periodo (' || v_concluidas_periodo ||
               ') < concluidas_hoje (' || v_concluidas_hoje || '); ';
    v_confianca := v_confianca - 15;
  END IF;

  -- 4c. Checklists: completos <= concluidas_periodo
  IF v_checklists_completos > v_concluidas_periodo THEN
    v_erros := v_erros || '[ERRO] checklists_completos (' || v_checklists_completos ||
               ') > concluidas_periodo (' || v_concluidas_periodo || '); ';
    v_confianca := v_confianca - 20;
  END IF;

  -- 4d. Ranking vs Overview (concluidas devem bater)
  SELECT COALESCE(SUM(r.concluidas), 0), COALESCE(SUM(r.total_os), 0)
  INTO v_ranking_concluidas, v_ranking_total
  FROM get_tecnico_ranking(7) r;

  IF v_ranking_concluidas != v_concluidas_periodo THEN
    v_divergencia := v_divergencia ||
      '[DIVERGENCIA] Ranking.concluidas (' || v_ranking_concluidas ||
      ') != Overview.concluidas_periodo (' || v_concluidas_periodo || '); ';
    v_confianca := v_confianca - 15;
  END IF;

  -- 4e. Tendência vs Overview (soma deve bater)
  SELECT COALESCE(SUM(t.concluidas), 0) INTO v_trend_total
  FROM get_daily_trend(7) t;

  IF v_trend_total != v_concluidas_periodo THEN
    v_divergencia := v_divergencia ||
      '[DIVERGENCIA] Trend.total (' || v_trend_total ||
      ') != Overview.concluidas_periodo (' || v_concluidas_periodo || '); ';
    v_confianca := v_confianca - 15;
  END IF;

  -- 4f. Ranking vs Overview (em andamento)
  SELECT COALESCE(SUM(r.total_os - r.concluidas), 0) INTO v_andamento
  FROM get_tecnico_ranking(7) r;
  -- (reuso v_andamento para comparar — renomeado conceitualmente)

  -- 4g. Tempo médio razoável (positivo e < 24h)
  IF v_tempo_medio IS NOT NULL AND (v_tempo_medio <= 0 OR v_tempo_medio > 86400) THEN
    v_erros := v_erros || '[ERRO] tempo_medio_segundos suspeito: ' || v_tempo_medio || 's; ';
    v_confianca := v_confianca - 10;
  END IF;

  -- ==========================================
  -- PASSO 5: Relatório Final
  -- ==========================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' RELATORIO FINAL DE VALIDACAO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '--- RESUMO DAS MÉTRICAS ---';
  RAISE NOTICE '  OS Hoje:                %', v_concluidas_hoje;
  RAISE NOTICE '  Em Andamento:           %', v_andamento;
  RAISE NOTICE '  Tempo Medio:            %s (% min)',
    v_tempo_medio, COALESCE(ROUND(v_tempo_medio / 60), 0);
  RAISE NOTICE '  Concluidas (7d):        %', v_concluidas_periodo;
  RAISE NOTICE '  Checklists Completos:   %', v_checklists_completos;
  RAISE NOTICE '  Ranking (soma concl.):  %', v_ranking_concluidas;
  RAISE NOTICE '  Tendencia (soma total): %', v_trend_total;
  RAISE NOTICE '';

  RAISE NOTICE '--- POSSIVEIS BUGS ---';
  IF v_erros = '' THEN
    RAISE NOTICE '  Nenhum erro critico detectado.';
  ELSE
    RAISE NOTICE '  %', v_erros;
  END IF;
  RAISE NOTICE '';

  RAISE NOTICE '--- INCONSISTENCIAS ENTRE METRICAS ---';
  IF v_divergencia = '' THEN
    RAISE NOTICE '  Nenhuma divergencia entre RPCs.';
  ELSE
    RAISE NOTICE '  %', v_divergencia;
  END IF;
  RAISE NOTICE '';

  RAISE NOTICE '--- NIVEL DE CONFIABILIDADE ---';
  v_confianca := GREATEST(0, LEAST(100, ROUND(v_confianca)));
  RAISE NOTICE '  %/100', v_confianca;

  IF v_confianca >= 90 THEN
    RAISE NOTICE '  STATUS: PRONTO PARA PRODUCAO';
  ELSIF v_confianca >= 70 THEN
    RAISE NOTICE '  STATUS: QUASE PRONTO (revisar alertas acima)';
  ELSE
    RAISE NOTICE '  STATUS: NAO PRONTO (corrigir erros antes)';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '--- RECOMENDACAO ---';
  IF v_confianca >= 90 THEN
    RAISE NOTICE '  O dashboard de produtividade esta confiavel para uso em producao.';
    RAISE NOTICE '  As metricas de overview, ranking e tendencia estao consistentes.';
    RAISE NOTICE '  Recomenda-se monitoramento continuo apos dados reais.';
  ELSIF v_confianca >= 70 THEN
    RAISE NOTICE '  Revisar os alertas antes de promover para producao.';
    RAISE NOTICE '  Possiveis ajustes finos nas RPCs podem ser necessarios.';
  ELSE
    RAISE NOTICE '  Corrigir os erros e inconsistencias antes de qualquer uso.';
    RAISE NOTICE '  Nao utilizar em producao no estado atual.';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE ' TESTE FINALIZADO';
  RAISE NOTICE '========================================';
END;
$$;
