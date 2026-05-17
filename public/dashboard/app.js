// SURUS Strategic Dashboard - App Logic
// ========================================

const opps = INTEL_DATA.opportunities;
let map, markers = [], currentFilter = 'all', sortCol = 'roi_num', sortAsc = false;
let filteredOpps = [...opps];
let favorites = JSON.parse(localStorage.getItem('surus_favorites')) || [];

function toggleFavorite(id, event) {
  if (event) event.stopPropagation();
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('surus_favorites', JSON.stringify(favorites));
  applyFilters(); // Re-render to update stars
  
  const favBtn = document.getElementById('dosFavBtn');
  if (favBtn && document.getElementById('dossierOverlay').classList.contains('open')) {
    const isFav = favorites.includes(id);
    favBtn.innerHTML = isFav ? '🌟 Quitar Fav' : '⭐ Añadir Fav';
    if(isFav) { favBtn.classList.replace('dos-link-s', 'dos-link-p'); }
    else { favBtn.classList.replace('dos-link-p', 'dos-link-s'); }
  }
}

// ── UTILS ──
function animateValue(id, start, end, duration, prefix = '', suffix = '') {
  const obj = document.getElementById(id);
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const ease = progress * (2 - progress); // easeOutQuad
    const current = start + ease * (end - start);
    obj.textContent = prefix + (end % 1 !== 0 ? current.toFixed(1) : Math.round(current)) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = prefix + (end % 1 !== 0 ? end.toFixed(1) : end) + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initKpis();
  initSidebar();
  initMap();
  initDashboard();
  initGrid();
  initSimulator();
  initViewSwitcher();
  initSearch();
  initFilters();
});

// ── KPIs (topbar) ──
function initKpis() {
  const totalInv = opps.reduce((s,o) => s + o.financials.investment_num, 0);
  const avgMargin = (opps.reduce((s,o) => s + parseFloat(o.financials.margin), 0) / opps.length).toFixed(1);
  const avgRoi = (opps.reduce((s,o) => s + o.financials.roi_num, 0) / opps.length).toFixed(1);
  
  animateValue('kTotal', 0, opps.length, 1500);
  animateValue('kMargin', 0, parseFloat(avgMargin), 1500, '', '%');
  animateValue('kRoi', 0, parseFloat(avgRoi), 1500, '', '%');
  animateValue('kInvest', 0, totalInv / 1e6, 1500, '€', 'M');
}

// ── VIEW SWITCHER ──
function initViewSwitcher() {
  document.querySelectorAll('.vbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(btn.dataset.view).classList.add('active');
      if (btn.dataset.view === 'mapView' && map) map.invalidateSize();
    });
  });
}

// ── SIDEBAR ──
function initSidebar() { renderSidebar(opps); }

function renderSidebar(list) {
  const el = document.getElementById('sbList');
  el.innerHTML = '';
  list.forEach((opp, i) => {
    const card = document.createElement('div');
    card.className = 'sb-card';
    card.style.animation = `fadeUp .3s ease ${i * .04}s forwards`;
    card.style.opacity = '0';
    card.dataset.id = opp.id;
    const mVal = parseFloat(opp.financials.margin);
    card.innerHTML = `
      <div class="sc-name">${favorites.includes(opp.id) ? '⭐ ' : ''}${opp.name}</div>
      <div class="sc-meta">${opp.location.city}, ${opp.location.country} · ${opp.status}</div>
      <div class="sc-tags">
        <span class="tag tag-p0">${opp.priority}</span>
        <span class="tag tag-margin">${opp.financials.margin}</span>
        <span class="tag tag-type">${opp.type}</span>
        <span class="tag tag-loc">${opp.location.country}</span>
      </div>`;
    card.addEventListener('click', () => openDossier(opp.id));
    el.appendChild(card);
  });
  const footer = document.getElementById('sbFooter');
  if (footer) footer.textContent = `Mostrando ${list.length} de ${opps.length} oportunidades`;
}

