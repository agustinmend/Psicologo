# Sistema de Gestión de Turnos – Consultorio Psicológico

Diagrama del sistema
<img width="1593" height="1094" alt="diagrama" src="https://github.com/user-attachments/assets/ee08e47c-727f-43e6-aab0-0770f1d9be15" />

## 1. Documentación Funcional

### 1.1 Propósito del Sistema
Sistema web para la gestión digital de turnos de un consultorio psicológico, permitiendo al profesional visualizar su agenda, registrar, editar, cancelar citas y llevar control de asistencia, eliminando los problemas de la agenda en papel (pérdida de turnos, superposición, falta de trazabilidad).

### 1.2 Alcance Funcional
| Requerimiento | Implementado | Observación |
|---------------|--------------|-------------|
| Visualización de turnos en calendario | ✅ | Vistas: día, semana, mes. Horario fijo 14-21h, solo lunes a viernes. |
| Registrar nuevo turno | ✅ | Selección de horario libre en calendario → formulario modal. |
| Cancelar turno | ✅ | Desde detalle de cita, con confirmación. |
| Editar turno | ✅ | Permite modificar paciente y descripción. |
| Mostrar turnos libres/ocupados | ✅ | Ocupados = color azul (u otros según estado). Libres = espacio seleccionable. |
| Buscar por paciente | ✅ | Buscador con filtro en tiempo real sobre citas cargadas. |
| Marcar asistencia (asistió / no asistió) | ✅ | Solo visible en citas pasadas. Cambia color del evento. |
| Vista semanal | ✅ | Disponible en el calendario. |

### 1.3 Actores
- **Psicólogo (único usuario)**: Gestiona turnos, consulta agenda, registra asistencia.

### 1.4 Flujos Principales

#### 1.4.1 Creación de una cita
1. El psicólogo hace clic en un bloque horario libre del calendario.
2. Se abre un modal con los datos: fecha y horario (precargados).
3. Completa nombre del paciente (obligatorio) y descripción opcional.
4. Confirma → sistema verifica solapamiento → guarda en base de datos → refresca calendario.

#### 1.4.2 Edición / Cancelación / Registro de Asistencia
1. Hace clic en un evento del calendario.
2. Se abre modal de detalle con datos completos.
3. Según la acción:
   - **Editar**: permite cambiar nombre y descripción.
   - **Cancelar**: elimina la cita tras confirmación.
   - **Asistió / No asistió**: solo disponible si la cita ya pasó; actualiza estado y color.

#### 1.4.3 Búsqueda de citas por paciente
1. Escribe nombre en campo de búsqueda y presiona "Buscar".
2. Se listan debajo todas las citas que coincidan (parcial o totalmente).

### 1.5 Reglas de Negocio
- **Horario de atención**: lunes a viernes, de 14:00 a 21:00 (configurado en calendario).
- **Duración mínima de turno**: 30 minutos (definido por el slot del calendario).
- **No superposición**: validación antes de guardar.
- **Estados de cita**: `programado` (default), `asistio`, `no_asistio` → colores respectivos.

---

## 2. Documentación Técnica

### 2.1 Arquitectura General
**Arquitectura Cliente-Servidor**:
- **Frontend**: HTML/CSS/JS vanilla, FullCalendar, desplegable en servidor web estático.
- **Backend**: Supabase (PostgreSQL).
- **Almacenamiento**: Datos en tabla `citas` de Supabase.

### 2.2 Tecnologías Utilizadas
| Capa | Tecnología | Versión / Nota |
|------|------------|----------------|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) | – |
| UI Components | FullCalendar | 6.1.20, con plugins timeGrid, dayGrid |
| Estilos | CSS custom + Google Fonts (Inter) | – |
| Backend | Supabase | Postgres 15, API REST automática |
| Cliente Supabase | `@supabase/supabase-js` | v2, CDN |
| Control de versiones | Git + GitHub | Repositorio público |


### 2.3 Modelo de Datos

### 2.4 "API" Interna (Servicios)
Todas las funciones están en `cita-servicio.js`:

| Función | Descripción | Parámetros |
|---------|-------------|------------|
| `obtenerCitas()` | Trae todas las citas | – |
| `verificarSolapamiento(fecha, horaInicio, horaFin)` | Retorna `true` si hay conflicto | fecha, horaInicio, horaFin |
| `guardarCita(psicologoId, fecha, horaInicio, horaFin, nombrePaciente, descripcion)` | Inserta nueva cita | – |
| `eliminarCita(id)` | Elimina por ID | – |
| `actualizarCita(id, datos)` | Actualiza campos pasados | datos: objeto con campos a modificar |

### 2.5 Requisitos de Instalación y Despliegue
**No requiere instalación local** (solo servidor web estático).  
Pasos para levantar en entorno local:
1. Clonar repositorio: `git clone https://github.com/agustinmend/Psicologo.git`
2. Servir con cualquier servidor estático (Live Server de VS Code, Python HTTP server, etc.)
3. Asegurar conexión a internet (para carga de CDNs y Supabase).

### 2.6 Consideraciones de Seguridad
- La **key de Supabase** es pública (publishable), por lo que se debe contar con políticas de seguridad a nivel de base de datos (RLS) para restringir operaciones.
- Actualmente no hay autenticación; se asume un único psicólogo con `psicologo_id = 1` fijo. En un entorno real, se recomienda implementar login y asociar citas al usuario autenticado.
- Validaciones básicas en frontend y backend (solapamiento, datos obligatorios).

### 2.7 Posibles Mejoras Futuras
| Área | Sugerencia |
|------|------------|
| Autenticación | Agregar login con Supabase Auth para múltiples psicólogos |
| Notificaciones | Envío de recordatorios por email/SMS (usar Edge Functions) |
| Reportes | Exportar agenda a PDF o generar estadísticas de asistencia |
| Manejo offline | Implementar Service Worker para uso sin conexión |

---

## 3. Cumplimiento de Requerimientos

El sistema cumple con la totalidad de los requerimientos funcionales planteados en el análisis de requerimientos, incluyendo las historias de usuario:
- ✅ HU-01: Visualización de turnos en calendario
- ✅ HU-02: Registrar nuevo turno
- ✅ HU-03: Cancelar turno
- ✅ HU-04: Editar turno
- ✅ HU-05: Buscar por paciente
- ✅ HU-06: Marcar asistencia
- ✅ HU-07: Vista semanal