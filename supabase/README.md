# Cómo activar el panel de administración (fase 1: Blog)

Esto conecta la app a una base de datos real en Supabase, para que el blog
(Adultos e Infancias) se pueda editar desde `/notas-profe` sin tocar código ni
volver a este chat. Son unos 10 minutos, una sola vez.

## 1. Creá tu proyecto de Supabase

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta gratis (podés
   entrar con GitHub o con email).
2. Creá un proyecto nuevo (`New project`). Elegí cualquier nombre y una
   contraseña de base de datos (guardala en algún lado, no la vas a necesitar
   para el día a día, pero por las dudas).
3. Esperá 1-2 minutos a que el proyecto termine de crearse.

## 2. Cargá las tablas

1. En el menú de la izquierda, andá a **SQL Editor**.
2. Abrí `supabase/schema.sql` (en esta carpeta del proyecto), copiá todo el
   contenido, pegalo en una query nueva y apretá **Run**.
3. Repetí lo mismo con `supabase/seed.sql` — esto carga los posts que ya
   habíamos armado, para no perderlos.

## 3. Conectá la app a tu proyecto

1. En Supabase, andá a **Project Settings → API**.
2. Copiá el valor de **Project URL** y el de **anon public** (la clave
   "anon" — NO la "service_role", esa es secreta).
3. En la carpeta del proyecto, copiá `.env.example` a un archivo nuevo
   llamado `.env.local` y pegá ahí esos dos valores:

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```

   `.env.local` ya está en `.gitignore`, así que nunca se sube a ningún
   repositorio ni te lo vuelvo a pedir por acá.

## 4. Creá tu usuario de acceso al panel

Esto lo tenés que hacer vos directamente en Supabase — así tu contraseña no
pasa nunca por este chat.

1. En Supabase, andá a **Authentication → Users**.
2. Apretá **Add user → Create new user**.
3. Completá tu email y una contraseña, y confirmá.
4. Con eso ya podés entrar a `/notas-profe/login` en la app con ese email y esa
   contraseña.

## 5. Probalo local

```
npm run dev
```

Abrí `http://localhost:5173/notas-profe/login`, entrá con tu usuario, y desde ahí
ya podés cargar/editar/borrar posts del blog. Los cambios se ven al toque en
`/adultos/blog` e `/infancias/blog` (probalo en otra pestaña).

## 6. Cuando quieras publicarlo en internet (Vercel)

