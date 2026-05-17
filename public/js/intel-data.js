/* SURUS Inversa — Intel Data Registry (auto-detect by URL) */
(function(){
var DB = {
"kuka-kr210": {
  confidence:"Media",
  condition:{score:7,components:[
    {name:"Brazo robótico",status:"ok",detail:"Desgaste normal en Eje 2-3"},
    {name:"Controlador KRC4",status:"ok",detail:"Firmware v8.3 — actualizable"},
    {name:"Servomotores",status:"wear",detail:"Motor Eje 1 con 42,000h"},
    {name:"Cableado dress-pack",status:"wear",detail:"Requiere reemplazo parcial"},
    {name:"Reductor Eje 2",status:"ok",detail:"Sin holgura detectada"}
  ],note:"Robot operativo hasta desmantelamiento planta. Calibración vigente."},
  hours:{value:"~38,500h",type:"Producción continua 3 turnos",lastProduction:"Dic 2024",environment:"Línea soldadura — polvo metálico",saleReason:"Cierre planta Augsburg"},
  maintenance:{lastService:"Oct 2024",nextService:"Vencido",partsChanged:"Dress-pack Eje 6 (2023), encoder Eje 3 (2022)",
    log:[
      {date:"Oct 2024",desc:"Servicio completo — lubricación, calibración ejes",type:"routine"},
      {date:"Jun 2023",desc:"Reemplazo dress-pack Eje 6 completo",type:"major"},
      {date:"Ene 2022",desc:"Encoder Eje 3 reemplazado por fallo",type:"major"},
      {date:"Jul 2021",desc:"Actualización firmware KRC4 v8.3",type:"routine"}
    ]},
  timeline:[
    {date:"2016",text:"Instalación en línea soldadura Augsburg",color:"#00e676"},
    {date:"2019",text:"Overhaul completo a 25,000h",color:"#18ffff"},
    {date:"2024",text:"Planta anuncia cierre — robot parado",color:"#ff6e40"},
    {date:"2025",text:"Incluido en lote subasta Troostwijk",color:"#ffd740"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"available",electricalSchemas:"partial",hydraulicDiagram:"pending",ceCertificate:"available",serviceHistory:"partial",realPhotos:"pending"},
  verdict:{action:"COMPRAR",summary:"Robot industrial con historial verificable. Horas altas pero mantenimiento consistente. Margen estimado 52%. Riesgo: dress-pack y motor Eje 1.",redFlags:["Motor Eje 1 cerca de límite de vida","Sin fotos verificadas del estado actual"]}
},
"aleo-solar": {
  confidence:"Baja",
  condition:{score:4,components:[
    {name:"Células fotovoltaicas",status:"wear",detail:"Degradación estimada 12-18%"},
    {name:"Marcos aluminio",status:"ok",detail:"Sin corrosión visible"},
    {name:"Junction boxes",status:"risk",detail:"⚠️ Verificar sellado IP67"},
    {name:"Conectores MC4",status:"wear",detail:"Oxidación parcial reportada"},
    {name:"Vidrio templado",status:"ok",detail:"Sin microfisuras aparentes"}
  ],note:"Línea de producción cerrada en 2023. Paneles almacenados en nave sin clima controlado."},
  hours:{value:"⚠️ N/A — producción, no operación",type:"Stock sin instalar + retornos",lastProduction:"Ago 2023",environment:"Almacén industrial — sin climatización",saleReason:"Quiebra Aleo Solar GmbH"},
  maintenance:{lastService:"N/A",nextService:"N/A",partsChanged:"N/A",log:[]},
  timeline:[
    {date:"2021",text:"Última producción línea Prenzlau",color:"#18ffff"},
    {date:"2023",text:"Aleo Solar GmbH declara insolvencia",color:"#ff6e40"},
    {date:"2024",text:"Inventario trasladado a nave subasta",color:"#ffd740"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"pending",electricalSchemas:"pending",hydraulicDiagram:"pending",ceCertificate:"partial",serviceHistory:"pending",realPhotos:"pending"},
  verdict:{action:"NEGOCIAR",summary:"Gran volumen a precio residual pero alto riesgo de degradación. Requiere test eléctrico antes de pujar. Margen potencial 40% si paneles pasan QC.",redFlags:["Sin test eléctrico reciente","Almacenamiento sin control climático","Junction boxes sin verificar"]}
},
"bsh-esquiroz": {
  confidence:"Media",
  condition:{score:6,components:[
    {name:"Línea ensamblaje",status:"ok",detail:"Operativa hasta cierre"},
    {name:"PLCs Siemens S7-1500",status:"ok",detail:"Programa respaldado"},
    {name:"Robots ABB pick&place",status:"wear",detail:"~30,000h operación"},
    {name:"Cintas transportadoras",status:"wear",detail:"Bandas con desgaste visible"},
    {name:"Sistemas visión",status:"ok",detail:"Cognex — calibrados"}
  ],note:"Línea parada por cierre planta Esquíroz, no por fallo técnico."},
  hours:{value:"~45,000h línea",type:"Producción electrodomésticos 2 turnos",lastProduction:"Mar 2025",environment:"Sala limpia industrial",saleReason:"Relocalización producción BSH a Polonia"},
  maintenance:{lastService:"Feb 2025",nextService:"Según plan OEM",partsChanged:"Bandas transportadoras (2024), sensores proximidad (2023)",
    log:[
      {date:"Feb 2025",desc:"Último mantenimiento preventivo antes de cierre",type:"routine"},
      {date:"Sep 2024",desc:"Cambio bandas transportadoras sección 3-5",type:"major"},
      {date:"Mar 2023",desc:"Actualización software PLCs S7-1500",type:"routine"}
    ]},
  timeline:[
    {date:"2018",text:"Instalación línea completa planta Esquíroz",color:"#00e676"},
    {date:"2024",text:"BSH anuncia cierre y relocalización",color:"#ff6e40"},
    {date:"2025",text:"Subasta industrial programada",color:"#ffd740"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"available",electricalSchemas:"available",hydraulicDiagram:"partial",ceCertificate:"available",serviceHistory:"available",realPhotos:"partial"},
  verdict:{action:"COMPRAR",summary:"Línea completa con documentación sólida. Cierre por decisión corporativa, no fallo. Ideal para reventa en LATAM.",redFlags:["Robots ABB cerca de overhaul","Desmantelamiento puede dañar componentes"]}
},
"neapco-europe": {
  confidence:"Media",
  condition:{score:6,components:[
    {name:"CNC Mazak",status:"ok",detail:"Precisión dentro de tolerancia"},
    {name:"Línea forja",status:"wear",detail:"Matrices con desgaste avanzado"},
    {name:"Tratamiento térmico",status:"ok",detail:"Hornos operativos"},
    {name:"Sistemas hidráulicos",status:"wear",detail:"Fugas menores detectadas"},
    {name:"Control calidad CMM",status:"ok",detail:"Zeiss calibrada 2024"}
  ],note:"Planta automotriz cerrada. Maquinaria de alta precisión para ejes de transmisión."},
  hours:{value:"~52,000h",type:"Producción automotriz 3 turnos",lastProduction:"Nov 2024",environment:"Planta automotriz pesada",saleReason:"Reestructuración Neapco Europe"},
  maintenance:{lastService:"Oct 2024",nextService:"Vencido",partsChanged:"Matrices forja (2024), bombas hidráulicas (2023)",
    log:[
      {date:"Oct 2024",desc:"Mantenimiento preventivo pre-cierre",type:"routine"},
      {date:"Jun 2024",desc:"Reemplazo matrices forja principales",type:"major"},
      {date:"Feb 2023",desc:"Overhaul sistema hidráulico central",type:"major"}
    ]},
  timeline:[
    {date:"2012",text:"Instalación línea producción ejes",color:"#00e676"},
    {date:"2023",text:"Neapco anuncia reestructuración",color:"#ffd740"},
    {date:"2024",text:"Cierre planta — activos a subasta",color:"#ff6e40"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"partial",electricalSchemas:"partial",hydraulicDiagram:"available",ceCertificate:"available",serviceHistory:"partial",realPhotos:"pending"},
  verdict:{action:"COMPRAR",summary:"CNC y CMM de alta gama. Matrices requieren inversión pero el core (Mazak+Zeiss) tiene alto valor reventa.",redFlags:["Fugas hidráulicas requieren evaluación","Horas altas en línea forja"]}
},
"frieslandcampina": {
  confidence:"Media",
  condition:{score:7,components:[
    {name:"Pasteurizadores",status:"ok",detail:"Acero inox 316L — sin corrosión"},
    {name:"Llenadoras Tetra Pak",status:"ok",detail:"Últimas 2 revisadas 2024"},
    {name:"CIP (Clean-in-Place)",status:"ok",detail:"Automatizado, funcional"},
    {name:"Compresores NH3",status:"wear",detail:"Uno de tres requiere overhaul"},
    {name:"Tanques almacenamiento",status:"ok",detail:"Certificados vigentes"}
  ],note:"Planta láctea cerrada por consolidación. Equipo food-grade en buen estado."},
  hours:{value:"~35,000h",type:"Producción láctea continua",lastProduction:"Ene 2025",environment:"Sala blanca alimentaria",saleReason:"Consolidación operaciones FrieslandCampina"},
  maintenance:{lastService:"Dic 2024",nextService:"Según plan",partsChanged:"Sellos llenadoras (2024), válvulas CIP (2023)",
    log:[
      {date:"Dic 2024",desc:"Mantenimiento completo pre-cierre",type:"routine"},
      {date:"Jul 2024",desc:"Cambio sellos llenadoras Tetra Pak",type:"routine"},
      {date:"Mar 2023",desc:"Overhaul compresor NH3 #2",type:"major"}
    ]},
  timeline:[
    {date:"2015",text:"Modernización línea llenado",color:"#00e676"},
    {date:"2024",text:"Anuncio consolidación plantas",color:"#ffd740"},
    {date:"2025",text:"Subasta activos planta",color:"#ff6e40"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"available",electricalSchemas:"available",hydraulicDiagram:"available",ceCertificate:"available",serviceHistory:"available",realPhotos:"partial"},
  verdict:{action:"COMPRAR",summary:"Equipo food-grade premium con documentación completa. Alta demanda en LATAM para plantas lácteas.",redFlags:["Compresor NH3 #1 necesita overhaul","Certificaciones food-grade pueden requerir renovación"]}
},
"eyrise-smart-glass": {
  confidence:"Baja",
  condition:{score:5,components:[
    {name:"Línea laminación",status:"wear",detail:"Rodillos con desgaste"},
    {name:"Controladores electrocrom.",status:"ok",detail:"Software propietario"},
    {name:"Cámara vacío",status:"ok",detail:"Sellado verificado"},
    {name:"Sistema coating",status:"risk",detail:"⚠️ Tecnología propietaria"},
    {name:"Horno templado",status:"ok",detail:"Operativo"}
  ],note:"Tecnología electrocrómico de nicho. Riesgo: dependencia de IP propietaria."},
  hours:{value:"~12,000h",type:"Producción especializada bajo demanda",lastProduction:"Sep 2024",environment:"Sala limpia",saleReason:"Cierre operaciones eyrise B.V."},
  maintenance:{lastService:"Ago 2024",nextService:"N/A",partsChanged:"Rodillos laminación (2024)",log:[
    {date:"Ago 2024",desc:"Último servicio antes cierre",type:"routine"},
    {date:"Feb 2024",desc:"Cambio rodillos laminación",type:"major"}
  ]},
  timeline:[
    {date:"2019",text:"Instalación línea producción",color:"#00e676"},
    {date:"2024",text:"eyrise B.V. cesa operaciones",color:"#ff6e40"}
  ],
  docs:{operatorManual:"partial",maintenanceManual:"partial",electricalSchemas:"pending",hydraulicDiagram:"pending",ceCertificate:"available",serviceHistory:"partial",realPhotos:"pending"},
  verdict:{action:"PRECAUCION",summary:"Tecnología interesante pero IP propietaria limita reventa. Solo viable si se adquiere licencia o know-how.",redFlags:["Software propietario sin licencia transferible","Mercado muy nicho","Pocos técnicos cualificados"]}
},
"ti-group-automotive": {
  confidence:"Media",
  condition:{score:6,components:[
    {name:"Extrusoras tubería",status:"ok",detail:"Desgaste normal husillo"},
    {name:"Máquinas conformado",status:"ok",detail:"Tolerancias aceptables"},
    {name:"Bancos de prueba",status:"ok",detail:"Certificados válidos"},
    {name:"Soldadura láser",status:"wear",detail:"Fuente láser ~18,000h"},
    {name:"Robots manipulación",status:"ok",detail:"FANUC — operativos"}
  ],note:"Planta automotriz de componentes fuel/brake. Maquinaria especializada."},
  hours:{value:"~40,000h",type:"Producción automotriz 2 turnos",lastProduction:"Feb 2025",environment:"Planta industrial estándar",saleReason:"Reestructuración TI Group"},
  maintenance:{lastService:"Ene 2025",nextService:"Pendiente",partsChanged:"Husillo extrusora #3 (2024), óptica láser (2023)",log:[
    {date:"Ene 2025",desc:"Mantenimiento preventivo completo",type:"routine"},
    {date:"Aug 2024",desc:"Cambio husillo extrusora #3",type:"major"},
    {date:"Mar 2023",desc:"Reemplazo óptica soldadura láser",type:"major"}
  ]},
  timeline:[
    {date:"2014",text:"Instalación línea producción",color:"#00e676"},
    {date:"2024",text:"TI Group reestructuración",color:"#ffd740"},
    {date:"2025",text:"Activos a subasta",color:"#ff6e40"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"available",electricalSchemas:"partial",hydraulicDiagram:"partial",ceCertificate:"available",serviceHistory:"partial",realPhotos:"pending"},
  verdict:{action:"COMPRAR",summary:"Extrusoras y robots FANUC tienen fuerte mercado secundario. Láser requiere evaluación fuente.",redFlags:["Fuente láser cerca de fin de vida","Especialización automotriz limita compradores"]}
},
"obeikan-mdf": {
  confidence:"Baja",
  condition:{score:5,components:[
    {name:"Prensa continua",status:"wear",detail:"Bandas con ~25,000h"},
    {name:"Refinadores",status:"wear",detail:"Discos desgaste avanzado"},
    {name:"Formadora",status:"ok",detail:"Operativa"},
    {name:"Lijadoras",status:"ok",detail:"Calibradas 2024"},
    {name:"Sistema resina",status:"risk",detail:"⚠️ Requiere limpieza profunda"}
  ],note:"Planta MDF Arabia Saudita. Logística compleja por ubicación."},
  hours:{value:"~60,000h",type:"Producción MDF continua 24/7",lastProduction:"Dic 2024",environment:"Desierto — alta temperatura y polvo",saleReason:"Modernización planta Obeikan"},
  maintenance:{lastService:"Nov 2024",nextService:"Vencido",partsChanged:"Discos refinadores (2024), bandas prensa (2023)",log:[
    {date:"Nov 2024",desc:"Mantenimiento pre-parada",type:"routine"},
    {date:"Jun 2024",desc:"Cambio discos refinadores",type:"major"},
    {date:"Feb 2023",desc:"Reemplazo bandas prensa continua",type:"major"}
  ]},
  timeline:[
    {date:"2010",text:"Instalación planta MDF",color:"#00e676"},
    {date:"2024",text:"Obeikan inicia modernización",color:"#ffd740"},
    {date:"2025",text:"Equipo antiguo a subasta",color:"#ff6e40"}
  ],
  docs:{operatorManual:"partial",maintenanceManual:"partial",electricalSchemas:"pending",hydraulicDiagram:"partial",ceCertificate:"pending",serviceHistory:"partial",realPhotos:"pending"},
  verdict:{action:"NEGOCIAR",summary:"Equipo con horas altas pero funcional. Logística desde Arabia es costosa. Solo rentable con descuento >40%.",redFlags:["60,000h en ambiente extremo","Logística compleja desde KSA","Sin certificado CE"]}
},
"torello-holzher": {
  confidence:"Media",
  condition:{score:7,components:[
    {name:"CNC Holz-Her Dynestic",status:"ok",detail:"Precisión dentro de spec"},
    {name:"Sierra seccionadora",status:"ok",detail:"Discos cambiados 2024"},
    {name:"Enchapadora cantos",status:"ok",detail:"Operativa — cola PUR"},
    {name:"Aspiración",status:"wear",detail:"Filtros saturados"},
    {name:"Software CAD/CAM",status:"ok",detail:"Licencias transferibles"}
  ],note:"Taller carpintería industrial cerrado. Maquinaria Holz-Her premium."},
  hours:{value:"~15,000h",type:"Producción mueble/carpintería 1 turno",lastProduction:"Mar 2025",environment:"Taller industrial climatizado",saleReason:"Jubilación propietario Torello"},
  maintenance:{lastService:"Feb 2025",nextService:"Según plan OEM",partsChanged:"Discos sierra (2024), boquillas cola (2024)",log:[
    {date:"Feb 2025",desc:"Servicio completo pre-cierre",type:"routine"},
    {date:"Oct 2024",desc:"Cambio discos sierra y calibración CNC",type:"routine"},
    {date:"May 2023",desc:"Actualización software CAD/CAM",type:"routine"}
  ]},
  timeline:[
    {date:"2017",text:"Adquisición CNC Holz-Her nuevo",color:"#00e676"},
    {date:"2024",text:"Propietario anuncia jubilación",color:"#ffd740"},
    {date:"2025",text:"Liquidación taller completo",color:"#ff6e40"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"available",electricalSchemas:"available",hydraulicDiagram:"pending",ceCertificate:"available",serviceHistory:"available",realPhotos:"partial"},
  verdict:{action:"COMPRAR",summary:"Equipo premium con pocas horas y buen mantenimiento. Mercado carpintería LATAM muy demandante. Margen >55%.",redFlags:["Filtros aspiración requieren cambio inmediato"]}
},
"all-in-foods": {
  confidence:"Baja",
  condition:{score:5,components:[
    {name:"Línea empaque",status:"ok",detail:"Multivac — funcional"},
    {name:"Mezcladores",status:"wear",detail:"Sellos desgastados"},
    {name:"Detector metales",status:"ok",detail:"Calibrado"},
    {name:"Cinta pesaje",status:"wear",detail:"Célula carga descalibrada"},
    {name:"Enfriadores",status:"ok",detail:"Gas R-404A"}
  ],note:"Planta alimentaria cerrada. Equipo food-grade requiere sanitización."},
  hours:{value:"~28,000h",type:"Producción alimentaria 2 turnos",lastProduction:"Oct 2024",environment:"Sala alimentaria controlada",saleReason:"Quiebra All-in Foods"},
  maintenance:{lastService:"Sep 2024",nextService:"Vencido",partsChanged:"Sellos Multivac (2024)",log:[
    {date:"Sep 2024",desc:"Último mantenimiento antes cierre",type:"routine"},
    {date:"Mar 2024",desc:"Cambio sellos empacadora Multivac",type:"routine"}
  ]},
  timeline:[
    {date:"2018",text:"Instalación línea completa",color:"#00e676"},
    {date:"2024",text:"All-in Foods declara quiebra",color:"#ff6e40"}
  ],
  docs:{operatorManual:"available",maintenanceManual:"partial",electricalSchemas:"pending",hydraulicDiagram:"pending",ceCertificate:"available",serviceHistory:"partial",realPhotos:"pending"},
  verdict:{action:"NEGOCIAR",summary:"Multivac tiene buen mercado secundario. Resto de línea necesita evaluación. Sanitización obligatoria.",redFlags:["Gas refrigerante R-404A en phase-out","Sanitización costosa","Sin historial completo"]}
},
"balta-industries": {
  confidence:"Baja",
  condition:{score:4,components:[
    {name:"Telares Jacquard",status:"wear",detail:"Alto desgaste mecánico"},
    {name:"Línea tufting",status:"wear",detail:"Agujas al 60% vida"},
    {name:"Secado/acabado",status:"ok",detail:"Hornos funcionales"},
    {name:"Backing",status:"wear",detail:"Rodillos desgastados"},
    {name:"Corte automático",status:"ok",detail:"Operativo"}
  ],note:"Planta textil alfombras. Maquinaria especializada de nicho."},
  hours:{value:"~55,000h",type:"Producción textil continua",lastProduction:"Nov 2024",environment:"Planta textil — fibras en ambiente",saleReason:"Reestructuración Balta Industries"},
  maintenance:{lastService:"Oct 2024",nextService:"Vencido",partsChanged:"Agujas tufting (2024), correas telares (2023)",log:[
    {date:"Oct 2024",desc:"Mantenimiento pre-cierre",type:"routine"},
    {date:"Jul 2024",desc:"Cambio agujas tufting parcial",type:"major"}
  ]},
  timeline:[
    {date:"2008",text:"Instalación línea producción",color:"#00e676"},
    {date:"2024",text:"Balta reestructura operaciones",color:"#ff6e40"}
  ],
  docs:{operatorManual:"partial",maintenanceManual:"pending",electricalSchemas:"pending",hydraulicDiagram:"pending",ceCertificate:"available",serviceHistory:"pending",realPhotos:"pending"},
  verdict:{action:"MONITOREAR",summary:"Mercado textil muy específico. Solo rentable si hay comprador identificado en LATAM/Asia.",redFlags:["Horas muy altas","Mercado nicho","Documentación escasa"]}
},
"ford-saarlouis": {
  confidence: "Alta",
  condition: { score: 9, components: [
    { name: "450+ Robots KUKA KR Quantec", status: "ok", detail: "Serie 2018-2022. <15k horas." },
    { name: "Celdas Soldadura Láser", status: "ok", detail: "IPG Photonics 6kW — estado excelente" },
    { name: "Línea de Prensas Schuler", status: "ok", detail: "5000t progresiva — automatizada" },
    { name: "Sistemas Visión ISRA", status: "ok", detail: "Calibración 2024" }
  ], note: "Cierre estratégico Ford Saarlouis. Activos de primer nivel mundial." },
  hours: { value: "<15,000h (Robots)", type: "Producción automotriz premium", lastProduction: "Jun 2025", environment: "Sala blanca automotriz", saleReason: "Cierre planta Ford Saarlouis" },
  maintenance: { lastService: "May 2025", nextService: "Programado Oct 2025", partsChanged: "Filtros láser (2024), Aceite reductor (2025)",
    log: [
      { date: "May 2025", desc: "Servicio preventivo anual por KUKA Service", type: "routine" },
      { date: "Ene 2024", desc: "Actualización firmware controladores KRC4", type: "routine" }
    ]},
  timeline: [
    { date: "2018", text: "Instalación línea carrocerías Focus", color: "#00e676" },
    { date: "2024", text: "Ford anuncia cese definitivo", color: "#ff6e40" },
    { date: "2025", text: "Liquidación total de activos", color: "#ffd740" }
  ],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "available", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "full_sap_export", realPhotos: "verified_hd_available" },
  financials: { buyPrice: "€8,500,000", sellPrice: "€18,200,000", margin: "53%", roi: "114%", extractionCost: "€450,000", transport: "€180,000", customs: "N/A (EU)" },
  potentialClients: ["Stellantis (Marruecos/Polonia)", "Volkswagen", "Rivian", "Lucid Motors", "Gestamp", "Magna"],
  verdict: { action: "COMPRAR", summary: "Oportunidad industrial de la década. Robots con vida remanente del 80%. Reventa garantizada.", redFlags: ["Logística crítica: requiere 40+ camiones y equipo pesado"] }
},
"goodyear-fulda": {
  confidence: "Media",
  condition: { score: 6, components: [
    { name: "Mezcladores Banbury", status: "wear", detail: "Desgaste en sellos de presión" },
    { name: "Extrusoras VMI", status: "ok", detail: "Configuración alta velocidad" },
    { name: "Prensas de Curado", status: "wear", detail: "Resistencias al 70% vida" }
  ], note: "Liquidación Goodyear Fulda. Maquinaria muy pesada." },
  hours: { value: "~55,000h", type: "Producción neumáticos 24/7", lastProduction: "Feb 2025", environment: "Planta caucho — alta temperatura", saleReason: "Insolvencia / Reestructuración" },
  maintenance: { lastService: "Dic 2024", nextService: "Vencido", partsChanged: "Rodillos mezcladores (2023)", log: [] },
  timeline: [
    { date: "2010", text: "Instalación línea pesada", color: "#00e676" },
    { date: "2024", text: "Anuncio cierre planta", color: "#ff6e40" }
  ],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "partial", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "partial", realPhotos: "available" },
  financials: { buyPrice: "€3,200,000", sellPrice: "€7,800,000", margin: "58%", roi: "143%", extractionCost: "€280,000", transport: "€120,000", customs: "€55,000 (Export India/Turkey)" },
  potentialClients: ["Petlas (Turquía)", "MRF (India)", "Michelin (Expansión Asia)", "Pirelli"],
  verdict: { action: "NEGOCIAR", summary: "Valor residual muy bajo. Margen alto si se gestiona logística pesada eficientemente.", redFlags: ["Cimentaciones profundas: extracción costosa", "Ambiente contaminado"] }
},
"thyssenkrupp-galmed": {
  confidence: "Alta",
  condition: { score: 8, components: [
    { name: "Línea Galvanizado", status: "ok", detail: "Modernizada 2021" },
    { name: "Sistemas Control PCS7", status: "ok", detail: "Licencias vigentes" },
    { name: "Celdas de Zinc", status: "ok", detail: "Revestimiento renovado" }
  ], note: "Planta Sagunto. Cierre por estrategia corporativa, no por obsolescencia." },
  hours: { value: "Operativa", type: "Galvanizado continuo", lastProduction: "Mar 2025", environment: "Siderúrgica controlada", saleReason: "Cierre estratégico Thyssenkrupp" },
  maintenance: { lastService: "Feb 2025", nextService: "Programado", partsChanged: "Sensores espesor (2024)", log: [] },
  timeline: [
    { date: "2021", text: "Upgrade tecnológico completo", color: "#18ffff" },
    { date: "2025", text: "Cierre definitivo Galmed", color: "#ff6e40" }
  ],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "full", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "full", realPhotos: "verified_hd_available" },
  financials: { buyPrice: "€12,000,000", sellPrice: "€28,000,000", margin: "57%", roi: "133%", extractionCost: "€1,200,000", transport: "€650,000", customs: "N/A" },
  potentialClients: ["Maghreb Steel (Marruecos)", "ArcelorMittal", "Siderúrgicas Sudáfrica", "US Steel"],
  verdict: { action: "COMPRAR", summary: "Planta llave en mano única. Activos casi nuevos. Ideal para mercados emergentes con demanda de acero galvanizado.", redFlags: ["Volumen masivo: requiere puerto cercano para exportación"] }
},
"marelli-crevalcore": {
  confidence: "Media",
  condition: { score: 7, components: [
    { name: "12 Inyectoras Bühler", status: "ok", detail: "1000t a 3200t" },
    { name: "Robots ABB Foundry", status: "ok", detail: "Protección IP67 extrema" },
    { name: "Hornos StrikoWestofen", status: "wear", detail: "Refractario al 60%" }
  ], note: "Especialistas en aluminio automotriz. Italia." },
  hours: { value: "~42,000h", type: "Fundición presión 3 turnos", lastProduction: "Feb 2025", environment: "Fundición — calor extremo", saleReason: "Reestructuración Marelli" },
  maintenance: { lastService: "Ene 2025", nextService: "Vencido", partsChanged: "Platos inyección (2024)", log: [] },
  timeline: [{ date: "2015", text: "Instalación celdas Bühler", color: "#00e676" }],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "available", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "full", realPhotos: "available" },
  financials: { buyPrice: "€4,500,000", sellPrice: "€8,700,000", margin: "48%", roi: "93%", extractionCost: "€150,000", transport: "€220,000", customs: "€35,000" },
  potentialClients: ["Nemak", "Teksid", "Ryobi", "Integradores China/India"],
  verdict: { action: "COMPRAR", summary: "Maquinaria Bühler mantiene valor de reventa alto. Sector fundición aluminio en auge por aligeramiento vehículos.", redFlags: ["Refractarios hornos necesitan cambio", "Contaminación por aceites"] }
},
"michelin-tours": {
  confidence: "Alta",
  condition: { score: 8, components: [
    { name: "Silos Inox 316L", status: "ok", detail: "Capacidad 50m3 c/u" },
    { name: "Mezcladores Alta Presión", status: "ok", detail: "Grado farmacéutico/químico" },
    { name: "Líneas de Llenado", status: "ok", detail: "Automáticas, CIP incluído" }
  ], note: "Planta Michelin Francia. Activos versátiles para química/alimentación." },
  hours: { value: "~25,000h", type: "Producción química/mezcla", lastProduction: "Abr 2025", environment: "Sala controlada", saleReason: "Consolidación Michelin" },
  maintenance: { lastService: "Mar 2025", nextService: "Oct 2025", partsChanged: "Sellos mecánicos (2025)", log: [] },
  timeline: [{ date: "2019", text: "Inauguración nueva nave mezcla", color: "#18ffff" }],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "full", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "full", realPhotos: "verified_hd_available" },
  financials: { buyPrice: "€2,100,000", sellPrice: "€5,200,000", margin: "59%", roi: "147%", extractionCost: "€85,000", transport: "€45,000", customs: "N/A" },
  potentialClients: ["Nestlé", "Danone", "BASF", "L'Oréal", "Empresas lácteas LATAM"],
  verdict: { action: "COMPRAR", summary: "Equipos premium de acero inox. Muy fácil de reubicar y vender por separado. Margen neto muy alto.", redFlags: ["Desmontaje silos requiere permisos especiales transporte"] }
},
"liberty-steel-galati": {
  confidence: "Media",
  condition: { score: 5, components: [
    { name: "Tren Laminado Frío", status: "wear", detail: "Rodillos requieren rectificado" },
    { name: "Bobinadoras Pesadas", status: "ok", detail: "Capacidad 30t" }
  ], note: "Rumanía. Activos excedentes por reestructuración." },
  hours: { value: "~75,000h", type: "Siderúrgica pesada", lastProduction: "Dic 2024", environment: "Ambiente corrosivo", saleReason: "Crisis financiera Liberty Steel" },
  maintenance: { lastService: "Oct 2024", nextService: "Vencido", partsChanged: "Motores tracción (2023)", log: [] },
  timeline: [{ date: "1980/2005", text: "Instalación / Retrofit completo", color: "#ffd740" }],
  docs: { operatorManual: "partial", maintenanceManual: "partial", electricalSchemas: "pending", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "partial", realPhotos: "available" },
  financials: { buyPrice: "€6,500,000", sellPrice: "€11,200,000", margin: "42%", roi: "72%", extractionCost: "€850,000", transport: "€1,100,000", customs: "€120,000" },
  potentialClients: ["Siderúrgicas Turquía", "India Steel", "China Steel", "Mercados emergentes"],
  verdict: { action: "NEGOCIAR", summary: "Solo para expertos en logística pesada. El valor del acero es alto, pero el flete desde Rumanía es el cuello de botella.", redFlags: ["Logística terrestre crítica", "Falta documentación eléctrica"] }
},
"vallourec-dusseldorf": {
  confidence: "Alta",
  condition: { score: 9, components: [
    { name: "Láser Tubo Trumpf", status: "ok", detail: "Modelo 2021 — <4k horas" },
    { name: "Bancos Prueba Hidro", status: "ok", detail: "Certificados API 2024" }
  ], note: "Referente en calidad. Alemania." },
  hours: { value: "<5,000h (Láser)", type: "Corte tubo alta precisión", lastProduction: "Jun 2025", environment: "Taller climatizado", saleReason: "Cierre Vallourec Alemania" },
  maintenance: { lastService: "May 2025", nextService: "Jun 2026", partsChanged: "Fuelle láser (2024)", log: [] },
  timeline: [{ date: "2021", text: "Instalación línea láser Trumpf", color: "#18ffff" }],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "full", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "full", realPhotos: "verified_hd_available" },
  financials: { buyPrice: "€1,800,000", sellPrice: "€3,500,000", margin: "48%", roi: "94%", extractionCost: "€25,000", transport: "€15,000", customs: "N/A" },
  potentialClients: ["Benteler", "Tenaris", "Automotrices Tier-1", "Empresas Oil&Gas"],
  verdict: { action: "COMPRAR", summary: "Maquinaria Trumpf de última generación. Riesgo casi nulo. Demanda masiva.", redFlags: ["Precio de entrada alto", "Subasta muy competitiva"] }
},
"zf-friedrichshafen": {
  confidence: "Alta",
  condition: { score: 9, components: [
    { name: "20 Grob G550 5-Ejes", status: "ok", detail: "Año 2019-2023. Estado impecable." },
    { name: "Líneas Lavado Dürr", status: "ok", detail: "Ciclo cerrado" }
  ], note: "Exceso de capacidad por cambio a EV." },
  hours: { value: "<8,000h husillo", type: "Mecanizado alta precisión", lastProduction: "Ene 2025", environment: "Planta climatizada", saleReason: "Transición a movilidad eléctrica" },
  maintenance: { lastService: "Dic 2024", nextService: "OEM plan", partsChanged: "Husillo G550 #4 (Garantía 2024)", log: [] },
  timeline: [{ date: "2020", text: "Plan expansión mecanizado térmico", color: "#00e676" }],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "available", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "full", realPhotos: "verified_hd_available" },
  financials: { buyPrice: "€9,200,000", sellPrice: "€16,500,000", margin: "44%", roi: "79%", extractionCost: "€60,000", transport: "€45,000", customs: "N/A" },
  potentialClients: ["SpaceX", "Boeing", "Airbus Tier-1", "Precision Machining México"],
  verdict: { action: "COMPRAR", summary: "Los Grob G550 son el 'Santo Grial' del mecanizado. Valor estable. Reventa rápida en sector aeroespacial.", redFlags: ["Configuración específica ZF puede requerir cambio de utillajes"] }
},
"allgaier-werke": {
  confidence: "Media",
  condition: { score: 6, components: [
    { name: "Prensa Schuler 5000t", status: "wear", detail: "Fisuras menores en bancada" },
    { name: "Transfer Automático", status: "ok", detail: "Gudel — operativo" }
  ], note: "Insolvencia Allgaier. Alemania." },
  hours: { value: "~65,000h", type: "Estampación gran tonelaje", lastProduction: "Nov 2024", environment: "Planta estampación", saleReason: "Insolvencia grupo Allgaier" },
  maintenance: { lastService: "Sep 2024", nextService: "Vencido", partsChanged: "Cojinetes biela (2023)", log: [] },
  timeline: [{ date: "2008", text: "Instalación prensa principal", color: "#ffd740" }],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "partial", hydraulicDiagram: "available", ceCertificate: "available", serviceHistory: "partial", realPhotos: "available" },
  financials: { buyPrice: "€1,500,000", sellPrice: "€4,200,000", margin: "64%", roi: "180%", extractionCost: "€450,000", transport: "€300,000", customs: "€85,000" },
  potentialClients: ["BYD México", "Tata Motors", "Empresas estampación China/Turquía"],
  verdict: { action: "COMPRAR", summary: "Inversión alta en logística pero el precio de adquisición es residual por insolvencia. Margen brutal.", redFlags: ["Desmontaje de 6-8 meses", "Requiere transporte especial por carretera y mar"] }
},
"bosch-electronics": {
  confidence: "Alta",
  condition: { score: 8, components: [
    { name: "6 Líneas SMT Fuji NXT III", status: "ok", detail: "Cabezales alta velocidad" },
    { name: "Hornos Reflow Rehm", status: "ok", detail: "Nitrógeno — 10 zonas" },
    { name: "AOI Koh Young", status: "ok", detail: "3D — última generación" }
  ], note: "Cierre líneas legacy componentes electrónicos." },
  hours: { value: "~12,000h", type: "Ensamblaje PCB alta densidad", lastProduction: "Feb 2025", environment: "Sala blanca ESD", saleReason: "Update tecnológico Bosch" },
  maintenance: { lastService: "Ene 2025", nextService: "Jul 2025", partsChanged: "Boquillas Fuji (Pack 1000 nuevas)", log: [] },
  timeline: [{ date: "2021", text: "Upgrade a NXT III", color: "#18ffff" }],
  docs: { operatorManual: "available", maintenanceManual: "available", electricalSchemas: "available", hydraulicDiagram: "N/A", ceCertificate: "available", serviceHistory: "full", realPhotos: "verified_hd_available" },
  financials: { buyPrice: "€2,500,000", sellPrice: "€4,800,000", margin: "48%", roi: "92%", extractionCost: "€35,000", transport: "€55,000", customs: "€20,000 (Export Vietnam)" },
  potentialClients: ["Foxconn", "Pegatron", "Jabil", "Contract Manufacturers México"],
  verdict: { action: "COMPRAR", summary: "Equipos SMT muy líquidos. Se venden por partes o líneas completas fácilmente. Estado impecable.", redFlags: ["Licencias software Fuji deben ser negociadas con OEM"] }
}
};

var page = window.location.pathname.replace(/.*\//,'').replace('.html','');
if(DB[page]) window.INTEL_DATA = DB[page];
window.ALL_INTEL_DB = DB; // Export for dashboard
})();
