// Parcial: Biblioteca Digital
// Asignatura: Programacion Web

// Variables globales para guardar los datos
let libros = [];
let prestamos = [];

// Funciones para manejar las fechas (Conferencia 5)
function obtenerFechaFutura(dias) {
    let fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
}

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

// Datos iniciales: 8 libros (2 de coleccion) y 4 prestamos (Conferencia 5)
const datosIniciales = {
    libros: [
        { id: 'L1', titulo: 'Cien años de soledad', autor: 'Gabriel Garcia Marquez', anio: 1967, genero: 'novela', coleccion: false, comentario: '' },
        { id: 'L2', titulo: 'El principito', autor: 'Antoine de Saint-Exupery', anio: 1943, genero: 'novela', coleccion: false, comentario: '' },
        { id: 'L3', titulo: 'Breves respuestas a las grandes preguntas', autor: 'Stephen Hawking', anio: 2018, genero: 'ciencia', coleccion: false, comentario: '' },
        { id: 'L4', titulo: 'Sapiens', autor: 'Yuval Noah Harari', anio: 2011, genero: 'historia', coleccion: false, comentario: '' },
        { id: 'L5', titulo: 'Veinte poemas de amor', autor: 'Pablo Neruda', anio: 1924, genero: 'poesia', coleccion: false, comentario: '' },
        { id: 'L6', titulo: '1984', autor: 'George Orwell', anio: 1949, genero: 'novela', coleccion: false, comentario: '' },
        { id: 'L7', titulo: 'Don Quijote', autor: 'Cervantes', anio: 1605, genero: 'novela', coleccion: true, comentario: '' },
        { id: 'L8', titulo: 'Historia de Cuba', autor: 'Varios', anio: 1980, genero: 'historia', coleccion: true, comentario: '' }
    ],
    prestamos: [
        { id: 'P1', idLibro: 'L1', persona: 'Ana', fechaPrestamo: obtenerFechaFutura(-5), fechaLimite: obtenerFechaFutura(9), fechaDevolucion: null },
        { id: 'P2', idLibro: 'L4', persona: 'Carlos', fechaPrestamo: obtenerFechaFutura(-20), fechaLimite: obtenerFechaFutura(-6), fechaDevolucion: null },
        { id: 'P3', idLibro: 'L2', persona: 'Luis', fechaPrestamo: obtenerFechaFutura(-10), fechaLimite: obtenerFechaFutura(4), fechaDevolucion: obtenerFechaFutura(-8) },
        { id: 'P4', idLibro: 'L3', persona: 'Marta', fechaPrestamo: obtenerFechaFutura(-30), fechaLimite: obtenerFechaFutura(-16), fechaDevolucion: obtenerFechaFutura(-10) }
    ]
};

// Persistencia con localStorage (Conferencia 7)
function guardarDatos() {
    localStorage.setItem('biblioteca_libros', JSON.stringify(libros));
    localStorage.setItem('biblioteca_prestamos', JSON.stringify(prestamos));
}

function cargarDatos() {
    let guardadosLibros = localStorage.getItem('biblioteca_libros');
    let guardadosPrestamos = localStorage.getItem('biblioteca_prestamos');

    if (guardadosLibros && guardadosPrestamos) {
        libros = JSON.parse(guardadosLibros);
        prestamos = JSON.parse(guardadosPrestamos);
    } else {
        libros = JSON.parse(JSON.stringify(datosIniciales.libros));
        prestamos = JSON.parse(JSON.stringify(datosIniciales.prestamos));
        guardarDatos();
    }
}

// Reglas de negocio (logica separada de la interfaz)
function obtenerPrestamoActivo(idLibro) {
    for (let i = 0; i < prestamos.length; i++) {
        if (prestamos[i].idLibro === idLibro && prestamos[i].fechaDevolucion === null) {
            return prestamos[i];
        }
    }
    return null;
}

