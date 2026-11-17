# Plan del Portafolio Personal

> Documento vivo: aquí iremos registrando cómo se va a realizar el portafolio. Lo marcado como **(por definir)** se decide en la sección final.

## 1. Objetivo

- Presentar mi perfil, proyectos y habilidades de forma memorable.
- Usar elementos 3D interactivos como sello visual, sin sacrificar rendimiento ni accesibilidad.
- Que sea fácil de mantener y de ampliar con nuevos proyectos.

## 2. Stack técnico

| Capa | Tecnología | Notas |
|------|------------|-------|
| Framework | Next.js (App Router) + TypeScript | Usa React 19, así que hay que cuidar la compatibilidad de las librerías 3D |
| 3D | Three.js + `@react-three/fiber` (v9) | R3F v9 es la versión compatible con React 19 |
| Helpers 3D | `@react-three/drei` (serie 10) | Controles, entorno, texto 3D, carga de modelos |
| Efectos | `@react-three/postprocessing` | Opcional: bloom, viñeta, profundidad de campo |
| Animación / scroll | GSAP (ScrollTrigger) + Lenis | Scroll suave y animaciones ligadas al scroll |
| Modelos | `.glb` + `gltfjsx` + compresión Draco/Meshopt | Modelos livianos convertidos a componentes |
| Backend | Supabase (Postgres + Auth + Storage) con `@supabase/supabase-js` y `@supabase/ssr` | Datos, login del admin y archivos |
| ORM / Migraciones | Prisma ORM (`@prisma/client` + `prisma`) | Modelado de datos, migraciones con `prisma migrate` y consultas tipadas |
| Estilos | Tailwind CSS **(por definir)** | |
| Debug | Leva, r3f-perf | Solo en desarrollo |
| Despliegue | Vercel **(por definir)** | |

## 3. Estructura del sitio

1. **Hero**: nombre, rol y escena 3D principal.
2. **Sobre mí**: breve presentación y foto.
3. **Proyectos**: tarjetas con imagen, descripción, tecnologías y enlaces.
4. **Habilidades**: tecnologías y herramientas.
5. **Experiencia / Educación** **(por definir)**.
6. **Comentarios**: espacio donde los visitantes dejan comentarios tras iniciar sesión con Google.
7. **Contacto**: correo, redes y formulario **(por definir)**.

### 3.1 Dos vistas: pública y administración

El mismo proyecto de Next.js tendrá dos vistas:

| | Vista pública (cliente) | Vista admin (yo) |
|---|---|---|
| Ruta | `/` y `/proyectos/[slug]` | `/admin/*` |
| Quién accede | Cualquier persona puede ver; para comentar hay que iniciar sesión con Google | Solo yo, con correo y contraseña |
| Qué hace | Muestra el portafolio con el 3D | Crear, editar y eliminar proyectos, textos, imágenes y modelos |
| Datos | Solo lectura | Lectura y escritura |

- El contenido se guarda en una base de datos y la vista pública lo lee desde ahí; así no se toca código para cambiar nada.
- `/admin` queda protegido con Supabase Auth (proxy/middleware de Next.js que refresca la sesión) y no se indexa en buscadores.
- Las escrituras se validan en el servidor (Server Actions o rutas de API), nunca solo en el navegador.
- Acciones del admin: listar, crear, editar, eliminar y reordenar proyectos; subir imágenes; editar el texto "Sobre mí", habilidades y enlaces de contacto; publicar u ocultar elementos.
- El 3D queda solo en la vista pública, para que el panel sea rápido y liviano.

## 4. Estructura de carpetas (propuesta)

```
portafolio/
├── app/
│   ├── layout.tsx
│   ├── (public)/        # vista del cliente
│   │   ├── page.tsx
│   │   └── proyectos/[slug]/page.tsx
│   ├── admin/           # vista del administrador (protegida)
│   │   ├── login/page.tsx
│   │   ├── page.tsx     # panel / resumen
│   │   └── proyectos/   # listar, crear, editar, eliminar
│   ├── auth/callback/route.ts  # retorno del login con Google
│   └── api/             # rutas de API (si no se usan Server Actions)
├── proxy.ts             # refresca sesión y protege /admin (middleware.ts en versiones anteriores de Next.js)
├── components/
│   ├── ui/              # botones, tarjetas, navbar
│   ├── sections/        # Hero, About, Projects, Contact
│   ├── admin/           # formularios y tablas del panel
│   ├── comments/        # lista, formulario y botón de login con Google
│   └── three/           # Scene, modelos, luces, efectos
├── lib/
│   ├── db/              # conexión y consultas a la base de datos
│   └── auth/            # sesión y verificación del admin
├── public/
│   ├── models/          # .glb comprimidos
│   └── images/
├── lib/                 # utilidades y hooks
└── styles/
```

