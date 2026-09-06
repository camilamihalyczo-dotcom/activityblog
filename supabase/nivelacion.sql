-- ============================================================
-- NIVELACIÓN EN ACTIVITY BLOG · English Kids Club
-- Corré este archivo entero en Supabase → SQL Editor → New query.
-- Es idempotente: si lo corrés dos veces no duplica nada, actualiza.
--
-- Crea dos grupos con su propia clave y les carga el cuestionario:
--   Nivelación · Aventureros   clave: hello10
--   Nivelación · Teens         clave: hello13
--
-- Los grupos solo habilitan 'quiz', así que el chico entra, hace la
-- actividad y no ve nada más. El resultado te queda en
-- /notas-profe/respuestas con el nombre que escribió.
-- ============================================================

-- ---------- 1. Los dos grupos ----------
insert into groups (slug, name, age_range, description, color_key, milestone, passcode, topics, sort_order)
values ('nivelacion-aventureros', 'Nivelación · Aventureros', '10–12 años', 'Actividad de la clase de nivelación. No es un examen: sirve para ver desde dónde arrancamos.',
        'kidsBlue', 0, 'hello10', '["quiz"]'::jsonb, 90)
on conflict (slug) do update set
  name = excluded.name, age_range = excluded.age_range, description = excluded.description,
  color_key = excluded.color_key, passcode = excluded.passcode, topics = excluded.topics,
  sort_order = excluded.sort_order;

insert into groups (slug, name, age_range, description, color_key, milestone, passcode, topics, sort_order)
values ('nivelacion-teens', 'Nivelación · Teens', '13–17 años', 'Actividad de la clase de nivelación. No es un examen: sirve para ver desde dónde arrancamos.',
        'kidsPurple', 0, 'hello13', '["quiz"]'::jsonb, 91)
on conflict (slug) do update set
  name = excluded.name, age_range = excluded.age_range, description = excluded.description,
  color_key = excluded.color_key, passcode = excluded.passcode, topics = excluded.topics,
  sort_order = excluded.sort_order;

-- ---------- 2. Los cuestionarios ----------
insert into content_items (scope_key, scope, group_slug, content_type, data, updated_at)
values ('infancias:nivelacion-aventureros:quiz', 'infancias', 'nivelacion-aventureros', 'quiz',
        '[{"id": "niv-aventureros", "title": "¿Cuánto sabés ya?", "questions": [{"id": "a1", "q": "Hello! What''s your name?", "options": ["I''m fine, thanks.", "My name is Lucas.", "I''m twelve.", "Yes, please."], "answer": 1}, {"id": "a2", "q": "She ___ a dog and two cats.", "options": ["has", "have", "is", "are"], "answer": 0}, {"id": "a3", "q": "Which one do you use at school?", "options": ["a rubber duck", "a pencil case", "a swimming pool", "a lion"], "answer": 1}, {"id": "a4", "q": "___ you like pizza?", "options": ["Do", "Does", "Are", "Is"], "answer": 0}, {"id": "a5", "q": "My birthday is ___ July.", "options": ["on", "at", "in", "to"], "answer": 2}, {"id": "a6", "q": "What is the opposite of “big”?", "options": ["tall", "small", "long", "old"], "answer": 1}, {"id": "a7", "q": "Yesterday I ___ to the park with my friends.", "options": ["go", "went", "going", "goes"], "answer": 1}, {"id": "a8", "q": "There ___ some milk in the fridge.", "options": ["are", "is", "have", "be"], "answer": 1}, {"id": "a9", "q": "She''s ___ than me at football.", "options": ["good", "better", "best", "more good"], "answer": 1}, {"id": "a10", "q": "Read: “Tom gets up at seven o''clock. He has breakfast and then he walks to school with his sister.” — How does Tom go to school?", "options": ["By bus", "He walks", "By car", "With his mum in the car"], "answer": 1}, {"id": "a11", "q": "“What are you doing?” — “I ___ my homework.”", "options": ["do", "am doing", "did", "does"], "answer": 1}, {"id": "a12", "q": "I ___ play the guitar, but I can sing.", "options": ["can", "can''t", "don''t can", "not can"], "answer": 1}]}]'::jsonb, now())
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

