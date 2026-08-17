-- Activity Blog — contenido de "English for Developers" (nivel B1-B2),
-- semanas 1 y 2 de tu plan, organizado por TEMA (no por número de semana,
-- para que no quede desalineado si alguna semana se atrasa o hay que
-- repasar un punto puntual). Corré esto una sola vez en el SQL Editor de
-- Supabase — se puede volver a correr sin problema si hace falta (por
-- ejemplo si retocás algún texto acá y lo querés volver a pegar).
--
-- Carga: 2 temarios nuevos dentro del track `english-for-developers`
-- (nivel b1-b2), cada uno con su Glosario (flashcards), Completar
-- oraciones (fill_blank) y Reading & Writing (preguntas de producción
-- escrita) — a partir de tus documentos de Semana 1 y Semana 2.
--
-- Todavía NO incluye Listening (necesita que elijas el video puntual de
-- cada semana) ni Reading (necesita el artículo puntual que elija el
-- alumno) — esos los cargamos juntos cuando tengas el link/transcripción
-- de cada uno.

-- ─── Temario 1: Present Simple vs Present Continuous ───────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'present-simple-continuous',
  'Present Simple vs Present Continuous',
  'Daily stand-up: rutinas y tareas estables vs. lo que estás haciendo en este momento.',
  1
)
on conflict (track_slug, slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-simple-continuous:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'present-simple-continuous', 'flashcards',
  $json$[
    {"id": "1", "front": "blocker", "back": "obstáculo o impedimento — I have a major blocker with the database integration.", "image_url": null},
    {"id": "2", "front": "to catch up", "back": "ponerse al día — I need to catch up on yesterday's Slack discussions.", "image_url": null},
    {"id": "3", "front": "standup", "back": "reunión diaria breve — Our daily standup starts in exactly five minutes.", "image_url": null},
    {"id": "4", "front": "to be stuck", "back": "estar trabado/a — I'm completely stuck on this authentication bug.", "image_url": null},
    {"id": "5", "front": "to work on", "back": "estar trabajando en algo — Right now, she is working on the signup flow.", "image_url": null},
    {"id": "6", "front": "progress", "back": "avance, progreso — We made good progress on the refactoring yesterday.", "image_url": null},
    {"id": "7", "front": "deadline", "back": "fecha límite — The hard deadline for this release is next Friday.", "image_url": null},
    {"id": "8", "front": "to wrap up", "back": "terminar, finalizar — I plan to wrap up the frontend styling today.", "image_url": null},
    {"id": "9", "front": "update", "back": "actualización, novedad — Do you have any updates about the API server error?", "image_url": null},
    {"id": "10", "front": "to plan to", "back": "tener planeado — Tomorrow, we plan to run the first staging tests.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-simple-continuous:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'present-simple-continuous', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "Yesterday, I _____ (work) on the login page.", "options": [], "answer": "worked", "image_url": null},
    {"id": "2", "sentence": "Right now, I _____ (fix) a blocking bug in the payments API.", "options": [], "answer": "am fixing", "image_url": null},
    {"id": "3", "sentence": "Every day, our development team _____ (have) a standup meeting at 9:00 AM.", "options": [], "answer": "has", "image_url": null},
    {"id": "4", "sentence": "Today, I _____ (plan) to finish the database migration report.", "options": [], "answer": "am planning/plan", "image_url": null},
    {"id": "5", "sentence": "She _____ (write) automated tests when I called her to catch up.", "options": [], "answer": "was writing", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-simple-continuous:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'present-simple-continuous', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "What did you do yesterday at work? Usá verbos en pasado para reportar tus tareas concluidas (2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "What are you working on right now? Utilizá el Present Continuous y mencioná componentes reales de tu software (2-3 oraciones).", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "What is your plan for tomorrow? Describí lo que tenés planeado para tu próxima jornada de desarrollo (2-3 oraciones).", "image_url": null},
    {"id": "4", "type": "writing", "title": "Pregunta 4", "prompt": "Do you have any blockers this week? Mencioná si estás trabado con alguna tarea o si dependés de otro equipo (2-3 oraciones).", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ─── Temario 2: Present Perfect vs Past Simple ──────────────────────────

insert into temarios (track_slug, slug, name, description, sort_order)
values (
  'english-for-developers',
  'present-perfect-past-simple',
  'Present Perfect vs Past Simple',
  'Verbos de código: reportar bugs y tareas recientes vs. eventos puntuales ya terminados.',
  2
)
on conflict (track_slug, slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-perfect-past-simple:flashcards',
  'adultos', 'b1-b2', 'english-for-developers', 'present-perfect-past-simple', 'flashcards',
  $json$[
    {"id": "1", "front": "to fix", "back": "arreglar, solucionar — I've fixed the login bug.", "image_url": null},
    {"id": "2", "front": "to deploy", "back": "desplegar, publicar (una app) — We deployed the new version yesterday.", "image_url": null},
    {"id": "3", "front": "to push", "back": "subir cambios (a un repo) — I've just pushed my changes.", "image_url": null},
    {"id": "4", "front": "to merge", "back": "fusionar (ramas de código) — She merged the pull request this morning.", "image_url": null},
    {"id": "5", "front": "to debug", "back": "depurar, buscar errores — I've been debugging this for an hour.", "image_url": null},
    {"id": "6", "front": "to break something", "back": "romper algo (que deje de funcionar) — That update broke the build.", "image_url": null},
    {"id": "7", "front": "already", "back": "ya, con Present Perfect — I've already fixed it.", "image_url": null},
    {"id": "8", "front": "yet", "back": "todavía, en negativas/preguntas — I haven't deployed it yet.", "image_url": null},
    {"id": "9", "front": "just", "back": "recién, acabo de — I've just merged the branch.", "image_url": null},
    {"id": "10", "front": "ago", "back": "hace, con Past Simple — I fixed that bug two days ago.", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-perfect-past-simple:fill_blank',
  'adultos', 'b1-b2', 'english-for-developers', 'present-perfect-past-simple', 'fill_blank',
  $json$[
    {"id": "1", "sentence": "I _____ (already / fix) the bug, so you can test it now.", "options": [], "answer": "have already fixed", "image_url": null},
    {"id": "2", "sentence": "We _____ (deploy) the new version last Friday.", "options": [], "answer": "deployed", "image_url": null},
    {"id": "3", "sentence": "_____ your changes yet?", "options": [], "answer": "Have you pushed", "image_url": null},
    {"id": "4", "sentence": "He _____ (break) the build two hours ago.", "options": [], "answer": "broke", "image_url": null},
    {"id": "5", "sentence": "I _____ (debug) this all morning, but I still don't know the cause.", "options": [], "answer": "have been debugging/have debugged", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, level_slug, track_slug, temario_slug, content_type, data)
values (
  'adultos:b1-b2:english-for-developers:present-perfect-past-simple:reading_writing',
  'adultos', 'b1-b2', 'english-for-developers', 'present-perfect-past-simple', 'reading_writing',
  $json$[
    {"id": "1", "type": "writing", "title": "Pregunta 1", "prompt": "Tell me about a bug you fixed recently. What did you do? (Tip: usá Past Simple para la acción puntual, Present Perfect para el resultado — 2-3 oraciones).", "image_url": null},
    {"id": "2", "type": "writing", "title": "Pregunta 2", "prompt": "Have you deployed anything this week? What was it? (2-3 oraciones).", "image_url": null},
    {"id": "3", "type": "writing", "title": "Pregunta 3", "prompt": "What's something you have been working on for a while? (2-3 oraciones).", "image_url": null}
  ]$json$::jsonb
)
on conflict (scope_key) do update set data = excluded.data, updated_at = now();
