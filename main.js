let routesData = null;
let pointsData = null;

let isRoaming = false;
let roamPaused = false;
let roamTimerId = null;
let roamPopup = null;

let activeRoam = null;
let activeNode = null;

let miniMap = null;
let miniMapReady = false;

let globeIntroStarted = false;
let globeIntroPaused = false;
let globeIntroTimerId = null;
let globeIntroRemaining = 9000;
let globeIntroStartedAt = 0;

const NORTH_GATE_CENTER = [117.199677759653056, 31.776693474945546];
const MAP_CENTER = NORTH_GATE_CENTER;

const CARD_NODE_NAMES = ["综合楼", "科教楼", "东风广场", "孤植树"];

const CARD_NODE_INFO = {
  "综合楼": {
    desc: "综合楼是校园内重要的教学与办公节点，也是从大北门进入校园后较容易识别的建筑参照物。",
    image: "./images/zonghelou.jpg"
  },
  "东风广场": {
    desc: "东风广场位于校园步行系统的重要交汇处，是前往建筑艺术馆过程中较清晰的空间节点。",
    image: "./images/dongfengguangchang.jpg"
  },
  "科教楼": {
    desc: "科教楼位于校园中部，是从大北门前往建艺馆路线中较醒目的教学建筑节点。",
    image: "./images/kejiaolou.jpg"
  },
  "孤植树": {
    desc: "孤植树位于开阔草坪中，是路线末段容易识别的自然景观节点。",
    image: "./images/solitary-tree.jpg"
  }
};

