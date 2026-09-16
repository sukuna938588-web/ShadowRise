export interface HunterAvatar {
  id: string;
  name: string;
  title: string;
  color: string;
  avatarSvg: string;
}

export const HUNTER_AVATARS: HunterAvatar[] = [
  {
    id: 'shadow-monarch',
    name: 'Shadow Sovereign',
    title: 'Monarch of Shadows',
    color: '#a855f7',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1133"/><stop offset="100%" stop-color="%236b21a8"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g1)" rx="24"/><path d="M50 20 L65 35 L58 48 L50 42 L42 48 L35 35 Z" fill="%23c084fc"/><circle cx="42" cy="52" r="3" fill="%2300f0ff"/><circle cx="58" cy="52" r="3" fill="%2300f0ff"/><path d="M30 85 C30 68 40 62 50 62 C60 62 70 68 70 85 Z" fill="%234c1d95"/><path d="M45 58 L50 62 L55 58" stroke="%23c084fc" stroke-width="2" fill="none"/></svg>`,
  },
  {
    id: 'void-assassin',
    name: 'Void Stalker',
    title: 'Speed Specialist',
    color: '#00f0ff',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23061c2b"/><stop offset="100%" stop-color="%230284c7"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g2)" rx="24"/><path d="M50 18 L68 38 L50 44 L32 38 Z" fill="%2338bdf8"/><path d="M38 50 L44 53 L38 56 Z" fill="%2300f0ff"/><path d="M62 50 L56 53 L62 56 Z" fill="%2300f0ff"/><path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85 Z" fill="%23075985"/><path d="M42 42 L50 46 L58 42 L50 35 Z" fill="%23e0f2fe"/></svg>`,
  },
  {
    id: 'blood-berserker',
    name: 'Blood Knight',
    title: 'Heavy Striker',
    color: '#f43f5e',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232e0c15"/><stop offset="100%" stop-color="%23be123c"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g3)" rx="24"/><polygon points="50,15 62,32 50,45 38,32" fill="%23fb7185"/><circle cx="43" cy="50" r="3.5" fill="%23ffe4e6"/><circle cx="57" cy="50" r="3.5" fill="%23ffe4e6"/><path d="M26 85 C26 65 38 62 50 62 C62 62 74 65 74 85 Z" fill="%23881337"/><line x1="50" y1="46" x2="50" y2="58" stroke="%23fb7185" stroke-width="3"/></svg>`,
  },
  {
    id: 'iron-tanker',
    name: 'Iron Aegis',
    title: 'Defense Titan',
    color: '#f59e0b',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b1a03"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g4)" rx="24"/><path d="M50 15 L70 28 L70 52 L50 68 L30 52 L30 28 Z" fill="%23fcd34d" opacity="0.85"/><path d="M42 40 L58 40 L50 48 Z" fill="%2378350f"/><path d="M24 85 C24 68 36 65 50 65 C64 65 76 68 76 85 Z" fill="%2392400e"/></svg>`,
  },
  {
    id: 'arcane-mage',
    name: 'Arcane Weaver',
    title: 'Mana Sorcerer',
    color: '#8b5cf6',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23170a31"/><stop offset="100%" stop-color="%237c3aed"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g5)" rx="24"/><circle cx="50" cy="38" r="16" fill="%23c4b5fd"/><circle cx="50" cy="38" r="8" fill="%234c1d95"/><circle cx="50" cy="38" r="3" fill="%23ffffff"/><path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85 Z" fill="%235b21b6"/><polygon points="50,16 54,26 64,28 56,34 58,44 50,38 42,44 44,34 36,28 46,26" fill="%23ddd6fe"/></svg>`,
  },
  {
    id: 'emerald-healer',
    name: 'Vital Priest',
    title: 'Recovery Guide',
    color: '#10b981',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23042417"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g6)" rx="24"/><rect x="44" y="24" width="12" height="32" rx="4" fill="%236ee7b7"/><rect x="34" y="34" width="32" height="12" rx="4" fill="%236ee7b7"/><path d="M26 85 C26 66 38 62 50 62 C62 62 74 66 74 85 Z" fill="%23065f46"/></svg>`,
  },
];