// ── SEARCH ──
function initSearch() {
  document.getElementById('searchInput').addEventListener('input', applyFilters);
}

// ── FILTERS ──
function initFilters() {
  // Populate locations
  const locs = [...new Set(opps.map(o => o.location.country))].sort();
  const locSel = document.getElementById('filterLocation');
  locs.forEach(l => locSel.insertAdjacentHTML('beforeend', `<option value="${l}">${l}</option>`));

  // Bind advanced filters
  locSel.addEventListener('change', applyFilters);
  document.getElementById('filterMargin').addEventListener('change', applyFilters);
  document.getElementById('filterInvest').addEventListener('change', applyFilters);

  // Bind category buttons
  document.querySelectorAll('.fb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const loc = document.getElementById('filterLocation').value;
  const mar = document.getElementById('filterMargin').value;
  const inv = document.getElementById('filterInvest').value;

  const filtered = opps.filter(o => {
    const text = `${o.name} ${o.location.city} ${o.location.country} ${o.type} ${o.technical.assets}`.toLowerCase();
    
    let matchType = true;
    if (currentFilter === 'favorites') {
      matchType = favorites.includes(o.id);
    } else if (currentFilter !== 'all') {
      matchType = o.priority === currentFilter || o.type === currentFilter;
    }

    const matchQ = q === '' || text.includes(q);
    const matchLoc = loc === '' || o.location.country === loc;
    
    let matchMar = true;
    const oMar = parseFloat(o.financials.margin);
    if (mar === '50') matchMar = oMar >= 50;
    else if (mar === '40') matchMar = oMar >= 40 && oMar < 50;
    else if (mar === '0') matchMar = oMar < 40;

    let matchInv = true;
    const oInv = o.financials.investment_num;
    if (inv === '10000000') matchInv = oInv >= 10000000;
    else if (inv === '5000000') matchInv = oInv >= 5000000 && oInv < 10000000;
    else if (inv === '1000000') matchInv = oInv >= 1000000 && oInv < 5000000;
    else if (inv === '0') matchInv = oInv < 1000000;

    return matchType && matchQ && matchLoc && matchMar && matchInv;
  });
  
  filteredOpps = filtered;
  renderSidebar(filteredOpps);
  updateMapMarkers(filteredOpps);
  renderDashboard(filteredOpps);
  renderGrid();
}

// ── MAP ──
function initMap() {
  map = L.map('map', { zoomControl: false, attributionControl: false }).setView([46.5, 5], 5);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd'
  }).addTo(map);
  addMapMarkers(opps);
  
  // Fit map to markers bounds
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 8 });
  }
}

function getMarkerColor(margin) {
  const m = parseFloat(margin);
  if (m >= 50) return '#00e676';
  if (m >= 40) return '#ffd740';
  return '#ff6e40';
}

function addMapMarkers(list) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  list.forEach(opp => {
    const color = getMarkerColor(opp.financials.margin);
    const circle = L.circleMarker([opp.location.lat, opp.location.lng], {
      radius: 8, fillColor: color, color: color, weight: 1, opacity: .8, fillOpacity: .5,
      className: opp.priority === 'P0' ? 'marker-pulse' : ''
    }).addTo(map);
    
    circle.bindTooltip(`<strong>${opp.name}</strong><br>Margen: ${opp.financials.margin} | ROI: ${opp.financials.roi}`, { direction: 'top' });
    circle.on('click', () => {
      loadSimFromDossier(opp.id);
    });
    
    markers.push(circle);
  });
}

function updateMapMarkers(list) { addMapMarkers(list); }

// ── DASHBOARD ──
function initDashboard() {
  renderDashboard(filteredOpps);
}