function estaDisponible(libro) {
    if (libro.coleccion) return false;
    if (obtenerPrestamoActivo(libro.id) !== null) return false;
    return true;
}

function calcularRetraso(prestamo) {
    let hoy = new Date(obtenerFechaHoy());
    let limite = new Date(prestamo.fechaLimite);
    
    if (prestamo.fechaDevolucion !== null) {
        let devolucion = new Date(prestamo.fechaDevolucion);
        if (devolucion > limite) {
            let diferencia = devolucion - limite;
            return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        }
        return 0;
    }
    
    if (hoy > limite) {
        let diferencia = hoy - limite;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }
    return 0;
}

function contarPrestamosActivos() {
    let contador = 0;
    for (let i = 0; i < prestamos.length; i++) {
        if (prestamos[i].fechaDevolucion === null) contador++;
    }
    return contador;
}

// Elementos del DOM (Conferencia 6)
let contenedorTarjetas = document.getElementById('contenedor-tarjetas');
let contadorLibros = document.getElementById('contador-libros');
let mensajeCatalogo = document.getElementById('mensaje-catalogo');
let buscador = document.getElementById('buscador');
let filtroGenero = document.getElementById('filtro-genero');
let ordenarPor = document.getElementById('ordenar-por');
let btnOrden = document.getElementById('btn-orden');
let botonesFiltro = document.querySelectorAll('.filtro-estado');

let filtroEstadoActual = 'todos';
let ordenAscendente = true;
let textoBusqueda = '';
let generoSeleccionado = 'todos';

function cargarGeneros() {
    let generos = [];
    for (let i = 0; i < libros.length; i++) {
        if (!generos.includes(libros[i].genero)) {
            generos.push(libros[i].genero);
        }
    }
    
    filtroGenero.innerHTML = '<option value="todos">Todos los generos</option>';
    for (let i = 0; i < generos.length; i++) {
        let option = document.createElement('option');
        option.value = generos[i];
        option.textContent = generos[i].charAt(0).toUpperCase() + generos[i].slice(1);
        filtroGenero.appendChild(option);
    }
}

