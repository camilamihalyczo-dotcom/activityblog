-- Activity Blog — "English for Developers" (nivel B1-B2), semanas 3 a 10
-- de tu plan (Plan_Ingles_Programador1.docx), organizado por TEMA como la
-- tanda anterior (semanas 1-2) — no por número de semana. Corré esto una
-- sola vez en el SQL Editor de Supabase; se puede volver a correr sin
-- problema si hace falta.
--
-- Carga 8 temarios nuevos dentro del track `english-for-developers`
-- (nivel b1-b2), cada uno con Glosario (flashcards), Completar oraciones
-- (fill_blank) y Reading & Writing (preguntas de producción escrita) — el
-- contenido lo armé yo a partir de la gramática/vocabulario que ya
-- definiste en el plan semana por semana, no de un documento tuyo
-- palabra por palabra como las semanas 1-2, así que dale una repasada
-- antes de la clase por si querés ajustar algún ejemplo al contexto
-- real del alumno.
--
-- Igual que semanas 1-2: todavía NO incluye Listening ni Reading con
-- artículo real (necesitan que elijas el video/artículo puntual de cada
-- semana según tu documento de fuentes) — los cargamos cuando los tengas.

-- ─── Temario 3: Present Perfect Continuous ──────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'present-perfect-continuous',
  'Present Perfect Continuous',
  'Cuánto tiempo llevás haciendo algo — reportar el progreso de un proyecto en curso.',
  3
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-perfect-continuous:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'present-perfect-continuous', 'flashcards',
  $json$[
    {"id": "1", "front": "to have been + -ing", "back": "llevar [tiempo] haciendo algo — I've been working on this feature since Monday.", "image_url": null},
    {"id": "2", "front": "for", "back": "durante, hace (con un período de tiempo) — I've been debugging this for three hours.", "image_url": null},
    {"id": "3", "front": "since", "back": "desde (con un punto de tiempo) — She's been reviewing PRs since 9 AM.", "image_url": null},
    {"id": "4", "front": "progress report", "back": "informe de avance — Let's do a quick progress report before the meeting.", "image_url": null},
    {"id": "5", "front": "ongoing", "back": "en curso, continuo — This is an ongoing investigation into the memory leak.", "image_url": null},
    {"id": "6", "front": "so far", "back": "hasta ahora — So far, we've fixed three of the five bugs.", "image_url": null},
    {"id": "7", "front": "lately", "back": "últimamente — I've been getting a lot of merge conflicts lately.", "image_url": null},
    {"id": "8", "front": "to keep + -ing", "back": "seguir haciendo algo — I keep running into the same error.", "image_url": null},
    {"id": "9", "front": "workload", "back": "carga de trabajo — My workload has been increasing since the new sprint started.", "image_url": null},
    {"id": "10", "front": "milestone", "back": "hito, etapa importante — We've been working towards this milestone for two months.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-perfect-continuous:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'present-perfect-continuous', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "I _____ (work) on this feature since Monday.", "options": [], "answer": "have been working", "image_url": null},
    {"id": "2", "sentence": "_____ (how long / you / debug) this issue?", "options": [], "answer": "How long have you been debugging", "image_url": null},
    {"id": "3", "sentence": "She _____ (review) pull requests all morning.", "options": [], "answer": "has been reviewing", "image_url": null},
    {"id": "4", "sentence": "We _____ (have) a lot of merge conflicts lately.", "options": [], "answer": "have been having", "image_url": null},
    {"id": "5", "sentence": "They _____ (not respond) to my message since yesterday.", "options": [], "answer": "haven't been responding/have not been responding", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-perfect-continuous:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'present-perfect-continuous', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "How long have you been working on your current project? Usá Present Perfect Continuous (2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "What have you been doing to improve your English lately? (2-3 oraciones).", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Describe a task you've been struggling with this week and why (2-3 oraciones).", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 4: Conditionals (0, 1, 2) ──────────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'conditionals',
  'Conditionals (0, 1, 2)',
  'Troubleshooting y reglas del sistema: si pasa esto, pasa esto otro.',
  4
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:conditionals:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'conditionals', 'flashcards',
  $json$[
    {"id": "1", "front": "to crash", "back": "colapsar, dejar de funcionar de golpe — If the server crashes, we lose all active sessions.", "image_url": null},
    {"id": "2", "front": "to fail", "back": "fallar — If the build fails, check the logs first.", "image_url": null},
    {"id": "3", "front": "to trigger", "back": "disparar, activar — If a user clicks submit, it triggers a validation check.", "image_url": null},
    {"id": "4", "front": "to handle (an error)", "back": "manejar (un error) — If an exception occurs, the app handles it gracefully.", "image_url": null},
    {"id": "5", "front": "edge case", "back": "caso límite, situación poco común — If we don't test edge cases, bugs slip into production.", "image_url": null},
    {"id": "6", "front": "fallback", "back": "opción de respaldo — If the API is down, the app uses a fallback response.", "image_url": null},
    {"id": "7", "front": "root cause", "back": "causa raíz — If you don't find the root cause, the bug will come back.", "image_url": null},
    {"id": "8", "front": "troubleshooting", "back": "resolución de problemas — Troubleshooting this took longer than expected.", "image_url": null},
    {"id": "9", "front": "to restart", "back": "reiniciar — If nothing works, restart the service.", "image_url": null},
    {"id": "10", "front": "threshold", "back": "umbral, límite — If usage passes the threshold, we get an alert.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:conditionals:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'conditionals', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "If the server crashes, we _____ (lose) all active sessions.", "options": [], "answer": "lose", "image_url": null},
    {"id": "2", "sentence": "If the build _____ (fail), check the logs first.", "options": [], "answer": "fails", "image_url": null},
    {"id": "3", "sentence": "If I _____ (have) more time this week, I would refactor this module.", "options": [], "answer": "had", "image_url": null},
    {"id": "4", "sentence": "If you _____ (deploy) on a Friday, you'll probably regret it.", "options": [], "answer": "deploy", "image_url": null},
    {"id": "5", "sentence": "If the API were down, we _____ (use) the fallback response.", "options": [], "answer": "would use", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:conditionals:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'conditionals', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "What do you do if a deploy fails in production? Usá Zero o First Conditional (2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "If you could change one thing about your current tech stack, what would it be and why? Usá Second Conditional (2-3 oraciones).", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Describe what happens in your team's workflow if a bug is reported (Zero Conditional, pasos generales).", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 5: Passive Voice ────────────────────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'passive-voice',
  'Passive Voice',
  'Cómo se describe la documentación técnica: el foco en la acción, no en quién la hace.',
  5
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:passive-voice:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'passive-voice', 'flashcards',
  $json$[
    {"id": "1", "front": "to process", "back": "procesar — The data is processed before being stored.", "image_url": null},
    {"id": "2", "front": "to store", "back": "almacenar — User information is stored in an encrypted database.", "image_url": null},
    {"id": "3", "front": "to handle", "back": "manejar, gestionar — Errors are handled by a global exception handler.", "image_url": null},
    {"id": "4", "front": "to trigger", "back": "disparar, activar — This function is triggered by a click event.", "image_url": null},
    {"id": "5", "front": "to validate", "back": "validar — Every request is validated before it reaches the server.", "image_url": null},
    {"id": "6", "front": "to encrypt", "back": "encriptar — Passwords are encrypted before being saved.", "image_url": null},
    {"id": "7", "front": "to deploy", "back": "desplegar — The app is deployed automatically on every merge to main.", "image_url": null},
    {"id": "8", "front": "to generate", "back": "generar — A report is generated at the end of each day.", "image_url": null},
    {"id": "9", "front": "by default", "back": "por defecto — Notifications are enabled by default.", "image_url": null},
    {"id": "10", "front": "to override", "back": "sobrescribir, anular — This setting can be overridden in the config file.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:passive-voice:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'passive-voice', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "The data _____ (process) before it's stored.", "options": [], "answer": "is processed", "image_url": null},
    {"id": "2", "sentence": "This bug _____ (report) by a user yesterday.", "options": [], "answer": "was reported", "image_url": null},
    {"id": "3", "sentence": "Passwords _____ (encrypt) before they're saved.", "options": [], "answer": "are encrypted", "image_url": null},
    {"id": "4", "sentence": "The app _____ (deploy) automatically every time we merge to main.", "options": [], "answer": "is deployed", "image_url": null},
    {"id": "5", "sentence": "This setting _____ (can / override) in the config file.", "options": [], "answer": "can be overridden", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:passive-voice:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'passive-voice', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Describe how your app handles user authentication. Usá Passive Voice (2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "Explain what happens when a user submits a form on your app, step by step, using Passive Voice.", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Rewrite this sentence in passive voice: 'The team deployed the new version yesterday.' Then write one more example of your own.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 6: Reported Speech ─────────────────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'reported-speech',
  'Reported Speech',
  'Contar reuniones y feedback de code review sin citar palabra por palabra.',
  6
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:reported-speech:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'reported-speech', 'flashcards',
  $json$[
    {"id": "1", "front": "to suggest", "back": "sugerir — She suggested refactoring the function.", "image_url": null},
    {"id": "2", "front": "to approve", "back": "aprobar — He approved the pull request this morning.", "image_url": null},
    {"id": "3", "front": "to request changes", "back": "pedir cambios — The reviewer requested changes on my PR.", "image_url": null},
    {"id": "4", "front": "nitpick", "back": "comentario menor, de poca importancia — That comment was just a nitpick about naming.", "image_url": null},
    {"id": "5", "front": "to mention", "back": "mencionar — He mentioned that the tests were failing.", "image_url": null},
    {"id": "6", "front": "to point out", "back": "señalar — She pointed out a possible edge case.", "image_url": null},
    {"id": "7", "front": "feedback", "back": "devolución, comentarios — The feedback was mostly positive.", "image_url": null},
    {"id": "8", "front": "to bring up", "back": "plantear, traer a la conversación — He brought up a concern about performance.", "image_url": null},
    {"id": "9", "front": "to follow up", "back": "hacer seguimiento — I'll follow up on that comment tomorrow.", "image_url": null},
    {"id": "10", "front": "reviewer", "back": "revisor/a (de código) — The reviewer left three comments on my PR.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:reported-speech:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'reported-speech', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "She said she _____ (review) my PR later that day.", "options": [], "answer": "would review", "image_url": null},
    {"id": "2", "sentence": "He mentioned that the tests _____ (fail).", "options": [], "answer": "were failing", "image_url": null},
    {"id": "3", "sentence": "The reviewer told me I _____ (need) to add more tests.", "options": [], "answer": "needed", "image_url": null},
    {"id": "4", "sentence": "She asked if I _____ (finish) the migration yet.", "options": [], "answer": "had finished", "image_url": null},
    {"id": "5", "sentence": "He said he _____ (fix) the bug the day before.", "options": [], "answer": "had fixed", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:reported-speech:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'reported-speech', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Report what your reviewer said about your last pull request, using Reported Speech (2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "Retell a piece of feedback you got recently in a meeting, using Reported Speech.", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "What did your teammate say about the deadline last week? Usá Reported Speech.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 7: Modal Verbs ──────────────────────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'modal-verbs',
  'Modal Verbs — Recomendaciones y Probabilidad',
  'Should, could, might, must — para dar recomendaciones y explicar conceptos técnicos a alguien no técnico.',
  7
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:modal-verbs:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'modal-verbs', 'flashcards',
  $json$[
    {"id": "1", "front": "should", "back": "debería (recomendación) — You should write a test for that function.", "image_url": null},
    {"id": "2", "front": "could", "back": "podría (posibilidad, sugerencia) — This could be caused by a race condition.", "image_url": null},
    {"id": "3", "front": "might", "back": "podría (posibilidad, menos seguro) — It might be a caching issue.", "image_url": null},
    {"id": "4", "front": "must", "back": "debe (obligación fuerte / certeza) — This must be a configuration problem.", "image_url": null},
    {"id": "5", "front": "don't have to", "back": "no es necesario que — You don't have to rewrite the whole module.", "image_url": null},
    {"id": "6", "front": "in other words", "back": "en otras palabras — In other words, the cache wasn't invalidated.", "image_url": null},
    {"id": "7", "front": "simply put", "back": "dicho de forma simple — Simply put, the server ran out of memory.", "image_url": null},
    {"id": "8", "front": "non-technical", "back": "no técnico/a — Explain it in non-technical terms for the client.", "image_url": null},
    {"id": "9", "front": "analogy", "back": "analogía, comparación — Let me use an analogy: it's like a traffic jam.", "image_url": null},
    {"id": "10", "front": "root of the problem", "back": "la raíz del problema — Let's get to the root of the problem first.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:modal-verbs:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'modal-verbs', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "You _____ (should) add a test before merging this.", "options": [], "answer": "should", "image_url": null},
    {"id": "2", "sentence": "This _____ (could) be a caching issue — I'm not sure yet.", "options": [], "answer": "could", "image_url": null},
    {"id": "3", "sentence": "This error message _____ (must) mean the config file is missing.", "options": [], "answer": "must", "image_url": null},
    {"id": "4", "sentence": "You _____ (not have to) rewrite everything, just fix this function.", "options": [], "answer": "don't have to", "image_url": null},
    {"id": "5", "sentence": "It _____ (might) take a while to reproduce this bug.", "options": [], "answer": "might", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:modal-verbs:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'modal-verbs', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Explain a technical concept from your job to someone non-technical, using simple language and at least one modal verb (2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "What might be causing a slow page load? Give 2-3 possible reasons using 'might' or 'could'.", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Write a short recommendation to a junior developer about something they should or shouldn't do.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 8: Writing profesional (emails y Slack) ────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'professional-writing',
  'Writing Profesional — Emails y Slack',
  'Convertir un mensaje informal de Slack en un email formal, y viceversa.',
  8
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:professional-writing:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'professional-writing', 'flashcards',
  $json$[
    {"id": "1", "front": "Hi team", "back": "saludo informal grupal (Slack) — Hi team, quick update on the deploy.", "image_url": null},
    {"id": "2", "front": "Dear [Name]", "back": "saludo formal (email) — Dear Sarah, I hope this email finds you well.", "image_url": null},
    {"id": "3", "front": "as discussed", "back": "como hablamos — As discussed, I've attached the updated report.", "image_url": null},
    {"id": "4", "front": "please find attached", "back": "adjunto encontrarás — Please find attached the meeting notes.", "image_url": null},
    {"id": "5", "front": "quick heads up", "back": "aviso rápido, informal — Quick heads up: the API will be down for 10 minutes.", "image_url": null},
    {"id": "6", "front": "let me know", "back": "avisame, decime — Let me know if you have any questions.", "image_url": null},
    {"id": "7", "front": "best regards", "back": "saludos cordiales, cierre formal — Best regards, Juan.", "image_url": null},
    {"id": "8", "front": "ASAP", "back": "lo antes posible (as soon as possible) — Can you review this ASAP?", "image_url": null},
    {"id": "9", "front": "to follow up", "back": "hacer seguimiento — I'm following up on my previous email.", "image_url": null},
    {"id": "10", "front": "FYI", "back": "para tu información (for your information) — FYI, the meeting moved to 3 PM.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:professional-writing:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'professional-writing', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "_____ (Dear) Sarah, I hope this email finds you well.", "options": [], "answer": "Dear", "image_url": null},
    {"id": "2", "sentence": "As _____ (discuss), I've attached the updated report.", "options": [], "answer": "discussed", "image_url": null},
    {"id": "3", "sentence": "Please find _____ (attach) the meeting notes.", "options": [], "answer": "attached", "image_url": null},
    {"id": "4", "sentence": "Quick heads up: the API _____ (be) down for 10 minutes tonight.", "options": [], "answer": "will be", "image_url": null},
    {"id": "5", "sentence": "I'm _____ (follow) up on my email from last week.", "options": [], "answer": "following", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:professional-writing:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'professional-writing', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Convertí este mensaje de Slack en un email formal, en inglés: 'hey can u check the pr when u get a chance? kinda blocking me'", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "Convertí este email formal en un mensaje de Slack informal, en inglés: 'Dear team, I would like to inform you that the deployment scheduled for tomorrow has been postponed until further notice.'", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Write a short professional email to a teammate asking for a code review, using at least one phrase from this week's glossary.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 9: Entrevistas técnicas (STAR method) ──────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'technical-interviews',
  'Entrevistas Técnicas — STAR Method',
  'Vocabulario y estructura para responder preguntas de comportamiento en una entrevista técnica.',
  9
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:technical-interviews:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'technical-interviews', 'flashcards',
  $json$[
    {"id": "1", "front": "Situation", "back": "situación (parte 1 de STAR) — Describe the situation you were in.", "image_url": null},
    {"id": "2", "front": "Task", "back": "tarea (parte 2 de STAR) — What was your specific task or responsibility?", "image_url": null},
    {"id": "3", "front": "Action", "back": "acción (parte 3 de STAR) — What actions did you take to solve it?", "image_url": null},
    {"id": "4", "front": "Result", "back": "resultado (parte 4 de STAR) — What was the final result or outcome?", "image_url": null},
    {"id": "5", "front": "challenging", "back": "desafiante — Tell me about a challenging project you worked on.", "image_url": null},
    {"id": "6", "front": "achievement", "back": "logro — What's an achievement you're proud of?", "image_url": null},
    {"id": "7", "front": "teamwork", "back": "trabajo en equipo — Give an example of good teamwork under pressure.", "image_url": null},
    {"id": "8", "front": "to overcome", "back": "superar — How did you overcome that obstacle?", "image_url": null},
    {"id": "9", "front": "strength", "back": "fortaleza — What's your biggest strength as a developer?", "image_url": null},
    {"id": "10", "front": "weakness", "back": "debilidad, punto a mejorar — What's an area you're working to improve?", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:technical-interviews:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'technical-interviews', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "Let me describe the _____ (situation) I was in first.", "options": [], "answer": "situation", "image_url": null},
    {"id": "2", "sentence": "My _____ (task) was to fix the bug before the release.", "options": [], "answer": "task", "image_url": null},
    {"id": "3", "sentence": "The _____ (action) I took was to isolate the problem step by step.", "options": [], "answer": "action", "image_url": null},
    {"id": "4", "sentence": "As a _____ (result), we shipped the fix a day early.", "options": [], "answer": "result", "image_url": null},
    {"id": "5", "sentence": "I had to _____ (overcome) a lack of documentation on that project.", "options": [], "answer": "overcome", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:technical-interviews:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'technical-interviews', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Contame de un proyecto desafiante usando el método STAR (Situation, Task, Action, Result) — una oración por cada parte.", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "What's an achievement you're proud of as a developer? (2-3 oraciones).", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Describe a time you worked in a team under pressure. What was your role? (2-3 oraciones).", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 10: Repaso general ──────────────────────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'general-review',
  'Repaso General',
  'Repaso integrado de todos los tiempos verbales del curso — autoevaluación final.',
  10
)
on conflict (track_slug, slug) do update set
  name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:general-review:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'general-review', 'flashcards',
  $json$[
    {"id": "1", "front": "yesterday", "back": "ayer, marcador de Past Simple — I deployed the fix yesterday.", "image_url": null},
    {"id": "2", "front": "already", "back": "ya, marcador de Present Perfect — I've already merged the branch.", "image_url": null},
    {"id": "3", "front": "since / for", "back": "desde / hace, marcadores de Present Perfect Continuous — I've been working on this since Monday.", "image_url": null},
    {"id": "4", "front": "if", "back": "si, marcador de Conditionals — If the server crashes, we lose the session.", "image_url": null},
    {"id": "5", "front": "by (+ agente)", "back": "por, marcador de Passive Voice — The bug was found by a user.", "image_url": null},
    {"id": "6", "front": "said that", "back": "dijo que, marcador de Reported Speech — She said that the tests were failing.", "image_url": null},
    {"id": "7", "front": "should / could / might", "back": "debería / podría / podría ser, Modal Verbs — This might be a caching issue.", "image_url": null},
    {"id": "8", "front": "as discussed", "back": "como hablamos, writing profesional — As discussed, here's the report.", "image_url": null},
    {"id": "9", "front": "STAR method", "back": "método STAR (entrevistas) — Use the STAR method to answer that question.", "image_url": null},
    {"id": "10", "front": "fluency", "back": "fluidez — The goal this week is fluency, not perfection.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:general-review:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'general-review', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "I _____ (deploy) the fix yesterday.", "options": [], "answer": "deployed", "image_url": null},
    {"id": "2", "sentence": "I _____ (already / merge) the branch, so you can test it.", "options": [], "answer": "have already merged", "image_url": null},
    {"id": "3", "sentence": "I _____ (work) on this since Monday.", "options": [], "answer": "have been working", "image_url": null},
    {"id": "4", "sentence": "If the server crashes, we _____ (lose) the session.", "options": [], "answer": "lose", "image_url": null},
    {"id": "5", "sentence": "The bug _____ (find) by a user last week.", "options": [], "answer": "was found", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:general-review:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'general-review', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Explain a project of yours from start to finish in English, using at least 3 different tenses from this course (3-4 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "What's one grammar point from this course you still find difficult? Why? (2-3 oraciones).", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "Write your personal study plan to keep improving your English after this course (apps, channels, daily habit) — 2-3 oraciones.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();
