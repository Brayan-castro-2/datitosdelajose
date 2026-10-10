// 10 Rutas Recomendadas y Verificadas por la Jose
// Mapeadas con los 82 registros oficiales curados por Santiago

const CURATED_ROUTES = [
  {
    "id": "RUTA-01",
    "title": "Ruta Ensenada Aventura & Volcanes (1 Día)",
    "duration": "Día Completo (8 hrs)",
    "zone": "Ensenada / Parque Vicente Pérez Rosales",
    "poiIds": [
      "POI-068",
      "POI-067",
      "POI-069",
      "POI-078"
    ],
    "itinerary": "1. Saltos del Petrohué temprano. 2. Caminata por Laguna Verde. 3. Subir en telesilla al Volcán Osorno. 4. Tarde en playa Ensenada.",
    "linkReel": "https://www.instagram.com/reel/DbWZ18DP2kn/",
    "tip": "Hacer en auto. Salir a las 9:00 AM para aprovechar el despeje del volcán."
  },
  {
    "id": "RUTA-02",
    "title": "Ruta Puerto Varas Día de Lluvia (Café, Arte & Sabor)",
    "duration": "Tarde-Noche (6 hrs)",
    "zone": "Puerto Varas Urbano / Barrio Estación",
    "poiIds": [
      "POI-061",
      "POI-027",
      "POI-032",
      "POI-063",
      "POI-024"
    ],
    "itinerary": "1. Café Ulmo & mesones Lego. 2. Almuerzo en La Grey Cowork. 3. Hamburguesas en Bargual. 4. Once en Pastelería Miel Canela. 5. Schops en Fuente Schulz.",
    "linkReel": "https://www.instagram.com/reel/DalyhcfAlE9/",
    "tip": "Refugios con chimenea y buena pastelería para disfrutar la lluvia sureña."
  },
  {
    "id": "RUTA-03",
    "title": "Ruta Frutillar & Llanquihue Borde Lago",
    "duration": "Medio Día (5 hrs)",
    "zone": "Frutillar y Llanquihue",
    "poiIds": [
      "POI-079",
      "POI-071",
      "POI-076",
      "POI-028",
      "POI-029"
    ],
    "itinerary": "1. Muelle Histórico de Llanquihue. 2. Paseo peatonal muelle de Frutillar Bajo. 3. Teatro del Lago. 4. Almuerzo alemán en Familie Fritz. 5. Strudel en El Rincón de la Oma.",
    "linkReel": "https://www.instagram.com/reel/DQS5NHrgNDv/",
    "tip": "La vista frontal a los volcanes desde el muelle de Frutillar es la foto obligada."
  },
  {
    "id": "RUTA-04",
    "title": "Ruta Escapada Glamping & Bosque Secreto",
    "duration": "Fin de Semana (2 Días)",
    "zone": "Los Riscos / Ensenada",
    "poiIds": [
      "POI-007",
      "POI-006",
      "POI-011",
      "POI-005"
    ],
    "itinerary": "1. Check-in en Domos Anulen con vista al volcán. 2. Tinajas calientes en Aremko Spa. 3. Cabañas Bahía Celeste frente al lago. 4. Refugio Río Blanco.",
    "linkReel": "https://www.instagram.com/p/DI2AjSZPe8b/",
    "tip": "Reservar la tinaja para las 19:30 hrs para ver el atardecer entre los árboles."
  },
  {
    "id": "RUTA-05",
    "title": "Ruta Barrio Estación Nocturno (Cervezas & Picoteo)",
    "duration": "Noche (4 hrs)",
    "zone": "Barrio Estación, Puerto Varas",
    "poiIds": [
      "POI-024",
      "POI-032",
      "POI-047",
      "POI-049"
    ],
    "itinerary": "1. Sándwiches en Fuente Schulz. 2. Tablas en Bargual Restobar. 3. Wok Estación. 4. Karaoke y hamburguesas en Brücken.",
    "linkReel": "https://www.instagram.com/reel/C8MyNmsuHN-/",
    "tip": "Todo se hace a pie dentro del Barrio Estación. Estacionar cerca de Parque Estación."
  },
  {
    "id": "RUTA-06",
    "title": "Ruta Sabores de Campo & Granja Educativa",
    "duration": "Medio Día (4 hrs)",
    "zone": "Camino a Ensenada & Llanquihue",
    "poiIds": [
      "POI-023",
      "POI-066",
      "POI-011",
      "POI-001"
    ],
    "itinerary": "1. Manjar artesanal y visita a terneros en Fundo Playa Venado. 2. Once campestre en Casona Totoral. 3. Lago en Bahía Celeste. 4. Camping Suyai Ensenada.",
    "linkReel": "https://www.instagram.com/reel/DZV5HhAgwnz/",
    "tip": "Panorama perfecto para familias con niños pequeños."
  },
  {
    "id": "RUTA-07",
    "title": "Ruta Relax, Bienestar & Spa Frente al Lago",
    "duration": "Tarde de Spa (5 hrs)",
    "zone": "Puerto Varas & Río Pescado",
    "poiIds": [
      "POI-006",
      "POI-017",
      "POI-046",
      "POI-012"
    ],
    "itinerary": "1. Tinajas en el bosque en Aremko Spa. 2. Masajes en Spa Para Ti Sur. 3. Piscina climatizada y buffet en Hotel Cabaña del Lago. 4. Sunset en 57 Terraza.",
    "linkReel": "https://www.instagram.com/p/DMO2XZqgAv7/",
    "tip": "Día ideal para desconectarse en pareja con tinaja caliente y vista al lago."
  },
  {
    "id": "RUTA-08",
    "title": "Ruta Playas & Atardecer frente a Volcanes",
    "duration": "Tarde (4 hrs)",
    "zone": "Camino a Ensenada Km 9 al 42",
    "poiIds": [
      "POI-070",
      "POI-078",
      "POI-074",
      "POI-012"
    ],
    "itinerary": "1. Picnic en Playa Hermosa. 2. Playa Ensenada de arena volcánica. 3. Paseo en lancha en Laguna La Poza. 4. Cóctel sunset en 57 Terraza.",
    "linkReel": "https://www.instagram.com/reel/DRSgBkiCTvk/",
    "tip": "Llevar manta y cortaviento: a las 18:00 hrs baja la brisa fresca del lago."
  },
  {
    "id": "RUTA-09",
    "title": "Ruta Familiar con Niños en Puerto Varas",
    "duration": "Día Completo (6 hrs)",
    "zone": "Puerto Varas Urbano",
    "poiIds": [
      "POI-018",
      "POI-061",
      "POI-048",
      "POI-082",
      "POI-065"
    ],
    "itinerary": "1. Centro Puerto Kids. 2. Café Ulmo y mesones Lego. 3. Juguetería didáctica Recórcholis. 4. Libros en Volcán de Papel. 5. Circuitos infantiles en Move Café.",
    "linkReel": "https://www.instagram.com/reel/DO6-OFRDa8M/",
    "tip": "Ideado para días donde los niños necesitan gastar energía sin aburrirse."
  },
  {
    "id": "RUTA-10",
    "title": "Ruta Naturaleza Salvaje & Alerces Milenarios",
    "duration": "Día Completo (7 hrs)",
    "zone": "Correntoso & Cuenca del Lago",
    "poiIds": [
      "POI-080",
      "POI-075",
      "POI-072",
      "POI-077"
    ],
    "itinerary": "1. Senderismo en Parque Nacional Alerce Andino (alerces de 3.000 años). 2. Kayak en Río Maullín. 3. Navegación en Lago Todos los Santos. 4. Mirador Monte Calvario.",
    "linkReel": "https://www.instagram.com/reel/Db6v33qAjZQ/",
    "tip": "Llevar botas de trekking impermeables; el sendero de los alerces suele tener barro."
  }
];

if (typeof window !== 'undefined') {
  window.CURATED_ROUTES = CURATED_ROUTES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CURATED_ROUTES };
}
