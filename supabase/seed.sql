-- Carga los posts que ya existían en el blog (los de ejemplo que armamos
-- antes de tener base de datos), para no perderlos al pasar a Supabase.
-- Corré esto DESPUÉS de schema.sql, también en el SQL Editor.
-- Si ya cargaste posts a mano desde /admin antes de correr esto, podés
-- saltearlo — es solo para no arrancar de cero.

insert into blog_posts (audience, slug, date, title, body) values
  ('adultos', 'bienvenida-al-blog', '2026-08-01', 'Bienvenidos a Activity Blog',
   E'Este espacio nació para que tengas todo el material de práctica en un solo lugar, organizado por nivel y por track — pero le quería sumar algo más personal: acá voy a ir dejando novedades del curso, tips para practicar entre clase y clase, y alguna reflexión sobre lo que veo trabajando con ustedes todas las semanas.\n\nNo es material de estudio en sí, así que no hace falta revisarlo todas las semanas — pero si en algún momento sentís que te falta motivación o no sabés por dónde seguir practicando solo, este es un buen lugar para volver.'),
  ('adultos', 'nuevos-tracks-developers-travel', '2026-08-15', 'Sumamos dos tracks nuevos: Developers y Travel',
   E'A partir de esta semana hay dos especializaciones nuevas disponibles en todos los niveles: English for Developers (para quienes laburan en tecnología y necesitan inglés para code reviews, standups y comunicación con el equipo) y English for Travel (inglés práctico para viajar — aeropuertos, alojamiento, y resolver imprevistos).\n\nSi alguno de los dos te sirve, pedime la clave y arrancamos cuando quieras. Como con el resto de los tracks, podés combinarlo con el que ya estás haciendo.'),
  ('adultos', 'tips-practicar-entre-clases', '2026-07-10', '3 tips para practicar entre clase y clase',
   E'1. Poco y seguido gana siempre a mucho y de vez en cuando: 10 minutos por día rinden más que una hora el domingo.\n2. Usá las flashcards del track que estás haciendo en algún momento muerto (esperando el colectivo, la cola del súper) — están pensadas para eso.\n3. Si un listening te resultó difícil, volvé a escucharlo al otro día sin mirar las preguntas. Vas a notar que entendés más de lo que pensabas.'),
  ('infancias', 'bienvenida-english-kids-club', '2026-08-01', '¡Bienvenidos a English Kids Club!',
   E'Este rincón es para las familias: acá voy a ir contando novedades de cada grupo, ideas simples para reforzar el inglés en casa sin que se sienta "más tarea", y alguna reflexión sobre cómo aprenden los chicos a esta edad.\n\nCada grupo (Primeros Pasos, Exploradores, Aventureros y Teens) tiene su propio ritmo, así que estas notas van a ser generales — lo específico de cada clase lo van a seguir viendo acá mismo, en la sección de su grupo.'),
  ('infancias', 'ayudar-en-casa-sin-ser-profe', '2026-08-10', 'Cómo ayudar en casa sin ser "profe de inglés"',
   E'No hace falta corregir cada palabra ni convertir la merienda en clase particular. Alcanza con sumar inglés a cosas que ya hacen: poner una serie o canción en inglés que les guste, jugar a nombrar objetos de la casa, o simplemente preguntarles qué aprendieron esta semana y dejarlos contar a su manera, con errores y todo.\n\nEl objetivo a esta edad no es la perfección — es que el inglés se sienta algo natural, no una materia más.'),
  ('infancias', 'grupo-nuevo-teens', '2026-07-05', 'Nuevo grupo, nueva aventura: arrancó Teens',
   E'Con los chicos que veníamos siguiendo desde Aventureros arrancamos oficialmente el grupo Teens, con writing más largo, speaking real y simulacros de examen. El cambio de tono se nota enseguida: ya no hace falta "vender" el inglés con juegos, ellos mismos empiezan a usarlo para lo que les interesa (series, redes, lo que sea).\n\nSi tu hijo/a está por pasar de Aventureros a Teens y tenés dudas sobre el cambio, escribime y lo charlamos.')
on conflict (audience, slug) do nothing;
