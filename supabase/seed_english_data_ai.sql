-- English for Data & AI: track inicial y desafíos de Voice Lab.
-- Ejecutar después de schema_phase4.sql y schema_phase7.sql.

insert into tracks (slug, name, description, progression, color_key, passcode, sort_order)
values (
  'english-for-data-ai',
  'English for Data & AI',
  'Inglés para daily updates, pipelines, model reviews, dashboards y entrevistas técnicas.',
  'Data Foundations & Standups → Technical Storytelling & Metrics → System Design & Interview Readiness',
  'violet',
  'datos24',
  6
)
on conflict (slug) do nothing;

insert into temarios (track_slug, slug, name, description, sort_order) values
  ('english-for-data-ai', 'data-foundations-standups', 'Data Foundations & Standups', 'Daily updates, pipelines, agilidad y primeros bloqueos.', 0),
  ('english-for-data-ai', 'technical-storytelling-metrics', 'Technical Storytelling & Metrics', 'Model reviews, trade-offs, dashboards y presentar a stakeholders.', 1),
  ('english-for-data-ai', 'system-design-interview-readiness', 'System Design & Interview Readiness', 'Pizarras técnicas, preguntas STAR y negociación internacional.', 2)
on conflict (track_slug, slug) do nothing;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-data-ai:data-foundations-standups:voice_lab',
  'adultos',
  'b1-b2',
  'english-for-data-ai',
  'data-foundations-standups',
  'voice_lab',
  '[
    {
      "id": "daily-past-action",
      "title": "1. Daily Past Action",
      "sentence": "Yesterday, I cleaned the dataset and deployed the model.",
      "keywords": ["cleaned", "dataset", "deployed"],
      "phoneticTip": "Cleaned es una sola sílaba: [kliind] (no cli-ned). Deployed termina en [di-PLOID]."
    },
    {
      "id": "today-focus",
      "title": "2. Today Focus",
      "sentence": "Today, I am tuning the hyperparameters to reduce latency.",
      "keywords": ["tuning", "hyperparameters", "latency"],
      "phoneticTip": "Latency acentúa la primera sílaba: [LEI-ten-si]."
    },
    {
      "id": "survival-blocker",
      "title": "3. Survival Blocker",
      "sentence": "I have a bottleneck with server access, but I will ping DevOps.",
      "keywords": ["bottleneck", "access", "ping"],
      "phoneticTip": "Bottleneck suena [BOT-l-nek]. Access lleva fuerza en la primera sílaba: [AK-ses]."
    },
    {
      "id": "career-pitch",
      "title": "4. Career Pitch",
      "sentence": "I have experience managing data pipelines and machine learning models.",
      "keywords": ["experience", "managing", "pipelines"],
      "phoneticTip": "Managing suena [MA-ni-dshing]. Evitá decir el sustantivo managment."
    }
  ]'::jsonb
)
on conflict (scope_key) do update set
  data = excluded.data,
  updated_at = now();