## 4.1 Base de datos (Supabase Postgres + Prisma ORM) y Archivos

**Modelado con Prisma (`prisma/schema.prisma`)**
- Se utiliza Prisma como ORM para definir modelos (`Profile`, `Project`, `ProjectImage`, `Skill`, `Admin`, `Comment`), realizar migraciones estructuradas (`npx prisma migrate dev`) y ejecutar consultas con tipado estricto en el servidor.
- Instancia única tipo singleton centralizada en `src/lib/prisma.ts`.

**Tablas principales**

| Tabla | Campos principales |
|-------|--------------------|
| `profile` | nombre, rol, bio, foto, correo, enlaces (GitHub, LinkedIn, etc.) |
| `projects` | título, slug, descripción, stack (lista), imagen de portada, enlace demo, repositorio, orden, `published` |
| `project_images` | proyecto, URL, orden |
| `skills` | nombre, categoría, orden |

**Seguridad (sin RLS — toda la validación ocurre en el servidor)**
- Las tablas de Supabase tienen RLS **desactivado**; el acceso directo desde el cliente queda bloqueado usando exclusivamente la clave `secret` en el servidor.
- Toda lectura y escritura pasa por **Server Actions o rutas de API** de Next.js, que verifican la sesión antes de ejecutar cualquier consulta.
- Lectura pública solo de lo que tenga `published = true` (filtro aplicado en el servidor).
- Escritura (insertar, editar, eliminar) solo desde rutas protegidas por el middleware, que verifica que el usuario sea admin con `supabase.auth.getClaims()`.
- La clave `secret` de Supabase **nunca va al navegador** ni a variables `NEXT_PUBLIC_*`; el cliente jamás llama directamente a Supabase.
- El cliente de Supabase con la clave `secret` solo se instancia en contextos de servidor (`server.ts` en `src/lib/supabase/`).

**Storage**
- Bucket `images` (público) para portadas y capturas.
- Bucket `models` (público) para los `.glb` comprimidos.

**Variables de entorno**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (solo servidor, si se necesita)

## 4.2 Autenticación y comentarios

**Dos tipos de usuario**

| | Admin (yo) | Visitante |
|---|---|---|
| Método de login | Correo y contraseña en `/admin/login` | Solo Google, con botón en la vista pública |
| Cómo se crea la cuenta | Manualmente en el panel de Supabase | Automática al entrar con Google por primera vez |
| Qué puede hacer | Todo el panel, moderar y borrar cualquier comentario | Escribir comentarios y editar o borrar los suyos |

**Configuración**
- Activar el proveedor Google en Supabase Auth con un Client ID y Secret creados en Google Cloud Console (la URL de callback de Supabase va como URI de redirección autorizada).
- Mantener activo el proveedor de correo, pero solo para mi cuenta admin.
- Dejar abiertos los registros solo para Google. Las rutas de registro de Supabase se pueden llamar sin pasar por mi interfaz, así que el bloqueo se hace en el servidor: un hook **Before User Created** que rechaza cualquier alta que no venga de Google (o que no sea el correo del admin).
- Crear mi cuenta admin **antes** de activar el hook y comprobar que sigo pudiendo entrar.
- Quién es admin lo decide una tabla `admins` (con mi `user_id`), no el correo ni el proveedor.
- Recomendado: activar verificación en dos pasos (TOTP) para la cuenta admin.

**Tablas nuevas**

| Tabla | Campos principales |
|-------|--------------------|
| `admins` | `user_id` (solo mi usuario) |
| `comments` | `id`, `user_id`, nombre y avatar (tomados de Google), `project_id` (opcional), texto, `status` (visible/oculto), fecha |

**Políticas de acceso de `comments`**
- Toda la lógica de acceso se implementa en el servidor (Server Actions / rutas de API):
  - **Leer**: solo se devuelven comentarios con `status = visible`.
  - **Insertar**: solo si hay sesión activa de Google; `user_id` se inyecta en el servidor, nunca llega del cliente.
  - **Editar o borrar**: el servidor verifica que `user_id` coincida con `auth.uid()`, o que el usuario sea admin.
  - **Ocultar o moderar**: solo admin, verificado en el servidor.