// Crear tarjetas dinamicamente (Conferencia 6)
function renderizarCatalogo() {
    // 1. Filtrar
    let filtrados = libros.filter(function(libro) {
        let coincideTexto = libro.titulo.toLowerCase().includes(textoBusqueda.toLowerCase()) || libro.autor.toLowerCase().includes(textoBusqueda.toLowerCase());
        let coincideGenero = (generoSeleccionado === 'todos' || libro.genero === generoSeleccionado);
        let disponible = estaDisponible(libro);
        let coincideEstado = true;
        if (filtroEstadoActual === 'disponibles') coincideEstado = disponible;
        if (filtroEstadoActual === 'prestados') coincideEstado = (!disponible && !libro.coleccion);
        return coincideTexto && coincideGenero && coincideEstado;
    });

    // 2. Ordenar
    filtrados.sort(function(a, b) {
        let valA = a[ordenarPor.value];
        let valB = b[ordenarPor.value];
        
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    // 3. Contador
    contadorLibros.textContent = 'Mostrando ' + filtrados.length + ' de ' + libros.length + ' libros';
    contenedorTarjetas.innerHTML = '';

    if (filtrados.length === 0) {
        contenedorTarjetas.innerHTML = '<p>No hay libros con esos filtros.</p>';
        return;
    }

    // 4. Crear tarjetas
    for (let i = 0; i < filtrados.length; i++) {
        let libro = filtrados[i];
        let prestamo = obtenerPrestamoActivo(libro.id);
        let disponible = estaDisponible(libro);
        
        let tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        if (!disponible && !libro.coleccion) tarjeta.classList.add('prestado');

        let contenido = document.createElement('div');
        contenido.className = 'tarjeta-contenido';

        let h3 = document.createElement('h3');
        h3.textContent = libro.titulo;
        contenido.appendChild(h3);

        let pAutor = document.createElement('p');
        pAutor.textContent = 'Autor: ' + libro.autor;
        contenido.appendChild(pAutor);

        let pAnio = document.createElement('p');
        pAnio.textContent = 'Año: ' + libro.anio + ' | Genero: ' + libro.genero;
        contenido.appendChild(pAnio);

        if (libro.coleccion) {
            let span = document.createElement('span');
            span.className = 'etiqueta coleccion';
            span.textContent = 'De coleccion';
            contenido.appendChild(span);
        } else if (prestamo) {
            let retraso = calcularRetraso(prestamo);
            
            let span = document.createElement('span');
            span.className = 'etiqueta';
            span.textContent = 'Prestado a ' + prestamo.persona;
            contenido.appendChild(span);
            
            let pFecha = document.createElement('p');
            pFecha.className = 'fecha-limite-tarjeta';
            pFecha.textContent = 'Devolver antes del: ' + prestamo.fechaLimite;
            contenido.appendChild(pFecha);

            if (retraso > 0) {
                let spanVencido = document.createElement('span');
                spanVencido.className = 'etiqueta vencido';
                spanVencido.textContent = 'Vencido (' + retraso + ' dias)';
                contenido.appendChild(spanVencido);
            }
        } else {
            let span = document.createElement('span');
            span.className = 'etiqueta';
            span.textContent = 'Disponible';
            contenido.appendChild(span);
        }
        
        tarjeta.appendChild(contenido);

        // Botones
        let botonesDiv = document.createElement('div');
        botonesDiv.className = 'tarjeta-botones';

        if (disponible) {
            let btn = document.createElement('button');
            btn.className = 'btn-prestar';
            btn.setAttribute('data-id', libro.id);
            btn.textContent = 'Prestar';
            botonesDiv.appendChild(btn);
        } else if (!libro.coleccion) {
            let btn = document.createElement('button');
            btn.className = 'btn-devolver';
            btn.setAttribute('data-id', libro.id);
            btn.textContent = 'Devolver';
            botonesDiv.appendChild(btn);
        } else {
            let btn = document.createElement('button');
            btn.disabled = true;
            btn.textContent = 'No prestable';
            botonesDiv.appendChild(btn);
        }

        let btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar';
        btnEditar.setAttribute('data-id', libro.id);
        btnEditar.textContent = 'Editar';
        botonesDiv.appendChild(btnEditar);

        let btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.setAttribute('data-id', libro.id);
        btnEliminar.textContent = 'Eliminar';
        botonesDiv.appendChild(btnEliminar);

        tarjeta.appendChild(botonesDiv);
        contenedorTarjetas.appendChild(tarjeta);
    }
}

// Modales (Restriccion del parcial: sin alert, prompt ni confirm)
let modalPrestar = document.getElementById('modal-prestar');
let modalEliminar = document.getElementById('modal-eliminar');
let modalRestablecer = document.getElementById('modal-restablecer');
let modalPrestarTitulo = document.getElementById('modal-prestar-titulo');
let modalPersona = document.getElementById('modal-persona');
let errorModalPrestar = document.getElementById('error-modal-prestar');
let modalEliminarTexto = document.getElementById('modal-eliminar-texto');

let idPrestar = null;
let idEliminar = null;

function abrirModalPrestar(id) {
    // Regla: maximo 3 prestamos activos
    if (contarPrestamosActivos() >= 3) {
        mensajeCatalogo.textContent = 'Error: No puedes tener mas de 3 prestamos activos.';
        return;
    }
    idPrestar = id;
    let libro = libros.find(function(l) { return l.id === id; });
    modalPrestarTitulo.textContent = 'Vas a prestar: "' + libro.titulo + '"';
    // Prellenar con el nombre guardado
    modalPersona.value = localStorage.getItem('biblioteca_usuario') || '';
    errorModalPrestar.textContent = '';
    mensajeCatalogo.textContent = '';
    modalPrestar.classList.add('activo');
    modalPersona.focus();
}

function confirmarPrestamo() {
    // Validacion: nombre de 2 a 40 caracteres
    let persona = modalPersona.value.trim();
    if (persona.length < 2 || persona.length > 40) {
        errorModalPrestar.textContent = 'El nombre debe tener entre 2 y 40 caracteres.';
        modalPersona.focus(); // El foco vuelve al campo con error
        return;
    }
    // Crear prestamo con fecha de hoy y limite de 14 dias
    let nuevoPrestamo = {
        id: 'P' + Date.now(),
        idLibro: idPrestar,
        persona: persona,
        fechaPrestamo: obtenerFechaHoy(),
        fechaLimite: obtenerFechaFutura(14),
        fechaDevolucion: null
    };
    prestamos.push(nuevoPrestamo);
    guardarDatos();
    modalPrestar.classList.remove('activo');
    renderizarCatalogo();
    actualizarContadorMenu();
}

function devolverLibro(id) {
    let prestamo = obtenerPrestamoActivo(id);
    if (!prestamo) return;

    // Se registra la fecha de devolucion (no se borra el prestamo)
    prestamo.fechaDevolucion = obtenerFechaHoy();
    let retraso = calcularRetraso(prestamo);
    
    if (retraso > 0) {
        mensajeCatalogo.textContent = 'Libro devuelto con ' + retraso + ' dias de retraso.';
    } else {
        mensajeCatalogo.textContent = 'Libro devuelto a tiempo.';
    }

    guardarDatos();
    renderizarCatalogo();
    actualizarContadorMenu();
    
    if (document.getElementById('vista-prestamos').classList.contains('activa')) {
        renderizarPrestamos();
    }
}

function abrirModalEliminar(id) {
    // Regla: no se puede eliminar un libro prestado
    if (obtenerPrestamoActivo(id)) {
        mensajeCatalogo.textContent = 'Error: No puedes eliminar un libro prestado.';
        return;
    }
    idEliminar = id;
    let libro = libros.find(function(l) { return l.id === id; });
    modalEliminarTexto.textContent = 'Eliminar "' + libro.titulo + '"? Se borrara su historial.';
    mensajeCatalogo.textContent = '';
    modalEliminar.classList.add('activo');
}

function confirmarEliminar() {
    // Al eliminar el libro, se borra tambien su historial
    libros = libros.filter(function(l) { return l.id !== idEliminar; });
    prestamos = prestamos.filter(function(p) { return p.idLibro !== idEliminar; });
    guardarDatos();
    modalEliminar.classList.remove('activo');
    renderizarCatalogo();
    actualizarContadorMenu();
    mensajeCatalogo.textContent = 'Libro eliminado.';
}

// Delegacion de eventos (Conferencia 7)
contenedorTarjetas.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-prestar')) {
        abrirModalPrestar(e.target.getAttribute('data-id'));
    } else if (e.target.classList.contains('btn-devolver')) {
        devolverLibro(e.target.getAttribute('data-id'));
    } else if (e.target.classList.contains('btn-editar')) {
        let id = e.target.getAttribute('data-id');
        let libro = libros.find(function(l) { return l.id === id; });
        
        document.getElementById('libro-titulo').value = libro.titulo;
        document.getElementById('libro-autor').value = libro.autor;
        document.getElementById('libro-anio').value = libro.anio;
        document.getElementById('libro-genero').value = libro.genero;
        document.getElementById('libro-comentario').value = libro.comentario || '';
        document.getElementById('libro-coleccion').checked = libro.coleccion;
        
        modoEdicion = true;
        idEditando = libro.id;
        document.getElementById('titulo-formulario').textContent = 'Editar Libro';
        document.getElementById('btn-guardar-libro').textContent = 'Guardar cambios';
        document.getElementById('btn-cancelar-edicion').classList.remove('oculto');
        
        let vistas = document.querySelectorAll('.vista');
        for (let i = 0; i < vistas.length; i++) vistas[i].classList.remove('activa');
        document.getElementById('vista-agregar').classList.add('activa');
        
        let enlaces = document.querySelectorAll('nav a');
        for (let i = 0; i < enlaces.length; i++) enlaces[i].classList.remove('activo');
        document.querySelector('nav a[data-vista="agregar"]').classList.add('activo');
    } else if (e.target.classList.contains('btn-eliminar')) {
        abrirModalEliminar(e.target.getAttribute('data-id'));
    }
});