const map = new maplibregl.Map({
  container: "map",
  style: "https://tiles.openfreemap.org/styles/positron",
  center: MAP_CENTER,
  zoom: 1.35,
  pitch: 0,
  bearing: 0,
  projection: {
    type: "globe"
  },
  antialias: true
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

map.on("load", async () => {
  const cacheBust = Date.now();

  map.addSource("leisure", {
    type: "geojson",
    data: `./data/leisure.geojson?v=${cacheBust}`
  });

  map.addLayer({
    id: "leisure-fill",
    type: "fill",
    source: "leisure",
    paint: {
      "fill-color": "#E6E0F3",
      "fill-opacity": 0.52
    }
  });

  map.addSource("water", {
    type: "geojson",
    data: `./data/water.geojson?v=${cacheBust}`
  });

  map.addLayer({
    id: "water-fill",
    type: "fill",
    source: "water",
    paint: {
      "fill-color": "#D6DAF5",
      "fill-opacity": 0.76
    }
  });

  map.addSource("roads", {
    type: "geojson",
    data: `./data/roads.geojson?v=${cacheBust}`
  });

  map.addLayer({
    id: "roads-line",
    type: "line",
    source: "roads",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#FFFFFF",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 0.8,
        16, 1.8,
        18, 3
      ],
      "line-opacity": 0.78
    }
  });

  try {
    routesData = await loadGeoJSON(`./data/routes.geojson?v=${cacheBust}`);
    pointsData = await loadGeoJSON(`./data/points.geojson?v=${cacheBust}`);
    console.log("pointsData:", pointsData);
    console.log(
      "points names:",
      pointsData.features.map((feature) => getFeatureName(feature.properties))
    );
  } catch (error) {
    console.error("GeoJSON 加载失败：", error);
  }

  map.addSource("routes", {
    type: "geojson",
    data: routesData || `./data/routes.geojson?v=${cacheBust}`
  });

  map.addLayer({
    id: "routes-shadow",
    type: "line",
    source: "routes",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#FF7047",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 10,
        16, 13,
        18, 16
      ],
      "line-opacity": 0.14,
      "line-blur": 2.2
    }
  });

  map.addLayer({
    id: "routes-casing",
    type: "line",
    source: "routes",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#FFFFFF",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 6.5,
        16, 8.5,
        18, 11
      ],
      "line-opacity": 0.86
    }
  });

  map.addLayer({
    id: "routes-line",
    type: "line",
    source: "routes",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": [
        "match",
        ["get", "route_type"],
        "main", "#FF7047",
        "alternative", "#FFB09A",
        "#FF7047"
      ],
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 3.8,
        16, 5.5,
        18, 7
      ],
      "line-opacity": 0.98
    }
  });

  map.addSource("buildings", {
    type: "geojson",
    data: `./data/buildings.geojson?v=${cacheBust}`
  });

  map.addLayer({
    id: "buildings-3d",
    type: "fill-extrusion",
    source: "buildings",
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["coalesce", ["to-number", ["get", "height"]], 18],
        6, "#DADAE1",
        12, "#C4C4CE",
        18, "#AFAEBC",
        24, "#9291A2",
        36, "#727183"
      ],
      "fill-extrusion-height": [
        "coalesce",
        ["to-number", ["get", "height"]],
        18
      ],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.96,
      "fill-extrusion-vertical-gradient": true
    }
  });

  map.addLayer({
    id: "buildings-outline",
    type: "line",
    source: "buildings",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#6F6E7B",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 0.35,
        16, 0.75,
        18, 1.15
      ],
      "line-opacity": 0.55
    }
  });

  map.addSource("tree", {
    type: "geojson",
    data: `./data/tree.geojson?v=${cacheBust}`
  });

  map.addLayer({
    id: "tree-3d",
    type: "fill-extrusion",
    source: "tree",
    paint: {
      "fill-extrusion-color": "#5F8F65",
      "fill-extrusion-height": [
        "coalesce",
        ["to-number", ["get", "height"]],
        8
      ],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.88,
      "fill-extrusion-vertical-gradient": true
    }
  });

  map.addLayer({
    id: "tree-outline",
    type: "line",
    source: "tree",
    paint: {
      "line-color": "#3F6848",
      "line-width": 1.4,
      "line-opacity": 0.85
    }
  });

  map.addSource("gates", {
    type: "geojson",
    data: `./data/gates.geojson?v=${cacheBust}`
  });

  addPointLayers("gates", "gates");

  map.addSource("points", {
    type: "geojson",
    data: pointsData || `./data/points.geojson?v=${cacheBust}`
  });

  addPointLayers("points", "points");
  addPointMarkers(pointsData);
  initNodeSearch(pointsData);

  map.addSource("roam-point", {
    type: "geojson",
    data: makePointFeature(MAP_CENTER)
  });

  map.addLayer({
    id: "roam-point-halo",
    type: "circle",
    source: "roam-point",
    paint: {
      "circle-radius": 16,
      "circle-color": "#FF7047",
      "circle-opacity": 0.18,
      "circle-blur": 0.35
    }
  });

  map.addLayer({
    id: "roam-point-circle",
    type: "circle",
    source: "roam-point",
    paint: {
      "circle-radius": 7,
      "circle-color": "#FFFFFF",
      "circle-stroke-color": "#FF7047",
      "circle-stroke-width": 4
    }
  });

  map.setLayoutProperty("roam-point-halo", "visibility", "none");
  map.setLayoutProperty("roam-point-circle", "visibility", "none");

  bindPointEvents();

  initMiniMap(cacheBust);

  initGlobeIntro();
});

function initGlobeIntro() {
  if (map.setProjection) {
    map.setProjection({ type: "globe" });
  }

  map.jumpTo({
    center: NORTH_GATE_CENTER,
    zoom: 1.35,
    pitch: 0,
    bearing: 0
  });
}

function startGlobeIntro() {
  if (globeIntroStarted) return;

  globeIntroStarted = true;
  document.getElementById("introCard")?.classList.add("started");
  document.getElementById("journeyControlBtn")?.classList.add("show");
  resumeGlobeIntro();
}

function toggleGlobeIntro() {
  if (!globeIntroStarted) {
    startGlobeIntro();
    return;
  }

  if (globeIntroPaused) {
    resumeGlobeIntro();
  } else {
    pauseGlobeIntro();
  }
}

function pauseGlobeIntro() {
  if (globeIntroPaused) return;

  globeIntroPaused = true;
  globeIntroRemaining = Math.max(
    900,
    globeIntroRemaining - (Date.now() - globeIntroStartedAt)
  );
  clearTimeout(globeIntroTimerId);
  map.stop();
  setJourneyControlLabel("继续");
}

function resumeGlobeIntro() {
  globeIntroPaused = false;
  globeIntroStartedAt = Date.now();
  setJourneyControlLabel("暂停");

  map.flyTo({
    center: NORTH_GATE_CENTER,
    zoom: 16.7,
    pitch: 58,
    bearing: -18,
    duration: globeIntroRemaining,
    curve: 1.35,
    essential: true
  });

  clearTimeout(globeIntroTimerId);
  globeIntroTimerId = setTimeout(completeGlobeIntro, globeIntroRemaining + 80);
}