function renderDashboard(list) {
  // KPI cards
  const totalInv = list.reduce((s,o) => s + o.financials.investment_num, 0);
  const totalRes = list.reduce((s,o) => s + o.financials.resale_num, 0);
  const avgMargin = list.length > 0 ? (list.reduce((s,o) => s + parseFloat(o.financials.margin), 0) / list.length).toFixed(1) : 0;
  const avgRoi = list.length > 0 ? (list.reduce((s,o) => s + o.financials.roi_num, 0) / list.length).toFixed(1) : 0;
  const p0Count = list.filter(o => o.priority === 'P0').length;
  const totalProfit = totalRes - totalInv;
  const kpis = [
    { v: list.length, l: 'Oportunidades Totales', c: 'var(--g)' },
    { v: p0Count, l: 'Prioridad P0', c: 'var(--o)' },
    { v: '€' + (totalInv/1e6).toFixed(1) + 'M', l: 'Inversión Total', c: 'var(--y)' },
    { v: '€' + (totalRes/1e6).toFixed(1) + 'M', l: 'Reventa Estimada', c: 'var(--c)' },
    { v: '€' + (totalProfit/1e6).toFixed(1) + 'M', l: 'Beneficio Potencial', c: 'var(--g)' },
    { v: avgMargin + '%', l: 'Margen Medio', c: 'var(--p)' },
    { v: avgRoi + '%', l: 'ROI Medio', c: 'var(--c)' },
    { v: new Set(list.map(o=>o.location.country)).size, l: 'Países', c: 'var(--y)' }
  ];
  document.getElementById('dashKpis').innerHTML = kpis.map(k =>
    `<div class="dash-kpi"><div class="dv" style="color:${k.c}">${k.v}</div><div class="dl">${k.l}</div></div>`
  ).join('');

  // ROI Bar Chart
  const sorted = [...list].sort((a,b) => b.financials.roi_num - a.financials.roi_num).slice(0, 12);
  const maxRoi = sorted.length > 0 ? Math.max(...sorted.map(o => o.financials.roi_num)) : 1;
  document.getElementById('roiChart').innerHTML = sorted.map(o => {
    const h = (o.financials.roi_num / maxRoi * 180);
    const c = getMarkerColor(o.financials.margin);
    const short = o.name.split('—')[0].trim().substring(0, 12);
    return `<div class="bar-col">
      <div class="bar-val" style="color:${c}">${o.financials.roi_num}%</div>
      <div class="bar" style="height:${h}px;background:linear-gradient(to top,${c}33,${c})"></div>
      <div class="bar-label">${short}</div>
    </div>`;
  }).join('');

  // Alerts
  const alerts = list.filter(o => o.priority === 'P0').slice(0, 5);
  document.getElementById('alertList').innerHTML = alerts.map(o =>
    `<div class="alert-item" style="cursor:pointer" onclick="openDossier('${o.id}')">
      <div class="at">🔥 ${o.name.split('—')[0].trim()}</div>
      <div class="ad">${o.financials.investment} → ${o.financials.resale} · Margen ${o.financials.margin}</div>
    </div>`
  ).join('');
}

// ── GRID ──
function initGrid() { renderGrid(); initGridSort(); }

function getRiskBadge(risk) {
  const r = (risk || '').toLowerCase();
  if (r.includes('alto') || r.includes('extremo')) return `<span class="tag" style="background:rgba(255,64,129,.15);color:var(--r);border:1px solid rgba(255,64,129,.3);box-shadow:0 0 10px rgba(255,64,129,.1)">Alto</span>`;
  if (r.includes('medio')) return `<span class="tag" style="background:rgba(255,215,64,.15);color:var(--y);border:1px solid rgba(255,215,64,.3);box-shadow:0 0 10px rgba(255,215,64,.1)">Medio</span>`;
  return `<span class="tag" style="background:rgba(0,230,118,.15);color:var(--g);border:1px solid rgba(0,230,118,.3);box-shadow:0 0 10px rgba(0,230,118,.1)">Bajo</span>`;
}