// EVENTOS DE LOS BOTONES DE LOS MODALES
document.getElementById('btn-cancelar-prestar').addEventListener('click', function() {
    modalPrestar.classList.remove('activo');
});
document.getElementById('btn-confirmar-prestar').addEventListener('click', confirmarPrestamo);

document.getElementById('btn-cancelar-eliminar').addEventListener('click', function() {
    modalEliminar.classList.remove('activo');
});
document.getElementById('btn-confirmar-eliminar').addEventListener('click', confirmarEliminar);

document.getElementById('btn-cancelar-restablecer').addEventListener('click', function() {
    modalRestablecer.classList.remove('activo');
});
document.getElementById('btn-confirmar-restablecer').addEventListener('click', function() {
    localStorage.clear();
    window.location.reload();
});

// Eventos de filtros y orden
buscador.addEventListener('input', function(e) {
    textoBusqueda = e.target.value;
    renderizarCatalogo();
});

filtroGenero.addEventListener('change', function(e) {
    generoSeleccionado = e.target.value;
    renderizarCatalogo();
});

for (let i = 0; i < botonesFiltro.length; i++) {
    botonesFiltro[i].addEventListener('click', function(e) {
        for (let j = 0; j < botonesFiltro.length; j++) {
            botonesFiltro[j].classList.remove('activo');
        }
        e.target.classList.add('activo');
        filtroEstadoActual = e.target.getAttribute('data-filtro');
        renderizarCatalogo();
    });
}

