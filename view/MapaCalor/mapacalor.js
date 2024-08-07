var map, heatmaps = {}, markers = {}, infoWindow;
var currentView = 'heatmap'; // Puede ser 'heatmap' o 'markers'
var categoryColors = {}; // Almacenará los colores asignados a cada categoría
var showPOIs = false; // Estado de visibilidad de los puntos de interés
const disabledCategories = ['last_tiendas', 'otros']; // Lista de categorías a desactivar
const activeCategories = new Set(); // Almacena las categorías activas
var bounds; // Almacena los límites de los puntos en el mapa

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: { lat: -33.6866, lng: -71.2166 }, // Coordenadas del centro de Melipilla
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: showPOIs ? 'on' : 'off' }]
      },
      {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{ visibility: showPOIs ? 'on' : 'off' }]
      }
    ]
  });

  infoWindow = new google.maps.InfoWindow();

  fetchAndGroupData().then(groupedData => {
    addHeatmapLayers(groupedData);
    addMarkers(groupedData);
    createCategoryButtons(groupedData);
    adjustMapBounds();
  });

  document.getElementById('toggleMapView').addEventListener('click', toggleView);
  document.getElementById('togglePOIs').addEventListener('click', togglePOIs);
  document.getElementById('dateFilterButton').addEventListener('click', showDateFilterDialog);
}

function showDateFilterDialog() {
  Swal.fire({
    title: 'Filtrar por Fecha',
    html:
      '<label for="swal-startDate">Fecha de Inicio:</label>' +
      '<input type="date" id="swal-startDate" class="swal2-input">' +
      '<label for="swal-endDate">Fecha de Cierre:</label>' +
      '<input type="date" id="swal-endDate" class="swal2-input">',
    showCancelButton: true,
    confirmButtonText: 'Aplicar Filtro',
    preConfirm: () => {
      const startDate = Swal.getPopup().querySelector('#swal-startDate').value;
      const endDate = Swal.getPopup().querySelector('#swal-endDate').value;
      return { startDate, endDate };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { startDate, endDate } = result.value;
      applyDateFilter(startDate, endDate);
    }
  });
}

function addHeatmapLayers(categories) {
  Object.keys(categories).forEach(category => {
    if (!categoryColors[category]) {
      categoryColors[category] = generateColorFromCategory(category);
    }

    const points = categories[category].map(item => new google.maps.LatLng(item.latitud, item.longitud));

    heatmaps[category] = new google.maps.visualization.HeatmapLayer({
      data: points,
      map: null,
      radius: 20
    });

    google.maps.event.addListener(heatmaps[category], 'click', function(event) {
      showInfoWindow(event.latLng, category);
    });

    google.maps.event.addListener(heatmaps[category], 'mousemove', function(event) {
      showInfoWindow(event.latLng, category);
    });
  });
}

function addMarkers(categories) {
  bounds = new google.maps.LatLngBounds();
  Object.keys(categories).forEach(category => {
    if (disabledCategories.includes(category)) {
      return;
    }

    markers[category] = categories[category].map(item => {
      const marker = new google.maps.Marker({
        position: { lat: item.latitud, lng: item.longitud },
        map: null,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: categoryColors[category],
          fillOpacity: 0.8,
          strokeColor: categoryColors[category],
          strokeWeight: 1,
          scale: 7
        },
        title: item.categoria
      });

      marker.addListener('click', function() {
        showInfoWindow(marker.getPosition(), category, item.detalles, item.img, item.unidad, item.fecha_inicio, item.fecha_cierre);
      });

      bounds.extend(marker.getPosition());
      return marker;
    });
  });
}

function showInfoWindow(latLng, category, details = 'Sin detalles', img = '', unidad, fecha_inicio, fecha_cierre) {
  let content = `<div><strong>Unidad:</strong> ${unidad}<br><strong>Categoria:</strong> ${category}<br><strong>Detalles:</strong> ${details}</div>`;
  if (img) {
    content += `<div><img src="../../public/${img}" alt="Imagen" style="max-width: 200px; max-height: 150px;"></div>`;
  }
  content += `<br> <strong>Fecha Creacion:</strong> ${fecha_inicio}`
  content += `<br> <strong>Fecha Cierre:</strong> ${fecha_cierre}`

  infoWindow.setContent(content);
  infoWindow.setPosition(latLng);
  infoWindow.open(map);
}

function filterCategory(category, button) {
  if (disabledCategories.includes(category)) {
    return;
  }

  if (currentView === 'heatmap') {
    if (heatmaps[category]) {
      const isVisible = heatmaps[category].getMap();
      heatmaps[category].setMap(isVisible ? null : map);

      if (isVisible) {
        activeCategories.delete(category);
        button.classList.remove('btn-success');
      } else {
        activeCategories.add(category);
        button.classList.add('btn-success');
      }
    }
  }

  if (currentView === 'markers') {
    if (markers[category]) {
      const areVisible = markers[category][0].getMap();
      markers[category].forEach(marker => marker.setMap(areVisible ? null : map));

      if (areVisible) {
        activeCategories.delete(category);
        button.classList.remove('btn-success');
      } else {
        activeCategories.add(category);
        button.classList.add('btn-success');
      }
    }
  }
  adjustMapBounds();
}

