/**
 * table-utils.js
 * Utilidades preparadas para futura lectura de tablas externas (CSV/Google Sheets)
 * 
 * TODO: La integración real se hará cuando existan las tablas externas.
 * Por ahora, estas funciones están listas para reutilizarse.
 */

/**
 * Parsea texto CSV a un arreglo de objetos usando la primera fila como encabezados
 * @param {string} text - Contenido CSV
 * @param {string} delimiter - Delimitador (por defecto coma)
 * @returns {Object[]}
 */
export function parseCSV(text, delimiter = ',') {
    if (!text || typeof text !== 'string') return [];

    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((header, i) => {
            row[header] = values[i] || '';
        });
        return row;
    });
}

/**
 * Normaliza una fila de tabla removiendo espacios extra
 * @param {Object} row - Fila a normalizar
 * @returns {Object}
 */
export function normalizeTableRow(row) {
    if (!row || typeof row !== 'object') return {};

    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
        normalized[key.trim()] = typeof value === 'string' ? value.trim() : value;
    });
    return normalized;
}

/**
 * Sanitiza un valor para uso seguro en HTML
 * @param {*} value
 * @returns {string}
 */
export function safeText(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Valida que una URL sea un enlace válido de tabla (Google Sheets CSV publicado)
 * @param {string} url
 * @returns {boolean}
 */
export function isValidTableUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && url.includes('docs.google.com');
    } catch {
        return false;
    }
}

/**
 * TODO: Función futura para hacer fetch de una tabla CSV publicada
 * No se ejecuta automáticamente hasta que exista una URL configurada.
 * 
 * @param {string} url - URL del CSV publicado
 * @returns {Promise<Object[]>}
 */
export async function fetchTableData(url) {
    if (!isValidTableUrl(url)) {
        console.warn('[table-utils] URL no configurada o no válida:', url);
        return [];
    }

    // TODO: Implementar fetch real cuando se tengan las URLs definitivas
    // const response = await fetch(url);
    // const text = await response.text();
    // return parseCSV(text);

    return [];
}