function completeGlobeIntro() {
  clearTimeout(globeIntroTimerId);

  if (map.setProjection) {
    map.setProjection({ type: "mercator" });
  }

  document.body.classList.remove("intro-mode");
  document.getElementById("introOverlay")?.classList.add("hidden");
}

function setJourneyControlLabel(label) {
  const button = document.getElementById("journeyControlBtn");
  if (button) button.textContent = label;
}

function getFeatureName(properties = {}) {
  return normalizeName(
    properties.name ||
    properties["名称"] ||
    properties.Name ||
    properties.NAME ||
    properties["建筑名称"] ||
    properties.label ||
    properties.Label ||
    properties.LABEL ||
    ""
  );
}

function getLabelExpression() {
  return [
    "coalesce",
    ["get", "name"],
    ["get", "名称"],
    ["get", "Name"],
    ["get", "NAME"],
    ["get", "建筑名称"],
    ["get", "label"],
    ["get", "Label"],
    ["get", "LABEL"]
  ];
}

function addPointLayers(sourceId, prefix) {
  map.addLayer({
    id: `${prefix}-halo`,
    type: "circle",
    source: sourceId,
    layout: {
      visibility: prefix === "points" ? "none" : "visible"
    },
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 10,
        16, 14,
        18, 20
      ],
      "circle-color": "#FF7047",
      "circle-opacity": 0.14,
      "circle-blur": 0.35
    }
  });

  map.addLayer({
    id: `${prefix}-circle`,
    type: "circle",
    source: sourceId,
    layout: {
      visibility: prefix === "points" ? "none" : "visible"
    },
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 5,
        16, 7.5,
        18, 10.5
      ],
      "circle-color": "#FF7047",
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 3,
      "circle-opacity": 1
    }
  });

  map.addLayer({
    id: `${prefix}-label`,
    type: "symbol",
    source: sourceId,
    layout: {
      visibility: prefix === "points" ? "none" : "visible",
      "text-field": getLabelExpression(),
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 12,
        16, 13,
        18, 15
      ],
      "text-offset": [0, 1.35],
      "text-anchor": "top",
      "text-allow-overlap": true,
      "text-ignore-placement": true
    },
    paint: {
      "text-color": "#2C2B36",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 2
    }
  });
}

function addPointMarkers(pointsGeoJSON) {
  if (!pointsGeoJSON || !pointsGeoJSON.features) return;

  pointsGeoJSON.features.forEach((feature) => {
    if (!feature.geometry || feature.geometry.type !== "Point") return;

    const pointName = getFeatureName(feature.properties);
    if (!pointName) return;

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "featured-point-marker";
    marker.title = pointName;
    marker.setAttribute("aria-label", `查看${pointName}信息`);

    const dot = document.createElement("span");
    dot.className = "featured-point-marker-dot";

    const label = document.createElement("span");
    label.className = "featured-point-marker-label";
    label.textContent = pointName;

    marker.append(dot, label);

    marker.addEventListener("click", (event) => {
      event.stopPropagation();

      if (CARD_NODE_NAMES.includes(pointName)) {
        showBuildingInfoPanel(feature);
      } else {
        new maplibregl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`
            <strong>${pointName}</strong><br/>
            校园建筑节点
          `)
          .addTo(map);
      }
    });

    new maplibregl.Marker({
      element: marker,
      anchor: "bottom",
      offset: [0, -8]
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });
}

function bindPointEvents() {
  map.on("click", "gates-circle", (e) => {
    const properties = e.features[0].properties;
    const gateName = getFeatureName(properties) || "校门";

    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>${gateName}</strong><br/>
        点击左侧按钮查看对应路线
      `)
      .addTo(map);
  });

  map.on("click", "points-circle", (e) => {
    const properties = e.features[0].properties;
    const pointName = getFeatureName(properties) || "建筑节点";

    if (CARD_NODE_NAMES.includes(pointName)) {
      showBuildingInfoPanel(e.features[0]);
    } else {
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <strong>${pointName}</strong><br/>
          校园建筑节点
        `)
        .addTo(map);
    }
  });

  ["gates-circle", "points-circle"].forEach((layerId) => {
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  });
}