// Guardar el orden elegido para que se conserve al recargar (Conferencia 7)
ordenarPor.addEventListener('change', function() {
    localStorage.setItem('biblioteca_orden', ordenarPor.value);
    renderizarCatalogo();
});

btnOrden.addEventListener('click', function() {
    ordenAscendente = !ordenAscendente;
    btnOrden.textContent = ordenAscendente ? 'Ascendente' : 'Descendente';
    localStorage.setItem('biblioteca_direccion', ordenAscendente ? 'asc' : 'desc');
    renderizarCatalogo();
});

// Vista 2: Mis prestamos
function renderizarPrestamos() {
    let listaActivos = document.getElementById('lista-prestamos-activos');
    let listaHistorial = document.getElementById('lista-historial');
    
    listaActivos.innerHTML = '';
    // Ordenar activos por fecha limite (la mas proxima primero)
    let activos = prestamos.filter(function(p) { return p.fechaDevolucion === null; });
    activos.sort(function(a, b) { return new Date(a.fechaLimite) - new Date(b.fechaLimite); });

    if (activos.length === 0) {
        listaActivos.innerHTML = '<p>No tienes prestamos activos.</p>';
    } else {
        for (let i = 0; i < activos.length; i++) {
            let p = activos[i];
            let libro = libros.find(function(l) { return l.id === p.idLibro; });
            if (!libro) continue;
            let retraso = calcularRetraso(p);
            
            let div = document.createElement('div');
            div.className = 'item-lista ' + (retraso > 0 ? 'vencido' : '');
            
            let infoDiv = document.createElement('div');
            infoDiv.className = 'item-lista-info';

            let h3 = document.createElement('h3');
            h3.textContent = libro.titulo;
            infoDiv.appendChild(h3);

            let pPersona = document.createElement('p');
            pPersona.textContent = 'Prestado a: ' + p.persona;
            infoDiv.appendChild(pPersona);

            let pLimite = document.createElement('p');
            pLimite.textContent = 'Limite: ' + p.fechaLimite;
            if (retraso > 0) {
                let spanVencido = document.createElement('span');
                spanVencido.className = 'etiqueta vencido';
                spanVencido.textContent = 'Vencido (' + retraso + ' dias)';
                pLimite.appendChild(spanVencido);
            }
            infoDiv.appendChild(pLimite);

            let btnDevolver = document.createElement('button');
            btnDevolver.className = 'boton btn-devolver-lista';
            btnDevolver.setAttribute('data-id', p.idLibro);
            btnDevolver.textContent = 'Devolver';

            div.appendChild(infoDiv);
            div.appendChild(btnDevolver);
            listaActivos.appendChild(div);
        }
    }

    listaHistorial.innerHTML = '';
    // Historial del mas reciente al mas antiguo
    let devueltos = prestamos.filter(function(p) { return p.fechaDevolucion !== null; });
    devueltos.sort(function(a, b) { return new Date(b.fechaDevolucion) - new Date(a.fechaDevolucion); });

    if (devueltos.length === 0) {
        listaHistorial.innerHTML = '<p>No hay historial.</p>';
    } else {
        for (let i = 0; i < devueltos.length; i++) {
            let p = devueltos[i];
            let libro = libros.find(function(l) { return l.id === p.idLibro; });
            if (!libro) continue;
            let retraso = calcularRetraso(p);
            let estado = retraso > 0 ? 'Con retraso (' + retraso + ' dias)' : 'A tiempo';
            
            let div = document.createElement('div');
            div.className = 'item-lista';
            
            let infoDiv = document.createElement('div');
            infoDiv.className = 'item-lista-info';

            let h3 = document.createElement('h3');
            h3.textContent = libro.titulo;
            infoDiv.appendChild(h3);

            let pPersona = document.createElement('p');
            pPersona.textContent = 'Persona: ' + p.persona;
            infoDiv.appendChild(pPersona);

            let pFechas = document.createElement('p');
            pFechas.textContent = 'Prestado: ' + p.fechaPrestamo + ' | Devuelto: ' + p.fechaDevolucion;
            infoDiv.appendChild(pFechas);

            let pEstado = document.createElement('p');
            pEstado.textContent = 'Estado: ' + estado;
            infoDiv.appendChild(pEstado);

            div.appendChild(infoDiv);
            listaHistorial.appendChild(div);
        }
    }
}

