import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce en valores de entrada
 * Útil para mejorar el rendimiento en operaciones como búsqueda en tiempo real
 * 
 * @param value El valor que se quiere debounce
 * @param delay El tiempo de espera en milisegundos (por defecto: 300ms)
 * @returns El valor después del tiempo de espera
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar un temporizador para actualizar el valor después del retraso
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia antes del retraso
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
