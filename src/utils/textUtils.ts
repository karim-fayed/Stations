/**
 * Normaliza un texto para búsquedas insensibles a mayúsculas/minúsculas y diacríticos
 * 
 * @param text El texto a normalizar
 * @returns El texto normalizado
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Convertir a minúsculas y normalizar para eliminar diacríticos
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Eliminar diacríticos
}

/**
 * Comprueba si un texto contiene otro texto, de forma insensible a mayúsculas/minúsculas y diacríticos
 * 
 * @param text El texto donde buscar
 * @param searchTerm El término de búsqueda
 * @returns true si el texto contiene el término de búsqueda
 */
export function textContains(text: string | null | undefined, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;
  
  const normalizedText = normalizeText(text);
  const normalizedSearchTerm = normalizeText(searchTerm);
  
  return normalizedText.includes(normalizedSearchTerm);
}

/**
 * Comprueba si un texto comienza con otro texto, de forma insensible a mayúsculas/minúsculas y diacríticos
 * 
 * @param text El texto donde buscar
 * @param searchTerm El término de búsqueda
 * @returns true si el texto comienza con el término de búsqueda
 */
export function textStartsWith(text: string | null | undefined, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;
  
  const normalizedText = normalizeText(text);
  const normalizedSearchTerm = normalizeText(searchTerm);
  
  return normalizedText.startsWith(normalizedSearchTerm);
}
