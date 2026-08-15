-- Carga en Supabase todo lo que ya existía en el código (tracks, temarios,
-- grupos, y el único contenido de ejemplo cargado hasta ahora: Business
-- English → Foundations en B1·B2), para no perder nada al pasar de
-- archivos estáticos a base de datos. Corré esto DESPUÉS de
-- schema_phase2.sql.

-- ─── Tracks (Adultos) ────────────────────────────────────────────────────

insert into tracks (slug, name, description, progression, color_key, passcode, sort_order) values
  ('business-english', 'Business English', 'Reuniones, mails y comunicación profesional en el trabajo — de cero a liderar reuniones y hacer networking internacional.', 'Foundations → Professional Communication → Advanced Business', 'brand', 'oficina24', 0),
  ('english-for-creatives', 'English for Creatives', 'Inglés para diseñadores y creativos: vocabulario de proceso, comunicación con clientes y networking de industria.', 'Creative Basics → Client Communication → Industry English', 'stamp', 'estudio24', 1),
  ('exam-prep', 'Exam Preparation', 'Preparación para un examen internacional, con la intensidad ajustada al tiempo que te queda: desde 3 meses antes hasta modo emergencia.', '3 months before → 1 month (Sprint) → Emergency mode', 'olive', 'examen24', 2),
  ('special-courses', 'Special Courses', 'Cursos cortos y puntuales: entrevistas técnicas en inglés y contenido para redes sociales/creadores.', 'English for Tech Interviews · English for Creators', 'pink', 'especial24', 3),
  ('english-for-developers', 'English for Developers', 'Inglés de uso cotidiano en equipos de desarrollo: code reviews, standups y comunicación async con el equipo.', 'Code Reviews & PRs → Standups & Meetings → Docs & Async Comms', 'violet', 'codigo24', 4),
  ('english-for-travel', 'English for Travel', 'Inglés práctico para viajar: aeropuertos, alojamiento, moverte y resolver imprevistos en otro país.', 'Airports & Check-in → Hotels & Getting Around → Eating Out & Emergencies', 'gold', 'viaje24', 5)
on conflict (slug) do nothing;

-- ─── Temarios ────────────────────────────────────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order) values
  ('business-english', 'foundations', 'Foundations', 'Sobrevivir en un entorno laboral en inglés: básicos para el día a día.', 0),
  ('business-english', 'professional-communication', 'Professional Communication', 'Reuniones activas, reportes y mails.', 1),
  ('business-english', 'advanced-business', 'Advanced Business', 'Liderar reuniones, presentaciones y networking internacional.', 2),

  ('english-for-creatives', 'creative-basics', 'Creative Basics', 'Vocabulario de diseño: describí tu trabajo y tu proceso.', 0),
  ('english-for-creatives', 'client-communication', 'Client Communication', 'Propuestas, briefings y feedback con clientes internacionales.', 1),
  ('english-for-creatives', 'industry-english', 'Industry English', 'Pitches, portfolio reviews y networking de industria.', 2),

  ('exam-prep', 'reading-use-of-english', 'Reading & Use of English', 'Comprensión de textos y gramática en contexto de examen.', 0),
  ('exam-prep', 'listening', 'Listening', 'Comprensión auditiva con el formato típico de examen.', 1),
  ('exam-prep', 'writing', 'Writing', 'Producción escrita: ensayos, cartas e informes según el examen.', 2),
  ('exam-prep', 'speaking', 'Speaking', 'Simulacros de la parte oral del examen.', 3),

  ('special-courses', 'tech-interviews', 'English for Tech Interviews', 'Mock interviews, vocabulario técnico, hablar de código con confianza.', 0),
  ('special-courses', 'creators', 'English for Creators', 'Captions, guiones, pitches y DMs para redes.', 1),

  ('english-for-developers', 'code-reviews-prs', 'Code Reviews & PRs', 'Dar y recibir feedback sobre código, comentar pull requests con claridad.', 0),
  ('english-for-developers', 'standups-meetings', 'Standups & Meetings', 'Daily standups, sprint planning y reuniones técnicas en inglés.', 1),
  ('english-for-developers', 'docs-async-comms', 'Docs & Async Comms', 'Documentación técnica, mensajes en Slack/Jira y comunicación asincrónica con el equipo.', 2),

  ('english-for-travel', 'airports-checkin', 'Airports & Check-in', 'Check-in, seguridad, migraciones y embarque sin sorpresas.', 0),
  ('english-for-travel', 'hotels-getting-around', 'Hotels & Getting Around', 'Alojamiento, transporte público y pedir indicaciones.', 1),
  ('english-for-travel', 'eating-out-emergencies', 'Eating Out & Emergencies', 'Restaurantes, compras y resolver imprevistos (salud, pérdidas, cambios de planes).', 2)
on conflict (track_slug, slug) do nothing;

-- ─── Grupos (Infancias) ──────────────────────────────────────────────────