document.getElementById('lista-prestamos-activos').addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-devolver-lista')) {
        devolverLibro(e.target.getAttribute('data-id'));
    }
});

// Vista 3: Formulario agregar/editar
let modoEdicion = false;
let idEditando = null;
let formLibro = document.getElementById('form-libro');

document.getElementById('libro-comentario').addEventListener('input', function() {
    let restantes = 120 - this.value.length;
    document.getElementById('contador-comentario').textContent = restantes + ' caracteres restantes';
});

document.getElementById('btn-cancelar-edicion').addEventListener('click', function() {
    formLibro.reset();
    document.getElementById('contador-comentario').textContent = '120 caracteres restantes';
    
    let errores = document.querySelectorAll('.error-campo');
    for (let i = 0; i < errores.length; i++) errores[i].textContent = '';
    
    document.getElementById('mensaje-formulario').textContent = '';
    modoEdicion = false;
    idEditando = null;
    document.getElementById('titulo-formulario').textContent = 'Agregar Libro';
    document.getElementById('btn-guardar-libro').textContent = 'Guardar Libro';
    this.classList.add('oculto');
});

formLibro.addEventListener('submit', function(e) {
    // Evitar que la pagina se recargue al enviar
    e.preventDefault();
    
    let erroresCampos = document.querySelectorAll('.error-campo');
    for (let i = 0; i < erroresCampos.length; i++) erroresCampos[i].textContent = '';
    
    document.getElementById('mensaje-formulario').textContent = '';

    let titulo = document.getElementById('libro-titulo').value.trim();
    let autor = document.getElementById('libro-autor').value.trim();
    let anio = parseInt(document.getElementById('libro-anio').value);
    let genero = document.getElementById('libro-genero').value;
    let comentario = document.getElementById('libro-comentario').value.trim();
    let coleccion = document.getElementById('libro-coleccion').checked;

    let errores = false;

    // Validaciones con mensajes debajo de cada campo
    if (titulo.length < 3 || titulo.length > 60) {
        document.getElementById('error-titulo').textContent = 'Entre 3 y 60 caracteres.';
        errores = true;
    }

    // No se admiten libros duplicados
    let duplicado = libros.find(function(l) {
        return l.titulo.toLowerCase() === titulo.toLowerCase() && l.autor.toLowerCase() === autor.toLowerCase() && l.id !== idEditando;
    });
    
    if (duplicado) {
        document.getElementById('error-titulo').textContent = 'Libro duplicado.';
        errores = true;
    }

    if (autor === '') {
        document.getElementById('error-autor').textContent = 'Obligatorio.';
        errores = true;
    }

    if (isNaN(anio) || anio < 1000 || anio > 2026) {
        document.getElementById('error-anio').textContent = 'Entre 1000 y 2026.';
        errores = true;
    }

// Si hay errores, el foco va al primer campo con error
    if (errores) {
        let primerError = document.querySelector('.error-campo:not(:empty)');
        if (primerError) {
            let inputId = primerError.id.replace('error-', 'libro-');
            document.getElementById(inputId).focus();
        }
        return;
    }

    if (modoEdicion) {
        let libro = libros.find(function(l) { return l.id === idEditando; });
        libro.titulo = titulo;
        libro.autor = autor;
        libro.anio = anio;
        libro.genero = genero;
        libro.comentario = comentario;
        libro.coleccion = coleccion;
        document.getElementById('mensaje-formulario').textContent = 'Libro actualizado.';
    } else {
        let nuevo = {
            id: 'L' + Date.now(),
            titulo: titulo,
            autor: autor,
            anio: anio,
            genero: genero,
            comentario: comentario,
            coleccion: coleccion
        };
        libros.push(nuevo);
        document.getElementById('mensaje-formulario').textContent = 'Libro agregado.';
    }

    guardarDatos();
    formLibro.reset();
    document.getElementById('contador-comentario').textContent = '120 caracteres restantes';
    modoEdicion = false;
    idEditando = null;
    document.getElementById('titulo-formulario').textContent = 'Agregar Libro';
    document.getElementById('btn-guardar-libro').textContent = 'Guardar Libro';
    document.getElementById('btn-cancelar-edicion').classList.add('oculto');
    renderizarCatalogo();
});

