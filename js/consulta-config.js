/**
 * consulta-config.js
 * Configuración del módulo de consulta de resultados por documento.
 */

export const CONSULTA_SELECCIONADAS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRF4Ue7GtLyW9PyT2wm-87JZ0zxXF7otmUf4fs28xElL8wZIWSiLWbtRfGPn6aiiA/pub?gid=293164081&single=true&output=csv';

export const CONSULTA_PARTICIPANTES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8NKnJOZvYiZjU55_guRhJCzJsU59r2DV1dlppLCPW_atTCFbWZ4vI7BuWjlDrlD7HPnZWVvKZnVp7/pub?gid=228573384&single=true&output=csv';

// Longitud máxima del campo (incluye puntos, espacios y guiones que la
// usuaria pueda escribir antes de normalizar).
export const CONSULTA_DOCUMENTO_RAW_MAX_LENGTH = 25;

// Longitud máxima razonable del documento ya normalizado (solo dígitos).
export const CONSULTA_DOCUMENTO_NORMALIZED_MAX_LENGTH = 15;

// Alias de encabezados aceptados para la columna de documento, ya
// normalizados (minúsculas, sin tildes, sin espacios ni puntos sobrantes).
export const CONSULTA_DOCUMENTO_COLUMN_ALIASES = [
    'cedula',
    'numero de documento',
    'documento',
    'numero de identificacion',
    'identificacion',
    'no documento',
    'nro documento',
    'numero de cedula',
    'cedula de ciudadania',
    'documento de identidad'
];
