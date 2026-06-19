/**
 * media-cuidadora-utils.js
 * Utilidades del módulo de bitácora audiovisual.
 */

export function parseRobustCSV(csvText = '') {
    const cleanText = String(csvText).replace(/^\uFEFF/, '');
    const result = [];
    let row = [];
    let cell = '';
    let inQuote = false;

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const nextChar = cleanText[i + 1];

        if (char === '"') {
            if (inQuote && nextChar === '"') {
                cell += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            row.push(cell.trim());
            cell = '';
        } else if ((char === '\n' || char === '\r') && !inQuote) {
            if (cell !== '' || row.length > 0) {
                row.push(cell.trim());
                result.push(row);
                cell = '';
                row = [];
            }

            if (char === '\r' && nextChar === '\n') {
                i++;
            }
        } else {
            cell += char;
        }
    }

    if (cell !== '' || row.length > 0) {
        row.push(cell.trim());
        result.push(row);
    }

    return result;
}

export function escapeHtml(value = '') {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function truncateText(value = '', maxLength = 120) {
    const text = String(value ?? '').trim();

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function extractYouTubeId(url = '') {
    const rawUrl = String(url ?? '').trim();

    if (!rawUrl) {
        return null;
    }

    try {
        const parsedUrl = new URL(rawUrl);
        const host = parsedUrl.hostname.replace(/^www\./, '');
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

        if (host.includes('youtu.be')) {
            return normalizeYouTubeId(pathParts[0]);
        }

        const watchId = parsedUrl.searchParams.get('v');

        if (watchId) {
            return normalizeYouTubeId(watchId);
        }

        const markers = ['embed', 'shorts', 'live', 'v'];

        for (const marker of markers) {
            const markerIndex = pathParts.indexOf(marker);

            if (markerIndex !== -1 && pathParts[markerIndex + 1]) {
                return normalizeYouTubeId(pathParts[markerIndex + 1]);
            }
        }
    } catch (error) {
        // Si no es una URL válida, se intenta con regex abajo.
    }

    const fallbackMatch = rawUrl.match(
        /(?:youtu\.be\/|watch\?v=|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([a-zA-Z0-9_-]{6,})/
    );

    return fallbackMatch ? normalizeYouTubeId(fallbackMatch[1]) : null;
}

function normalizeYouTubeId(value = '') {
    const id = String(value ?? '').split(/[?&#/]/)[0].trim();
    return id || null;
}

export function getYouTubeEmbedUrl(videoId) {
    if (!videoId) {
        return '';
    }

    return `https://www.youtube.com/embed/${videoId}`;
}

export function extractDriveFileId(url = '') {
    const rawUrl = String(url ?? '').trim();

    if (!rawUrl) {
        return null;
    }

    const match =
        rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/open\?id=([a-zA-Z0-9_-]+)/);

    return match ? match[1] : null;
}

export function driveToDirectImageUrl(url = '') {
    const fileId = extractDriveFileId(url);

    if (!fileId) {
        return null;
    }

    return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
}

export function parseFormato(raw = '') {
    const value = String(raw ?? '').toLowerCase().trim();

    if (value.includes('horizontal') || value.includes('16:9')) {
        return 'horizontal';
    }

    if (value.includes('vertical') || value.includes('9:16')) {
        return 'vertical';
    }

    return 'vertical';
}

export function resolveThumbnail(rawThumbnail = '', videoId = '', fallbackImage = '') {
    const thumb = String(rawThumbnail ?? '').trim();

    if (thumb) {
        if (thumb.includes('drive.google.com') || thumb.includes('docs.google.com')) {
            const driveImage = driveToDirectImageUrl(thumb);

            if (driveImage) {
                return driveImage;
            }
        }

        if (/^https?:\/\//i.test(thumb)) {
            return thumb;
        }
    }

    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    return fallbackImage;
}

export function parseLatinDate(value = '') {
    const raw = String(value ?? '').trim();

    if (!raw) {
        return null;
    }

    const normalized = raw.replace(',', ' ');

    const latinMatch = normalized.match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?)?/i
    );

    if (latinMatch) {
        const day = Number(latinMatch[1]);
        const month = Number(latinMatch[2]) - 1;
        const yearRaw = latinMatch[3];
        const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);

        let hour = latinMatch[4] ? Number(latinMatch[4]) : 0;
        const minute = latinMatch[5] ? Number(latinMatch[5]) : 0;
        const second = latinMatch[6] ? Number(latinMatch[6]) : 0;

        const meridiem = String(latinMatch[7] ?? '')
            .toLowerCase()
            .replace(/\./g, '')
            .replace(/\s/g, '');

        if (meridiem.includes('p') && hour < 12) {
            hour += 12;
        }

        if (meridiem.includes('a') && hour === 12) {
            hour = 0;
        }

        const parsed = new Date(year, month, day, hour, minute, second);

        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    const nativeDate = new Date(raw);

    if (!Number.isNaN(nativeDate.getTime())) {
        return nativeDate;
    }

    return null;
}
