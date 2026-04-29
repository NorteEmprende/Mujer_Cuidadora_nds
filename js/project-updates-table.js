/**
 * project-updates-table.js
 * Archivo reservado para la futura lectura de la tabla externa
 * de avances, jornadas, actividades o bitácora del proyecto.
 * 
 * TODO: Esta tabla aún no existe.
 * TODO: Cuando se cree, se debe documentar en CONTEXTO_PROYECTO.txt:
 *   - URL de la tabla
 *   - Columnas esperadas
 *   - Sección que alimenta: "Bitácora del proyecto"
 *   - Fecha de integración
 */

// import { fetchTableData, safeText } from './table-utils.js';

/**
 * Carga y renderiza los avances del proyecto
 * desde una tabla externa.
 * 
 * @param {string} tableUrl - URL del CSV publicado (futura)
 * @returns {Object[]} - Arreglo de actualizaciones o vacío si no hay datos
 * 
 * TODO: No crear tarjetas dinámicas todavía.
 * TODO: No crear filtros todavía.
 * TODO: No crear modales todavía.
 */
export async function loadProjectUpdatesTable(tableUrl) {
    if (!tableUrl) {
        console.info('[project-updates-table] URL de tabla no configurada aún. Sección pendiente.');
        return [];
    }

    // TODO: Implementar cuando exista la tabla externa
    // const data = await fetchTableData(tableUrl);
    // renderUpdates(data);
    // return data;

    return [];
}

/**
 * TODO: Función futura para renderizar tarjetas de avances
 * en el contenedor #bitacora-proyecto-placeholder
 * 
 * @param {Object[]} updates
 */
// function renderUpdates(updates) {
//     const container = document.getElementById('bitacora-proyecto-placeholder');
//     if (!container || updates.length === 0) return;
//     // Lógica de renderizado futura
// }
