/**
 * historias-data.js
 * Carga y normalización de datos de Historias de transformación.
 */

import {
    HISTORIAS_CSV_URL,
    HISTORIAS_FALLBACK_IMAGE,
    HISTORIAS_COLUMN_ALIASES
} from './historias-config.js';

import {
    parseRobustCSV,
    extractYouTubeId,
    resolveThumbnail,
    parseLatinDate
} from './media-cuidadora-utils.js';

export async function fetchHistoriasData() {
    if (!isCsvUrlConfigured()) {
        console.info('[Historias] URL del CSV no configurada.');
        return [];
    }

    try {
        const response = await fetch(withCacheBuster(HISTORIAS_CSV_URL));

        if (!response.ok) {
            throw new Error(`No se pudo cargar el CSV. Estado HTTP: ${response.status}`);
        }

        const csvText = await response.text();
        const rows = parseRobustCSV(csvText);

        if (rows.length < 2) {
            return [];
        }

        const columnIndex = mapHeaderColumns(rows[0]);
        const dataRows = rows.slice(1);
        const stories = [];

        dataRows.forEach((cols) => {
            const story = mapCsvRowToStory(cols, columnIndex);

            if (story) {
                stories.push(story);
            }
        });

        return sortStoriesByDate(stories);
    } catch (error) {
        console.error('[Historias] Error cargando datos:', error);
        throw error;
    }
}

function isCsvUrlConfigured() {
    return Boolean(
        HISTORIAS_CSV_URL &&
        HISTORIAS_CSV_URL.trim() &&
        !HISTORIAS_CSV_URL.includes('PEGAR_AQUI')
    );
}

function withCacheBuster(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
}

function normalizeHeader(value = '') {
    return String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\bdel\b/g, 'de el')
        .replace(/\s+/g, ' ')
        .trim();
}

function mapHeaderColumns(headerRow = []) {
    const normalizedHeaders = headerRow.map(normalizeHeader);
    const columnIndex = {};

    Object.entries(HISTORIAS_COLUMN_ALIASES).forEach(([field, aliases]) => {
        const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
        columnIndex[field] = index;
    });

    return columnIndex;
}

function mapCsvRowToStory(cols = [], columnIndex = {}) {
    if (!cols.length || cols.every((cell) => !clean(cell))) {
        return null;
    }

    const timestamp = clean(getColumn(cols, columnIndex.timestamp));
    const titulo = clean(getColumn(cols, columnIndex.titulo));
    const cuerpo = clean(getColumn(cols, columnIndex.cuerpo));
    const rawThumbnail = clean(getColumn(cols, columnIndex.miniatura));
    const videoUrl = clean(getColumn(cols, columnIndex.videoUrl));
    const rawFormato = clean(getColumn(cols, columnIndex.formato));

    if (!titulo) {
        return null;
    }

    const video = resolveVideoInfo(videoUrl);
    const formato = parseFormatoHistoria(rawFormato);
    const thumbnailUrl = resolveThumbnail(
        rawThumbnail,
        video.type === 'youtube' ? video.videoId : '',
        HISTORIAS_FALLBACK_IMAGE
    );

    return {
        timestamp,
        titulo,
        cuerpo,
        video,
        formato,
        thumbnailUrl,
        sortDate: parseLatinDate(timestamp)
    };
}

function getColumn(cols, index) {
    if (typeof index !== 'number' || index < 0) {
        return '';
    }

    return cols[index];
}

function clean(value = '') {
    return String(value ?? '').trim();
}

function resolveVideoInfo(rawUrl = '') {
    const url = clean(rawUrl);

    if (!url) {
        return { type: null };
    }

    const videoId = extractYouTubeId(url);

    if (videoId) {
        return { type: 'youtube', videoId };
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch (error) {
        return { type: null };
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return { type: null };
    }

    if (/\.(mp4|webm|ogg)$/i.test(parsedUrl.pathname)) {
        return { type: 'file', src: parsedUrl.href };
    }

    return { type: null };
}

function parseFormatoHistoria(raw = '') {
    const value = String(raw ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim();

    if (value.includes('vertical') || value.includes('9:16') || value.includes('9 / 16') || value.includes('9/16')) {
        return 'vertical';
    }

    if (value.includes('horizontal') || value.includes('16:9') || value.includes('16 / 9') || value.includes('16/9')) {
        return 'horizontal';
    }

    return 'horizontal';
}

function sortStoriesByDate(stories = []) {
    return [...stories].sort((a, b) => {
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