function renderGrid() {
  const sorted = [...filteredOpps].sort((a,b) => {
    let va, vb;
    if (sortCol === 'name') { va = a.name; vb = b.name; }
    else if (sortCol === 'type') { va = a.type; vb = b.type; }
    else if (sortCol === 'location') { va = a.location.city; vb = b.location.city; }
    else if (sortCol === 'margin') { va = parseFloat(a.financials.margin); vb = parseFloat(b.financials.margin); }
    else if (sortCol === 'risk') { va = a.financials.risk; vb = b.financials.risk; }
    else { va = a.financials[sortCol] || 0; vb = b.financials[sortCol] || 0; }
    if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortAsc ? va - vb : vb - va;
  });

  document.getElementById('gridBody').innerHTML = sorted.map(o => {
    const mc = getMarkerColor(o.financials.margin);
    const link = o.links[0] ? `<a href="${o.links[0].url}" target="_blank" onclick="event.stopPropagation()">${o.links[0].label}</a>` : '—';
    return `<tr onclick="openDossier('${o.id}')" style="cursor:pointer">
      <td><strong>${favorites.includes(o.id) ? '⭐ ' : ''}${o.name}</strong></td>
      <td><span class="tag tag-type">${o.type}</span></td>
      <td>${o.location.city}, ${o.location.country}</td>
      <td style="font-family:'JetBrains Mono',monospace">${o.financials.investment}</td>
      <td style="font-family:'JetBrains Mono',monospace">${o.financials.resale}</td>
      <td style="font-family:'JetBrains Mono',monospace;color:${mc};font-weight:700">${o.financials.margin}</td>
      <td style="font-family:'JetBrains Mono',monospace;color:var(--c)">${o.financials.roi}</td>
      <td>${getRiskBadge(o.financials.risk)}</td>
      <td>${link}</td>
    </tr>`;
  }).join('');
}

function initGridSort() {
  document.querySelectorAll('.grid-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortCol === col) sortAsc = !sortAsc;
      else { sortCol = col; sortAsc = false; }
      renderGrid();
    });
  });
}

// ── SIMULATOR ──
function initSimulator() {
  const sel = document.getElementById('simAsset');
  sel.innerHTML = '<option value="">— Seleccionar activo —</option>' +
    opps.map(o => `<option value="${o.id}">${o.name} (${o.financials.margin})</option>`).join('');
  sel.addEventListener('change', () => {
    const opp = opps.find(o => o.id === sel.value);
    if (opp) {
      document.getElementById('simInvest').value = opp.financials.investment_num;
      document.getElementById('simResale').value = opp.financials.resale_num;
      const extractNum = parseInt(opp.logistics.extraction_cost.replace(/[^\d]/g, '')) || 0;
      document.getElementById('simLogistics').value = extractNum;
    }
  });
}

