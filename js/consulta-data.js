/**
 * consulta-data.js
 * Carga, normalización y consulta de documentos para la sección
 * "Consulta tu resultado".
 *
 * Privacidad: de cada CSV solo se extrae la columna de documento; el resto
 * de columnas nunca se lee ni se conserva. Los documentos normalizados se
 * guardan únicamente en memoria (Set) durante la sesión de la página, nunca
 * en localStorage, sessionStorage, cookies ni ningún almacenamiento persistente.
 */

import { parseRobustCSV } from './media-cuidadora-utils.js';
import {
    CONSULTA_SELECCIONADAS_CSV_URL,
    CONSULTA_PARTICIPANTES_CSV_URL,
    CONSULTA_DOCUMENTO_COLUMN_ALIASES
} from './consulta-config.js';

export const CONSULTA_RESULT = Object.freeze({
    SELECCIONADA: 'seleccionada',
    NO_SELECCIONADA: 'no-seleccionada',
    NO_ENCONTRADA: 'no-encontrada'
});

export class ConsultaFuenteError extends Error {
    constructor(message, reason) {
        super(message);
        this.name = 'ConsultaFuenteError';
        this.reason = reason;
    }
}

// Cache en memoria: url -> Promise<Set<string>>. Se conserva mientras dure
// la carga de la página; nunca se persiste en disco ni en el navegador.
const sourceCache = new Map();

export function normalizeDocumento(rawValue = '') {
    return String(rawValue ?? '')
        .trim()
        .replace(/[.,\-\s]/g, '')
        .replace(/\D/g, '');
}

function normalizeHeader(value = '') {
    return String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[.,]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function findDocumentColumnIndex(headerRow = []) {
    const normalizedHeaders = headerRow.map(normalizeHeader);
    return normalizedHeaders.findIndex((header) => CONSULTA_DOCUMENTO_COLUMN_ALIASES.includes(header));
}

async function loadDocumentSet(url) {
    let response;

    try {
        response = await fetch(url);
    } catch (error) {
        throw new ConsultaFuenteError('No se pudo conectar con la fuente de datos.', 'network');
    }

    if (!response.ok) {
        throw new ConsultaFuenteError(`Respuesta HTTP inválida: ${response.status}`, 'http');
    }

    let csvText;

    try {
        csvText = await response.text();
    } catch (error) {
        throw new ConsultaFuenteError('No se pudo leer la respuesta del servidor.', 'network');
    }

    let rows;

    try {
        rows = parseRobustCSV(csvText);
    } catch (error) {
        throw new ConsultaFuenteError('No se pudo interpretar el archivo CSV.', 'parse');
    }

    if (!rows.length) {
        throw new ConsultaFuenteError('El archivo CSV está vacío.', 'empty');
    }

    const columnIndex = findDocumentColumnIndex(rows[0]);

    if (columnIndex === -1) {
        throw new ConsultaFuenteError('No se encontró la columna de documento en el CSV.', 'no-column');
    }

    // Solo se conserva la columna de documento, normalizada; el resto de
    // cada fila (nombres, teléfonos, municipios, etc.) se descarta aquí
    // mismo y nunca llega a construirse como objeto ni a la interfaz.
    const documentSet = new Set();

    rows.slice(1).forEach((row) => {
        const normalized = normalizeDocumento(row[columnIndex]);

        if (normalized) {
            documentSet.add(normalized);
        }
    });

    return documentSet;
}

function getDocumentSet(url) {
    if (!sourceCache.has(url)) {
        const promise = loadDocumentSet(url).catch((error) => {
            // No se cachean los errores: permite reintentar en la próxima consulta.
            sourceCache.delete(url);
            throw error;
        });

        sourceCache.set(url, promise);
    }

    return sourceCache.get(url);
}

function getSeleccionadasSet() {
    return getDocumentSet(CONSULTA_SELECCIONADAS_CSV_URL);
}

function getParticipantesSet() {
    return getDocumentSet(CONSULTA_PARTICIPANTES_CSV_URL);
}

/**
 * Consulta un documento ya normalizado contra las dos fuentes, respetando
 * la prioridad: primero seleccionadas, luego participantes generales.
 * Si la primera fuente falla, se propaga el error sin consultar la segunda
 * ni concluir "no seleccionada".
 */
export async function consultarDocumento(normalizedDocumento) {
    const seleccionadas = await getSeleccionadasSet();

    if (seleccionadas.has(normalizedDocumento)) {
        return CONSULTA_RESULT.SELECCIONADA;
    }

    const participantes = await getParticipantesSet();

    if (participantes.has(normalizedDocumento)) {
        return CONSULTA_RESULT.NO_SELECCIONADA;
    }

    return CONSULTA_RESULT.NO_ENCONTRADA;
}
