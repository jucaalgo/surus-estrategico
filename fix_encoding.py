import os
import re

def fix_content(content):
    # Common UTF-8 to Latin-1/Windows-1252 corruption patterns
    replacements = {
        'Ã¡': 'á',
        'Ã©': 'é',
        'Ã­': 'í',
        'Ã³': 'ó',
        'Ãº': 'ú',
        'Ã±': 'ñ',
        'Ã‘': 'Ñ',
        'Ã¡': 'á',
        'Ã‰': 'É',
        'Ã': 'Í',
        'Ã“': 'Ó',
        'Ãš': 'Ú',
        'Ã¼': 'ü',
        'Â·': '·',
        'â€”': '—',
        'â€“': '–',
        'â€¢': '•',
        'Âº': 'º',
        'Âª': 'ª',
        'Â¿': '¿',
        'Â¡': '¡',
        'â„¢': '™',
        'Â©': '©',
        'Â®': '®',
        'â‚¬': '€',
        'Ã ': 'à',
        'Ã¨': 'è',
        'Ã²': 'ò',
        'Ã¹': 'ù',
        'Â': '', # Often a lone Â appears before spaces or other chars
        'â˜…': '★',
        'â˜†': '☆',
        'âœ14': '✓'
    }
    
    for corrupted, fixed in replacements.items():
        content = content.replace(corrupted, fixed)
    
    return content

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.js', '.css', '.md', '.json')):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}...")
                try:
                    # Try reading with utf-8
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    fixed_content = fix_content(content)
                    
                    if fixed_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(fixed_content)
                        print(f"Fixed {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    process_directory('c:\\Users\\JUAN CARLOS\\Documents\\MarketingSkils\\surus-estrategico\\public')
    # Also check the root for dashboard_full.html and other files
    process_directory('c:\\Users\\JUAN CARLOS\\Documents\\MarketingSkils\\surus-estrategico')
