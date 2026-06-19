/**
 * media-cuidadora-data.js
 * Carga y normalización de datos de la bitácora audiovisual.
 */

import {
    MUJER_CUIDADORA_MEDIA_CSV_URL,
    MUJER_CUIDADORA_FALLBACK_IMAGE,
    MUJER_CUIDADORA_MEDIA_COLUMNS
} from './media-cuidadora-config.js';

import {
    parseRobustCSV,
    extractYouTubeId,
    parseFormato,
    resolveThumbnail,
    parseLatinDate
} from './media-cuidadora-utils.js';

export async function fetchMujerCuidadoraMediaData() {
    if (!isCsvUrlConfigured()) {
        console.info('[Mujer Cuidadora Media] URL del CSV no configurada.');
        return [];
    }

    try {
        const response = await fetch(withCacheBuster(MUJER_CUIDADORA_MEDIA_CSV_URL));

        if (!response.ok) {
            throw new Error(`No se pudo cargar el CSV. Estado HTTP: ${response.status}`);
        }

        const csvText = await response.text();
        const rows = parseRobustCSV(csvText);

        if (rows.length < 2) {
            return [];
        }

        const dataRows = rows.slice(1);
        const videos = [];

        dataRows.forEach((cols) => {
            const item = mapCsvRowToMediaItem(cols);

            if (item) {
                videos.push(item);
            }
        });

        return sortMediaItemsByDate(videos);
    } catch (error) {
        console.error('[Mujer Cuidadora Media] Error cargando datos:', error);
        throw error;
    }
}

function isCsvUrlConfigured() {
    return Boolean(
        MUJER_CUIDADORA_MEDIA_CSV_URL &&
        MUJER_CUIDADORA_MEDIA_CSV_URL.trim() &&
        !MUJER_CUIDADORA_MEDIA_CSV_URL.includes('PEGAR_AQUI')
    );
}

function withCacheBuster(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
}

function mapCsvRowToMediaItem(cols = []) {
    const C = MUJER_CUIDADORA_MEDIA_COLUMNS;

    const timestamp = clean(cols[C.timestamp]);
    const fecha = clean(cols[C.fecha]);
    const titulo = clean(cols[C.titulo]);
    const descripcion = clean(cols[C.descripcion]);
    const videoUrl = clean(cols[C.videoUrl]);
    const rawThumbnail = clean(cols[C.thumbnail]);
    const rawFormato = clean(cols[C.formato]);

    if (!titulo || !descripcion || !videoUrl) {
        return null;
    }

    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
        return null;
    }

    const formato = parseFormato(rawFormato);
    const thumbnailUrl = resolveThumbnail(
        rawThumbnail,
        videoId,
        MUJER_CUIDADORA_FALLBACK_IMAGE
    );

    return {
        timestamp,
        fecha,
        titulo,
        descripcion,
        videoUrl,
        videoId,
        thumbnailUrl,
        formato,
        sortDate: parseLatinDate(fecha) || parseLatinDate(timestamp)
    };
}

function clean(value = '') {
    return String(value ?? '').trim();
}

function sortMediaItemsByDate(items = []) {
    return [...items].sort((a, b) => {
        const dateA = a.sortDate;
        const dateB = b.sortDate;

        if (dateA && dateB) {
            return dateB - dateA;
        }

        if (dateA) {
            return -1;
        }

        if (dateB) {
            return 1;
        }

        return 0;
    });
}
