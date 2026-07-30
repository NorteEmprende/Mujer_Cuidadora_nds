/**
 * bitacora-data.js
 * Carga, parseo y normalización de datos de la Bitácora desde CSV.
 * Reutiliza parseRobustCSV, extractDriveFileId y driveToDirectImageUrl
 * de media-cuidadora-utils.js para evitar duplicidad.
 */

import { BITACORA_CSV_URL, BITACORA_COLUMNS } from './bitacora-config.js';
import {
    parseRobustCSV,
    extractDriveFileId,
    driveToDirectImageUrl
} from './media-cuidadora-utils.js';

/**
 * Carga y parsea los datos de la Bitácora desde el CSV publicado.
 * @param {Object} options
 * @param {boolean} options.requireDate - Si true, descarta registros sin fecha.
 * @returns {Promise<Array>} Array de noticias ordenadas de más reciente a más antigua.
 */
export async function fetchBitacoraData({ requireDate = true } = {}) {
    const url = withCacheBuster(BITACORA_CSV_URL);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`No se pudo cargar el CSV de Bitácora. Estado HTTP: ${response.status}`);
    }

    const text = await response.text();
    const allRows = parseRobustCSV(text);

    if (allRows.length < 2) {
        return [];
    }

    const dataRows = allRows.slice(1);
    const C = BITACORA_COLUMNS;

    const noticias = dataRows
        .map(cols => {
            if (cols.length < 6) return null;

            const titulo = clean(cols[C.titulo]);
            const municipio = clean(cols[C.municipio]);
            const descripcion = clean(cols[C.descripcion]);
            const fecha = clean(cols[C.fecha]);

            if (!titulo || !municipio || !descripcion) {
                return null;
            }

            if (requireDate && !fecha) {
                return null;
            }

            const imageColumns = [C.foto1, C.foto2, C.foto3, C.foto4, C.foto5];

            const imagenes = imageColumns
                .map(index => resolveImageUrl(cols[index]))
                .filter(Boolean);

            if (imagenes.length === 0) {
                return null;
            }

            return {
                titulo,
                municipio,
                descripcion,
                fecha,
                imgUrl: imagenes[0],
                imagenes
            };
        })
        .filter(Boolean);

    noticias.sort((a, b) => parseBitacoraDate(b.fecha) - parseBitacoraDate(a.fecha));

    return noticias;
}

/**
 * Resuelve una URL de imagen.
 * Soporta URLs de Google Drive y URLs directas.
 * @param {string} rawUrl
 * @returns {string|null}
 */
function resolveImageUrl(rawUrl) {
    const url = clean(rawUrl);

    if (!url) {
        return null;
    }

    // Si es URL de Google Drive, convertir
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        return driveToDirectImageUrl(url);
    }

    // Si ya es una URL de lh3 googleusercontent
    if (url.includes('lh3.googleusercontent.com') || url.includes('drive.google.com/thumbnail')) {
        return url;
    }

    // Si es una URL directa válida
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    // Intentar extraer ID de Drive como fallback
    const fileId = extractDriveFileId(url);

    if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
    }

    return null;
}

/**
 * Parsea fechas en formato DD/MM/YYYY, D/M/YYYY, DD-MM-YYYY, D-M-YYYY.
 * Devuelve timestamp numérico para ordenar. Devuelve 0 si no puede parsear.
 * @param {string} dateStr
 * @returns {number}
 */
export function parseBitacoraDate(dateStr = '') {
    const raw = clean(dateStr);

    if (!raw) return 0;

    const parts = raw.split(/[/-]/);

    if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const yearRaw = Number(parts[2]);
        const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;

        const date = new Date(year, month, day);

        if (!Number.isNaN(date.getTime())) {
            return date.getTime();
        }
    }

    const fallback = Date.parse(raw);

    return Number.isNaN(fallback) ? 0 : fallback;
}

/**
 * Limpia un valor de celda CSV.
 * @param {*} value
 * @returns {string}
 */
function clean(value = '') {
    return String(value ?? '').trim();
}

/**
 * Agrega cache buster a la URL del CSV.
 * @param {string} url
 * @returns {string}
 */
function withCacheBuster(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
}
