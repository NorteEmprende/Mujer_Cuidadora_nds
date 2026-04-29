/**
 * placeholders.js
 * Lógica mínima para secciones placeholder futuras
 */

/**
 * Inicializa las secciones placeholder con mensajes informativos
 */
export function initPlaceholders() {
    const historias = document.getElementById('historias-transformacion-placeholder');
    const bitacora = document.getElementById('bitacora-proyecto-placeholder');

    // Las secciones ya contienen su contenido estático en el HTML.
    // Esta función queda preparada para agregar lógica futura
    // cuando se conecten las tablas externas.

    if (historias) {
        historias.setAttribute('data-status', 'pending');
        historias.setAttribute('data-source', 'women-stories-table');
    }

    if (bitacora) {
        bitacora.setAttribute('data-status', 'pending');
        bitacora.setAttribute('data-source', 'project-updates-table');
    }
}