function initMiniMap(cacheBust) {
  const miniMapContainer = document.getElementById("miniMap");

  if (!miniMapContainer) return;

  miniMap = new maplibregl.Map({
    container: "miniMap",
    style: "https://tiles.openfreemap.org/styles/positron",
    center: MAP_CENTER,
    zoom: 13.8,
    pitch: 0,
    bearing: 0,
    interactive: false,
    attributionControl: false
  });

  miniMap.on("load", () => {
    miniMapReady = true;

    miniMap.addSource("mini-routes", {
      type: "geojson",
      data: routesData || `./data/routes.geojson?v=${cacheBust}`
    });

    miniMap.addLayer({
      id: "mini-routes-line",
      type: "line",
      source: "mini-routes",
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#FF7047",
        "line-width": 3,
        "line-opacity": 0.9
      }
    });

    miniMap.addSource("mini-points", {
      type: "geojson",
      data: pointsData || `./data/points.geojson?v=${cacheBust}`
    });

    miniMap.addLayer({
      id: "mini-points-circle",
      type: "circle",
      source: "mini-points",
      paint: {
        "circle-radius": 4,
        "circle-color": "#FF7047",
        "circle-stroke-color": "#FFFFFF",
        "circle-stroke-width": 1.5
      }
    });

    miniMap.addSource("mini-roam-point", {
      type: "geojson",
      data: makePointFeature(MAP_CENTER)
    });

    miniMap.addLayer({
      id: "mini-roam-point",
      type: "circle",
      source: "mini-roam-point",
      paint: {
        "circle-radius": 6,
        "circle-color": "#FFFFFF",
        "circle-stroke-color": "#FF7047",
        "circle-stroke-width": 3
      }
    });

    miniMap.addSource("mini-view-center", {
      type: "geojson",
      data: makePointFeature(MAP_CENTER)
    });

    miniMap.addLayer({
      id: "mini-view-center",
      type: "circle",
      source: "mini-view-center",
      paint: {
        "circle-radius": 5,
        "circle-color": "#2E2B3C",
        "circle-stroke-color": "#FFFFFF",
        "circle-stroke-width": 2
      }
    });

    syncMiniMap();
  });

  map.on("move", syncMiniMap);
}

function syncMiniMap() {
  if (!miniMap || !miniMapReady) return;

  const center = map.getCenter();

  miniMap.jumpTo({
    center: center,
    zoom: Math.max(map.getZoom() - 3.2, 13.2),
    bearing: 0,
    pitch: 0
  });

  const centerSource = miniMap.getSource("mini-view-center");

  if (centerSource) {
    centerSource.setData(makePointFeature([center.lng, center.lat]));
  }
}

function fitMapToPoints(pointsGeoJSON) {
  if (!pointsGeoJSON || !pointsGeoJSON.features || pointsGeoJSON.features.length === 0) {
    return;
  }

  const coords = pointsGeoJSON.features
    .filter((feature) => feature.geometry && feature.geometry.type === "Point")
    .map((feature) => feature.geometry.coordinates);

  if (coords.length === 0) return;

  const bounds = coords.reduce((bounds, coord) => {
    return bounds.extend(coord);
  }, new maplibregl.LngLatBounds(coords[0], coords[0]));

  map.fitBounds(bounds, {
    padding: {
      top: 100,
      right: 430,
      bottom: 270,
      left: 380
    },
    duration: 1000,
    bearing: -18,
    pitch: 58
  });
}

async function loadGeoJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`无法加载 ${url}`);
  }

  return await response.json();
}

function toggleRouteGroup() {
  const group = document.getElementById("routeGroup");
  const arrow = document.getElementById("routeGroupArrow");

  if (!group || !arrow) return;

  group.classList.toggle("closed");
  arrow.classList.toggle("closed");

  showAllRoutes();
}

function togglePanel() {
  const panel = document.getElementById("guidePanel");
  const openBtn = document.getElementById("panelOpenBtn");

  if (!panel || !openBtn) return;

  panel.classList.toggle("collapsed");
  openBtn.classList.toggle("show");
}

