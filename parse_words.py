import re
import json

# Read the raw text
with open('words_raw.txt', 'r', encoding='utf-8') as f:
    text = f.read()

words_list = []
# Regex to match: '. Word (Meaning)' or just '. Word'
lines = text.strip().split('\n')
for line in lines:
    line = line.strip()
    if not line or line == '.': continue
    
    # Remove leading dot and space
    if line.startswith('.'):
        line = line[1:].strip()
    
    # Check for meanings in parentheses
    match = re.search(r'^(.*?)\s*\((.*?)\)$', line)
    
    word = ""
    meaning = ""
    
    if match:
        word = match.group(1).strip()
        meaning = match.group(2).strip()
    else:
        # Check if there is a dash or slash separating word/meaning roughly
        if '-' in line:
            parts = line.split('-', 1)
            word = parts[0].strip()
            meaning = parts[1].strip()
        else:
            word = line.strip()
            meaning = "Definition pending..." # Placeholder
            
    # Cleanup possible artifacts
    if not word: continue
    
    words_list.append({
        "id": len(words_list) + 1,
        "word": word,
        "pronunciation": "", # We don't have this data explicitly
        "meaning": meaning,
        "category": "General", # Default category
        "usage": "Usage example needed."
    })

# Format as JS module
js_content = f"export const wordsData = {json.dumps(words_list, indent=4, ensure_ascii=False)};\n"

with open('src/data/words.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully parsed {len(words_list)} words.")
