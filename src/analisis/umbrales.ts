export const VARIABLES = ['temperatura', 'humedad', 'pm25', 'precipitacion', 'ph'] as const;
export type Variable = (typeof VARIABLES)[number];

export const UMBRALES: Record<Variable, { min?: number; max?: number; unidad: string }> = {
  temperatura:   { max: 35, unidad: '°C' },
  humedad:       { max: 95, unidad: '%' },
  pm25:          { max: 25, unidad: 'µg/m³' },
  precipitacion: { max: 50, unidad: 'mm' },
  ph:            { min: 6, max: 9, unidad: 'pH' },
};