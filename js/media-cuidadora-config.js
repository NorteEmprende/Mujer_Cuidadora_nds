/**
 * media-cuidadora-config.js
 * Configuración del módulo dinámico de Bitácora del proyecto.
 */

export const MUJER_CUIDADORA_MEDIA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS33BPFo7F4KzE3NknoEpKfzTjb5EjeUR1svAlMf8a6Wh-NgFPhKAJzojCJG5qdiLyWw0eSOpFCwG2G/pub?gid=1170999841&single=true&output=csv';

export const MUJER_CUIDADORA_FALLBACK_IMAGE = 'img/logo_sin_fondo.png';

export const MUJER_CUIDADORA_MEDIA_COLUMNS = Object.freeze({
    timestamp: 0,
    fecha: 1,
    titulo: 2,
    descripcion: 3,
    videoUrl: 4,
    thumbnail: 5,
    formato: 6
});