insert into groups (slug, name, age_range, description, color_key, milestone, passcode, topics, sort_order) values
  ('primeros-pasos', 'Primeros Pasos', '4–6 años', 'Juego puro: colores, números, animales y rutinas simples con mucho apoyo visual. Sin lectoescritura formal ni evaluación — solo vocabulario, canciones y repetición.', 'kidsYellow', 1, 'globo24', array['flashcards', 'listening'], 0),
  ('exploradores', 'Exploradores', '7–9 años', 'Primeras frases y phonics en formato de juego grupal: se presentan, cuentan qué les gusta y siguen historias cortas con preguntas y juegos de rol.', 'kidsGreen', 2, 'brujula24', array['flashcards', 'listening', 'cuestionario'], 1),
  ('aventureros', 'Aventureros', '10–12 años', 'Gramática y conversación real sobre lo que les interesa (series, juegos, redes), con comprensión más exigente, mini proyectos y debate liviano.', 'kidsBlue', 3, 'mapa24', array['flashcards', 'cuestionario', 'listening', 'reading-writing'], 2),
  ('teens', 'Teens', '13–17 años', 'Writing más largo, speaking real y simulacros de examen, con pop culture y temas de actualidad — para un examen internacional o para perder el miedo a hablar.', 'kidsPurple', 4, 'cumbre24teens', array['flashcards', 'cuestionario', 'listening', 'reading-writing'], 3)
on conflict (slug) do nothing;

-- ─── Contenido de ejemplo: Business English → Foundations (B1·B2) ────────

-- Nota: el contenido de texto usa acá abajo "dollar quoting" ($j$...$j$)
-- en vez de comillas simples — así los apóstrofos dentro del texto en
-- inglés (wasn't, I'd, it's...) no rompen el literal SQL. No hace falta
-- escapar nada adentro de un bloque $j$...$j$.

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data) values
  (
    'adultos:b1-b2:business-english:foundations:flashcards',
    'adultos', 'b1-b2', 'business-english', 'foundations', 'flashcards',
    $j$[
      {"id": 1, "front": "to catch up", "back": "ponerse al día"},
      {"id": 2, "front": "in the long run", "back": "a largo plazo"},
      {"id": 3, "front": "to make up your mind", "back": "decidirse"},
      {"id": 4, "front": "worthwhile", "back": "que vale la pena"},
      {"id": 5, "front": "to bring up", "back": "mencionar / criar (un tema o un hijo)"},
      {"id": 6, "front": "overwhelmed", "back": "abrumado/a"}
    ]$j$::jsonb
  ),
  (
    'adultos:b1-b2:business-english:foundations:quiz',
    'adultos', 'b1-b2', 'business-english', 'foundations', 'quiz',
    $j${
      "title": "Cuestionario (ejemplo) · Phrasal verbs cotidianos",
      "questions": [
        {"id": 1, "q": "I need to ___ with my emails before the trip.", "options": ["catch up", "bring up", "look forward"], "answer": 0},
        {"id": 2, "q": "¿Qué significa \"to make up your mind\"?", "options": ["Olvidarse de algo", "Decidirse", "Enojarse"], "answer": 1},
        {"id": 3, "q": "She felt completely ___ after her first week at the new job.", "options": ["worthwhile", "overwhelmed", "caught up"], "answer": 1}
      ]
    }$j$::jsonb
  ),
  (
    'adultos:b1-b2:business-english:foundations:listening',
    'adultos', 'b1-b2', 'business-english', 'foundations', 'listening',
    $j$[
      {
        "id": 1,
        "title": "Listening (ejemplo) · A short interview",
        "youtubeId": "",
        "transcript": "Interviewer: So, what made you decide to move abroad?\nGuest: Honestly, it wasn't a easy decision. I'd been thinking about it for years, but I finally made up my mind after I visited a friend who'd done the same thing.\nInterviewer: And has it been worthwhile?\nGuest: Definitely. It was overwhelming at first, but in the long run, it's the best decision I've made.",
        "questions": [
          {"id": 1, "q": "¿Por qué el invitado finalmente se decidió a mudarse?", "options": ["Por trabajo", "Después de visitar a una amiga", "Por casualidad"], "answer": 1},
          {"id": 2, "q": "Según el invitado, ¿valió la pena la decisión?", "options": ["No, se arrepiente", "Sí, a largo plazo", "Todavía no lo sabe"], "answer": 1}
        ]
      }
    ]$j$::jsonb
  ),
  (
    'adultos:b1-b2:business-english:foundations:reading_writing',
    'adultos', 'b1-b2', 'business-english', 'foundations', 'reading_writing',
    $j$[
      {
        "id": 1,
        "type": "reading",
        "title": "Reading (ejemplo) · Remote work",
        "text": "Remote work has changed the way many people think about their careers. For some, it means more flexibility and a better work-life balance. For others, it can bring up new challenges, like staying motivated without a fixed routine or feeling isolated from colleagues.\n\nCompanies that have embraced remote work often say that, in the long run, it has helped them attract talent from different parts of the world. Still, plenty of managers admit it took time to make up their minds about whether the shift was truly worthwhile.",
        "questions": [
          {"id": 1, "q": "¿Qué desafío menciona el texto sobre el trabajo remoto?"},
          {"id": 2, "q": "¿Qué beneficio obtienen las empresas a largo plazo, según el texto?"}
        ]
      },
      {
        "id": 2,
        "type": "writing",
        "title": "Writing (ejemplo) · Tu opinión",
        "prompt": "Escribí un párrafo (80-120 palabras) dando tu opinión sobre el trabajo remoto. Usá al menos dos de las expresiones vistas en las flashcards de esta unidad (por ejemplo: \"in the long run\", \"worthwhile\", \"overwhelmed\")."
      }
    ]$j$::jsonb
  )
on conflict (scope_key) do nothing;