insert into content_items (scope_key, scope, group_slug, content_type, data, updated_at)
values ('infancias:nivelacion-teens:quiz', 'infancias', 'nivelacion-teens', 'quiz',
        '[{"id": "niv-teens", "title": "¿Cuánto sabés ya?", "questions": [{"id": "t1", "q": "She ___ to the cinema last night.", "options": ["goes", "went", "has gone", "going"], "answer": 1}, {"id": "t2", "q": "How ___ is the ticket?", "options": ["many", "much", "long", "old"], "answer": 1}, {"id": "t3", "q": "Which sentence is correct?", "options": ["I have 16 years.", "I am 16 years old.", "I have 16 years old.", "I am 16 years."], "answer": 1}, {"id": "t4", "q": "If it rains tomorrow, we ___ at home.", "options": ["stay", "will stay", "stayed", "would stay"], "answer": 1}, {"id": "t5", "q": "I''ve lived here ___ five years.", "options": ["since", "for", "from", "during"], "answer": 1}, {"id": "t6", "q": "Which sentence is correct?", "options": ["I am agree with you.", "I agree with you.", "I''m agree with you.", "I am agreed with you."], "answer": 1}, {"id": "t7", "q": "The film was so ___ that I fell asleep.", "options": ["bored", "boring", "bore", "boredom"], "answer": 1}, {"id": "t8", "q": "She asked me ___ I wanted coffee.", "options": ["that", "if", "what", "which"], "answer": 1}, {"id": "t9", "q": "This is the book ___ I told you about.", "options": ["who", "which", "what", "whose"], "answer": 1}, {"id": "t10", "q": "Read: “Maya applied for the job twice. The second time she got an interview, but they hired someone with more experience. She''s now taking an online course.” — How does Maya most likely feel?", "options": ["She has given up.", "She is determined to keep trying.", "She never wanted the job.", "She got the job."], "answer": 1}, {"id": "t11", "q": "I wish I ___ more time to study.", "options": ["have", "had", "will have", "would have"], "answer": 1}, {"id": "t12", "q": "By the time we arrived, the concert ___.", "options": ["started", "has started", "had started", "was starting"], "answer": 2}, {"id": "t13", "q": "Which sounds most natural in a work email?", "options": ["Send me the file now.", "I''d appreciate it if you could send me the file.", "You must send the file.", "Give me the file, please."], "answer": 1}, {"id": "t14", "q": "Not only ___ late, but he also forgot the tickets.", "options": ["he was", "was he", "he is", "is he"], "answer": 1}]}]'::jsonb, now())
on conflict (scope_key) do update set data = excluded.data, updated_at = now();

-- ============================================================
-- CÓMO LEER EL PUNTAJE
--
--   AVENTUREROS (12 preguntas)        TEENS (14 preguntas)
--     0 – 4   A1 inicial                0 – 5   A2
--     5 – 8   A1 consolidado            6 – 10  B1
--     9 – 12  A2                       11 – 14  B2
--
-- Las preguntas están ordenadas de menor a mayor dificultad, así que
-- si abandona a mitad de camino igual sabés hasta dónde llegó.
-- No tienen pistas a propósito: una pista infla el puntaje.
--
-- OJO: el puntaje mide Reading y gramática. NO mide Speaking, que es
-- lo que más pesa en el informe. Ese sigue saliendo del Meet.
--
-- SI FALLA EL `on conflict (slug)` de la parte 1: la tabla `groups` no
-- tiene índice único en slug. En ese caso creá los dos grupos a mano
-- desde /notas-profe/groups, con EXACTAMENTE esos slugs y esas claves,
-- y después corré solo la parte 2.
-- ============================================================