function runSimulation() {
  const invest = parseFloat(document.getElementById('simInvest').value) || 0;
  const logistics = parseFloat(document.getElementById('simLogistics').value) || 0;
  const resale = parseFloat(document.getElementById('simResale').value) || 0;
  const totalCost = invest + logistics;
  const profit = resale - totalCost;
  const margin = resale > 0 ? ((profit / resale) * 100).toFixed(1) : 0;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0;
  const paybackMonths = profit > 0 ? Math.ceil((totalCost / profit) * 6) : '∞';

  const res = document.getElementById('simResults');
  res.style.display = 'block';

  // Gauge
  const roiNum = parseFloat(roi);
  const gaugeColor = roiNum >= 80 ? '#00e676' : roiNum >= 40 ? '#ffd740' : '#ff6e40';
  const gauge = document.getElementById('simGauge');
  gauge.style.background = `conic-gradient(${gaugeColor} ${Math.min(roiNum, 200)/200*360}deg, rgba(255,255,255,.05) 0deg)`;
  document.getElementById('simRoiVal').textContent = roi + '%';
  document.getElementById('simRoiVal').style.color = gaugeColor;

  // Metrics
  document.getElementById('simMetrics').innerHTML = `
    <div class="sim-metric" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);padding:.8rem;border-radius:10px"><div class="sv" style="color:var(--o)">€${(totalCost/1e3).toFixed(0)}K</div><div class="sl" style="color:var(--dm);font-size:.6rem;font-weight:600;margin-top:.2rem">Coste Total</div></div>
    <div class="sim-metric" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);padding:.8rem;border-radius:10px"><div class="sv" style="color:${profit>0?'var(--g)':'var(--r)'}">€${(profit/1e3).toFixed(0)}K</div><div class="sl" style="color:var(--dm);font-size:.6rem;font-weight:600;margin-top:.2rem">Beneficio Neto</div></div>
    <div class="sim-metric" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);padding:.8rem;border-radius:10px"><div class="sv" style="color:var(--y)">${margin}%</div><div class="sl" style="color:var(--dm);font-size:.6rem;font-weight:600;margin-top:.2rem">Margen</div></div>
    <div class="sim-metric" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);padding:.8rem;border-radius:10px"><div class="sv" style="color:var(--c)">${roi}%</div><div class="sl" style="color:var(--dm);font-size:.6rem;font-weight:600;margin-top:.2rem">ROI</div></div>
    <div class="sim-metric" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);padding:.8rem;border-radius:10px"><div class="sv" style="color:var(--p)">${paybackMonths}m</div><div class="sl" style="color:var(--dm);font-size:.6rem;font-weight:600;margin-top:.2rem">Payback Est.</div></div>
    <div class="sim-metric" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);padding:.8rem;border-radius:10px"><div class="sv" style="font-size:.8rem;margin-bottom:.2rem">${roiNum>=80?'<span class="tag" style="background:rgba(0,230,118,.15);color:var(--g)">Excelente</span>':roiNum>=40?'<span class="tag" style="background:rgba(255,215,64,.15);color:var(--y)">Viable</span>':'<span class="tag" style="background:rgba(255,64,129,.15);color:var(--r)">Riesgo</span>'}</div><div class="sl" style="color:var(--dm);font-size:.6rem;font-weight:600;margin-top:.2rem">Rating</div></div>
  `;
}