async function fetchAndGroupData(startDate = null, endDate = null) {
  const url = '../../controller/evento.php?op=get_evento_lat_lon';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.fecha_inicio);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (!start || itemDate >= start) && (!end || itemDate <= end);
    });

    const groupedData = filteredData.reduce((acc, item) => {
      const { categoria } = item;
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(item);
      return acc;
    }, {});

    return groupedData;

  } catch (error) {
    console.error('Fetch error:', error);
    return {};
  }
}

function createCategoryButtons(categories) {
  const controlsDiv = document.getElementById('controls');
  controlsDiv.innerHTML = '';

  let row;
  Object.keys(categories).forEach((category, index) => {
    if (disabledCategories.includes(category)) {
      return;
    }

    if (index % 3 === 0) {
      row = document.createElement('div');
      row.className = 'btn-group mb-2';
      controlsDiv.appendChild(row);
    }

    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary';
    button.textContent = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
    button.onclick = () => filterCategory(category, button);

    const icon = createCategoryIcon(categoryColors[category]);
    button.prepend(icon);
    row.appendChild(button);
  });
}

function toggleView() {
  currentView = currentView === 'heatmap' ? 'markers' : 'heatmap';

  Object.keys(heatmaps).forEach(category => {
    if (currentView === 'heatmap') {
      if (activeCategories.has(category)) {
        heatmaps[category].setMap(map);
      }
    } else {
      heatmaps[category].setMap(null);
    }
  });

  Object.keys(markers).forEach(category => {
    if (currentView === 'markers') {
      if (activeCategories.has(category)) {
        markers[category].forEach(marker => marker.setMap(map));
      }
    } else {
      markers[category].forEach(marker => marker.setMap(null));
    }
  });

  const toggleMapViewButton = document.getElementById('toggleMapView');
  if (currentView === 'heatmap') {
    toggleMapViewButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Mapa de Dispersión';
  } else {
    toggleMapViewButton.innerHTML = '<i class="fa fa-bullseye"></i> Mapa de Calor';
  }
  adjustMapBounds();
}

function togglePOIs() {
  showPOIs = !showPOIs;
  map.setOptions({
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: showPOIs ? 'on' : 'off' }]
      },
      {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{ visibility: showPOIs ? 'on' : 'off' }]
      }
    ]
  });

  const poIsButton = document.getElementById('togglePOIs');

  if (poIsButton) {

    if (showPOIs) {
      poIsButton.textContent = '';
      poIsButton.appendChild(createIcon('fa-eye-slash'));
      poIsButton.appendChild(document.createTextNode(' Ocultar Puntos de Interés'));

      poIsButton.classList.add('btn-active');
      poIsButton.classList.remove('btn-inactive');
    } else {
      poIsButton.textContent = '';
      poIsButton.appendChild(createIcon('fa-eye'));
      poIsButton.appendChild(document.createTextNode(' Mostrar Puntos de Interés'));

      poIsButton.classList.add('btn-inactive');
      poIsButton.classList.remove('btn-active');
    }
  } else {
    console.error('Botón con ID togglePOIs no encontrado.');
  }
}

function createIcon(iconClass) {
  const icon = document.createElement('i');
  icon.className = `fas ${iconClass} btn-icon`;
  return icon;
}

function generateColorFromCategory(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function applyDateFilter(startDate, endDate) {
  fetchAndGroupData(startDate, endDate).then(groupedData => {
    clearMapData();
    addHeatmapLayers(groupedData);
    addMarkers(groupedData);
    createCategoryButtons(groupedData);
    restoreActiveCategories();
    adjustMapBounds();
  });
}

function clearMapData() {
  Object.keys(heatmaps).forEach(category => heatmaps[category].setMap(null));
  Object.keys(markers).forEach(category => markers[category].forEach(marker => marker.setMap(null)));
}

function restoreActiveCategories() {
  activeCategories.forEach(category => {
    if (currentView === 'heatmap' && heatmaps[category]) {
      heatmaps[category].setMap(map);
    } else if (currentView === 'markers' && markers[category]) {
      markers[category].forEach(marker => marker.setMap(map));
    }
  });
}

function adjustMapBounds() {
  const activeMarkers = [];
  activeCategories.forEach(category => {
    if (markers[category]) {
      activeMarkers.push(...markers[category]);
    }
  });

  if (activeMarkers.length > 0) {
    const newBounds = new google.maps.LatLngBounds();
    activeMarkers.forEach(marker => newBounds.extend(marker.getPosition()));
    map.fitBounds(newBounds);
  } else if (bounds && !bounds.isEmpty()) {
    map.fitBounds(bounds);
  }
}
function createCategoryIcon(color) {
  const icon = document.createElement('i');
  icon.className = 'fa fa-circle';
  icon.style.color = color;
  icon.style.marginRight = '5px';
  return icon;
}
window.onload = initMap;