function collapseGuidePanel() {
  const panel = document.getElementById("guidePanel");
  const openBtn = document.getElementById("panelOpenBtn");

  if (!panel || !openBtn) return;

  panel.classList.add("collapsed");
  openBtn.classList.add("show");
}

function toggleSearchPanel() {
  const panel = document.getElementById("searchPanel");
  const openBtn = document.getElementById("searchOpenBtn");

  if (!panel || !openBtn) return;

  panel.classList.toggle("collapsed");
  openBtn.classList.toggle("show");
}

function collapseSearchPanel() {
  const panel = document.getElementById("searchPanel");
  const openBtn = document.getElementById("searchOpenBtn");

  if (!panel || !openBtn) return;

  panel.classList.add("collapsed");
  openBtn.classList.add("show");
}

function initNodeSearch(pointsGeoJSON) {
  const input = document.getElementById("nodeSearchInput");

  if (!input || !pointsGeoJSON || !pointsGeoJSON.features) return;

  input.addEventListener("input", () => {
    renderNodeSearchResults(pointsGeoJSON.features, input.value);
  });

  renderNodeSearchResults(pointsGeoJSON.features, "");
}

function renderNodeSearchResults(features, query) {
  const results = document.getElementById("searchResults");
  const count = document.getElementById("searchResultCount");

  if (!results || !count) return;

  const keyword = normalizeName(query).toLowerCase();
  const matches = features.filter((feature) => {
    const name = getFeatureName(feature.properties);
    return name && name.toLowerCase().includes(keyword);
  });

  results.replaceChildren();
  count.textContent = `${matches.length} 个节点`;

  matches.forEach((feature) => {
    const name = getFeatureName(feature.properties);
    const isCardNode = CARD_NODE_NAMES.includes(name);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-card";

    const icon = document.createElement("span");
    icon.className = "search-result-icon";
    icon.textContent = isCardNode ? "●" : "○";

    const copy = document.createElement("span");
    copy.className = "search-result-copy";

    const title = document.createElement("strong");
    title.textContent = name;

    const subtitle = document.createElement("small");
    subtitle.textContent = isCardNode ? "可查看实景详情" : "校园地图节点";

    const arrow = document.createElement("span");
    arrow.className = "search-result-arrow";
    arrow.textContent = "›";

    copy.append(title, subtitle);
    button.append(icon, copy, arrow);
    button.addEventListener("click", () => {
      setActiveSearchResult(button);
      focusSearchFeature(feature);
    });
    results.append(button);
  });
}

function setActiveSearchResult(activeButton) {
  document.querySelectorAll(".search-result-card.active").forEach((button) => {
    button.classList.remove("active");
  });

  activeButton?.classList.add("active");
}

function focusSearchFeature(feature) {
  if (!feature || !feature.geometry || feature.geometry.type !== "Point") return;

  const name = getFeatureName(feature.properties);

  map.flyTo({
    center: feature.geometry.coordinates,
    zoom: 17.6,
    pitch: 62,
    duration: 1100,
    essential: true
  });

  if (CARD_NODE_NAMES.includes(name)) {
    showBuildingInfoPanel(feature);
  } else {
    new maplibregl.Popup()
      .setLngLat(feature.geometry.coordinates)
      .setHTML(`<strong>${name}</strong><br/>校园地图节点`)
      .addTo(map);
  }
}

function clearNodeSearch() {
  const input = document.getElementById("nodeSearchInput");

  if (!input || !pointsData) return;

  input.value = "";
  renderNodeSearchResults(pointsData.features || [], "");
  input.focus();
}

function showGateRoutes(gateId) {
  const filter = ["==", ["get", "gate_id"], gateId];

  showRoutesByFilter(filter);
  setActiveRouteButton(gateId);
  focusRouteStart(gateId);
}

function setActiveRouteButton(gateId) {
  document.querySelectorAll(".route-group button.active").forEach((button) => {
    button.classList.remove("active");
  });

  document.querySelector(`[data-gate-id="${gateId}"]`)?.classList.add("active");
}

function focusRouteStart(gateId) {
  const feature = findRouteFeature(gateId);
  const coords = getRouteCoordinates(feature);

  if (coords.length < 2) return;

  map.flyTo({
    center: coords[0],
    zoom: 17.1,
    pitch: 58,
    bearing: getBearing(coords[0], coords[1]),
    duration: 1250,
    curve: 1.25,
    essential: true
  });
}

