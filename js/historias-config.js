/**
 * historias-config.js
 * Configuración del módulo dinámico de Historias de transformación.
 */

export const HISTORIAS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBPY6Xn3ftkALl63ZpNjaU4Y234MyrKJ-giam_-0ogxIBLKAf8vorbmRfWtsT8UcdWMu5u1ngS75PG/pub?gid=1230682647&single=true&output=csv';

export const HISTORIAS_FALLBACK_IMAGE = 'img/logo_sin_fondo.png';

export const HISTORIAS_PREVIEW_LIMIT = 3;

// Alias de encabezados aceptados por columna, ya normalizados
// (minúsculas, sin tildes, sin espacios sobrantes).
export const HISTORIAS_COLUMN_ALIASES = Object.freeze({
    timestamp: ['marca temporal'],
    titulo: ['titulo de la historia', 'titulo de historia'],
    cuerpo: ['cuerpo de la historia', 'cuerpo de historia'],
    miniatura: ['miniatura de la historia', 'miniatura de historia'],
    videoUrl: ['link de el video', 'link del video', 'link de video'],
    formato: ['formato de el video', 'formato del video', 'formato de video']
});
