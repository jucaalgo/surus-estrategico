const fs = require('fs');

const realBuyersMap = {
  'liberty-galati': ['ArcelorMittal (Rumanía/Europa)', 'Metinvest (Ucrania)', 'US Steel (Europa)', 'JSW Steel', 'Liberty House Group'],
  'goodyear-fulda': ['Michelin', 'Pirelli', 'Continental AG', 'Bridgestone', 'Apollo Tyres', 'Hankook Tire'],
  'allgaier-automotive': ['Gestamp Automoción', 'CIE Automotive', 'Magna International', 'Benteler Automotive', 'Martinrea International'],
  'ford-saarlouis-robots': ['KUKA Robotics (Refurbishing)', 'Stellantis (Europa)', 'Tesla (Giga Berlin)', 'Rivian', 'Valiant TMS'],
  'marelli-casting': ['Nemak', 'Teksid (Stellantis)', 'GF Casting Solutions', 'Ryobi Die Casting', 'Linamar'],
  'zf-precision': ['Airbus Operations GmbH', 'MTU Aero Engines', 'Renishaw', 'Schaeffler', 'Sandvik Coromant'],
  'bosch-smt': ['Foxconn (Hon Hai)', 'Flex Ltd.', 'Jabil Circuit', 'Celestica', 'Sanmina Corporation'],
  'michelin-mixing': ['HF Mixing Group', 'Farrel Pomini', 'KraussMaffei', 'Zeppelin Systems', 'Coperion'],
  'bsh-esquiroz-2026': ['Beko (Arçelik)', 'Haier Europe', 'Electrolux', 'Whirlpool EMEA', 'Miele'],
  'vallourec-tube': ['Tenaris', 'TMK Group', 'Tubos Reunidos', 'Salzgitter AG', 'Benteler Steel/Tube'],
  'cat-336d-ocana': ['Ferrovial Construcción', 'ACS Group', 'Sacyr', 'FCC Construcción', 'Ritchie Bros (Dealer)'],
  'liebherr-ltm-ocana': ['Grúas Roxu', 'Eurogrúas', 'Mammoet', 'Sarens', 'ALE Heavylift'],
  'dmg-mori-ctx-france': ['Safran', 'Thales Group', 'Fidia S.p.A.', 'Fives Group', 'Mecachrome'],
  'okuma-mx60-terrassa': ['Flowserve', 'Emerson Electric', 'ITP Aero', 'Danobat Group', 'Nicolás Correa'],
  'golden-laser-romania': ['Inditex (Proveedores)', 'H&M (Proveedores)', 'Lear Corporation', 'Faurecia', 'Grupo Antolin'],
  'koyama-elorrio': ['Fagor Ederlan', 'Draxton', 'Condals Foundry', 'Grupo Castmetal', 'Componentes Vilanova'],
  'kleen-tek-bcn': ['Dürr Ecoclean', 'Karl Roll GmbH', 'BvL Oberflächentechnik', 'MecLav', 'Pero AG'],
  'volvo-l150g-ocana': ['Holcim', 'Cemex', 'HeidelbergCement', 'Tarmac', 'Grupo Puma'],
  'mori-seiki-sh5000-zestoa': ['GKN Driveline', 'BorgWarner', 'Dana Incorporated', 'Linamar', 'American Axle (AAM)'],
  'kira-kn40-terrassa': ['Straumann Group', 'Zimmer Biomet', 'Medtronic', 'Stryker', 'Dentsply Sirona'],
  'thyssenkrupp-galmed': ['ArcelorMittal Sagunto', 'Tata Steel Europe', 'SSAB', 'voestalpine', 'NLMK Group'],
  'ae-group-aluminio': ['Nemak Europe', 'Martinrea Honsel', 'KSM Castings Group', 'Handtmann', 'Aludyne'],
  'lumileds-semiconductores': ['Osram', 'Cree LED', 'Nichia Corporation', 'Seoul Semiconductor', 'Epistar'],
  'hilco-seamless-tube': ['Tubacex', 'Productos Tubulares', 'Mannesmann Stainless Tubes', 'Sandvik Materials Technology', 'Centravis'],
  'allgaier-werke-cnc': ['Schuler Group', 'Aida Engineering', 'Komatsu', 'Fagor Arrasate', 'Andritz Group'],
  'allgaier-france-prensas': ['Gestamp Automoción', 'Snop (Groupe FSD)', 'Magnetto (CLN Group)', 'Tower International', 'Cosma International'],
  'prensas-saarlouis': ['Kirchhoff Automotive', 'Benteler Automotive', 'Voestalpine Automotive Components', 'Gestamp', 'Magna Cosma'],
  'marel-carne-cz': ['JBS', 'Tyson Foods', 'WH Group', 'Danish Crown', 'Vion Food Group'],
  'zeewolde-eolico': ['Vestas (Refurbishing)', 'Siemens Gamesa', 'Nordex', 'E.ON', 'RWE Renewables'],
  'ritchie-ocana': ['Ferrovial Construcción', 'Dragados', 'OHL', 'Acciona Infraestructuras', 'Sacyr'],
  'ritchie-southeast-us': ['Bechtel', 'Fluor Corporation', 'Turner Construction', 'Skanska USA', 'Kiewit'],
  'ritchie-quebec': ['SNC-Lavalin', 'PCL Construction', 'EllisDon', 'Pomerleau', 'Aecon Group'],
  'azteca-ceramicas': ['Porcelanosa Grupo', 'Pamesa Cerámica', 'Grupo STN', 'Roca', 'Mohawk Industries'],
  'frost-trol-refrigeracion': ['Carrier Commercial Refrigeration', 'Epta Group', 'Arneg', 'Danfoss', 'Haier Biomedical'],
  'harinas-bufort': ['Grupo Siro', 'Cerealto', 'Harineras Villamayor', 'Grupo Harinero', 'Oromas'],
  'troostwijk-belgium': ['Barry Callebaut', 'Puratos', 'Lotus Bakeries', 'Godiva Chocolatier', 'Neuhaus'],
  'ritchie-las-vegas': ['Kiewit', 'McCarthy Building Companies', 'Tutor Perini', 'Clark Construction', 'Mortenson'],
  'govplanet-generators': ['Caterpillar (Used)', 'Cummins', 'Aggreko', 'Sunbelt Rentals', 'United Rentals']
};

const filePath = 'public/dashboard/intel-data.js';
let content = fs.readFileSync(filePath, 'utf8');

for (const [id, buyers] of Object.entries(realBuyersMap)) {
    const regex = new RegExp(`"id":\\s*"${id}"[\\s\\S]*?"potential_clients":\\s*\\[([\\s\\S]*?)\\]`, 'g');
    content = content.replace(regex, (match) => {
        const replacementBuyers = buyers.map(b => `        "${b}"`).join(',\n');
        return match.replace(/"potential_clients":\s*\[[\s\S]*?\]/, `"potential_clients": [\n${replacementBuyers}\n      ]`);
    });
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Real buyers injected into intel-data.js successfully.');
