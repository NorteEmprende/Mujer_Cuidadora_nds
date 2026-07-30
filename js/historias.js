/**
 * historias.js
 * Inicializador de la sección "Historias de transformación".
 * Se usa tanto en el resumen de index.html como en la página historias.html,
 * configurado mediante atributos data-historias-* en el contenedor.
 */

import { HISTORIAS_FALLBACK_IMAGE, HISTORIAS_PREVIEW_LIMIT } from './historias-config.js';
import { fetchHistoriasData } from './historias-data.js';
import { openHistoriaModal } from './historias-modal.js';
import { escapeHtml, truncateText } from './media-cuidadora-utils.js';

const HISTORIAS_CONTAINER_ID = 'historias-container';

export async function initHistoriasSection() {
    const container = document.getElementById(HISTORIAS_CONTAINER_ID);

    if (!container) {
        return;
    }

    const options = getRenderOptions(container);

    renderLoading(container);

    try {
        const stories = await fetchHistoriasData();

        if (!stories.length) {
            renderEmptyState(container);
            return;
        }

        renderStoriesGrid(container, stories, options);
    } catch (error) {
        console.error('[Historias] Error inicializando sección:', error);
        renderErrorState(container);
    }
}

function getRenderOptions(container) {
    const mode = container.dataset.historiasMode || 'preview';
    const rawLimit = container.dataset.historiasLimit || String(HISTORIAS_PREVIEW_LIMIT);
    const showCta = container.dataset.historiasShowCta === 'true';

    let limit = HISTORIAS_PREVIEW_LIMIT;

    if (rawLimit === 'all' || mode === 'full') {
        limit = null;
    } else {
        const parsedLimit = Number.parseInt(rawLimit, 10);
        limit = Number.isNaN(parsedLimit) ? HISTORIAS_PREVIEW_LIMIT : parsedLimit;
    }

    return { mode, limit, showCta };
}

function renderLoading(container) {
    prepareContainer(container);

    container.innerHTML = `
        <div class="historias-state">
            <div class="historias-state__icon">
                <span class="material-symbols-outlined" aria-hidden="true">hourglass_empty</span>
            </div>
            <p>Cargando historias...</p>
        </div>
    `;
}

function renderEmptyState(container) {
    prepareContainer(container);
    container.setAttribute('data-status', 'empty');

    container.innerHTML = `
        <div class="historias-state">
            <div class="historias-state__icon">
                <span class="material-symbols-outlined" aria-hidden="true">auto_stories</span>
            </div>
            <h3>Historias en camino</h3>
            <p>Pronto conocerás nuevas historias de transformación.</p>
        </div>
    `;
}

function renderErrorState(container) {
    prepareContainer(container);
    container.setAttribute('data-status', 'error');

    container.innerHTML = `
        <div class="historias-state historias-state--error">
            <div class="historias-state__icon">
                <span class="material-symbols-outlined" aria-hidden="true">error</span>
            </div>
            <h3>No fue posible cargar las historias en este momento.</h3>
            <button class="btn btn--secondary" id="historias-retry" type="button">Reintentar</button>
        </div>
    `;

    document.getElementById('historias-retry')?.addEventListener('click', () => {
        initHistoriasSection();
    });
}

function renderStoriesGrid(container, stories, options = {}) {
    prepareContainer(container);
    container.setAttribute('data-status', 'loaded');

    const visibleStories = options.limit
        ? stories.slice(0, options.limit)
        : stories;

    container.innerHTML = `
        <div class="historias-grid" id="historias-grid"></div>
        ${options.showCta ? buildViewAllButton() : ''}
    `;

    const grid = container.querySelector('#historias-grid');

    visibleStories.forEach((story, index) => {
        grid.appendChild(createHistoriaCard(story, index, visibleStories));
    });
}

function prepareContainer(container) {
    container.classList.add('historias-ready');
}

function buildViewAllButton() {
    return `
        <div class="historias-actions">
            <a href="historias.html" class="btn btn--primary">
                Ver todas las historias
                <span class="btn__arrow">&rarr;</span>
            </a>
        </div>
    `;
}

function createHistoriaCard(story, index, stories) {
    const card = document.createElement('article');

    card.className = 'historia-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Conocer la historia: ${story.titulo}`);

    const safeTitle = escapeHtml(story.titulo);
    const safeSummary = escapeHtml(truncateText(story.cuerpo, 130));
    const safeThumbnail = escapeHtml(story.thumbnailUrl);

    card.innerHTML = `
        <div class="historia-card__thumb">
            <img
                src="${safeThumbnail}"
                alt="${safeTitle}"
                loading="lazy"
                class="historia-card__image"
            >
        </div>
        <div class="historia-card__content">
            <h3>${safeTitle}</h3>
            ${safeSummary ? `<p>${safeSummary}</p>` : ''}
            <span class="historia-card__cta">
                Conocer la historia
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </span>
        </div>
    `;

    const image = card.querySelector('img');

    image?.addEventListener(
        'error',
        () => {
            image.src = HISTORIAS_FALLBACK_IMAGE;
            image.classList.add('is-fallback');
        },
        { once: true }
    );

    card.addEventListener('click', () => {
        openHistoriaModal(stories, index);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openHistoriaModal(stories, index);
        }
    });

    return card;
}
