export const CATEGORIES = {
  deen: { label: 'Deen', urdu: 'دین', weight: 40, color: '#30D158', accent: '#28B04A' },
  growth: { label: 'Growth', urdu: 'ترقی', weight: 25, color: '#007AFF', accent: '#0062CC' },
  health: { label: 'Health', urdu: 'صحت', weight: 15, color: '#FF9F0A', accent: '#CC7F08' },
  output: { label: 'Output', urdu: 'آؤٹ پٹ', weight: 20, color: '#BF5AF2', accent: '#9B3FD9' }
};

export const HABITS = {
  deen: [
    { id: 'fajr',         label: 'Fajr',              urdu: 'فجر',            critical: true,  timeWindow: 'morning'   },
    { id: 'zohar',        label: 'Zohar',             urdu: 'ظہر',            critical: false, timeWindow: 'afternoon', fridayLabel: 'Jumma', fridayUrdu: 'جمعہ' },
    { id: 'asar',         label: 'Asar',              urdu: 'عصر',            critical: false, timeWindow: 'afternoon' },
    { id: 'maghrib',      label: 'Maghrib',           urdu: 'مغرب',           critical: false, timeWindow: 'evening'   },
    { id: 'isha',         label: 'Isha',              urdu: 'عشاء',           critical: true,  timeWindow: 'evening'   },
    { id: 'tahajjud',     label: 'Tahajjud',          urdu: 'تہجد',           critical: false, timeWindow: 'night'     },
    { id: 'astaghfar',   label: '100 Astaghfar',     urdu: '١٠٠ استغفار',    critical: false },
    { id: 'ayatul_kursi', label: '100 Ayat-ul-Kursi', urdu: '١٠٠ آیت الکرسی', critical: false }
  ],
  growth: [
    { id: 'dsa',     label: 'DSA Practice',  urdu: 'DSA پریکٹس',  critical: false, hasDSAModal: true },
    { id: 'college', label: 'College Study', urdu: 'کالج پڑھائی', critical: false }
  ],
  health: [
    { id: 'walk', label: 'Walk',      urdu: 'چلنا',     selectOne: true },
    { id: 'swim', label: 'Swim',      urdu: 'تیراکی',   selectOne: true },
    { id: 'gym',  label: 'Gym',       urdu: 'جم',       selectOne: true },
    { id: 'abc_juice', label: 'ABC Juice', urdu: 'ABC جوس', alwaysShow: true }
  ],
  output: [
    { id: 'post_online',       label: 'Post Online',       urdu: 'آن لائن پوسٹ',   selectOne: true, critical: true },
    { id: 'apply_internship',  label: 'Apply Internship',  urdu: 'انٹرن شپ اپلائی', selectOne: true, critical: true }
  ]
};

export const HEALTH_OPTIONS = ['walk', 'swim', 'gym'];
export const OUTPUT_OPTIONS = ['post_online', 'apply_internship'];

// Flat list for iteration
export const ALL_HABITS = Object.entries(HABITS).flatMap(([cat, habits]) =>
  habits.map(h => ({ ...h, category: cat }))
);

export function getHabitLabel(habit, isFriday) {
  if (habit.id === 'zohar' && isFriday) {
    return { label: habit.fridayLabel || habit.label, urdu: habit.fridayUrdu || habit.urdu };
  }
  return { label: habit.label, urdu: habit.urdu };
}

export function isFridayToday() {
  return new Date().getDay() === 5;
}
