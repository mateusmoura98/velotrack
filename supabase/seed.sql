-- ============================================
-- VELOTRACK - Seed de Teste para Produtividade
-- Requer: usuarios com role = 'tecnico' existentes
-- ============================================

INSERT INTO servicos (
  id, technician_id, status, tempo_inicio, tempo_fim, checklist, created_at
)
VALUES
  -- 🔵 CONCLUÍDAS HOJE (2) - checklist completo
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 0),
    'concluido',
    NOW() - interval '3 hours',
    NOW() - interval '1 hour',
    '[{"checked": true}, {"checked": true}]',
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 1),
    'concluido',
    NOW() - interval '5 hours',
    NOW() - interval '2 hours',
    '[{"checked": true}, {"checked": true}, {"checked": true}]',
    NOW()
  ),

  -- 🟡 EM ANDAMENTO (3) - checklist incompleto
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 0),
    'em_andamento',
    NOW() - interval '2 hours',
    NULL,
    '[{"checked": true}, {"checked": false}]',
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 1),
    'em_andamento',
    NOW() - interval '4 hours',
    NULL,
    '[{"checked": false}]',
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 2),
    'em_andamento',
    NOW() - interval '1 hour',
    NULL,
    '[{"checked": true}]',
    NOW()
  ),

  -- 🟢 CONCLUÍDAS NO PERÍODO (3)
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 0),
    'concluido',
    NOW() - interval '5 days 3 hours',
    NOW() - interval '5 days 1 hour',
    '[{"checked": true}, {"checked": true}]',
    NOW() - interval '5 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 1),
    'concluido',
    NOW() - interval '4 days 6 hours',
    NOW() - interval '4 days 3 hours',
    '[{"checked": true}, {"checked": true}]',
    NOW() - interval '4 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 2),
    'concluido',
    NOW() - interval '3 days 4 hours',
    NOW() - interval '3 days 2 hours',
    '[{"checked": true}, {"checked": false}]',
    NOW() - interval '3 days'
  ),

  -- 🔴 FORA DO PERÍODO / CASOS VARIADOS (2)
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 0),
    'concluido',
    NOW() - interval '6 days 5 hours',
    NOW() - interval '6 days 2 hours',
    '[{"checked": true}]',
    NOW() - interval '6 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'tecnico' LIMIT 1 OFFSET 1),
    'concluido',
    NOW() - interval '2 days 7 hours',
    NOW() - interval '2 days 3 hours',
    '[{"checked": true}, {"checked": true}, {"checked": false}]',
    NOW() - interval '2 days'
  );