// ── DOSSIER ──
function openDossier(id) {
  const opp = opps.find(o => o.id === id);
  if (!opp) return;

  // Highlight sidebar card
  document.querySelectorAll('.sb-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.querySelector(`.sb-card[data-id="${id}"]`);
  if (activeCard) activeCard.classList.add('active');

  // Flash map marker
  if (map) map.setView([opp.location.lat, opp.location.lng], 7, { animate: true });

  const tag = document.getElementById('dosTag');
  tag.textContent = opp.priority;
  tag.className = 'tag tag-p0';

  const body = document.getElementById('dosBody');
  body.innerHTML = `
    <div class="dos-title">${opp.name}</div>
    <div class="dos-subtitle">${opp.location.city}, ${opp.location.country} · ${opp.type} · ${opp.status}</div>

    <div class="dos-section">
      <div class="dos-section-title fin">📊 Financiero</div>
      <div class="dos-grid">
        <div class="dos-cell"><div class="dcv" style="color:var(--o)">${opp.financials.investment}</div><div class="dcl">Inversión</div></div>
        <div class="dos-cell"><div class="dcv" style="color:var(--g)">${opp.financials.resale}</div><div class="dcl">Reventa</div></div>
        <div class="dos-cell"><div class="dcv" style="color:var(--y)">${opp.financials.margin}</div><div class="dcl">Margen</div></div>
        <div class="dos-cell"><div class="dcv" style="color:var(--c)">${opp.financials.roi}</div><div class="dcl">ROI</div></div>
        <div class="dos-cell"><div class="dcv" style="color:var(--p)">${opp.financials.payback}</div><div class="dcl">Payback</div></div>
        <div class="dos-cell"><div class="dcv" style="color:var(--r)">${opp.financials.risk}</div><div class="dcl">Riesgo</div></div>
      </div>
    </div>

    ${opp.images && opp.images.length > 0 ? `
    <div class="dos-gallery">
      ${opp.images.map(img => `
        <div class="dos-img-container">
          <img src="${img.url}" class="dos-img" alt="${img.caption}">
          <div class="dos-img-caption">${img.caption}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="dos-section">
      <div class="dos-section-title tech">⚙️ Técnico</div>
      <div class="dos-info"><strong>Activos:</strong> ${opp.technical.assets}</div>
      <div class="dos-info"><strong>Condición:</strong> ${opp.technical.condition}</div>
      <div class="dos-info"><strong>Mantenimiento:</strong> ${opp.technical.maintenance}</div>
      <div class="dos-info"><strong>Manuales:</strong> ${opp.technical.manual_available}</div>
    </div>

    <div class="dos-section">
      <div class="dos-section-title log">🚚 Logística</div>
      <div class="dos-info"><strong>Extracción:</strong> ${opp.logistics.extraction_cost}</div>
      <div class="dos-info"><strong>Transporte:</strong> ${opp.logistics.transport_type}</div>
      <div class="dos-info"><strong>Aduanas:</strong> ${opp.logistics.customs_info}</div>
      <div class="dos-info"><strong>Tiempo:</strong> ${opp.logistics.time_estimate}</div>
    </div>

    <div class="dos-section">
      <div class="dos-section-title mkt">🎯 Marketing / Compradores</div>
      <div class="dos-info"><strong>USP:</strong> ${opp.marketing.USP}</div>
      <div class="dos-info" style="margin-top:.3rem"><strong>Buyer Personas:</strong> ${opp.marketing.buyer_personas.join(', ')}</div>
      <div class="dos-clients">${opp.marketing.potential_clients.map(c => `<span class="dos-client">${c}</span>`).join('')}</div>
    </div>

    <div class="dos-section">
      <div class="dos-section-title cnt">📞 Contactos</div>
      ${opp.contacts.map(c => `
        <div class="dos-contact">
          <div class="cn">${c.name}</div>
          <div class="cr">${c.role}</div>
          ${c.email ? `<a href="mailto:${c.email}">${c.email}</a>` : ''}
          ${c.phone ? `<span style="font-size:.6rem;color:var(--dm);margin-left:.5rem">${c.phone}</span>` : ''}
        </div>
      `).join('')}
    </div>

    ${opp.documentation ? `
    <div class="dos-section">
      <div class="dos-section-title" style="color:var(--y)">📄 Documentación</div>
      <div class="dos-info"><strong>Manuales:</strong> ${opp.documentation.manuals}</div>
      <div class="dos-info"><strong>Registros:</strong> ${opp.documentation.maintenance_logs}</div>
    </div>` : ''}

    <div class="dos-links">
      ${opp.links.map(l => `<a href="${l.url}" target="_blank" class="dos-link dos-link-s">🔗 ${l.label}</a>`).join('')}
      <button class="dos-link dos-link-p" onclick="loadSimFromDossier('${opp.id}')">🧮 Simular ROI</button>
      <button id="dosFavBtn" class="dos-link ${favorites.includes(opp.id) ? 'dos-link-p' : 'dos-link-s'}" onclick="toggleFavorite('${opp.id}')">${favorites.includes(opp.id) ? '🌟 Quitar Fav' : '⭐ Añadir Fav'}</button>
    </div>

    ${opp.pdf_dossier ? `
      <a href="${opp.pdf_dossier}" target="_blank" class="dos-link dos-link-pdf" style="text-decoration: none; display: flex;">
        📄 DESCARGAR DOSSIER TÉCNICO COMPLETO (PDF)
      </a>
    ` : ''}
  `;

  document.getElementById('dossierOverlay').classList.add('open');
}

function closeDossier() {
  document.getElementById('dossierOverlay').classList.remove('open');
}

function loadSimFromDossier(id) {
  closeDossier();
  // Switch to simulator view
  document.querySelectorAll('.vbtn').forEach(b => b.classList.remove('active'));
  document.querySelector('.vbtn[data-view="simView"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('simView').classList.add('active');
  // Load data
  const sel = document.getElementById('simAsset');
  sel.value = id;
  sel.dispatchEvent(new Event('change'));
}
