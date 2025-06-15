// Elementos del DOM
const elementos = {
    evento: document.getElementById('evento'),
    identificador: document.getElementById('identificador'),
    resultado: document.getElementById('resultado'),
    certificadoPreview: document.getElementById('certificadoPreview'),
    previewEvento: document.getElementById('previewEvento'),
    previewNombre: document.getElementById('previewNombre'),
    previewDNI: document.getElementById('previewDNI'),
    previewTipo: document.getElementById('previewTipo'),
    btnBuscar: document.getElementById('btnBuscar'),
    btnDescargar: document.getElementById('btnDescargar'),
    pdfPreview: document.getElementById('pdfPreview')
};

// Inicialización de la aplicación
function init() {
    cargarEventos();
    configurarEventListeners();
}

// Cargar los eventos en el select
function cargarEventos() {
    database.eventos.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento.id;
        option.textContent = evento.nombre;
        elementos.evento.appendChild(option);
    });
}

// Configurar event listeners
function configurarEventListeners() {
    elementos.btnBuscar.addEventListener('click', buscarCertificado);
    elementos.btnDescargar.addEventListener('click', descargarCertificado);
    
    // Autocompletar con ejemplo al seleccionar evento
    elementos.evento.addEventListener('change', function() {
        const eventoSeleccionado = database.getEventoById(this.value);
        if (eventoSeleccionado && eventoSeleccionado.participantes.length > 0) {
            elementos.identificador.placeholder = `Ej: ${eventoSeleccionado.participantes[0].dni}`;
        }
    });
}

// Función para buscar certificado
async function buscarCertificado() {
    const eventoId = elementos.evento.value;
    const dni = elementos.identificador.value.trim();
    
    // Validación básica
    if (!eventoId || !dni) {
        mostrarResultado('error', '❌ Por favor complete todos los campos');
        elementos.certificadoPreview.style.display = 'none';
        return;
    }
    
    if (dni.length !== 8 || isNaN(dni)) {
        mostrarResultado('error', '❌ El DNI debe tener 8 dígitos numéricos');
        return;
    }
    
    // Mostrar carga
    elementos.btnBuscar.innerHTML = '<span class="loading"></span> Buscando...';
    elementos.btnBuscar.disabled = true;
    
    // Simular búsqueda con delay
    setTimeout(async () => {
        const evento = database.getEventoById(eventoId);
        const participante = database.buscarParticipante(eventoId, dni);
        
        if (evento && participante) {
            await mostrarCertificado(evento, participante);
            mostrarResultado('exito', `✅ Certificado encontrado para ${participante.nombre}`);
        } else {
            mostrarResultado('error', '❌ No se encontró certificado para este DNI en el evento seleccionado');
            elementos.certificadoPreview.style.display = 'none';
        }
        
        // Restaurar botón
        elementos.btnBuscar.innerHTML = 'Buscar Certificado';
        elementos.btnBuscar.disabled = false;
    }, 800);
}

// Función para mostrar el certificado encontrado
async function mostrarCertificado(evento, participante) {
    // Configurar la información del certificado
    elementos.previewEvento.textContent = evento.nombre;
    elementos.previewNombre.textContent = participante.nombre;
    elementos.previewDNI.textContent = participante.dni;
    elementos.previewTipo.textContent = evento.tipo;
    
    // Cargar vista previa del PDF
    await cargarVistaPreviaPDF(evento.pdf);
    
    // Mostrar la vista previa
    elementos.certificadoPreview.style.display = 'block';
}

// Función para cargar vista previa del PDF - Versión mejorada
async function cargarVistaPreviaPDF(pdfUrl) {
    elementos.pdfPreview.innerHTML = '<div class="pdf-loading">Cargando vista previa del certificado...</div>';
    
    try {
        // Configurar PDF.js
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
        
        // Cargar el PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        // Obtener la primera página
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Preparar el canvas para renderizar
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Renderizar la página
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Mostrar el canvas en el contenedor
        elementos.pdfPreview.innerHTML = '';
        elementos.pdfPreview.appendChild(canvas);
        
        // Ajustar el tamaño del contenedor
        elementos.pdfPreview.style.height = 'auto';
        elementos.pdfPreview.style.maxHeight = '500px';
        elementos.pdfPreview.style.overflow = 'auto';
        
    } catch (error) {
        console.error('Error al cargar PDF:', error);
        elementos.pdfPreview.innerHTML = `
            <div class="pdf-error">
                <p>No se pudo cargar la vista previa del certificado.</p>
                <p>Puede <a href="${pdfUrl}" target="_blank">descargar el certificado</a> directamente.</p>
            </div>
        `;
    }
}

// Función para descargar certificado
function descargarCertificado() {
    const eventoId = elementos.evento.value;
    const dni = elementos.identificador.value.trim();
    
    if (!eventoId || !dni) {
        mostrarResultado('error', '❌ Por favor busque un certificado primero');
        return;
    }
    
    const evento = database.getEventoById(eventoId);
    const participante = database.buscarParticipante(eventoId, dni);
    
    if (!evento || !participante) {
        mostrarResultado('error', '❌ No se puede descargar, certificado no encontrado');
        return;
    }
    
    // Simular proceso de descarga
    elementos.btnDescargar.innerHTML = '<span class="loading"></span> Preparando descarga...';
    elementos.btnDescargar.disabled = true;
    
    setTimeout(() => {
        mostrarResultado('exito', '✅ Certificado listo para descargar');
        
        // Crear enlace de descarga
        const enlace = document.createElement('a');
        enlace.href = evento.pdf;
        enlace.download = `Certificado-${evento.nombre.substring(0, 15)}-${participante.dni}.pdf`;
        enlace.click();
        
        // Restaurar botón
        elementos.btnDescargar.innerHTML = '📄 Descargar Certificado';
        elementos.btnDescargar.disabled = false;
    }, 1500);
}

// Función para mostrar resultados/mensajes
function mostrarResultado(tipo, mensaje) {
    elementos.resultado.style.display = 'block';
    elementos.resultado.className = tipo;
    elementos.resultado.innerHTML = mensaje;
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar elementos del carrusel
    const carruselContainer = document.querySelector('.carrusel-container');
    const slides = document.querySelectorAll('.carrusel-slide');
    const dotsContainer = document.querySelector('.carrusel-dots');
    const prevBtn = document.querySelector('.carrusel-prev');
    const nextBtn = document.querySelector('.carrusel-next');
    
    let currentIndex = 0;
    
    // Crear puntos indicadores
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carrusel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Función para ir a un slide específico
    function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        document.querySelectorAll('.carrusel-dot')[currentIndex].classList.remove('active');
        
        currentIndex = (index + slides.length) % slides.length;
        
        slides[currentIndex].classList.add('active');
        document.querySelectorAll('.carrusel-dot')[currentIndex].classList.add('active');
    }
    
    // Event listeners para botones
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    
    // Cambio automático cada 5 segundos
    setInterval(() => goToSlide(currentIndex + 1), 5000);
    
    // Efecto hover para pausar el carrusel
    carruselContainer.addEventListener('mouseenter', () => {
        clearInterval(interval);
    });
    
    carruselContainer.addEventListener('mouseleave', () => {
        interval = setInterval(() => goToSlide(currentIndex + 1), 5000);
    });
});