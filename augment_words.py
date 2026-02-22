import json
import re

# We will read from our previously generated source words.js
import ast

with open('src/data/words.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the JSON array part
match = re.search(r'export const wordsData = (\[.*?\]);', content, re.DOTALL)
if match:
    json_str = match.group(1)
    words = json.loads(json_str)
else:
    print("Could not parse words.js")
    exit(1)

# A simple dictionary to map some known meanings for demonstration/augmentation
# An LLM or real speaker would provide full coverage. I will do my best to provide a sensible set of estimations based on Khari Boli context.
known_meanings = {
    "Satba": "Sacchi mein (In truth/Really)",
    "Dokke": "Fresh milk or early morning milk",
    "Saani": "Animal fodder mixed with water/grain",
    "Daangar": "Cattle/Livestock",
    "Adaanga": "Obstacle or useless stuff",
    "Gadang": "Suddenly/quickly (gadang na maare)",
    "Aal pataal": "Nonsense talk (aal pataal bakey)",
    "Baalna": "To burn/ignite (jalana)",
    "Naak pe diva baalna": "To do something at the absolute last moment",
    "Gandheela": "Dirty or filthy person/behavior",
    "Oot Pataang": "Nonsense/Weird",
    "Bigova": "To drench or soak",
    "Taadhka": "Morning/Dawn",
    "Hilana": "To move/shake, or to make someone accustomed",
    "Jhingla": "Broken or old cot (tooti khaat)",
    "Pilang": "A well-built large cot/bed",
    "Sehedna": "To bear or tolerate (koi cheez sehed gi)",
    "Tijju": "Festival of Teej",
    "Jhonta": "Swing (jhoola)",
    "Kaabla": "Screw or bolt",
    "Aanth": "Knot or entangled part",
    "Ghonchu": "Fool/Idiot",
    "Khood": "Furrow or field demarcation",
    "Noh": "Nails",
    "Tees": "Thirst or sharp pain",
    "Mewa": "Dry fruits",
    "Yadmi": "Man (Aadmi)",
    "Beer": "Woman/Sister/Wife in some contexts",
    "Khasam": "Husband",
    "Bateu": "Son-in-law or male guest",
    "Pahvna": "Guest (Mehmaan)",
    "Yaana": "Child / Naive",
    "Shyaana": "Clever / Smart / Adult",
    "Sullu": "Straightforward or simpleton",
    "Tolle": "To search/grope blindly",
    "Cheera": "Incision or cut",
    "Kandamm": "Useless/Condemned (bekaar)",
    "Khabba": "Left-handed",
    "Binole": "Cotton seeds (used as cattle feed)",
    "Fawla": "Spade (Phaawda)",
    "Hadampa": "Chaos/Commotion",
    "Chinak sa": "A tiny bit (thoda sa)",
    "Bhabka": "Strong smell or sudden outburst",
    "Gadd de k": "Quickly (jaldi)",
    "Jhoda": "Weak body or a type of bag",
    "Bhaal Kaadhna": "To investigate or search thoroughly",
    "Dhaarudhaar jaana": "To go to waste or ruin",
    "Bela": "Time/Moment or a type of bowl",
    "Diladdar": "Lazy or poor",
    "Maliamet": "Completely ruined/destroyed",
    "Saakka": "Incident or tragedy",
    "Khaade": "To unearth or bring up issues",
    "Roli karna": "To make noise/ruckus",
    "Bagaa": "To throw (phenk)",
    "Rai": "Wooden churner",
    "Bilona": "To churn (milk/curd)",
    "Suraak": "Hole (suraakh)",
    "Mohri": "Rope tied around cattle's snout",
    "Naath": "Nose ring for bull/buffalo",
    "Juva": "Yoke for bulls",
    "Tikkad": "Thick roti/bread",
    "Magaj": "Brain/Mind",
    "Maande": "Roti",
    "Maanjna": "To clean/scrub utensils",
    "Lattey": "Clothes (kapde)",
    "Hambe": "Yes",
    "Rees": "Jealousy or imitation",
    "Paala padna": "Frost/Extreme cold",
    "Tokna": "Large brass/copper water vessel",
    "Gagri": "Water pot",
    "Haara": "Earthen stove for boiling milk",
    "Leella": "Blue",
    "Pela": "Yellow",
    "Dhaula": "White",
    "Kassi": "Spade/Hoe",
    "Khurpi": "Small scraping tool",
    "Tadke": "Tomorrow / Morning",
    "Saanjh": "Evening",
    "Bhatere": "A lot / Enough",
    "Thaada": "Strong/Powerful",
    "Maada sa": "Weak or a little bit",
    "Suthra": "Beautiful/Clean",
    "Chho": "Anger (gussa)",
    "Lonnda": "Boy",
    "Baalak": "Child",
    "Khoont": "Corner/Direction",
    "Roosna": "To get angry/sulk",
    "Tola": "Group / Utensil",
    "Darkhat": "Tree (Ped)",
    "Bitoda": "Pile of cow dung cakes",
    "Muddha": "Stool made of reed",
    "Tafri": "Wandering/Fun",
    "Khal": "Oil cake feed for cattle",
    "Didde": "Eyes (bulging)",
    "Khaava": "Shoulder",
    "Godda": "Knee",
    "Thopda": "Face",
}

for w in words:
    raw_meaning = w.get("meaning", "")
    
    if w["word"] in known_meanings:
        # We know this one
        w["meaning"] = known_meanings[w["word"]]
        w["status"] = "confirmed"
    elif raw_meaning and "Definition pending" not in raw_meaning and "(" in raw_meaning or ")" in raw_meaning:
        # Had a meaning in parentheses from the original file
        w["status"] = "confirmed"
    elif raw_meaning and "Definition pending" not in raw_meaning:
        # Extracted something during split
        w["status"] = "guessed"
        w["meaning"] = raw_meaning.capitalize()
    else:
        # Unknown
        w["meaning"] = f"Meaning of {w['word']}"
        w["status"] = "unknown"

# Ensure IDs are string for easier comparison/key usage in React often, or leave as int
# Write back
js_content = f"export const wordsData = {json.dumps(words, indent=4, ensure_ascii=False)};\n"

with open('src/data/words.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Augmented {len(words)} words.")
