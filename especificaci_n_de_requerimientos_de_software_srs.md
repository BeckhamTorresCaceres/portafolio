# Especificación de Requerimientos de Software (SRS)
**Proyecto:** Plataforma Móvil de Mensajería Instantánea en Tiempo Real (Tipo WhatsApp)  
**Versión:** 1.0  
**Estándar de referencia:** ISO/IEC/IEEE 29148  

---

## 1. Introducción

### 1.1 Propósito
Definir de manera completa, precisa y verificable los requerimientos funcionales, no funcionales, arquitectura de datos, interfaces externas y reglas de negocio necesarios para diseñar, desarrollar y probar una aplicación móvil de mensajería instantánea con soporte *offline-first* y comunicación bidireccional en tiempo real.

### 1.2 Alcance del Sistema
El sistema consta de dos componentes principales:
1. **Aplicación Cliente Móvil (iOS / Android):** Desarrollada en React Native (Expo) + TypeScript con almacenamiento local SQLite para garantizar acceso inmediato al historial sin conexión y sincronización automática.
2. **Servidor Backend y Motor Tiempo Real:** API REST y servidor WebSockets (Node.js / NestJS + Socket.io) respaldado por PostgreSQL, Redis y almacenamiento de objetos en la nube (AWS S3 o Cloudflare R2).

### 1.3 Definiciones, Acrónimos y Abreviaturas
* **SRS:** *Software Requirements Specification* (Especificación de Requerimientos de Software).
* **WebSocket (WSS):** Protocolo de comunicación bidireccional persistente sobre TCP seguro.
* **Local-First:** Paradigma donde la interfaz lee y escribe primero en una base de datos local (SQLite) y sincroniza en segundo plano con el servidor.
* **ACK (*Acknowledgement*):** Confirmación técnica emitida por el servidor o cliente indicando la recepción de un paquete.
* **Presigned URL:** URL temporal firmada criptográficamente que permite subir archivos directamente al almacenamiento en la nube sin pasar por el servidor de aplicación.
* **UUIDv4:** Identificador único universal generado en el cliente para garantizar idempotencia.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El sistema opera como una arquitectura cliente-servidor orientada a eventos. El cliente móvil actúa como fuente primaria de lectura mediante su caché local, mientras que el backend actúa como fuente de verdad centralizada, enrutador de mensajes en tiempo real y gestor de notificaciones push cuando los clientes están desconectados.

```text
+-------------------+       HTTPS (REST / Upload)       +----------------------+
|                   | --------------------------------> |   API REST & Auth    |
|  App Móvil        |                                   |   (NestJS / Node)    |
|  (React Native    | <======= WebSockets (WSS) ======> |   Socket.io Gateway  |
|   + Expo)         |                                   +----------+-----------+
|                   |                                              |
|  [SQLite Local]   |       HTTPS (Presigned URL)                  |
|  [Zustand Store]  | ----------------+                            v
+-------------------+                 |                 +----------+-----------+
        ^                             v                 | PostgreSQL (Historial|
        |                   +-------------------+       | Usuarios, Salas)     |
        |                   |  Cloud Storage    |       +----------+-----------+
        +--- Push (FCM) --- |  (S3 / R2)        |                  |
                            +-------------------+       +----------+-----------+
                                                        | Redis (Presencia,    |
                                                        | Sockets activos)     |
                                                        +----------------------+
```

### 2.2 Clases de Usuarios y Características
| Rol de Usuario | Descripción y Privilegios |
| :--- | :--- |
| **Usuario Estándar** | Puede registrar su cuenta, editar su perfil, iniciar chats 1 a 1, participar en grupos, enviar texto/multimedia y gestionar su privacidad básica. |
| **Administrador de Grupo** | Posee todos los privilegios de un Usuario Estándar, además de poder agregar o eliminar participantes, modificar el nombre/foto del grupo y asignar otros administradores. |

### 2.3 Entorno Operativo
* **Cliente Móvil:** Android 10+ (API 29+) e iOS 15.0+.
* **Servidor:** Contenedores Linux (Ubuntu/Alpine) ejecutando Node.js LTS, PostgreSQL 16+ y Redis 7+.
* **Red:** Operación en redes móviles (3G/4G/5G) y Wi-Fi con soporte para desconexiones intermitentes.

