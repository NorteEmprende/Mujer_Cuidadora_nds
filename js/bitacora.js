/**
 * bitacora.js
 * Inicializador principal de la Bitácora dinámica.
 * Funciones: initBitacoraPreview (index.html) e initBitacoraPage (bitacora.html).
 */

import { BITACORA_PREVIEW_LIMIT } from './bitacora-config.js';
import { fetchBitacoraData } from './bitacora-data.js';
import { createBitacoraCard } from './bitacora-card.js';
import { openBitacoraModal } from './bitacora-modal.js';

/**
 * Inicializa la vista previa de la Bitácora en index.html.
 * Busca el contenedor #bitacora-preview-grid y renderiza las primeras 3 noticias.
 */
export async function initBitacoraPreview() {
    const container = document.querySelector('#bitacora-preview-grid');

    if (!container) return;

    renderStatus(container, 'loading', 'Cargando bitácora...');

    try {
        const noticias = await fetchBitacoraData();

        if (!noticias.length) {
            renderStatus(container, 'empty', 'No hay registros disponibles en este momento.');
            return;
        }

        const preview = noticias.slice(0, BITACORA_PREVIEW_LIMIT);
        renderBitacoraCards(container, preview);
    } catch (error) {
        console.error('[Bitácora Preview] Error:', error);
        renderStatus(container, 'error', 'No pudimos cargar la bitácora. Intenta nuevamente más tarde.');
    }
}

/**
 * Inicializa la página completa de la Bitácora en bitacora.html.
 * Busca el contenedor #bitacora-grid y el filtro #bitacora-municipio-filter.
 */
export async function initBitacoraPage() {
    const container = document.querySelector('#bitacora-grid');

    if (!container) return;

    const filterSelect = document.querySelector('#bitacora-municipio-filter');

    renderStatus(container, 'loading', 'Cargando bitácora...');

    try {
        const allNoticias = await fetchBitacoraData({ requireDate: false });

        if (!allNoticias.length) {
            renderStatus(container, 'empty', 'No hay registros disponibles en este momento.');
            return;
        }

        // Poblar filtro de municipios
        if (filterSelect) {
            populateMunicipioFilter(filterSelect, allNoticias);

            filterSelect.addEventListener('change', () => {
                const selected = filterSelect.value;

                const filtered = selected === 'all'
                    ? allNoticias
                    : allNoticias.filter(item => item.municipio === selected);

                if (filtered.length === 0) {
                    renderStatus(container, 'empty', 'No hay registros que coincidan con el municipio seleccionado.');
                } else {
                    renderBitacoraCards(container, filtered);
                }
            });
        }

        renderBitacoraCards(container, allNoticias);
    } catch (error) {
        console.error('[Bitácora Page] Error:', error);
        renderStatus(container, 'error', 'No pudimos cargar la bitácora. Intenta nuevamente más tarde.');
    }
}

/**
 * Renderiza las tarjetas de noticias en el contenedor.
 * @param {HTMLElement} container
 * @param {Array} noticias
 */
function renderBitacoraCards(container, noticias) {
    container.innerHTML = '';
    container.classList.remove('bitacora-grid--status');

    noticias.forEach(noticia => {
        const card = createBitacoraCard(noticia, (data) => {
            openBitacoraModal(data);
        });
        container.appendChild(card);
    });
}

/**
 * Muestra un estado (cargando, vacío, error) en el contenedor.
 * @param {HTMLElement} container
 * @param {'loading'|'empty'|'error'} type
 * @param {string} message
 */
function renderStatus(container, type, message) {
    container.classList.add('bitacora-grid--status');

    const iconMap = {
        loading: 'hourglass_empty',
        empty: 'article',
        error: 'error'
    };

    const icon = iconMap[type] || 'info';

    container.innerHTML = `
        <div class="bitacora-status bitacora-status--${type}">
            <span class="material-symbols-outlined bitacora-status__icon" aria-hidden="true">${icon}</span>
            <p class="bitacora-status__text">${message}</p>
        </div>
    `;
}

/**
 * Pobla el select de filtro con municipios únicos.
 * @param {HTMLSelectElement} filterSelect
 * @param {Array} noticias
 */
function populateMunicipioFilter(filterSelect, noticias) {
    const municipios = [...new Set(noticias.map(item => item.municipio))].sort();

    filterSelect.innerHTML = '<option value="all">Todos los municipios</option>';

    municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio;
        option.textContent = municipio;
        filterSelect.appendChild(option);
    });
}