**Protección contra abuso**
- Límite de longitud del texto y límite de comentarios por minuto por usuario.
- Escapar y sanear el texto al mostrarlo (nunca renderizar HTML crudo).
- Botón de reporte opcional y panel de moderación en `/admin/comentarios`.

## 5. Plan para el 3D

- **Dónde va**: elemento principal en el hero **(por definir si hay más escenas)**.
- **Interacción**: reacción al mouse/scroll **(por definir)**.
- **Integración en Next.js**:
  - `<Canvas>` dentro de un componente cliente (`'use client'`).
  - Carga con `next/dynamic` y `ssr: false`.
  - `Suspense` con un fallback ligero mientras carga la escena.
- **Rendimiento**:
  - `dpr={[1, 2]}` para limitar el pixel ratio.
  - Modelos de pocos polígonos y texturas comprimidas.
  - Pausar el render cuando la escena no está visible.
- **Plan B**: imagen estática o versión simplificada en dispositivos lentos y para quien prefiera movimiento reducido (`prefers-reduced-motion`).

## 6. Contenido a preparar

- [ ] Texto de presentación (2-3 párrafos cortos).
- [ ] Foto o avatar.
- [ ] Lista de proyectos a mostrar (nombre, descripción, stack, capturas, enlace/repositorio).
- [ ] CV en PDF.
- [ ] Enlaces: GitHub, LinkedIn, correo.
- [ ] Modelo(s) 3D (propios, de librerías gratuitas o creados en Blender).

## 7. Rendimiento, SEO y accesibilidad

- Meta tags y Open Graph por página (API de metadata de Next.js).
- Imágenes con `next/image`.
- Contraste y navegación por teclado en toda la interfaz.
- Medir con Lighthouse y apuntar a buen puntaje también en móvil.

## 8. Fases de trabajo

1. **Base**: crear el proyecto, configurar TypeScript, estilos y estructura de carpetas.
2. **Contenido y diseño**: maquetar secciones sin 3D, con los datos reales.
3. **3D**: integrar la escena del hero y probar rendimiento.
4. **Animaciones**: scroll suave y transiciones.
5. **Pulido**: SEO, accesibilidad, responsive y plan B sin 3D.
6. **Despliegue**: publicar y configurar dominio **(por definir)**.

## 9. Decisiones pendientes

- [x] Backend del panel admin: Supabase (base de datos, Auth y Storage).
- [x] Login: admin con correo y contraseña; visitantes solo con Google (para comentar).
- [ ] Comentarios: ¿se publican al instante o pasan por aprobación del admin?
- [ ] Comentarios: ¿generales del portafolio, por proyecto, o ambos?
- [x] Tipo de 3D: Cohete procedural ensamblado con scroll (Three.js + R3F + GSAP).
- [x] Estilo visual: Dark/Light theme con glassmorphism, JetBrains Mono y Space Grotesk.
- [x] ¿Tailwind CSS u otra opción de estilos?: Tailwind CSS v4 configurado.
- [ ] Idiomas del sitio (solo español o español + inglés).
- [ ] ¿Formulario de contacto propio o solo enlaces?
- [ ] ¿Blog o sección de artículos?
- [ ] Dominio y hosting.

## 10. Registro de avances

| Fecha | Avance |
|-------|--------|
| 2026-11-16 | Definido el stack 3D y creado este plan |
| 2026-11-16 | Definidas las dos vistas (pública y admin) y elegido Supabase como backend |
| 2026-11-16 | Definido el login: admin con cuenta propia, visitantes con Google y espacio de comentarios |
| 2026-11-16 | Decidido no usar RLS; toda la seguridad se centraliza en Server Actions y middleware de Next.js |
| 2026-11-16 | Integrado el portafolio 3D completo en Next.js (R3F, GSAP ScrollTrigger, Lenis, temas claro/oscuro) |
| 2026-11-17 | Integrado Prisma ORM con schema de modelos (`Profile`, `Project`, `Skill`, `Admin`, `Comment`) y cliente singleton |
| 2026-11-17 | Implementado sistema de Auth dual (Admin con correo/password en `/admin`, invitados solo con Google OAuth en `/`) y moderación de comentarios |
| 2026-11-17 | Diseñada interfaz 3D y animaciones para el login (escena Three.js orbital, tarjeta con tilt 3D y brillo holográfico reactivo) |
| 2026-11-17 | Implementadas animaciones cinemáticas de salida/descarte 3D (GSAP warp-out y desvanecimiento de fondo) al cerrar el login |
| 2026-11-17 | Conexión exitosa a Supabase Postgres y sincronización de modelos Prisma (`Profile`, `Project`, `Comment`, etc.) |
