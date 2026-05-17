/**
 * SURUS Inversa — Intel Operativo Module
 * Auto-injects first-hand intelligence section into any dossier page.
 * Usage: Set window.INTEL_DATA before loading this script.
 */
(function(){
  const d = window.INTEL_DATA;
  if(!d) return console.warn('INTEL_DATA not defined');

  // --- STYLES ---
  const style = document.createElement('style');
  style.textContent = `
.intel-section{margin:2rem 0;animation:intelFadeIn .4s ease}
@keyframes intelFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.intel-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid rgba(255,110,64,.3)}
.intel-header h2{font-size:1.3rem;font-weight:900;background:linear-gradient(135deg,#ff6e40,#ffd740);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.intel-header .intel-badge{font-size:.6rem;font-weight:700;padding:.2rem .6rem;border-radius:4px;text-transform:uppercase;letter-spacing:1px}
.intel-badge-pending{background:rgba(255,110,64,.15);color:#ff6e40;border:1px solid rgba(255,110,64,.3);animation:pulseBadge 2s infinite}
.intel-badge-partial{background:rgba(255,215,64,.15);color:#ffd740;border:1px solid rgba(255,215,64,.3)}
.intel-badge-verified{background:rgba(0,230,118,.15);color:#00e676;border:1px solid rgba(0,230,118,.3)}
@keyframes pulseBadge{0%,100%{box-shadow:0 0 4px rgba(255,110,64,.2)}50%{box-shadow:0 0 12px rgba(255,110,64,.4)}}
.intel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:1.5rem}
.intel-card{background:var(--bg-card,#0e0e18);border:1px solid var(--border,#1e1e30);border-radius:14px;padding:1.25rem;transition:all .3s}
.intel-card:hover{border-color:rgba(255,110,64,.4);box-shadow:0 0 30px rgba(255,110,64,.06)}
.intel-card-title{font-size:.8rem;font-weight:800;margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem}
.intel-score{display:flex;gap:.25rem;margin:.5rem 0}
.intel-score-bar{height:6px;flex:1;border-radius:3px;background:rgba(255,255,255,.06)}
.intel-score-bar.filled{background:linear-gradient(90deg,#ff6e40,#ffd740)}
.intel-score-bar.good{background:linear-gradient(90deg,#00e676,#18ffff)}
.intel-row{display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.78rem}
.intel-row:last-child{border:none}
.intel-row .label{color:var(--text-dim,#8888a0);font-weight:600}
.intel-row .value{font-weight:700;font-family:'JetBrains Mono',monospace;font-size:.72rem}
.intel-pending{color:#ff6e40;font-style:italic;font-size:.7rem}
.intel-available{color:#00e676}
.intel-partial{color:#ffd740}
.intel-timeline-row{display:flex;gap:.75rem;align-items:flex-start;padding:.6rem;background:var(--bg-card,#0e0e18);border-radius:10px;margin-bottom:.4rem;border:1px solid var(--border,#1e1e30);font-size:.78rem}
.intel-timeline-dot{min-width:10px;height:10px;border-radius:50%;margin-top:4px;flex-shrink:0}
.intel-doc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem}
.intel-doc-item{display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;background:var(--bg-card,#0e0e18);border:1px solid var(--border,#1e1e30);border-radius:8px;font-size:.75rem;transition:all .2s}
.intel-doc-item:hover{border-color:rgba(255,215,64,.3)}
.intel-doc-icon{font-size:1rem}
.intel-verdict{margin-top:1.5rem;padding:1.25rem;border-radius:14px;border:2px solid;text-align:center}
.intel-verdict-buy{background:rgba(0,230,118,.06);border-color:rgba(0,230,118,.4)}
.intel-verdict-monitor{background:rgba(255,215,64,.06);border-color:rgba(255,215,64,.3)}
.intel-verdict-caution{background:rgba(255,110,64,.06);border-color:rgba(255,110,64,.3)}
.intel-verdict-skip{background:rgba(255,68,68,.06);border-color:rgba(255,68,68,.3)}
.intel-verdict h3{font-size:1.1rem;font-weight:900;margin-bottom:.3rem}
.intel-verdict p{font-size:.8rem;color:var(--text-dim,#8888a0);line-height:1.5}
.intel-full-width{grid-column:1/-1}
.intel-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.75rem;margin-top:.75rem}
.intel-gallery img{width:100%;height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--border,#1e1e30);transition:transform .3s;cursor:pointer}
.intel-gallery img:hover{transform:scale(1.05);border-color:rgba(255,110,64,.5);z-index:1}
@media(max-width:768px){
  .intel-grid{grid-template-columns:1fr}
  .intel-doc-grid{grid-template-columns:1fr}
  .intel-gallery{grid-template-columns:repeat(2,1fr)}
  /* FIX MOBILE TABS OVERFLOW */
  [class*="-tabs"]{flex-wrap:wrap!important;white-space:normal!important;overflow-x:visible!important;gap:0.5rem!important;padding-bottom:1rem!important}
  [class*="-tab"]{flex:1 1 45%;text-align:center;padding:0.6rem!important}
}
`;
  document.head.appendChild(style);

  // --- BUILD HTML ---
  function scoreBar(score, max=10) {
    let bars = '';
    for(let i=0;i<max;i++) bars+=`<div class="intel-score-bar ${i<score?(score>=7?'good':'filled'):''}"></div>`;
    return `<div class="intel-score">${bars}</div><div style="font-size:.65rem;color:var(--text-dim)">${score}/${max} — ${score>=8?'Excelente':score>=6?'Bueno':score>=4?'Aceptable':score>=2?'Deficiente':'Sin datos'}</div>`;
  }

  function docItem(icon, name, status) {
    const cls = status==='available'?'intel-available':status==='partial'?'intel-partial':'intel-pending';
    const txt = status==='available'?'✅ Disponible':status==='partial'?'⚠️ Parcial':'❌ Pendiente';
    return `<div class="intel-doc-item"><span class="intel-doc-icon">${icon}</span><div><div style="font-weight:700">${name}</div><div class="${cls}" style="font-size:.65rem">${txt}</div></div></div>`;
  }

  function timelineItem(date, text, color) {
    return `<div class="intel-timeline-row"><div class="intel-timeline-dot" style="background:${color}"></div><div><div style="font-weight:700;color:${color};font-size:.7rem">${date}</div><div style="color:var(--text-dim,#8888a0)">${text}</div></div></div>`;
  }

  const verdictClass = {COMPRAR:'buy',NEGOCIAR:'monitor',MONITOREAR:'monitor',DESCARTAR:'skip',PRECAUCION:'caution'}[d.verdict?.action||'MONITOREAR']||'monitor';
  const verdictColor = {buy:'#00e676',monitor:'#ffd740',caution:'#ff6e40',skip:'#ff4444'}[verdictClass];
  const badgeCls = d.confidence==='Alta'?'verified':d.confidence==='Media'?'partial':'pending';

  const html = `
<div class="intel-section" id="intel-operativo">
  <div class="intel-header">
    <h2>🔎 Intel Operativo — Agente de Oportunidades</h2>
    <span class="intel-badge intel-badge-${badgeCls}">Confianza: ${d.confidence||'Sin verificar'}</span>
  </div>

  <div class="intel-grid">
    <!-- ESTADO REAL -->
    <div class="intel-card">
      <div class="intel-card-title" style="color:#ff6e40">🔧 Estado Real de la Máquina</div>
      ${scoreBar(d.condition?.score||0)}
      ${(d.condition?.components||[]).map(c=>`<div class="intel-row"><span class="label">${c.name}</span><span class="value" style="color:${c.status==='ok'?'#00e676':c.status==='wear'?'#ffd740':'#ff6e40'}">${c.detail||'⚠️ Pendiente inspección'}</span></div>`).join('')}
      ${d.condition?.note?`<div style="font-size:.7rem;color:var(--text-dim);margin-top:.5rem;padding:.5rem;background:rgba(255,110,64,.06);border-radius:6px">${d.condition.note}</div>`:''}
    </div>

    <!-- HORAS DE OPERACION -->
    <div class="intel-card">
      <div class="intel-card-title" style="color:#18ffff">⏱️ Actividad y Uso</div>
      <div class="intel-row"><span class="label">Horas operación</span><span class="value ${d.hours?.value?'intel-available':'intel-pending'}">${d.hours?.value||'⚠️ Solicitar al vendedor'}</span></div>
      <div class="intel-row"><span class="label">Tipo de uso</span><span class="value">${d.hours?.type||'⚠️ Pendiente'}</span></div>
      <div class="intel-row"><span class="label">Última producción</span><span class="value">${d.hours?.lastProduction||'⚠️ Pendiente'}</span></div>
      <div class="intel-row"><span class="label">Ambiente operativo</span><span class="value">${d.hours?.environment||'⚠️ Pendiente'}</span></div>
      <div class="intel-row"><span class="label">Motivo de venta</span><span class="value">${d.hours?.saleReason||'⚠️ Pendiente'}</span></div>
    </div>

    <!-- MANTENIMIENTO -->
    <div class="intel-card intel-full-width">
      <div class="intel-card-title" style="color:#ffd740">📋 Historial de Mantenimiento</div>
      ${(d.maintenance?.log||[]).length>0 ? d.maintenance.log.map(m=>timelineItem(m.date, m.desc, m.type==='major'?'#ff6e40':m.type==='routine'?'#18ffff':'#ffd740')).join('') : `<div class="intel-pending" style="padding:.75rem;text-align:center;background:rgba(255,110,64,.06);border-radius:8px">⚠️ PENDIENTE — Solicitar libro de mantenimiento al vendedor/casa de subastas<br><span style="font-size:.65rem;color:var(--text-dim)">Este dato es CRÍTICO para evaluar el riesgo real de la inversión</span></div>`}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem;margin-top:.75rem">
        <div class="intel-row" style="flex-direction:column;align-items:flex-start;gap:.2rem"><span class="label">Último servicio</span><span class="value ${d.maintenance?.lastService?'':'intel-pending'}">${d.maintenance?.lastService||'⚠️ Desconocido'}</span></div>
        <div class="intel-row" style="flex-direction:column;align-items:flex-start;gap:.2rem"><span class="label">Próximo servicio</span><span class="value ${d.maintenance?.nextService?'':'intel-pending'}">${d.maintenance?.nextService||'⚠️ Desconocido'}</span></div>
        <div class="intel-row" style="flex-direction:column;align-items:flex-start;gap:.2rem"><span class="label">Piezas cambiadas</span><span class="value ${d.maintenance?.partsChanged?'':'intel-pending'}">${d.maintenance?.partsChanged||'⚠️ Sin registro'}</span></div>
      </div>
    </div>

    <!-- HISTORIAL ACTIVIDAD -->
    <div class="intel-card">
      <div class="intel-card-title" style="color:#b388ff">📅 Historial de Actividad</div>
      ${(d.timeline||[]).map(t=>timelineItem(t.date, t.text, t.color||'#b388ff')).join('')}
      ${(d.timeline||[]).length===0?'<div class="intel-pending" style="text-align:center;padding:.5rem">⚠️ Reconstruir con datos del vendedor</div>':''}
    </div>

    <!-- DOCUMENTACION -->
    <div class="intel-card">
      <div class="intel-card-title" style="color:#00e676">📁 Documentación Disponible</div>
      <div class="intel-doc-grid">
        ${docItem('📖', 'Manual operador', d.docs?.operatorManual||'pending')}
        ${docItem('🔧', 'Manual mantenimiento', d.docs?.maintenanceManual||'pending')}
        ${docItem('⚡', 'Esquemas eléctricos', d.docs?.electricalSchemas||'pending')}
        ${docItem('💧', 'Diagrama hidráulico', d.docs?.hydraulicDiagram||'pending')}
        ${docItem('🏷️', 'Certificado CE', d.docs?.ceCertificate||'pending')}
        ${docItem('📄', 'Declaración conformidad', d.docs?.conformityDecl||'pending')}
        ${docItem('📊', 'Historial servicio', d.docs?.serviceHistory||'pending')}
        ${docItem('📸', 'Fotos reales verificadas', d.docs?.realPhotos||'pending')}
      </div>
    </div>

    <!-- EVIDENCIA VISUAL -->
    ${(d.gallery && d.gallery.length > 0) ? `
    <div class="intel-card intel-full-width">
      <div class="intel-card-title" style="color:#ff6e40">📸 Evidencia Visual Actual</div>
      <div class="intel-gallery">
        ${d.gallery.map(img => `<img src="${img}" alt="Evidencia de activo" onclick="window.open(this.src,'_blank')" loading="lazy" />`).join('')}
      </div>
      <div style="font-size:.65rem;color:var(--text-dim);margin-top:.75rem;text-align:right">Haz clic en la imagen para ampliar</div>
    </div>` : ''}
  </div>

  <!-- VEREDICTO -->
  <div class="intel-verdict intel-verdict-${verdictClass}">
    <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${verdictColor};margin-bottom:.3rem">Evaluación Agente de Oportunidades</div>
    <h3 style="color:${verdictColor}">${d.verdict?.action||'MONITOREAR'}</h3>
    <p>${d.verdict?.summary||'Evaluación pendiente — Se requiere información de primera mano para emitir veredicto.'}</p>
    ${(d.verdict?.redFlags||[]).length>0?`<div style="margin-top:.75rem;text-align:left;max-width:500px;margin-left:auto;margin-right:auto"><div style="font-size:.7rem;font-weight:700;color:#ff6e40;margin-bottom:.3rem">🚩 Red Flags</div>${d.verdict.redFlags.map(f=>`<div style="font-size:.72rem;color:var(--text-dim);padding:.2rem 0">• ${f}</div>`).join('')}</div>`:''}
  </div>
</div>`;

  // --- INJECT ---
  // Strategy 1: Tab-based pages — add tab + section
  const tabContainers = document.querySelectorAll('[class*="-tabs"]');
  if(tabContainers.length > 0) {
    const tabContainer = tabContainers[0];
    const prefix = tabContainer.className.match(/(\w+)-tabs/)?.[1] || 'kuka';
    
    // Add tab button
    const tabBtn = document.createElement('div');
    tabBtn.className = `${prefix}-tab`;
    tabBtn.dataset.tab = 'intel-operativo';
    tabBtn.innerHTML = '🔎 Intel Operativo';
    tabBtn.style.cssText = 'background:rgba(255,110,64,.12)!important;border-color:rgba(255,110,64,.3)!important;color:#ff6e40!important';
    tabContainer.appendChild(tabBtn);

    // Add section
    const section = document.createElement('section');
    section.className = `${prefix}-section`;
    section.id = 'intel-operativo';
    section.innerHTML = html;
    
    // Insert after last section
    const sections = document.querySelectorAll(`.${prefix}-section`);
    const lastSection = sections[sections.length - 1];
    if(lastSection) lastSection.parentNode.insertBefore(section, lastSection.nextSibling);
    else document.querySelector(`.${prefix}-container`)?.appendChild(section);

    // Wire up tab click
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll(`.${prefix}-tab`).forEach(t=>t.classList.remove('active'));
      document.querySelectorAll(`.${prefix}-section`).forEach(s=>s.classList.remove('active'));
      tabBtn.classList.add('active');
      section.classList.add('active');
    });
    
    // Also add nav link if nav exists
    const navLinks = document.querySelector(`.${prefix}-nav-links`);
    if(navLinks) {
      const navLink = document.createElement('a');
      navLink.href = '#intel-operativo';
      navLink.textContent = 'Intel';
      navLink.style.color = '#ff6e40';
      navLink.style.fontWeight = '700';
      navLink.addEventListener('click', (e) => {
        e.preventDefault();
        tabBtn.click();
      });
      const pdfBtn = navLinks.querySelector('button');
      if(pdfBtn) navLinks.insertBefore(navLink, pdfBtn);
      else navLinks.appendChild(navLink);
    }
  } else {
    // Strategy 2: Scroll-based pages — inject before closing container
    const container = document.querySelector('[class$="-container"]') || document.querySelector('.kuka-container, .aleo-container, .bsh-container');
    if(container) {
      // Add divider + section
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `<hr style="border:0;height:1px;background:linear-gradient(90deg,transparent,var(--border,#1e1e30),transparent);margin:2rem 0">${html}`;
      container.appendChild(wrapper);
      
      // Add nav link
      const prefix = container.className.match(/(\w+)-container/)?.[1];
      if(prefix) {
        const navLinks = document.querySelector(`.${prefix}-nav-links`);
        if(navLinks) {
          const navLink = document.createElement('a');
          navLink.href = '#intel-operativo';
          navLink.textContent = 'Intel';
          navLink.style.color = '#ff6e40';
          navLink.style.fontWeight = '700';
          const pdfBtn = navLinks.querySelector('button');
          if(pdfBtn) navLinks.insertBefore(navLink, pdfBtn);
          else navLinks.appendChild(navLink);
        }
      }
    }
  }
})();
