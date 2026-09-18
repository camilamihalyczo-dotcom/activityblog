-- Activity Blog — fase 8 (Sentence Builder y Voice Lab).
-- Ejecutar en Supabase si las tablas ya fueron creadas con una fase anterior.

alter table content_items drop constraint if exists content_items_content_type_check;

alter table content_items add constraint content_items_content_type_check
  check (content_type in (
    'flashcards',
    'quiz',
    'listening',
    'reading_writing',
    'fill_blank',
    'synonyms_antonyms',
    'pronunciation',
    'sentence_builder',
    'voice_lab'
  ));

alter table submissions drop constraint if exists submissions_content_type_check;

alter table submissions add constraint submissions_content_type_check
  check (content_type in (
    'fill_blank',
    'quiz',
    'synonyms_antonyms',
    'listening',
    'reading_writing',
    'pronunciation',
    'sentence_builder',
    'voice_lab'
  ));