function showRoutesByFilter(filter) {
  safeSetFilter(map, "routes-shadow", filter);
  safeSetFilter(map, "routes-casing", filter);
  safeSetFilter(map, "routes-line", filter);

  safeSetFilter(miniMap, "mini-routes-line", filter);
}

function showAllRoutes() {
  safeSetFilter(map, "routes-shadow", null);
  safeSetFilter(map, "routes-casing", null);
  safeSetFilter(map, "routes-line", null);

  safeSetFilter(miniMap, "mini-routes-line", null);

  document.querySelectorAll(".route-group button.active").forEach((button) => {
    button.classList.remove("active");
  });
}

function startNorthGateRoam() {
  if (!routesData) {
    alert("路线数据还没有加载完成，请稍等一秒再试。");
    return;
  }

  const routeFeature = findRouteFeature("north_gate", "north_gate_a");

  if (!routeFeature) {
    alert("没有在 routes.geojson 里找到 gate_id 为 north_gate 的路线。");
    return;
  }

  const rawCoords = getRouteCoordinates(routeFeature);

  if (!rawCoords || rawCoords.length < 2) {
    alert("这条路线坐标不足，无法生成漫游。");
    return;
  }

  stopRoam();

  const coords = densifyRoute(rawCoords, 20);
  const stops = buildStopNodesForRoute(coords, pointsData, 170);

  activeRoam = {
    coords,
    index: 0,
    stops,
    visitedStopIds: new Set(),
    stepDuration: 520
  };

  isRoaming = true;
  roamPaused = false;

  document.querySelector(".roam-btn")?.classList.add("active");
  setActiveRouteButton("north_gate");
  collapseSearchPanel();
  collapseGuidePanel();
  showRoutesByFilter(["==", ["get", "route_id"], "north_gate_a"]);
  hideBuildingInfoPanel();

  const start = coords[0];

  showRoamPoint(start);
  updateMiniRoamPoint(start);

  map.flyTo({
    center: start,
    zoom: 17.15,
    pitch: 68,
    bearing: getBearing(start, coords[1]),
    speed: 0.7,
    curve: 1.35,
    essential: true
  });

  roamTimerId = setTimeout(roamStep, 1800);
}

function roamStep() {
  if (!isRoaming || roamPaused || !activeRoam) return;

  const { coords, stepDuration } = activeRoam;

  if (activeRoam.index >= coords.length) {
    finishRoam();
    return;
  }

  const coord = coords[activeRoam.index];
  const nextCoord = coords[activeRoam.index + 1] || coord;
  const bearing = getBearing(coord, nextCoord);

  updateRoamPoint(coord);
  updateMiniRoamPoint(coord);

  map.easeTo({
    center: coord,
    zoom: 17.35,
    pitch: 68,
    bearing,
    duration: stepDuration,
    easing: (t) => t,
    essential: true
  });

  const stopNode = findCurrentStopNode(activeRoam.index);

  if (stopNode) {
    activeRoam.visitedStopIds.add(stopNode.stopId);
    activeNode = stopNode.feature;
    roamPaused = true;

    roamTimerId = setTimeout(() => {
      showBuildingInfoPanel(activeNode);
    }, stepDuration + 120);

    return;
  }

  activeRoam.index += 1;
  roamTimerId = setTimeout(roamStep, stepDuration);
}

function findCurrentStopNode(currentIndex) {
  if (!activeRoam) return null;

  return activeRoam.stops.find((stop) => {
    return (
      currentIndex >= stop.stepIndex &&
      !activeRoam.visitedStopIds.has(stop.stopId)
    );
  });
}

function confirmSeenAndContinue() {
  continueRoamFromPause();
}

function skipNodeAndContinue() {
  continueRoamFromPause();
}

function continueRoamFromPause() {
  hideBuildingInfoPanel();

  if (!activeRoam) return;

  roamPaused = false;
  activeNode = null;
  activeRoam.index += 1;

  roamTimerId = setTimeout(roamStep, 350);
}

