// Character code to race/gender mapping for FFXIV
// Usage: import or include this file in your scripts as needed
const charaCodeLibrary = {
  c0101: 'male midlander',
  c0201: 'female midlander',
  c0301: 'male highlander',
  c0401: 'female highlander',
  c0501: 'male elezen',
  c0601: 'female elezen',
  c0701: 'male miqote',
  c0801: 'female miqote',
  c0901: 'male roegadyn',
  c1001: 'female roegadyn',
  c1101: 'male lalafell',
  c1201: 'female lalafell',
  c1301: 'male aura',
  c1401: 'female aura',
  c1501: 'male roegadyn',
  c1601: 'female roegadyn',
  c1701: 'male viera',
  c1801: 'female viera'
};

// Export for module usage (uncomment if using modules)
// export default charaCodeLibrary;

const method_map = {
    "Save for everyone/remaining": "all",
    "Don't save": "none",
    "Wiggle ears": ["wiggle","ears"],
    "Miqote only ears": ["cat", "miqo", "kitty", "c0801", "c0701"],
    "Bunny only ears": ["bunny", "viera", "c1701", "c1801"],
    "Elezen & Lalafell ears": ["elf", "elezen", "ele"],
    "Ears disabled": ["human","no_ears","noears", ],
    "Everyone except lalafell": ["adult", "nsfw", "nolala", "no_lala"],
    "Only lalafell": ["minor", "small", "smol", "lala", "lalafell", "c1101", "c1201"],
    "Hro & Roe posture": ["big", "hro", "roe", "hrothgar", "roegadyn", "c0901", "c1501"],
    "Normal posture": "normal",
    "Female only": ["fem", "girl", "c0801", "c0201"],
    "Individual assignment": ["individual", "indiv", "single", "one"],
}


const method_exec = {
    "Save for everyone/remaining": [
        "c0101", "c0201", "c0301", "c0401", "c0501", "c0601",
        "c0701", "c0801", "c0901", "c1001", "c1101", "c1201",
        "c1301", "c1401", "c1501", "c1601", "c1701", "c1801"
    ],
    "Don't save": [],
    "Wiggle ears": [
        "c0701", "c0801", // miqote
        "c1701", "c1801"  // viera
    ],
    "Miqote only ears": [
        "c0701", "c0801"
    ],
    "Bunny only ears": [
        "c1701", "c1801"
    ],
    "Elezen & Lalafell ears": [
        "c0501", "c0601", // elezen
        "c1101", "c1201"  // lalafell
    ],
    "Ears disabled": [
        "c0101", "c0201", "c0301", "c0401", // midlander & highlander
        "c1301", "c1401" // aura
    ],
    "Everyone except lalafell": [
        "c0101", "c0201", "c0301", "c0401", "c0501", "c0601",
        "c0701", "c0801", "c0901", "c1001", "c1301", "c1401",
        "c1501", "c1601", "c1701", "c1801"
    ],
    "Only lalafell": [
        "c1101", "c1201"
    ],
    "Hro & Roe posture": [
        "c0901", // roegadyn
        "c1501" // hrothgar (assuming these codes, adjust if needed)
    ],
    "Normal posture": [
        "c0101", "c0201", "c0301", "c0401", "c0501", "c0601",
        "c0701", "c0801", "c1001", "c1101", "c1201", "c1301", "c1401",
        "c1601", "c1701", "c1801"
    ],
    "Female only": [
        "c0201", "c0401", "c0601", "c0801", "c1001", "c1201",
        "c1401", "c1601", "c1801"
    ],
    "Individual assignment": [
        // This is for per-character assignment, so likely left empty or handled elsewhere
    ]
};