### 2.4 Restricciones de Diseño e Implementación
1. **Idempotencia:** Todo mensaje debe generar su `UUIDv4` en el dispositivo emisor antes de ser transmitido para evitar duplicados ante reintentos de red.
2. **Desacoplamiento Multimedia:** Ningún archivo binario (imagen, audio, video) debe transmitirse a través del canal WebSocket; deben cargarse vía HTTP mediante *Presigned URLs*.
3. **Ciclo de Vida Móvil:** El cliente debe gestionar explícitamente los cambios de estado del sistema operativo (`active`, `background`, `inactive`) para liberar conexiones WebSocket y evitar consumo excesivo de batería.

---

## 3. Requerimientos Funcionales (RF)

### 3.1 Módulo de Identidad y Perfil
* **RF-01 Registro e Inicio de Sesión:** El sistema debe permitir autenticar usuarios mediante número telefónico o correo electrónico utilizando verificación por código (OTP) o credenciales con emisión de tokens JWT (`access_token` y `refresh_token`).
* **RF-02 Gestión de Perfil:** El usuario debe poder actualizar su nombre visible (máx. 100 caracteres), texto de estado (máx. 150 caracteres) y fotografía de avatar.
* **RF-03 Descubrimiento de Usuarios:** El sistema debe permitir buscar usuarios registrados por identificador (teléfono/correo/usuario) para iniciar una nueva conversación.

### 3.2 Módulo de Conversaciones y Grupos
* **RF-04 Chats Individuales (1 a 1):** Al iniciar un chat con un usuario existente, el sistema debe recuperar la conversación previa si ya existe o crear una nueva instancia única entre ambos participantes.
* **RF-05 Creación y Gestión de Grupos:** Un usuario debe poder crear una sala grupal asignando un nombre (obligatorio), una imagen (opcional) y seleccionando al menos 1 participante adicional (máximo 256 miembros).
* **RF-06 Administración de Participantes:** Los administradores de un grupo deben poder añadir nuevos miembros, expulsar miembros existentes y abandonar el grupo (transfiriendo el rol de administrador automáticamente si era el único).

### 3.3 Módulo de Mensajería en Tiempo Real
* **RF-07 Envío y Recepción de Texto:** El sistema debe transmitir mensajes de texto UTF-8 (incluyendo emojis) con una latencia percibida menor a $300\text{ ms}$ bajo condiciones normales de red.
* **RF-08 Máquina de Estados del Mensaje:** Cada mensaje enviado debe transitar estrictamente por los siguientes estados visibles para el emisor:
  1. `pending`: Almacenado en SQLite local, pendiente de transmisión.
  2. `sent`: Confirmado (`ACK`) y persistido en la base de datos del servidor ($\checkmark$).
  3. `delivered`: Recibido por el dispositivo del destinatario ($\checkmark\checkmark$ gris).
  4. `read`: Visualizado en pantalla por el destinatario al tener la conversación abierta en primer plano ($\checkmark\checkmark$ azul).
* **RF-09 Respuesta Citada (*Reply*):** El usuario debe poder seleccionar un mensaje previo de la conversación para responder haciendo referencia directa a su `message_id`.
* **RF-10 Eliminación de Mensajes:** El emisor debe poder eliminar un mensaje propio ("Eliminar para mí" a nivel local o "Eliminar para todos" notificando mediante evento WebSocket para reemplazar su contenido).

### 3.4 Módulo de Presencia y Eventos Efímeros
* **RF-11 Estado de Conexión:** El sistema debe mostrar en la cabecera del chat 1 a 1 si el contacto está *"En línea"* (socket activo en Redis) o la marca de tiempo de su *"Última vez"*.
* **RF-12 Indicador de Escritura:** Cuando un usuario teclea en la caja de texto, el cliente debe emitir un evento efímero (`typing:start`) con *debounce* de $2\text{ segundos}$ para mostrar *"Escribiendo..."* a los demás participantes sin persistir dicho evento en disco.

