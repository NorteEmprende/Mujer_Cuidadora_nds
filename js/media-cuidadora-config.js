/**
 * media-cuidadora-config.js
 * Configuración del módulo dinámico de Bitácora del proyecto.
 */

export const MUJER_CUIDADORA_MEDIA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfvjx6-TH8Tnd_C-4KFk5mTpJmPJLC8zexCDOw02QwHQQuo6iOuMcv6R0DQGgdhCc-dSihxdqTsrEL/pub?gid=1168913486&single=true&output=csv';

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
