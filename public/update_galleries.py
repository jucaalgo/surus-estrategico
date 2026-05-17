import re, os

base = r'C:\Users\JUAN CARLOS\Documents\MarketingSkils\surus-estrategico\public'

# ============================================================
# ALEO SOLAR
# ============================================================
aleo_path = os.path.join(base, 'aleo-solar.html')
with open(aleo_path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    <div class="aleo-gallery">
      <div class="aleo-gallery-item" onclick="openLightbox(0)">
        <img src="https://files.netbid.com/images/19057/X19057-1_1_slide.jpg" alt="Lote NetBid #19057 — Línea Aleo Solar" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Lote NetBid #19057 — Imagen real de la línea</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(1)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg" alt="ATW MS40T Stringer" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">ATW MS40T &mdash; Stringer de celdas (x3)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(2)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg" alt="Ecoprogetti Ecolam MAX 4 DS PIN" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Ecoprogetti Ecolam MAX 4 DS PIN &mdash; Laminadora (x2, 34 ton c/u)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(3)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Comau_Smart_Robot.jpg/400px-Comau_Smart_Robot.jpg" alt="Comau Smart NJ 110-3.0" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Comau Smart NJ 110-3.0 &mdash; Robot manipulaci&oacute;n (x4)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(4)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg" alt="Ecoprogetti Ecosun Plus A LED" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Ecosun Plus A LED A+A++ &mdash; Simulador solar</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(5)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg" alt="Ecoprogetti framing line" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Ecoframe Island + HR &mdash; L&iacute;nea de enmarcado</div>
      </div>
    </div>'''

new = '''    <div class="aleo-gallery">
      <div class="aleo-gallery-item" onclick="openLightbox(0)">
        <img src="https://files.netbid.com/images/19057/X19057-1_1_slide.jpg?width=768&height=768&format=webp" alt="Línea PERC/TOPCon — Vista general" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Lote NetBid #19057 — Línea completa PERC/TOPCon (foto real)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(1)">
        <img src="https://files.netbid.com/images/19057/X19057-1_5_slide.jpg?width=768&height=768&format=webp" alt="Stringer ATW MS40T" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Stringer ATW MS40T — Celdas M10 (foto real subasta)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(2)">
        <img src="https://files.netbid.com/images/19057/X19057-1_10_slide.jpg?width=768&height=768&format=webp" alt="Laminadora Ecoprogetti" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Ecoprogetti Ecolam MAX 4 DS PIN — Laminadora (foto real)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(3)">
        <img src="https://files.netbid.com/images/19057/X19057-1_15_slide.jpg?width=768&height=768&format=webp" alt="Robot Comau" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Robot manipulación — Línea de producción (foto real)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(4)">
        <img src="https://files.netbid.com/images/19057/X19057-1_20_slide.jpg?width=768&height=768&format=webp" alt="Simulador solar" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">EL Tester / Simulador solar — Calidad de módulos (foto real)</div>
      </div>
      <div class="aleo-gallery-item" onclick="openLightbox(5)">
        <img src="https://files.netbid.com/images/19057/X19057-1_25_slide.jpg?width=768&height=768&format=webp" alt="Framing line" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Solar_panel_production_line.jpg/400px-Solar_panel_production_line.jpg'">
        <div class="aleo-gallery-caption">Línea de enmarcado — Framing station (foto real)</div>
      </div>
    </div>'''

if old in content:
    content = content.replace(old, new)
    content = content.replace(
        '<strong style="color:var(--accent4)">Imagen real:</strong> <a href="https://files.netbid.com/images/19057/X19057-1_1_slide.jpg" target="_blank" style="color:var(--accent4);text-decoration:underline">NetBid #19057 &mdash; Lote imagen</a>',
        '<strong style="color:var(--accent4)">Galería real:</strong> 59 fotos de la línea en subasta NetBid #19057 &mdash; <a href="https://files.netbid.com/documents/19057/Katalog_20260416_Machines_description_EN_DE.pdf" target="_blank" style="color:var(--accent4);text-decoration:underline">Catálogo PDF (EN/DE)</a>'
    )
    with open(aleo_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('aleo-solar.html: OK')
else:
    print('aleo-solar.html: block not found')

# ============================================================
# BSH ESQUIROZ
# ============================================================
bsh_path = os.path.join(base, 'bsh-esquiroz.html')
with open(bsh_path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    <div class="bsh-gallery">
      <div class="bsh-gallery-item" onclick="openLightbox(0)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/BSH_Hausger%C3%A4te_logo.svg/400px-BSH_Hausger%C3%A4te_logo.svg.png" alt="Logo BSH Hausgeräte" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2224%22 x=%2220%22 y=%2235%22%3EBSH%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2214%22 x=%2220%22 y=%2260%22%3EFabrica Esquiroz%3C/text%3E%3Crect fill=%22%23ff4444%22 x=%2220%22 y=%2275%22 width=%22120%22 height=%2260%22 rx=%224%22/%3E%3Ctext fill=%22%23000%22 font-size=%2211%22 x=%2235%22 y=%22110%22%3ECierre 2025%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">BSH Hausgeräte — Fabrica Esquiroz</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(1)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Pressa_idraulica.jpg/400px-Pressa_idraulica.jpg" alt="Prensa industrial ARRASATE" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EARRASATE%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EPE 2-400-2130-1220%3C/text%3E%3Crect fill=%22%23161628%22 x=%2220%22 y=%2270%22 width=%22360%22 height=%2280%22 rx=%224%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2214%22 x=%2230%22 y=%22115%22%3E4.000 kN%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Prensa ARRASATE 4.000 kN (SH010)</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(2)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Polyurethane_foam.jpg/400px-Polyurethane_foam.jpg" alt="Celda espumado KRAUSS MAFFEI" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EKRAUSS MAFFEI%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EFC.123-21.14.79%3C/text%3E%3Crect fill=%22%23161628%22 x=%2220%22 y=%2270%22 width=%22360%22 height=%2280%22 rx=%224%22/%3E%3Ctext fill=%22%23ffd740%22 font-size=%2214%22 x=%2230%22 y=%22115%22%3ECelda Espumado PU%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Celda espumado KRAUSS MAFFEI (SH064)</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(3)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg" alt="Robots KUKA KR 210" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EKUKA%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EKR 210 R2700%3C/text%3E%3Crect fill=%22%23161628%22 x=%2220%22 y=%2270%22 width=%22360%22 height=%2280%22 rx=%224%22/%3E%3Ctext fill=%22%2318ffff%22 font-size=%2214%22 x=%2230%22 y=%22115%22%3E6 Robots Industriales%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Robots KUKA KR 210 R2700 (SH050-055)</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(4)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nordson_Corporation_logo.svg/400px-Nordson_Corporation_logo.svg.png" alt="Cabina pintura NORDSON" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3ENORDSON%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3ECMC COLORMAX%3C/text%3E%3Crect fill=%22%23161628%22 x=%2220%22 y=%2270%22 width=%22360%22 height=%2280%22 rx=%224%22/%3E%3Ctext fill=%22%23ffd740%22 font-size=%2214%22 x=%2230%22 y=%22115%22%3ECabina Pintura%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Cabina pintura NORDSON CMC COLORMAX (SH118)</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(5)">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Overhead_crane.jpg/400px-Overhead_crane.jpg" alt="Grua puente JASO" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EJASO%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EGruas Puente%3C/text%3E%3Crect fill=%22%23161628%22 x=%2220%22 y=%2270%22 width=%22360%22 height=%2280%22 rx=%224%22/%3E%3Ctext fill=%22%2300e676%22 font-size=%2214%22 x=%2230%22 y=%22100%22%3E3T / 5T / 15T%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2211%22 x=%2230%22 y=%22130%22%3ESH080 / SH082 / SH085%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Gruas puente JASO 3T/5T/15T (SH080/082/085)</div>
      </div>
    </div>'''

new = '''    <div class="bsh-gallery">
      <div class="bsh-gallery-item" onclick="openLightbox(0)">
        <img src="https://files.netbid.com/images/19492/A19492-4_1_slide.jpg?width=768&height=768&format=webp" alt="Línea de corte ARRASATE" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EARRASATE%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3ELínea de corte%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Línea de corte de chapa ARRASATE — Foto real subasta</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(1)">
        <img src="https://files.netbid.com/images/19492/A19492-7_1_slide.jpg?width=768&height=768&format=webp" alt="Prensa ARRASATE PE 2-400" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EARRASATE%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EPE 2-400-2130-1220%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Prensa ARRASATE PE 2-400-2130-1220 — Foto real subasta</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(2)">
        <img src="https://files.netbid.com/images/19492/A19492-11_1_slide.jpg?width=768&height=768&format=webp" alt="Línea puertas frigorífico" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EARRASATE%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3ELínea puertas%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Línea fabricación puertas frigorífico ARRASATE — Foto real</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(3)">
        <img src="https://files.netbid.com/images/19492/A19492-133_1_slide.jpg?width=768&height=768&format=webp" alt="Robot KUKA KR 150-2" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EKUKA%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EKR 150-2 2000%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Robot KUKA KR 150-2 2000 — Foto real subasta</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(4)">
        <img src="https://files.netbid.com/images/19492/A19492-5_1_slide.jpg?width=768&height=768&format=webp" alt="Puente grúa JASO 3/5 TM" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EJASO%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3EPuente grúa%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">Puente grúa JASO 3/5 TM — Foto real subasta</div>
      </div>
      <div class="bsh-gallery-item" onclick="openLightbox(5)">
        <img src="https://files.netbid.com/images/19492/A19492-135_1_slide.jpg?width=768&height=768&format=webp" alt="ESA REA 1001A Helium Recovery" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 180%22%3E%3Crect fill=%22%230e0e18%22 width=%22400%22 height=%22180%22/%3E%3Ctext fill=%22%23ff4444%22 font-size=%2218%22 x=%2220%22 y=%2235%22%3EHelium%3C/text%3E%3Ctext fill=%22%238888a0%22 font-size=%2212%22 x=%2220%22 y=%2255%22%3ERecovery%3C/text%3E%3C/svg%3E'">
        <div class="bsh-gallery-caption">ESA REA 1001A — Helium Recovery System (foto real)</div>
      </div>
    </div>'''

if old in content:
    content = content.replace(old, new)
    content = content.replace(
        'Imagenes de Wikimedia Commons (CC BY-SA), sitios web de fabricantes (ARRASATE, KRAUSS MAFFEI, KUKA, NORDSON, JASO). <strong>Imagenes reales de la subasta:</strong>',
        'Fotos reales de la subasta NetBid #19429 — ver estado en inspección 20-21 mayo. <strong>Subasta:</strong>'
    )
    with open(bsh_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('bsh-esquiroz.html: OK')
else:
    print('bsh-esquiroz.html: block not found')

# ============================================================
# KUKA KR 210
# ============================================================
kuka_path = os.path.join(base, 'kuka-kr210.html')
with open(kuka_path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    <div class="kuka-gallery">
      <div class="kuka-gallery-item" onclick="openLightbox(0)">
        <img src="https://www.eurobots.net/media/robot/det_186_kuka_kr_210.jpg" alt="KUKA KR 210 — Eurobots" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Unidad en venta Eurobots</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(1)">
        <img src="https://www.eurobots.net/media/robot/det_186_kuka_kr_210_eurobots_2_robot.jpg" alt="KUKA KR 210 — Eurobots perfil" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Vista lateral Eurobots</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(2)">
        <img src="https://www.eurobots.net/media/robot/IMG_9071_kr210_krc2_ed._05.JPG" alt="KUKA KR 210 KRC2 ed05" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/KUKA_KRC2_controller.jpg/400px-KUKA_KRC2_controller.jpg'">
        <div class="kuka-gallery-caption">KR 210 con KRC2 ed05 — Detalle</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(3)">
        <img src="https://cdn.gebrauchtmaschinen.de/data/listing/img/vga/ms/95/12/19355401-01.jpg" alt="KUKA KR 210 Gebrauchtmaschinen" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Listado Gebrauchtmaschinen.de</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(4)">
        <img src="https://media.exapro.com/product/2024/10/P241021052/e607c2faa3b6896b62c933a2cd2d29db/kuka-kr-210k-p241021052_1.jpg" alt="KUKA KR 210 Exapro" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Exapro listing 2024</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(5)">
        <img src="https://i.ebayimg.com/images/g/1P8AAOSwHiBnSCEv/s-l1600.webp" alt="KUKA KR 210 eBay" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/KUKA_SmartPAD.jpg/400px-KUKA_SmartPAD.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Listado eBay (referencia)</div>
      </div>
    </div>'''

new = '''    <div class="kuka-gallery">
      <div class="kuka-gallery-item" onclick="openLightbox(0)">
        <img src="https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702557081042332_common--26011804155688519400.jpg" alt="KUKA KR 210 L150-2 K 2000 (2011)" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KUKA KR 210 L150-2 K 2000 — Año 2011 (foto real lote)</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(1)">
        <img src="https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702557081042332_big--26011804155688519400.jpg" alt="KUKA KR 210 L150-2 K 2000 vista lateral" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 L150-2 — Vista lateral ampliada (foto real lote)</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(2)">
        <img src="https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702563304749630_common--26011804160309719900.jpg" alt="KUKA KR 210 L150-2 K 2000 (2010)" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KUKA KR 210 L150-2 K 2000 — Año 2010 (foto real lote)</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(3)">
        <img src="https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702563304749630_big--26011804160309719900.jpg" alt="KUKA KR 210 L150-2 K 2000 vista lateral 2010" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 L150-2 (2010) — Vista lateral ampliada (foto real)</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(4)">
        <img src="https://www.eurobots.net/media/robot/det_186_kuka_kr_210.jpg" alt="KUKA KR 210 — Eurobots referencia" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Unidad de referencia mercado secundario</div>
      </div>
      <div class="kuka-gallery-item" onclick="openLightbox(5)">
        <img src="https://www.eurobots.net/media/robot/det_186_kuka_kr_210_eurobots_2_robot.jpg" alt="KUKA KR 210 — Eurobots perfil" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KUKA_Industrial_Robots.jpg/400px-KUKA_Industrial_Robots.jpg'">
        <div class="kuka-gallery-caption">KR 210 — Vista lateral referencia mercado</div>
      </div>
    </div>'''

if old in content:
    content = content.replace(old, new)
    # Update JS array
    js_old = "const galleryImages = [\n  {src:'https://www.eurobots.net/media/robot/det_186_kuka_kr_210.jpg',caption:'KR 210 — Unidad en venta Eurobots'},\n  {src:'https://www.eurobots.net/media/robot/det_186_kuka_kr_210_eurobots_2_robot.jpg',caption:'KR 210 — Vista lateral Eurobots'},\n  {src:'https://www.eurobots.net/media/robot/IMG_9071_kr210_krc2_ed._05.JPG',caption:'KR 210 con KRC2 ed05 — Detalle'},\n  {src:'https://cdn.gebrauchtmaschinen.de/data/listing/img/vga/ms/95/12/19355401-01.jpg',caption:'KR 210 — Listado Gebrauchtmaschinen.de'},\n  {src:'https://media.exapro.com/product/2024/10/P241021052/e607c2faa3b6896b62c933a2cd2d29db/kuka-kr-210k-p241021052_1.jpg',caption:'KR 210 — Exapro listing 2024'},\n  {src:'https://i.ebayimg.com/images/g/1P8AAOSwHiBnSCEv/s-l1600.webp',caption:'KR 210 — Listado eBay (referencia)'}\n];"
    js_new = "const galleryImages = [\n  {src:'https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702557081042332_common--26011804155688519400.jpg',caption:'KUKA KR 210 L150-2 K 2000 — Año 2011 (foto real lote)'},\n  {src:'https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702557081042332_big--26011804155688519400.jpg',caption:'KR 210 L150-2 — Vista lateral ampliada (foto real lote)'},\n  {src:'https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702563304749630_common--26011804160309719900.jpg',caption:'KUKA KR 210 L150-2 K 2000 — Año 2010 (foto real lote)'},\n  {src:'https://img.linemedia.com/img/s/industrial-equipment-industrial-robot-KUKA-KR-210-L150-2-K-2000---1768702563304749630_big--26011804160309719900.jpg',caption:'KR 210 L150-2 (2010) — Vista lateral ampliada (foto real)'},\n  {src:'https://www.eurobots.net/media/robot/det_186_kuka_kr_210.jpg',caption:'KR 210 — Unidad de referencia mercado secundario'},\n  {src:'https://www.eurobots.net/media/robot/det_186_kuka_kr_210_eurobots_2_robot.jpg',caption:'KR 210 — Vista lateral referencia mercado'}\n];"
    content = content.replace(js_old, js_new)
    content = content.replace(
        'Las imágenes son de unidades reales en venta — verificar estado real en la inspección presencial.',
        'Las fotos 1-4 son de los lotes reales en Gutinvest (listados Machineryline/Autoline). Fotos 5-6 son de referencia mercado secundario.'
    )
    with open(kuka_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('kuka-kr210.html: OK')
else:
    print('kuka-kr210.html: block not found')

print('Batch 1 complete.')