### 3.5 Módulo Multimedia y Notificaciones
* **RF-13 Envío de Imágenes:** El usuario debe poder capturar fotos con la cámara o seleccionarlas desde la galería, comprimirlas en el cliente antes de subirlas al Storage y enviarlas con un texto opcional (*caption*).
* **RF-14 Notas de Voz:** El usuario debe poder grabar audio desde el micrófono de la app, visualizar la duración, subir el archivo comprimido (`.m4a`/`.aac`) y reproducirlo dentro de la burbuja de chat.
* **RF-15 Notificaciones Push:** Si el servidor detecta que el destinatario no posee una sesión WebSocket activa al recibir un mensaje nuevo, debe encolar y despachar una notificación push (FCM/APNs) incluyendo el nombre del remitente y una vista previa del contenido.

### 3.6 Módulo Offline-First y Sincronización
* **RF-16 Lectura sin Conexión:** Al abrir la aplicación sin acceso a internet, el sistema debe cargar la lista de conversaciones y los mensajes almacenados en SQLite en menos de $500\text{ ms}$.
* **RF-17 Cola de Salida Local:** Los mensajes redactados sin conexión deben guardarse en SQLite con estado `pending` y enviarse secuencialmente en orden cronológico (`FIFO`) en cuanto se restablezca el túnel WebSocket.
* **RF-18 Sincronización Diferencial (*Delta Sync*):** Al reconectar el socket tras un periodo offline, el cliente debe solicitar al servidor únicamente los mensajes y actualizaciones de estado posteriores a su último `timestamp` sincronizado.

---

## 4. Requerimientos No Funcionales (RNF)

### 4.1 Rendimiento y Fluidez
* **RNF-01 Tasa de Cuadros (FPS):** El desplazamiento (*scroll*) en listas con más de $5,000$ mensajes y contenido multimedia debe mantenerse a $60\text{ FPS}$ mediante reciclaje de vistas (`@shopify/flash-list`) y caché de imágenes en disco.
* **RNF-02 Paginación:** La carga inicial de una sala de chat debe recuperar únicamente los últimos $30$ mensajes; los mensajes anteriores se cargarán bajo demanda mediante paginación por cursor (`cursor-based pagination`).

### 4.2 Seguridad y Privacidad
* **RNF-03 Cifrado en Tránsito:** Toda comunicación REST debe operar sobre **HTTPS (TLS 1.3)** y toda comunicación en tiempo real sobre **WSS**.
* **RNF-04 Autorización en Salas:** El servidor WebSocket debe validar en cada evento `chat:join` y `message:send` que el `user_id` autenticado en el token JWT pertenezca a la tabla `participants` de dicha conversación.
* **RNF-05 Control de Acceso Multimedia:** Las URLs de subida (*Presigned URLs*) deben tener una caducidad máxima de $5\text{ minutos}$ y validar el tipo MIME (`image/jpeg`, `image/png`, `audio/mp4`, `audio/aac`) y tamaño máximo ($15\text{ MB}$ por archivo).

### 4.3 Disponibilidad y Escalabilidad
* **RNF-06 Reconexión Automática:** Ante caídas de red, el cliente WebSocket debe implementar una estrategia de *Exponential Backoff* con *jitter* (reintentos a $1\text{s}, 2\text{s}, 4\text{s}, 8\text{s}$, máx. $30\text{s}$) para evitar saturar el servidor tras cortes masivos.
* **RNF-07 Escalabilidad Horizontal:** El servidor de WebSockets debe utilizar un adaptador Pub/Sub (Redis Adapter) para permitir múltiples instancias del backend sincronizadas entre sí.

---

## 5. Modelo de Datos (PostgreSQL)

```sql
-- 1. Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_or_email VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    about_text VARCHAR(150) DEFAULT 'Disponible',
    push_token TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversaciones (Chats 1 a 1 o Grupos)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN DEFAULT FALSE,
    group_name VARCHAR(100),
    group_avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Participantes por conversación
CREATE TABLE participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin' | 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 4. Mensajes
CREATE TABLE messages (
    id UUID PRIMARY KEY, -- Generado en el cliente (UUIDv4) para idempotencia
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'audio'
    content TEXT,
    media_url TEXT,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent' | 'delivered' | 'read'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices críticos para rendimiento
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_participants_user ON participants(user_id);
```