// Vista 4: Resumen y ajustes
function renderizarResumen() {
    let total = libros.length;
    let disponibles = libros.filter(function(l) { return estaDisponible(l); }).length;
    let prestados = libros.filter(function(l) { return obtenerPrestamoActivo(l.id) !== null; }).length;
    let vencidos = prestamos.filter(function(p) { return p.fechaDevolucion === null && calcularRetraso(p) > 0; }).length;

    let porGenero = {};
    for (let i = 0; i < libros.length; i++) {
        let gen = libros[i].genero;
        if (porGenero[gen]) {
            porGenero[gen]++;
        } else {
            porGenero[gen] = 1;
        }
    }

    let htmlGeneros = '';
    for (let genero in porGenero) {
        htmlGeneros += '<div class="caja"><h3>' + genero + '</h3><p>' + porGenero[genero] + '</p></div>';
    }

    document.getElementById('resumen-datos').innerHTML = `
        <div class="caja"><h3>Total Libros</h3><p>${total}</p></div>
        <div class="caja"><h3>Disponibles</h3><p>${disponibles}</p></div>
        <div class="caja"><h3>Prestados</h3><p>${prestados}</p></div>
        <div class="caja"><h3>Vencidos</h3><p>${vencidos}</p></div>
        ${htmlGeneros}
    `;
}

