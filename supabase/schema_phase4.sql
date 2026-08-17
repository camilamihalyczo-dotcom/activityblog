-- Activity Blog — fase 4 (nuevos tipos de contenido). Corré esto una sola
-- vez en tu proyecto de Supabase: SQL Editor → New query → pegar todo este
-- archivo → Run. Se puede volver a correr sin problema si hace falta.
--
-- Por qué hace falta: la tabla `content_items` (fase 2) tiene una regla que
-- solo deja guardar content_type = 'flashcards', 'quiz', 'listening' o
-- 'reading_writing'. Al sumar "Completar oraciones", "Sinónimos y
-- antónimos" y "Pronunciación" hay que ampliar esa lista — sin este script,
-- guardar contenido de esos tres tipos nuevos falla con un error de la base
-- de datos ("violates check constraint").

alter table content_items drop constraint if exists content_items_content_type_check;

alter table content_items add constraint content_items_content_type_check
  check (content_type in (
    'flashcards',
    'quiz',
    'listening',
    'reading_writing',
    'fill_blank',
    'synonyms_antonyms',
    'pronunciation'
  ));