---

## 6. Interfaces Externas y Contratos de Comunicación

### 6.1 Interfaz de API REST (Endpoints Principales)
| Método | Ruta | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Inicia sesión / solicita OTP. | Pública |
| `POST` | `/api/v1/auth/verify` | Valida OTP y entrega `access_token` + `refresh_token`. | Pública |
| `GET` | `/api/v1/conversations` | Lista conversaciones activas del usuario con último mensaje. | Bearer JWT |
| `GET` | `/api/v1/conversations/:id/messages` | Obtiene historial paginado (`?cursor=TIMESTAMP&limit=30`). | Bearer JWT |
| `POST` | `/api/v1/media/presigned-url` | Genera URL firmada para subida directa a S3/R2. | Bearer JWT |
| `PUT` | `/api/v1/users/push-token` | Registra o actualiza el token FCM/APNs del dispositivo. | Bearer JWT |

### 6.2 Contrato de Eventos WebSocket (Socket.io)

#### Eventos emitidos por el Cliente (`Client -> Server`)
| Evento | Payload (JSON) | Descripción |
| :--- | :--- | :--- |
| `chat:join` | `{ conversationId }` | Une el socket activo a la sala de la conversación. |
| `message:send` | `{ id, conversationId, type, content, mediaUrl, replyToId }` | Envía un mensaje nuevo. |
| `message:delivered` | `{ messageIds: string[], conversationId }` | Confirma que los mensajes llegaron al dispositivo. |
| `message:read` | `{ messageIds: string[], conversationId }` | Confirma que el usuario abrió el chat y los leyó. |
| `typing:start` | `{ conversationId }` | Notifica que el usuario está escribiendo. |
| `typing:stop` | `{ conversationId }` | Notifica que dejó de escribir. |

#### Eventos emitidos por el Servidor (`Server -> Client`)
| Evento | Payload (JSON) | Descripción |
| :--- | :--- | :--- |
| `message:new` | `{ id, conversationId, senderId, content, status, createdAt }` | Entrega un mensaje nuevo a los miembros de la sala. |
| `message:ack` | `{ tempId, status: 'sent', serverTimestamp }` | Confirma al emisor que el servidor guardó el mensaje. |
| `message:status_update` | `{ conversationId, messageIds, status: 'delivered' \| 'read' }` | Actualiza los checks en tiempo real. |
| `user:presence` | `{ userId, isOnline: boolean, lastSeenAt }` | Actualiza estado en línea en la cabecera del chat. |
| `typing:update` | `{ conversationId, userId, isTyping: boolean }` | Muestra/oculta el indicador *"escribiendo..."*. |

### 6.3 Reglas de Negocio Críticas
* **RN-01:** Un usuario no puede enviarse mensajes a sí mismo a menos que abra explícitamente su chat personal ("Mensajes guardados").
* **RN-02:** Un mensaje marcado como `read` no puede retroceder nunca a estado `delivered` o `sent`.
* **RN-03:** Si un mensaje falla al enviarse por error de validación del servidor (ej. usuario expulsado del grupo), el cliente debe marcarlo como `failed` en SQLite y detener los reintentos automáticos para ese ID.

---

## 7. Criterios de Aceptación para el MVP (Definición de Terminado)
El producto mínimo viable se considerará completado y listo para despliegue cuando supere las siguientes pruebas:
1. Dos dispositivos físicos distintos intercambian mensajes de texto en tiempo real con transición visual completa de estados ($\text{Reloj} \rightarrow \text{Check simple} \rightarrow \text{Doble check gris} \rightarrow \text{Doble check azul}$).
2. Al activar el "Modo Avión" en el Dispositivo A, enviar $3$ mensajes y desactivar el "Modo Avión", los $3$ mensajes llegan al Dispositivo B en el orden exacto sin duplicados.
3. Al cerrar completamente la aplicación en el Dispositivo B y enviar una imagen desde el Dispositivo A, el Dispositivo B recibe una notificación push nativa y visualiza la imagen al abrir la app.