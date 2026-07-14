export const TENANT_TYPES = [
  { label: { en: "Dentist", id: "Dokter Gigi" }, value: "dentist" },
  { label: { en: "Doctor", id: "Dokter" }, value: "doctor" },
  { label: { en: "Veterinarian", id: "Dokter Hewan" }, value: "veterinarian" },
  { label: { en: "Psychologist", id: "Psikolog" }, value: "psychologist" },
  { label: { en: "Lawyer", id: "Pengacara" }, value: "lawyer" },
  { label: { en: "Teacher", id: "Guru" }, value: "teacher" },
  { label: { en: "Musician", id: "Musisi" }, value: "musician" },
  {
    label: { en: "Yoga Trainer", id: "Instruktur Yoga" },
    value: "yoga_trainer",
  },
  {
    label: { en: "Pilates Teacher", id: "Instruktur Pilates" },
    value: "pilates_teacher",
  },
  { label: { en: "Hair Dresser", id: "Penata Rambut" }, value: "hair_dresser" },
  { label: { en: "Tailor", id: "Penjahit" }, value: "tailor" },
  { label: { en: "Technician", id: "Teknisi" }, value: "technician" },
  { label: { en: "Cleaner", id: "Petugas Kebersihan" }, value: "cleaner" },
  { label: { en: "Driver", id: "Sopir" }, value: "driver" },
  { label: { en: "Nurse", id: "Perawat" }, value: "nurse" },
  {
    label: { en: "Physiotherapist", id: "Fisioterapis" },
    value: "physiotherapist",
  },
  { label: { en: "Nutritionist", id: "Ahli Gizi" }, value: "nutritionist" },
  { label: { en: "Photographer", id: "Fotografer" }, value: "photographer" },
  { label: { en: "Makeup Artist", id: "Penata Rias" }, value: "makeup_artist" },
  {
    label: { en: "Personal Trainer", id: "Pelatih Pribadi" },
    value: "personal_trainer",
  },
  { label: { en: "Tutor", id: "Tutor" }, value: "tutor" },
  { label: { en: "Consultant", id: "Konsultan" }, value: "consultant" },
  { label: { en: "Plumber", id: "Ahli pipa" }, value: "plumber" },
] as const;

export const ASIAN_COUNTRIES = [
  { code: "+62", flag: "🇮🇩" },
  { code: "+60", flag: "🇲🇾" },
  { code: "+65", flag: "🇸🇬" },
  { code: "+66", flag: "🇹🇭" },
  { code: "+84", flag: "🇻🇳" },
  { code: "+63", flag: "🇵🇭" },
  { code: "+95", flag: "🇲🇲" },
  { code: "+855", flag: "🇰🇭" },
  { code: "+856", flag: "🇱🇦" },
  { code: "+673", flag: "🇧🇳" },
  { code: "+81", flag: "🇯🇵" },
  { code: "+82", flag: "🇰🇷" },
  { code: "+86", flag: "🇨🇳" },
  { code: "+852", flag: "🇭🇰" },
  { code: "+886", flag: "🇹🇼" },
  { code: "+91", flag: "🇮🇳" },
  { code: "+92", flag: "🇵🇰" },
  { code: "+880", flag: "🇧🇩" },
  { code: "+94", flag: "🇱🇰" },
  { code: "+977", flag: "🇳🇵" },
] as const;

// biome-ignore lint/suspicious/noRedeclare: future usage
export type TenantType = (typeof TENANT_TYPES)[number]["value"];
// biome-ignore lint/suspicious/noRedeclare: <explanation>
export type Locale = "en" | "id";

export const THEME_OPTIONS = [
  { icon: "☀️", label: "Light theme", value: "light" },
  { icon: "🌙", label: "Dark theme", value: "dark" },
] as const;

export const STAT_ITEMS = [
  { label: "Total Responses" },
  { label: "Attending" },
  { label: "Not Attending" },
  { label: "Total Guests" },
] as const;

export const DASHBOARD_CARDS = [
  { description: "Manage your offerings", title: "Services" },
  { description: "Set availability", title: "Schedule" },
  { description: "View appointments", title: "Bookings" },
  { description: "Update your info", title: "Profile" },
] as const;