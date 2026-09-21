export interface CartItem {
  nombre: string;
  precio: number;
  cantidad: number;
  opciones: string;
  notas: string;
  menuId?: string;
  esCombo?: boolean;
  comboId?: string;
  comboNombre?: string;
  comboItemsJson?: string;
}

export const fmt = (n: number) => `$${n.toFixed(2)}`;

export function parseOpciones(opciones?: string): string[] {
  if (!opciones) return [];
  try {
    const arr = JSON.parse(opciones);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return opciones ? [opciones] : [];
  }
}

export function parseComboInternos(
  json?: string,
): { nombre: string; cantidad: number; opciones: string[] }[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    return Array.isArray(raw)
      ? raw.map((int: { nombre?: string; cantidad?: number; opciones?: unknown }) => ({
          nombre: int.nombre || "Plato",
          cantidad: int.cantidad ?? 1,
          opciones: Array.isArray(int.opciones) ? int.opciones.map(String) : [],
        }))
      : [];
  } catch {
    return [];
  }
}
