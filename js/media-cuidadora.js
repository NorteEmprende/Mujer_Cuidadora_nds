/**
 * media-cuidadora.js
 * Inicializador visual de la Bitácora del proyecto.
 */

import { MUJER_CUIDADORA_FALLBACK_IMAGE } from './media-cuidadora-config.js';
import { fetchMujerCuidadoraMediaData } from './media-cuidadora-data.js';
import { openMujerCuidadoraMediaModal } from './media-cuidadora-modal.js';
import { escapeHtml, truncateText } from './media-cuidadora-utils.js';

const BITACORA_CONTAINER_ID = 'bitacora-proyecto-placeholder';

export async function initMujerCuidadoraMedia() {
    const container = document.getElementById(BITACORA_CONTAINER_ID);

    if (!container) {
        return;
    }

    const options = getMediaRenderOptions(container);

    renderLoading(container);

    try {
        const videos = await fetchMujerCuidadoraMediaData();

        if (!videos.length) {
            renderEmptyState(container);
            return;
        }

        renderMediaGrid(container, videos, options);
    } catch (error) {
        console.error('[Mujer Cuidadora Media] Error inicializando módulo:', error);
        renderErrorState(container);
    }
}

function getMediaRenderOptions(container) {
    const mode = container.dataset.mediaMode || 'preview';
    const rawLimit = container.dataset.mediaLimit || '4';
    const showCta = container.dataset.mediaShowCta === 'true';

    let limit = 4;

    if (rawLimit === 'all' || mode === 'full') {
        limit = null;
    } else {
        const parsedLimit = Number.parseInt(rawLimit, 10);
        limit = Number.isNaN(parsedLimit) ? 4 : parsedLimit;
    }

    return {
        mode,
        limit,
        showCta
    };
}

function renderLoading(container) {
    prepareContainer(container);

    container.innerHTML = `
        <div class="cuidadora-media-state">
            <div class="cuidadora-media-state__icon">
                <span class="material-symbols-outlined" aria-hidden="true">hourglass_empty</span>
            </div>
            <p>Cargando galería del proyecto...</p>
        </div>
    `;
}

function renderEmptyState(container) {
    prepareContainer(container);
    container.setAttribute('data-status', 'empty');

    container.innerHTML = `
        <div class="cuidadora-media-state">
            <div class="cuidadora-media-state__icon">
                <span class="material-symbols-outlined" aria-hidden="true">video_library</span>
            </div>
            <h3>Galería en preparación</h3>
            <p>Aún no hay videos o noticias disponibles para esta sección.</p>
        </div>
    `;
}

function renderErrorState(container) {
    prepareContainer(container);
    container.setAttribute('data-status', 'error');

    container.innerHTML = `
        <div class="cuidadora-media-state cuidadora-media-state--error">
            <div class="cuidadora-media-state__icon">
                <span class="material-symbols-outlined" aria-hidden="true">error</span>
            </div>
            <h3>No pudimos cargar la galería</h3>
            <p>Por favor intenta nuevamente más tarde.</p>
        </div>
    `;
}

function renderMediaGrid(container, videos, options = {}) {
    prepareContainer(container);
    container.setAttribute('data-status', 'loaded');

    const visibleVideos = options.limit
        ? videos.slice(0, options.limit)
        : videos;

    container.innerHTML = `
        <div class="cuidadora-media-intro" aria-label="Introducción de la bitácora">
            <span class="cuidadora-media-intro__badge">
                <span class="material-symbols-outlined" aria-hidden="true">volunteer_activism</span>
                Avances del proceso
            </span>
            <p>Historias, jornadas y momentos clave del proyecto Mujeres Cuidadoras Emprenden.</p>
        </div>
        <div class="cuidadora-media-grid" id="cuidadora-media-grid"></div>
        ${options.showCta ? buildViewAllButton() : ''}
    `;

    const grid = container.querySelector('#cuidadora-media-grid');

    visibleVideos.forEach((video, index) => {
        grid.appendChild(createMediaCard(video, index, visibleVideos));
    });
}

function prepareContainer(container) {
    container.classList.add('cuidadora-media-ready');
}

function buildViewAllButton() {
    return `
        <div class="cuidadora-media-actions">
            <a href="manos-que-cuidan.html" class="btn btn--primary">
                Ver Manos que cuidan
                <span class="btn__arrow">&rarr;</span>
            </a>
        </div>
    `;
}

function createMediaCard(video, index, videos) {
    const card = document.createElement('article');

    card.className = 'cuidadora-media-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Ver video: ${video.titulo}`);

    const safeTitle = escapeHtml(video.titulo);
    const safeDate = escapeHtml(video.fecha);
    const safeDescription = escapeHtml(truncateText(video.descripcion, 115));
    const safeThumbnail = escapeHtml(video.thumbnailUrl);

    card.innerHTML = `
        <div class="cuidadora-media-card__thumb">
            <img
                src="${safeThumbnail}"
                alt="${safeTitle}"
                loading="lazy"
                class="cuidadora-media-card__image"
            >
            <div class="cuidadora-media-card__play" aria-hidden="true">
                <span class="material-symbols-outlined">play_arrow</span>
            </div>
        </div>

        <div class="cuidadora-media-card__content">
            <span class="cuidadora-media-card__date">
                <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                ${safeDate}
            </span>
            <h3>${safeTitle}</h3>
            <p>${safeDescription}</p>
        </div>
    `;

    const image = card.querySelector('img');

    image?.addEventListener(
        'error',
        () => {
            image.src = MUJER_CUIDADORA_FALLBACK_IMAGE;
            image.classList.add('is-fallback');
        },
        { once: true }
    );

    card.addEventListener('click', () => {
        openMujerCuidadoraMediaModal(videos, index);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openMujerCuidadoraMediaModal(videos, index);
        }
    });

    return card;
}
