const fs = require('fs');

const filePath = './public/dashboard/intel-data.js';
let content = fs.readFileSync(filePath, 'utf8');

// The file format is:
// const INTEL_DATA = {
//   opportunities: [ ... ]
// };
// We will extract the JSON part, fix URLs, sort, and write back.

// Extract JSON
const jsonStartStr = 'const INTEL_DATA = ';
const jsonStartIndex = content.indexOf(jsonStartStr) + jsonStartStr.length;
const jsonEndIndex = content.lastIndexOf(';');
let jsonStr = content.substring(jsonStartIndex, jsonEndIndex);

// It's a JS object, not strict JSON. Let's try to evaluate it.
let data;
try {
  data = eval('(' + jsonStr + ')');
} catch (e) {
  console.error("Failed to eval jsonStr:", e);
  process.exit(1);
}

// Fix broken links
const linkReplacements = {
  'https://maynards.com/auctions/goodyear-fulda-germany': 'https://maynards.com/',
  'https://www.netbid.com/en/magazine/private-treaty-sale-ford-saarlouis': 'https://www.netbid.com/en/',
  'https://www.marelli.com/news/': 'https://www.marelli.com/en/',
  'https://www.netbid.com/en/auctions/current/': 'https://www.netbid.com/en/',
  'https://www.bosch.com/news/': 'https://www.bosch.com/',
  'https://maynards.com/auctions/vallourec-dusseldorf/': 'https://maynards.com/',
  'https://www.rbauction.es/ocana': 'https://www.rbauction.es/',
  'https://www.surplex.com/es/subastas/maquinaria-metal': 'https://www.surplex.com/es/',
  'https://www.surplex.com/es/subastas/': 'https://www.surplex.com/es/',
  'https://www.levante-emv.com/economia/2024/05/16/thyssenkrupp-vende-planta-sagunto-network-steel-10245678.html': 'https://www.levante-emv.com/'
};

const imageReplacements = {
  'https://images.unsplash.com/photo-1565515267443-26f25ec2c623?auto=format&fit=crop&w=1200&q=80': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579453070058-29653835e975?auto=format&fit=crop&w=1200&q=80': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541625602330-2277a4c4b01d?auto=format&fit=crop&w=1200&q=80': 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531284528840-0bd34460f38b?auto=format&fit=crop&w=1200&q=80': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80'
};

data.opportunities.forEach(opp => {
  if (opp.links) {
    opp.links.forEach(l => {
      if (linkReplacements[l.url]) {
        l.url = linkReplacements[l.url];
      }
    });
  }
  if (opp.images) {
    opp.images.forEach(img => {
      if (imageReplacements[img.url]) {
        img.url = imageReplacements[img.url];
      }
    });
  }
});

// Sort by Priority (P0 > P1) and then by ROI descending
data.opportunities.sort((a, b) => {
  if (a.priority !== b.priority) {
    return a.priority < b.priority ? -1 : 1; // "P0" comes before "P1"
  }
  return b.financials.roi_num - a.financials.roi_num;
});

const header = `/**
 * 🧠 SURUS INVERSA - TERMINAL DE INTELIGENCIA ESTRATÉGICA v2.5
 * Última actualización: 17 Mayo 2026
 * 
 * DATOS DE ACTUACIÓN "BRUTALMENTE COMPLETOS"
 * Incluye: Manuales, Mantenimiento, Finanzas Proyectadas, Logística y Clientes.
 */

const INTEL_DATA = `;

const newContent = header + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(filePath, newContent, 'utf8');

console.log("Updated intel-data.js successfully.");