function showBuildingInfoPanel(feature) {
  const panel = document.getElementById("buildingInfoPanel");
  const title = document.getElementById("infoTitle");
  const desc = document.getElementById("infoDesc");
  const imageBox = document.getElementById("infoImageBox");
  const image = document.getElementById("infoImage");

  if (!panel || !title || !desc || !imageBox || !image) return;

  const props = feature.properties || {};
  const name = getFeatureName(props) || "建筑节点";
  const defaultInfo = CARD_NODE_INFO[name] || {};

  const description =
    props.desc ||
    props.description ||
    props["说明"] ||
    defaultInfo.desc ||
    "当前路线已经到达该建筑节点附近。请在画面中确认是否看到这个建筑。";

  const imagePath =
    props.image ||
    props.img ||
    props["图片"] ||
    defaultInfo.image ||
    "";

  title.textContent = name;
  desc.textContent = description;

  if (imagePath) {
    image.src = imagePath;
    imageBox.classList.add("show");

    image.onerror = () => {
      image.src = "";
      imageBox.classList.remove("show");
    };
  } else {
    image.src = "";
    imageBox.classList.remove("show");
  }

  panel.classList.add("show");
}

function hideBuildingInfoPanel() {
  const panel = document.getElementById("buildingInfoPanel");

  if (panel) {
    panel.classList.remove("show");
  }
}

function finishRoam() {
  isRoaming = false;
  roamPaused = false;
  document.querySelector(".roam-btn")?.classList.remove("active");

  hideBuildingInfoPanel();

  const end = activeRoam.coords[activeRoam.coords.length - 1];

  roamPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    offset: 18
  })
    .setLngLat(end)
    .setHTML(`
      <strong>到达建艺馆附近</strong><br/>
      路线漫游已完成
    `)
    .addTo(map);

  launchArrivalConfetti();
  setTimeout(showArrivalPrompt, 500);
}