// Navegacion SPA (sin recargar la pagina)
let enlacesNav = document.querySelectorAll('nav a');
for (let i = 0; i < enlacesNav.length; i++) {
    enlacesNav[i].addEventListener('click', function(e) {
        e.preventDefault();
        
        for (let j = 0; j < enlacesNav.length; j++) {
            enlacesNav[j].classList.remove('activo');
        }
        e.target.classList.add('activo');
        
        let vistas = document.querySelectorAll('.vista');
        for (let k = 0; k < vistas.length; k++) {
            vistas[k].classList.remove('activa');
        }
        
        let vistaId = 'vista-' + e.target.getAttribute('data-vista');
        document.getElementById(vistaId).classList.add('activa');

        if (e.target.getAttribute('data-vista') === 'prestamos') renderizarPrestamos();
        if (e.target.getAttribute('data-vista') === 'resumen') renderizarResumen();
    });
}

// Inicializacion y actualizacion del contador
function actualizarContadorMenu() {
    document.getElementById('contador-prestamos').textContent = '(' + contarPrestamosActivos() + ')';
    
    let nombre = localStorage.getItem('biblioteca_usuario');
    let saludoSpan = document.getElementById('saludo-usuario');
    if (nombre && saludoSpan) {
        saludoSpan.textContent = '| Hola, ' + nombre;
    } else if (saludoSpan) {
        saludoSpan.textContent = '';
    }
}

document.getElementById('nombre-usuario').addEventListener('input', function() {
    localStorage.setItem('biblioteca_usuario', this.value.trim());
    actualizarContadorMenu();
});

document.getElementById('btn-restablecer').addEventListener('click', function() {
    modalRestablecer.classList.add('activo');
});

document.getElementById('btn-tema').addEventListener('click', function() {
    document.body.classList.toggle('tema-oscuro');
    
    // Si el body tiene la clase 'tema-oscuro', guardamos 'oscuro'. Si no, guardamos 'claro'.
    let tema = document.body.classList.contains('tema-oscuro') ? 'oscuro' : 'claro';
    localStorage.setItem('biblioteca_tema', tema);
});

// Evento que se ejecuta al cargar la pagina
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    cargarGeneros();
    renderizarCatalogo();
    actualizarContadorMenu();
    
    document.getElementById('nombre-usuario').value = localStorage.getItem('biblioteca_usuario') || '';
    
    // Recuperar el tema guardado
let temaGuardado = localStorage.getItem('biblioteca_tema');
if (temaGuardado === 'oscuro') {
    document.body.classList.add('tema-oscuro');
}
    
    // Recuperar el orden y la direccion guardados
    let ordenGuardado = localStorage.getItem('biblioteca_orden');
    if (ordenGuardado) ordenarPor.value = ordenGuardado;
    
    let dirGuardada = localStorage.getItem('biblioteca_direccion');
    if (dirGuardada === 'desc') {
        ordenAscendente = false;
        btnOrden.textContent = 'Descendente';
    }
});

// Cerrar modales y limpiar formulario con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (modalPrestar.classList.contains('activo')) modalPrestar.classList.remove('activo');
        if (modalEliminar.classList.contains('activo')) modalEliminar.classList.remove('activo');
        if (modalRestablecer.classList.contains('activo')) modalRestablecer.classList.remove('activo');
        
        if (document.getElementById('vista-agregar').classList.contains('activa')) {
            document.getElementById('btn-cancelar-edicion').click();
        }
    }
});