export const predefinedMissions = [
  { id: '1', icon: '😁', text: 'Senyum Paling Lebar' },
  { id: '2', icon: '🍲', text: 'Makanan Paling Enak' },
  { id: '3', icon: '💑', text: 'Momen Paling Romantis' },
  { id: '4', icon: '👗', text: 'OOTD (Outfit) Terbaik' },
];

export function getMissionById(id?: string | null) {
  if (!id) return null;
  return predefinedMissions.find(m => m.id === id) || null;
}
