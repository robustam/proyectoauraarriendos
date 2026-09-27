/* AuraArriendos — datos de marca y semillas de datos.
   Este archivo expone únicamente window.__AURA__. No modificar en runtime:
   store.js clona estos arreglos hacia localStorage en el primer arranque. */
(function () {
  "use strict";

  var REGIONES = [
    { region: "Región de Arica y Parinacota", comunas: ["Arica", "Camarones", "Putre", "General Lagos"] },
    { region: "Región de Tarapacá", comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"] },
    { region: "Región de Antofagasta", comunas: ["Antofagasta", "Calama", "Tocopilla", "Mejillones", "San Pedro de Atacama"] },
    { region: "Región de Atacama", comunas: ["Copiapó", "Vallenar", "Caldera", "Chañaral"] },
    { region: "Región de Coquimbo", comunas: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña"] },
    { region: "Región de Valparaíso", comunas: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "San Antonio", "Los Andes", "Quillota", "La Ligua"] },
    { region: "Región Metropolitana de Santiago", comunas: ["Santiago", "Providencia", "Las Condes", "Ñuñoa", "La Reina", "Vitacura", "Maipú", "La Florida", "Puente Alto", "San Miguel", "Independencia", "Recoleta", "Macul", "Peñalolén", "San Bernardo", "Estación Central", "Quilicura", "Colina"] },
    { region: "Región del Libertador Bernardo O'Higgins", comunas: ["Rancagua", "Machalí", "San Fernando", "Rengo", "Pichilemu"] },
    { region: "Región del Maule", comunas: ["Talca", "Curicó", "Linares", "Constitución", "Longaví"] },
    { region: "Región de Ñuble", comunas: ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes"] },
    { region: "Región del Biobío", comunas: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante", "Los Ángeles", "Coronel"] },
    { region: "Región de la Araucanía", comunas: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol"] },
    { region: "Región de los Ríos", comunas: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"] },
    { region: "Región de los Lagos", comunas: ["Puerto Montt", "Puerto Varas", "Osorno", "Castro", "Ancud"] },
    { region: "Región de Aysén", comunas: ["Coyhaique", "Puerto Aysén", "Chile Chico"] },
    { region: "Región de Magallanes y la Antártica Chilena", comunas: ["Punta Arenas", "Puerto Natales", "Porvenir"] }
  ];

  var CATEGORIAS = ["Casa", "Departamento", "Oficina", "Parcela"];

  var CORREOS_VALIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

  var PROPIEDADES = [
    { id: "PR-1001", codigo: "PR-1001", nombre: "Departamento luminoso en Providencia", categoria: "Departamento", region: "Región Metropolitana de Santiago", comuna: "Providencia", direccion: "Av. Pedro de Valdivia 1204", precio: 650000, dormitorios: 2, banos: 1, m2: 55, estacionamiento: true, unidadesDisponibles: 3, alertaDisponibilidad: 1, imagen: "../img/prop-1.jpg", descripcion: "Departamento con excelente iluminación natural, a pasos del metro y del Parque Bustamante. Cocina americana, living amplio y balcón orientado al norte.", estado: "publicada", destacada: true },
    { id: "PR-1002", codigo: "PR-1002", nombre: "Casa con jardín en Ñuñoa", categoria: "Casa", region: "Región Metropolitana de Santiago", comuna: "Ñuñoa", direccion: "Calle Suecia 845", precio: 980000, dormitorios: 3, banos: 2, m2: 120, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-2.jpg", descripcion: "Casa de un piso con jardín trasero, quincho y bodega. Barrio residencial tranquilo, cerca de colegios y áreas verdes.", estado: "publicada", destacada: true },
    { id: "PR-1003", codigo: "PR-1003", nombre: "Departamento con vista a la ciudad en Las Condes", categoria: "Departamento", region: "Región Metropolitana de Santiago", comuna: "Las Condes", direccion: "Av. Apoquindo 4501", precio: 1250000, dormitorios: 3, banos: 2, m2: 90, estacionamiento: true, unidadesDisponibles: 2, alertaDisponibilidad: 1, imagen: "../img/prop-3.jpg", descripcion: "Torre con piscina, gimnasio y conserjería 24/7. Vista despejada hacia la cordillera, a minutos del metro Manquehue.", estado: "publicada", destacada: true },
    { id: "PR-1004", codigo: "PR-1004", nombre: "Casa remodelada en Viña del Mar", categoria: "Casa", region: "Región de Valparaíso", comuna: "Viña del Mar", direccion: "Calle Álvarez 220", precio: 850000, dormitorios: 3, banos: 2, m2: 110, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-4.jpg", descripcion: "Cocina completamente remodelada, terminaciones nuevas y a 10 minutos caminando de la playa.", estado: "publicada", destacada: false },
    { id: "PR-1005", codigo: "PR-1005", nombre: "Studio acogedor en Concepción", categoria: "Departamento", region: "Región del Biobío", comuna: "Concepción", direccion: "Barros Arana 733", precio: 420000, dormitorios: 1, banos: 1, m2: 35, estacionamiento: false, unidadesDisponibles: 4, alertaDisponibilidad: 2, imagen: "../img/prop-5.jpg", descripcion: "Ideal para estudiantes o profesionales solos. Edificio con lavandería y sala de estudio compartida.", estado: "publicada", destacada: false },
    { id: "PR-1006", codigo: "PR-1006", nombre: "Casa con terraza en Colina", categoria: "Casa", region: "Región Metropolitana de Santiago", comuna: "Colina", direccion: "Camino Chicureo 3400", precio: 1100000, dormitorios: 4, banos: 3, m2: 160, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-6.jpg", descripcion: "Condominio con áreas verdes y seguridad privada. Terraza amplia ideal para reuniones familiares.", estado: "publicada", destacada: true },
    { id: "PR-1007", codigo: "PR-1007", nombre: "Loft estilo industrial en Providencia", categoria: "Departamento", region: "Región Metropolitana de Santiago", comuna: "Providencia", direccion: "Barrio Italia, Condell 1560", precio: 720000, dormitorios: 1, banos: 1, m2: 60, estacionamiento: false, unidadesDisponibles: 2, alertaDisponibilidad: 1, imagen: "../img/prop-7.jpg", descripcion: "Techos altos, ladrillo a la vista y ventanales industriales. En pleno Barrio Italia, rodeado de cafés y talleres.", estado: "publicada", destacada: false },
    { id: "PR-1008", codigo: "PR-1008", nombre: "Penthouse con balcón en Viña del Mar", categoria: "Departamento", region: "Región de Valparaíso", comuna: "Viña del Mar", direccion: "Av. Perú 4890", precio: 1800000, dormitorios: 3, banos: 3, m2: 140, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-8.jpg", descripcion: "Último piso con balcón panorámico frente al mar. Terminaciones de lujo y dos estacionamientos.", estado: "publicada", destacada: true },
    { id: "PR-1009", codigo: "PR-1009", nombre: "Departamento minimalista en Temuco", categoria: "Departamento", region: "Región de la Araucanía", comuna: "Temuco", direccion: "Av. Alemania 550", precio: 380000, dormitorios: 2, banos: 1, m2: 48, estacionamiento: false, unidadesDisponibles: 3, alertaDisponibilidad: 1, imagen: "../img/prop-9.jpg", descripcion: "Diseño minimalista, luz natural en todas las habitaciones y cercano a la Universidad de la Frontera.", estado: "publicada", destacada: false },
    { id: "PR-1010", codigo: "PR-1010", nombre: "Casa familiar en Puente Alto", categoria: "Casa", region: "Región Metropolitana de Santiago", comuna: "Puente Alto", direccion: "Los Álamos 2205", precio: 560000, dormitorios: 3, banos: 1, m2: 85, estacionamiento: true, unidadesDisponibles: 2, alertaDisponibilidad: 1, imagen: "../img/prop-10.jpg", descripcion: "Casa de dos pisos en condominio cerrado con áreas comunes y juegos infantiles.", estado: "publicada", destacada: false },
    { id: "PR-1011", codigo: "PR-1011", nombre: "Oficina moderna en Las Condes", categoria: "Oficina", region: "Región Metropolitana de Santiago", comuna: "Las Condes", direccion: "Av. Isidora Goyenechea 3000", precio: 1400000, dormitorios: 0, banos: 2, m2: 95, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-11.jpg", descripcion: "Oficina de planta libre en torre corporativa, con salas de reunión equipadas y recepción compartida.", estado: "publicada", destacada: false },
    { id: "PR-1012", codigo: "PR-1012", nombre: "Parcela con cabaña en Pucón", categoria: "Parcela", region: "Región de la Araucanía", comuna: "Pucón", direccion: "Camino a Caburgua Km 8", precio: 900000, dormitorios: 2, banos: 1, m2: 5000, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-12.jpg", descripcion: "Cabaña de madera rodeada de bosque nativo, con vista al volcán Villarrica. Ideal para arriendo de temporada o teletrabajo.", estado: "publicada", destacada: true },
    { id: "PR-2001", codigo: "PR-2001", nombre: "Departamento cerca del metro (en revisión)", categoria: "Departamento", region: "Región Metropolitana de Santiago", comuna: "San Miguel", direccion: "Gran Avenida 4820", precio: 480000, dormitorios: 2, banos: 1, m2: 50, estacionamiento: false, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-7.jpg", descripcion: "Publicación enviada por un arrendador y pendiente de revisión por el equipo de AuraArriendos.", estado: "pendiente", destacada: false, publicadoPor: "vendedor@gmail.com" },
    { id: "PR-2002", codigo: "PR-2002", nombre: "Cabaña junto al lago (rechazada)", categoria: "Parcela", region: "Región de los Lagos", comuna: "Puerto Varas", direccion: "Ruta 225, sector lago", precio: 700000, dormitorios: 2, banos: 1, m2: 3000, estacionamiento: true, unidadesDisponibles: 1, alertaDisponibilidad: 1, imagen: "../img/prop-9.jpg", descripcion: "Publicación rechazada: las fotografías no cumplían con el estándar mínimo de calidad de AuraArriendos.", estado: "rechazada", destacada: false, publicadoPor: "vendedor@gmail.com", motivoRechazo: "Fotografías insuficientes o de baja calidad." }
  ];

  var USUARIOS = [
    { run: "111111111", nombre: "Administradora", apellidos: "AuraArriendos", correo: "admin@duoc.cl", clave: "admin123", fechaNacimiento: "1990-01-01", tipoUsuario: "Administrador", region: "Región Metropolitana de Santiago", comuna: "Santiago", direccion: "Av. Apoquindo 3000, oficina 501" },
    { run: "222222222", nombre: "Javiera", apellidos: "Rodríguez Soto", correo: "vendedor@gmail.com", clave: "vende123", fechaNacimiento: "1988-05-14", tipoUsuario: "Vendedor", region: "Región Metropolitana de Santiago", comuna: "Ñuñoa", direccion: "Calle Irarrázaval 3120" },
    { run: "333333333", nombre: "Matías", apellidos: "Fernández Lira", correo: "cliente@gmail.com", clave: "cliente123", fechaNacimiento: "1996-09-22", tipoUsuario: "Cliente", region: "Región Metropolitana de Santiago", comuna: "La Florida", direccion: "Av. Vicuña Mackenna 8900" }
  ];

  var TESTIMONIOS = [
    { nombre: "Constanza Muñoz", comuna: "Providencia, RM", texto: "Encontré mi departamento en menos de una semana. El filtro por comuna y precio me ahorró horas de búsqueda.", rating: 5 },
    { nombre: "Ignacio Torres", comuna: "Concepción, Biobío", texto: "El proceso de contacto con el arrendador fue directo y transparente. Sin letra chica ni sorpresas.", rating: 5 },
    { nombre: "Familia Vargas Peña", comuna: "Puente Alto, RM", texto: "Arrendamos la casa para toda la familia. Nos encantó poder guardar varias opciones antes de decidir.", rating: 4 },
    { nombre: "Sofía Contreras", comuna: "Viña del Mar, Valparaíso", texto: "La galería de fotos y los detalles de cada propiedad son muy completos, se nota la seriedad del equipo.", rating: 5 },
    { nombre: "Rodrigo Salinas", comuna: "Temuco, Araucanía", texto: "Publiqué mi departamento como arrendador y el equipo lo revisó y aprobó en menos de 48 horas.", rating: 5 },
    { nombre: "Camila Espinoza", comuna: "Pucón, Araucanía", texto: "Arrendamos la parcela para trabajar remoto un mes. Todo calzó exactamente con la publicación.", rating: 4 }
  ];

  var BLOG = [
    {
      id: "elegir-arriendo",
      titulo: "5 consejos para elegir tu próximo arriendo sin sorpresas",
      resumen: "Antes de firmar un contrato, revisa estos puntos clave que muchas veces se pasan por alto.",
      imagen: "../img/blog-1.jpg",
      fecha: "2026-03-04",
      autor: "Equipo AuraArriendos",
      contenido: [
        "Arrendar una vivienda es una decisión importante y, muchas veces, se toma bajo presión de tiempo. Antes de comprometerte, dedica al menos una visita presencial o una videollamada guiada por el arrendador para verificar el estado real de la propiedad.",
        "Revisa la conectividad del sector: transporte público, comercio cercano y tiempos de traslado a tu trabajo o estudio. Un arriendo económico puede terminar siendo más caro si sumas los costos de movilización.",
        "Lee el contrato completo, especialmente las cláusulas sobre reajuste de precio, duración mínima y condiciones de término anticipado. En AuraArriendos, cada publicación aprobada incluye esta información de forma clara.",
        "Pregunta por los gastos comunes y si están incluidos en el precio de arriendo. Es uno de los puntos que más confusión genera al momento de presupuestar.",
        "Finalmente, guarda todas las comunicaciones con el arrendador. Nuestra función de 'Mis solicitudes' te permite mantener un registro ordenado de las propiedades que te interesan y su información de contacto."
      ]
    },
    {
      id: "mudanza-sin-estres",
      titulo: "Cómo mudarte sin estrés: checklist completo",
      resumen: "Una mudanza ordenada empieza semanas antes. Aquí tienes una guía paso a paso.",
      imagen: "../img/blog-2.jpg",
      fecha: "2026-02-18",
      autor: "Equipo AuraArriendos",
      contenido: [
        "Cuatro semanas antes de mudarte, empieza a clasificar tus pertenencias en tres categorías: lo que te llevas, lo que donas y lo que descartas. Esto reduce significativamente el volumen de la mudanza.",
        "Dos semanas antes, cotiza y reserva el servicio de traslado. Si tu nuevo arriendo tiene restricciones de horario para camiones de mudanza (común en edificios), confírmalas con la administración.",
        "Una semana antes, notifica el cambio de dirección a servicios básicos, bancos y suscripciones. Aprovecha de tomar fotos del estado de tu arriendo anterior para el finiquito del contrato.",
        "El día de la mudanza, ten a mano una 'caja esencial' con artículos de aseo, cargadores, documentos y una muda de ropa, para no tener que abrir todas las cajas la primera noche.",
        "Ya instalado, revisa el estado de la nueva propiedad contra lo publicado y comunica cualquier observación a tu arrendador dentro de los primeros días, tal como se indica en cada ficha de propiedad de AuraArriendos."
      ]
    }
  ];

  window.__AURA__ = {
    brand: {
      name: "AuraArriendos",
      tagline: "Arriendos con confianza, hogares con propósito.",
      email: "contacto@auraarriendos.cl",
      phone: "+56 9 5555 1234",
      address: "Av. Apoquindo 3000, of. 501, Las Condes, Santiago"
    },
    regiones: REGIONES,
    categorias: CATEGORIAS,
    correosValidos: CORREOS_VALIDOS,
    propiedades: PROPIEDADES,
    usuarios: USUARIOS,
    testimonios: TESTIMONIOS,
    blog: BLOG
  };
})();