1. Subí este proyecto a un repositorio de GitHub (si todavía no lo hiciste).
2. En [vercel.com](https://vercel.com), creá una cuenta gratis e importá ese
   repositorio (`New Project → Import`).
3. En la configuración del proyecto en Vercel, agregá las mismas dos
   variables de entorno que en `.env.local` (`VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY`) en **Settings → Environment Variables**.
4. Deploy. Listo — tus alumnos entran por la URL de Vercel, y vos seguís
   cargando contenido desde `/notas-profe` sin volver a subir nada a mano: los
   cambios de blog son inmediatos porque ya no dependen del código, dependen
   de la base de datos.

---

**Sobre la ruta `/notas-profe`:** es a propósito no obvia — no aparece
linkeada en ningún lado del sitio público, así que solo se llega
escribiéndola directamente en el navegador. Eso ayuda a que no te la
encuentre cualquiera navegando, pero la protección real sigue siendo el
login: sin tu usuario y contraseña de Supabase, nadie puede leer los datos
de nadie ni cargar/editar/borrar contenido, aunque adivine la URL.

**Nota sobre alcance:** por ahora solo el Blog vive en la base de datos.
Flashcards, cuestionarios, listening, reading & writing, y la gestión de
tracks/grupos (nombres, colores, claves) siguen siendo archivos de código —
esa es la fase 2 del panel, y usa el mismo patrón que el blog.

---

# Fase 2: Tracks, grupos y contenido

Mismo mecanismo que el blog, pero para tracks/temarios (Adultos), grupos
(Infancias), y el contenido de estudio (flashcards, cuestionario, listening,
reading & writing). Se activa una sola vez, corriendo dos archivos SQL más.

1. En Supabase, andá a **SQL Editor** (el mismo lugar donde corriste
   `schema.sql` y `seed.sql`).
2. Apretá **New query**. Abrí `supabase/schema_phase2.sql` (en la carpeta del
   proyecto en tu compu), copiá todo el contenido, pegalo ahí, y apretá
   **Run**. Esto crea las tablas `tracks`, `temarios`, `groups` y
   `content_items`, con sus permisos.
3. Apretá **New query** de nuevo. Abrí `supabase/seed_phase2.sql`, copiá todo
   el contenido, pegalo, y apretá **Run**. Esto carga los tracks, temarios y
   grupos que ya tenías, más el contenido de muestra que ya existía
   (Business English → Foundations, B1-B2).

Con eso ya está. Hacé `git add`, `commit` y `push` de los cambios del código
para que Vercel despliegue las páginas y el panel nuevo, y desde
`/notas-profe` vas a ver tres secciones más: **Tracks y temarios**,
**Grupos**, y **Contenido**.

---

# Fase 3: Imágenes

Suma imagen opcional al blog, a las flashcards, y a las preguntas/ítems de
todos los tipos de contenido. Un solo archivo SQL más.

1. En Supabase, **SQL Editor → New query**. Abrí `supabase/schema_phase3.sql`,
   copiá todo el contenido, pegalo, y apretá **Run**. Esto agrega la columna
   de imagen del blog y crea el bucket de Storage `media` (público para
   lectura, protegido para subir/borrar) con sus permisos.
2. Este script está armado para poder correrse de nuevo sin error si hace
   falta — no rompe nada si ya lo corriste.

No hace falta cargar nada más: las imágenes se suben directo desde el panel
de administración cuando editás cualquier contenido.

---

# Fase 4: Completar oraciones, sinónimos/antónimos y pronunciación

Suma tres tipos de contenido nuevos al panel. La tabla `content_items` de la
fase 2 tiene una regla que limita qué valores acepta `content_type` — sin
este paso, guardar contenido de estos tres tipos nuevos falla con un error
de la base de datos.

1. En Supabase, **SQL Editor → New query**. Abrí `supabase/schema_phase4.sql`,
   copiá todo el contenido, pegalo, y apretá **Run**. Esto amplía esa regla
   para permitir `fill_blank`, `synonyms_antonyms` y `pronunciation` además
   de los cuatro tipos que ya había.
2. También se puede correr de nuevo sin problema si hace falta.

Con eso ya podés cargar "Completar oraciones", "Sinónimos y antónimos" y
"Pronunciación" desde `/notas-profe/content` sin que la base de datos
rechace el guardado.

---

# Fase 5: Registro de errores

Suma una sección privada para anotar errores recurrentes de cada alumno —
solo la ves vos, no aparece en ningún lado del sitio público.

1. En Supabase, **SQL Editor → New query**. Abrí `supabase/schema_phase5.sql`,
   copiá todo el contenido, pegalo, y apretá **Run**. Esto crea la tabla
   `error_notes`, con permisos SOLO para vos logueado (a diferencia del
   resto de las tablas, acá no hay lectura pública).
2. También se puede correr de nuevo sin problema si hace falta.

Con eso ya tenés la sección **Registro de errores** en `/notas-profe`: vas
anotando fecha, alumno, categoría del error, ejemplo y corrección, y el
panel te muestra qué categorías se repiten más para ese alumno.

---

# Fase 6: Glosario

Suma un glosario acumulado por track (Adultos) o grupo (Infancias), visible
para los alumnos junto al resto del contenido.

1. En Supabase, **SQL Editor → New query**. Abrí `supabase/schema_phase6.sql`,
   copiá todo el contenido, pegalo, y apretá **Run**. Esto crea la tabla
   `glossary_entries`, con lectura pública (la ven los alumnos) y escritura
   solo para vos logueado — mismo patrón que el resto del contenido.
2. También se puede correr de nuevo sin problema si hace falta.

El glosario se arma solo con las palabras que ya están en las flashcards de
cada track o grupo — no hace falta cargar nada para que empiece a
funcionar. Desde `/notas-profe/glosario` podés además sumar palabras
sueltas que todavía no tengan su propia flashcard. Los alumnos lo ven
tocando el botón "Glosario" dentro de cada track (Adultos) o grupo
(Infancias).
