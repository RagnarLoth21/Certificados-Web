// Base de datos simulada de eventos y participantes
const database = {
    eventos: [
        {
            id: "evento1",
            nombre: "Día del Abogado - Certificado 01",
            pdf: "imagenes/certificados/dia-abogado-certificado01.pdf",
            tipo: "Certificado de Participación",
            participantes: [
                { dni: "71234567", nombre: "María García López" },
                { dni: "73456789", nombre: "Luis Fernández Ríos" },
                { dni: "75678901", nombre: "Ana Torres Vargas" }
            ]
        },
        {
            id: "evento2",
            nombre: "Día del Abogado - Certificado 02",
            pdf: "imagenes/certificados/dia-abogado-certificado02.pdf",
            tipo: "Certificado de Asistencia",
            participantes: [
                { dni: "72345678", nombre: "Carlos Mendoza Ruiz" },
                { dni: "74567890", nombre: "Sofía Ramírez Paz" },
                { dni: "76789012", nombre: "Jorge Villanueva Soto" }
            ]
        },
        {
            id: "evento3",
            nombre: "Día del Abogado - Certificado 03",
            pdf: "imagenes/certificados/dia-abogado-certificado03.pdf",
            tipo: "Certificado de Reconocimiento",
            participantes: [
                { dni: "73245678", nombre: "Daniela Castro Méndez" },
                { dni: "75467890", nombre: "Roberto Sánchez Díaz" },
                { dni: "77689012", nombre: "Lucía Peña Flores" }
            ]
        },
        {
            id: "evento4",
            nombre: "Día del Abogado - Reconocimiento Especial",
            pdf: "imagenes/certificados/dia-abogado-reconocimiento.pdf",
            tipo: "Reconocimiento Especial",
            participantes: [
                { dni: "74245678", nombre: "Pedro Gómez Herrera" },
                { dni: "76467890", nombre: "Carmen Vega Montes" },
                { dni: "78689012", nombre: "Fernando Díaz Castro" }
            ]
        }
    ],
    
    getEventoById: function(id) {
        return this.eventos.find(evento => evento.id === id);
    },
    
    buscarParticipante: function(eventoId, dni) {
        const evento = this.getEventoById(eventoId);
        if (!evento) return null;
        
        return evento.participantes.find(part => part.dni === dni);
    }
};

// Configurar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';