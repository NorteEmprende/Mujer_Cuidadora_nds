/**
 * bitacora-config.js
 * Configuración del módulo dinámico de Bitácora de Mujeres Emprendedoras.
 */

export const BITACORA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1C-2wr-HTABxE7sgiu9JPubdnDoZ4UKyPE3PN9pIqozjHRV0MU861z10V-r24bXf7dl1XIlN0y-8j/pub?gid=1093743685&single=true&output=csv';

export const BITACORA_FALLBACK_IMAGE = 'img/logo_sin_fondo.png';

export const BITACORA_PREVIEW_LIMIT = 3;

export const BITACORA_COLUMNS = Object.freeze({
    timestamp: 0,
    titulo: 1,
    municipio: 2,
    descripcion: 3,
    foto1: 4,
    fecha: 5,
    numFotos: 6,
    foto2: 7,
    foto3: 8,
    foto4: 9,
    foto5: 10
});
