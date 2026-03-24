import { verificarSolapamiento, guardarCita, obtenerCitas, eliminarCita, actualizarCita } from "./service/cita-servicio.js"
document.addEventListener('DOMContentLoaded', async function() {
    const ID_Psicologo = 1
    let seleccionActual = null
    let citas = await obtenerCitas()
    const eventos = citas.map(cita => ({
        id: cita.id,
        title: `Cita con ` + cita.nombre_paciente,
        start: cita.fecha + 'T' + cita.hora_inicio,
        end: cita.fecha + 'T' + cita.hora_fin,
        backgroundColor: obtenerColorPorEstado(cita.estado),
        extendedProps: {
            descripcion: cita.descripcion,
            estado: cita.estado,
            nombre: cita.nombre_paciente
        }
    }))
    const calendarioEl = document.getElementById('calendario')
    const calendario = new FullCalendar.Calendar(calendarioEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        selectable: true,
        allDaySlot: false,
        buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
        dayHeaderFormat: { weekday: 'long' },
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        weekends: false,
        slotMinTime: "14:00:00",
        slotMaxTime: "21:00:00",
        height: 'auto',
        events: eventos,
        eventClick: function (info) {
            const template = document.getElementById('detalle-cita')
            const nodo = template.content.cloneNode(true)
            document.body.appendChild(nodo)
            const modal = document.querySelector('.modal:last-of-type')
            const cita = info.event
            const ahora = new Date()
            const esPasada = cita.end < ahora
            modal.querySelector('#detalle-paciente').textContent = cita.title
            modal.querySelector('#detalle-fecha').textContent = cita.start.toLocaleDateString()
            modal.querySelector('#detalle-hora').textContent = cita.start.toLocaleTimeString() + ' - ' + cita.end.toLocaleTimeString()
            modal.querySelector('#detalle-estado').textContent = cita.extendedProps.estado
            modal.querySelector('#detalle-descripcion').textContent = cita.extendedProps.descripcion || ''
            const btnAsistio = modal.querySelector('#btn-asistio')
            const btnNoAsistio = modal.querySelector('#btn-no-asistio')
            if(!esPasada) {
                btnAsistio.style.display = 'none'
                btnNoAsistio.style.display = 'none'
            }
            modal.querySelector('#btn-cerrar').addEventListener('click', () => {
                modal.remove()
            })
            modal.querySelector('#btn-cancelar').addEventListener('click', async () => {
                const confirmar = confirm('¿Cancelar turno?')
                if (!confirmar) return
                const res = await eliminarCita(cita.id)
                if (res.error) {
                    alert('Error al cancelar')
                    return
                }
                cita.remove()
                modal.remove()
            })
            modal.querySelector('#btn-editar').addEventListener('click', () => {
                modal.remove()
                abrirModalEdicion(cita)
            })
            btnAsistio.addEventListener('click', async () => {
                const res = await actualizarCita(cita.id, {
                    estado: 'asistio'
                })
                if (res.error) {
                    alert('Error al actualizar')
                    return
                }
                cita.setExtendedProp('estado', 'asistio')
                actualizarColorEvento(cita)
                modal.remove()
            })
            btnNoAsistio.addEventListener('click', async () => {
                const res = await actualizarCita(cita.id, {
                    estado: 'no_asistio'
                })
                if (res.error) {
                    alert('Error al actualizar')
                    return
                }
                cita.setExtendedProp('estado', 'no_asistio')
                actualizarColorEvento(cita)
                modal.remove()
            })
            modal.style.display = 'flex'
        },
        select: function(info) {
            const fecha = info.startStr.split('T')[0]
            const horaInicio = info.startStr.split('T')[1].substring(0,5)
            const horaFin = info.endStr.split('T')[1].substring(0,5)
            seleccionActual = {
                fecha,
                horaInicio,
                horaFin,
                startIso: info.startStr,
                endIso: info.endStr
            }
            abrirModalCrear(seleccionActual, calendario)
        }
    })
    calendario.render()
    function abrirModalCrear(seleccion, calendario) {
        const template = document.getElementById('formulario-crear-cita')
        const nodo = template.content.cloneNode(true)
        document.body.appendChild(nodo)
        const modal = document.querySelector('.modal:last-of-type')
        const inputPaciente = modal.querySelector('[name="nombre_paciente"]')
        const inputFecha = modal.querySelector('[name="fecha"]')
        const inputHorario = modal.querySelector('[name="horario"]')
        const inputDescripcion = modal.querySelector('[name="descripcion"]')
        const formulario = modal.querySelector('.modal__formulario')
        const btnCancelar = modal.querySelector('.modal__boton')
        inputFecha.value = seleccion.fecha
        inputHorario.value = seleccion.horaInicio + ' - ' + seleccion.horaFin
        modal.style.display = 'flex'
        btnCancelar.addEventListener('click', () => {
            modal.remove()
            calendario.unselect()
        })
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault()
            const nombrePaciente = inputPaciente.value.trim()
            if (!nombrePaciente) {
                alert('Nombre obligatorio')
                return
            }
            const ocupado = await verificarSolapamiento(
                seleccion.fecha,
                seleccion.horaInicio,
                seleccion.horaFin
            )
            if (ocupado) {
                alert('Horario ocupado')
                return
            }
            const res = await guardarCita(
                ID_Psicologo,
                seleccion.fecha,
                seleccion.horaInicio,
                seleccion.horaFin,
                nombrePaciente,
                inputDescripcion.value.trim()
            )
            if (res.error) {
                alert('Error al guardar')
                return
            }
            const nuevaCitaBD =res.data[0]
            calendario.addEvent({
                id: nuevaCitaBD.id,
                title: 'Cita con ' + nombrePaciente,
                start: seleccion.startIso,
                end: seleccion.endIso,
                extendedProps: {
                    descripcion: inputDescripcion.value.trim(),
                    estado: 'programado',
                    nombre: nombrePaciente
                }
            })
            citas.push({
                id: nuevaCitaBD.id,
                nombre_paciente: nombrePaciente,
                fecha: seleccion.fecha,
                hora_inicio: seleccion.horaInicio,
                hora_fin: seleccion.horaFin
            });
            modal.remove()
            calendario.unselect()
        })
    }
    function abrirModalEdicion(evento) {
        const template = document.getElementById('formulario-crear-cita')
        const nodo = template.content.cloneNode(true)
        document.body.appendChild(nodo)
        const modal = document.querySelector('.modal:last-of-type')
        modal.querySelector('.modal__titulo').textContent = 'Editar cita'
        const inputPaciente = modal.querySelector('[name="nombre_paciente"]')
        const inputFecha = modal.querySelector('[name="fecha"]')
        const inputHorario = modal.querySelector('[name="horario"]')
        const inputDescripcion = modal.querySelector('[name="descripcion"]')
        inputPaciente.value = evento.extendedProps.nombre
        inputFecha.value = evento.start.toISOString().split('T')[0]
        const inicio = evento.start.toTimeString().substring(0,5)
        const fin = evento.end.toTimeString().substring(0,5)
        inputHorario.value = inicio + ' - ' + fin
        inputDescripcion.value = evento.extendedProps.descripcion || ''
        const formulario = modal.querySelector('.modal__formulario')
        const btnCancelar = modal.querySelector('.modal__boton')
        modal.style.display = 'flex'
        btnCancelar.addEventListener('click', () => {
            modal.remove()
        })
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault()
            const nombre = inputPaciente.value.trim()
            const descripcion = inputDescripcion.value.trim()
            const res = await actualizarCita(evento.id, {
                nombre_paciente: nombre,
                descripcion: descripcion
            })
            if (res.error) {
                alert('Error al actualizar')
                return
            }
            evento.setProp('title', 'Cita con ' + nombre)
            evento.setExtendedProp('descripcion', descripcion)
            modal.remove()
        })
    }
    const inputBusqueda = document.getElementById('input-busqueda')
    const btnBuscar = document.getElementById('btn-buscar')
    const listaResultados = document.getElementById('lista-resultados')
    btnBuscar.addEventListener('click', () => {
        const texto = inputBusqueda.value.toLowerCase().trim()
        const resultados = citas.filter(cita => cita.nombre_paciente.toLowerCase().includes(texto))
        renderizarResultados(resultados)
    })
    function renderizarResultados(resultados) {
        listaResultados.innerHTML = ''
        if(resultados.length === 0) {
            listaResultados.innerHTML = '<p>No se encontraron resultados</p>'
            return
        }
        resultados.forEach(cita => {
            const div = document.createElement('div')
            div.classList.add('resultado-item')
            div.innerHTML = `
                <strong>${cita.nombre_paciente}</strong><br>
                Fecha: ${cita.fecha}<br>
                Hora: ${cita.hora_inicio} - ${cita.hora_fin}
            `
            listaResultados.appendChild(div)
        });
    }
    function actualizarColorEvento(evento) {
        const estado = evento.extendedProps.estado
        evento.setProp('backgroundColor', obtenerColorPorEstado(estado))
    }
    function obtenerColorPorEstado(estado) {
        if (estado === 'asistio') return '#4CAF50'
        if (estado === 'no_asistio') return '#f44336'
        return '#3788d8'
    }
})