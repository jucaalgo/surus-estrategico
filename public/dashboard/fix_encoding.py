import os
import re

path = r"c:\Users\JUAN CARLOS\Documents\MarketingSkils\surus-estrategico\public\dashboard\index.html"

with open(path, "rb") as f:
    bytes_content = f.read()

# Try to decode as UTF-8
try:
    content = bytes_content.decode("utf-8")
    print("Decoded successfully as UTF-8")
except Exception as e:
    print("UTF-8 decode failed, trying ISO-8859-1:", e)
    content = bytes_content.decode("iso-8859-1")

# Clean double CR line endings
content = content.replace("\r\r\n", "\n").replace("\r\n", "\n")

# Replacements dictionary for Latin-1 double-encoded UTF-8 (mojibake)
replacements = {
    'DÃ¼RR': 'DÜRR',
    'GÃ¼DEL': 'GÜDEL',
    'StÃ¤ubli': 'Stäubli',
    'LÃ¼nen': 'Lünen',
    'LÃ¼nen': 'Lünen',
    'LÃ¼nders': 'Lünders',
    'DÃ¼ren': 'Düren',
    'TÃºnez': 'Túnez',
    'SudÃ¡frica': 'Sudáfrica',
    'Ã¡frica': 'áfrica',
    'Ãfrica': 'África',
    'Ã frica': 'África',
    'Asiático': 'Asiático',
    'construcciÃ³n': 'construcción',
    'transiciÃ³n': 'transición',
    'expansiÃ³n': 'expansión',
    'eÃ³licos': 'eólicos',
    'â†\'': '→',
    'â†"': '↓',
    'â€"': '—',
    'â€™': "'",
    'â€œ': '"',
    'â€ ': '"',
    'Ã—': '×',
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ã¡': 'á',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã¶': 'ö',
    'Ã¼': 'ü',
    'Ã¤': 'ä',
    'Å¡': 'š',
    'Å ': 'Š',
    '?frica': 'África',
    'Stubli': 'Stäubli',
    'Refineras': 'Refinerías',
    'transicin': 'transición',
    'alimentaria ?frica': 'alimentaria África',
    'elicos': 'eólicos',
    'mueble Norte ?frica': 'mueble Norte África',
    'madera Norte ?frica': 'madera Norte África',
    'Sudfrica': 'Sudáfrica',
    'Asitico': 'Asiático',
    'construccin': 'construcción',
    'generadoras ?frica': 'generadoras África',
}

for key, val in replacements.items():
    content = content.replace(key, val)

# Write back as clean UTF-8
with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print(f"Fixed encoding in index.html. Wrote {len(content)} characters.")

# Quick search to see if any broken chars remain
remaining = re.findall(r'Ã[¡-¼]|â€|Å[¡ ]|', content)
if remaining:
    print(f"WARNING: {len(remaining)} possible broken characters remain.")
    for r in remaining[:10]:
        print(f"  Found: '{r}'")
else:
    print("SUCCESS: No broken characters detected!")
