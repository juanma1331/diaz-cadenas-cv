export const CVS_STATUS = {
  PENDING: 1,
  REVIEWED: 2,
  REJECTED: 3,
  SELECTED: 4,
} as const;

export type CVSStatusType = (typeof CVS_STATUS)[keyof typeof CVS_STATUS];

export const PLACES = [
  "Andújar",
  "Brenes",
  "Bollullos Par del Condado",
  "Cádiz",
  "Coria del Rio",
  "Estepa",
  "Gilena",
  "Hytasa",
  "La Carolina",
  "Lantejuela",
  "Moguer",
  "Osuna",
  "Sanlúcar de Barrameda",
  "Sevilla",
  "Utrera",
] as const;

export const POSITIONS = [
  "Carnicería",
  "Charcutería",
  "Pescadería",
  "Frutería",
  "Panadería",
  "Pastelería",
  "Cajero",
  "Reponedor",
  "Limpieza",
] as const;
