/**
 * documentation-guard.js
 * Recordatorio en consola para mantenimiento por IA o desarrolladores
 */

/**
 * Imprime en consola un recordatorio de documentación
 */
export function initDocumentationGuard() {
    console.info(
        '%c📋 RECORDATORIO DE MANTENIMIENTO',
        'color: #522989; font-weight: bold; font-size: 14px;'
    );
    console.info(
        '%cAntes de editar, revisa CONTEXTO_PROYECTO.txt y actualiza el historial de cambios.',
        'color: #625A6D; font-size: 12px;'
    );
    console.info(
        '%cEste proyecto sigue una arquitectura modular. Consulta la documentación antes de modificar archivos.',
        'color: #625A6D; font-size: 11px;'
    );
}