function launchArrivalConfetti() {
  const layer = document.getElementById("confettiLayer");
  if (!layer) return;

  const colors = ["#FF8A62", "#FFC2AD", "#6675C8", "#AAB3E8", "#5EA78A", "#FFFFFF"];

  layer.replaceChildren();
  layer.classList.add("show");

  for (let index = 0; index < 72; index += 1) {
    const piece = document.createElement("span");
    const angle = -78 + Math.random() * 156;
    const distance = 220 + Math.random() * 520;
    const drift = Math.sin(angle * Math.PI / 180) * distance;
    const rise = -(280 + Math.random() * 420);

    piece.className = "confetti-piece";
    piece.style.left = `${46 + Math.random() * 8}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--drift", `${drift}px`);
    piece.style.setProperty("--fall-drift", `${drift * 1.25}px`);
    piece.style.setProperty("--rise", `${rise}px`);
    piece.style.setProperty("--spin", `${360 + Math.random() * 900}deg`);
    piece.style.setProperty("--delay", `${Math.random() * 0.35}s`);
    piece.style.setProperty("--duration", `${2.8 + Math.random() * 1.7}s`);
    layer.append(piece);
  }

  setTimeout(() => {
    layer.classList.remove("show");
    layer.replaceChildren();
  }, 5200);
}

function showArrivalPrompt() {
  document.getElementById("arrivalPrompt")?.classList.add("show");
}

function hideArrivalPrompt() {
  document.getElementById("arrivalPrompt")?.classList.remove("show");
}

function openVideoPage() {
  hideArrivalPrompt();
  document.getElementById("videoStartCard")?.classList.remove("hidden");
  document.getElementById("videoPage")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function startRoomVideo() {
  const video = document.getElementById("roomVideo");
  const card = document.getElementById("videoStartCard");

  if (!video) return;

  card?.classList.add("hidden");

  try {
    await video.play();
  } catch (error) {
    card?.classList.remove("hidden");
    console.error("视频播放失败：", error);
  }
}

function setVideoPlaybackRate(rate) {
  const video = document.getElementById("roomVideo");
  if (video) video.playbackRate = Number(rate) || 1;
}

function closeVideoPage() {
  const video = document.getElementById("roomVideo");

  if (video) {
    video.pause();
  }

  document.getElementById("mapSection")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function stopRoam() {
  isRoaming = false;
  roamPaused = false;
  document.querySelector(".roam-btn")?.classList.remove("active");
  activeRoam = null;
  activeNode = null;

  if (roamTimerId) {
    clearTimeout(roamTimerId);
    roamTimerId = null;
  }

  hideBuildingInfoPanel();

  if (map.getLayer("roam-point-halo")) {
    map.setLayoutProperty("roam-point-halo", "visibility", "none");
  }

  if (map.getLayer("roam-point-circle")) {
    map.setLayoutProperty("roam-point-circle", "visibility", "none");
  }

  if (roamPopup) {
    roamPopup.remove();
    roamPopup = null;
  }
}

function buildStopNodesForRoute(routeCoords, pointsGeoJSON, thresholdMeters = 130) {
  if (!pointsGeoJSON || !pointsGeoJSON.features) return [];

  const stops = [];

  pointsGeoJSON.features.forEach((feature, index) => {
    if (!feature.geometry || feature.geometry.type !== "Point") return;

    const props = feature.properties || {};
    const nodeName = getFeatureName(props);

    if (!CARD_NODE_NAMES.includes(nodeName)) return;

    const pointCoord = feature.geometry.coordinates;
    const nearest = findNearestRouteIndex(pointCoord, routeCoords);

    if (nearest.distance <= thresholdMeters) {
      const stopId = props.id || nodeName || `stop-${index}`;

      stops.push({
        stopId,
        feature,
        stepIndex: nearest.index,
        distance: nearest.distance
      });
    }
  });

  return stops.sort((a, b) => a.stepIndex - b.stepIndex);
}

function findNearestRouteIndex(pointCoord, routeCoords) {
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  routeCoords.forEach((coord, index) => {
    const distance = getDistance(pointCoord, coord);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return {
    index: nearestIndex,
    distance: nearestDistance
  };
}

function findRouteFeature(gateId, routeId = "") {
  const features = routesData.features || [];

  if (routeId) {
    const exactRoute = features.find((feature) => {
      return feature.properties && feature.properties.route_id === routeId;
    });

    if (exactRoute) return exactRoute;
  }

  const mainRoute = features.find((feature) => {
    return (
      feature.properties &&
      feature.properties.gate_id === gateId &&
      feature.properties.route_type === "main"
    );
  });

  if (mainRoute) return mainRoute;

  return features.find((feature) => {
    return feature.properties && feature.properties.gate_id === gateId;
  });
}

function getRouteCoordinates(feature) {
  if (!feature || !feature.geometry) return [];

  const geometry = feature.geometry;

  if (geometry.type === "LineString") {
    return geometry.coordinates;
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flat();
  }

  return [];
}

function densifyRoute(coords, segmentMeters = 20) {
  const result = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i];
    const end = coords[i + 1];
    const distance = getDistance(start, end);
    const steps = Math.max(1, Math.ceil(distance / segmentMeters));

    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      result.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t
      ]);
    }
  }

  result.push(coords[coords.length - 1]);

  return result;
}

function getDistance(a, b) {
  const earthRadius = 6371000;
  const lng1 = toRadians(a[0]);
  const lat1 = toRadians(a[1]);
  const lng2 = toRadians(b[0]);
  const lat2 = toRadians(b[1]);

  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function getBearing(start, end) {
  const lng1 = toRadians(start[0]);
  const lat1 = toRadians(start[1]);
  const lng2 = toRadians(end[0]);
  const lat2 = toRadians(end[1]);

  const dLng = lng2 - lng1;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = Math.atan2(y, x);

  return (toDegrees(bearing) + 360) % 360;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

function makePointFeature(coord) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: coord
        }
      }
    ]
  };
}

function showRoamPoint(coord) {
  updateRoamPoint(coord);

  if (map.getLayer("roam-point-halo")) {
    map.setLayoutProperty("roam-point-halo", "visibility", "visible");
  }

  if (map.getLayer("roam-point-circle")) {
    map.setLayoutProperty("roam-point-circle", "visibility", "visible");
  }
}

function updateRoamPoint(coord) {
  const source = map.getSource("roam-point");

  if (!source) return;

  source.setData(makePointFeature(coord));
}

function updateMiniRoamPoint(coord) {
  if (!miniMap || !miniMapReady) return;

  const source = miniMap.getSource("mini-roam-point");

  if (!source) return;

  source.setData(makePointFeature(coord));
}

function safeSetFilter(targetMap, layerId, filter) {
  if (targetMap && targetMap.getLayer && targetMap.getLayer(layerId)) {
    targetMap.setFilter(layerId, filter);
  }
}

function normalizeName(name) {
  return String(name).trim();
}
