/**
 * media-cuidadora-modal.js
 * Modal para reproducir videos de la bitácora.
 */

import {
    escapeHtml,
    truncateText,
    getYouTubeEmbedUrl
} from './media-cuidadora-utils.js';

let modalElement = null;
let modalBody = null;
let currentVideos = [];
let currentIndex = 0;
let currentViewMode = null;
let orientationHandler = null;
let listenersReady = false;

export function openMujerCuidadoraMediaModal(videos = [], index = 0) {
    if (!videos.length || !videos[index]) {
        return;
    }

    ensureModal();

    currentVideos = videos;
    currentIndex = index;
    currentViewMode = null;

    renderModalContent();
}

export function closeMujerCuidadoraMediaModal() {
    if (!modalElement || !modalBody) {
        return;
    }

    modalElement.classList.remove('is-open');
    modalElement.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
    document.body.classList.remove('cuidadora-media-modal-open');
    removeOrientationListener();
}

function ensureModal() {
    if (modalElement && modalBody) {
        return;
    }

    modalElement = document.getElementById('cuidadora-media-modal');

    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = 'cuidadora-media-modal';
        modalElement.className = 'cuidadora-media-modal';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.setAttribute('role', 'dialog');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.setAttribute('aria-label', 'Video de la bitácora del proyecto');

        modalElement.innerHTML = `
            <div class="cuidadora-media-modal__content" role="document">
                <button class="cuidadora-media-modal__close" type="button" aria-label="Cerrar video">
                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
                <div class="cuidadora-media-modal__body" id="cuidadora-media-modal-body"></div>
            </div>
        `;

        document.body.appendChild(modalElement);
    }

    modalBody = modalElement.querySelector('#cuidadora-media-modal-body');

    if (!listenersReady) {
        bindBaseListeners();
        listenersReady = true;
    }
}

function bindBaseListeners() {
    const closeButton = modalElement.querySelector('.cuidadora-media-modal__close');

    closeButton?.addEventListener('click', closeMujerCuidadoraMediaModal);

    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            closeMujerCuidadoraMediaModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            modalElement &&
            modalElement.classList.contains('is-open')
        ) {
            closeMujerCuidadoraMediaModal();
        }
    });
}

function renderModalContent() {
    const video = currentVideos[currentIndex];

    if (!video) {
        return;
    }

    const isMobilePortrait =
        window.matchMedia('(max-width: 768px)').matches &&
        window.matchMedia('(orientation: portrait)').matches;

    if (
        video.formato === 'horizontal' &&
        isMobilePortrait &&
        currentViewMode === null
    ) {
        renderOrientationChoice(video);
        return;
    }

    renderVideoPlayer(video);
}

function renderOrientationChoice(video) {
    const safeTitle = escapeHtml(video.titulo);

    openModalHtml(`
        <div class="cuidadora-media-modal-layout">
            <div class="cuidadora-media-orientation">
                <div class="cuidadora-media-orientation__icon">
                    <span class="material-symbols-outlined" aria-hidden="true">screen_rotation</span>
                </div>
                <h3>${safeTitle}</h3>
                <p>Este video está en formato horizontal. Para verlo mejor, puedes girar tu teléfono o reproducirlo directamente.</p>
                <div class="cuidadora-media-orientation__actions">
                    <button class="btn btn--primary" id="cuidadora-media-view-normal" type="button">
                        <span class="material-symbols-outlined" aria-hidden="true">open_in_full</span>
                        Ver completo
                    </button>
                    <button class="btn btn--secondary" id="cuidadora-media-view-rotated" type="button">
                        <span class="material-symbols-outlined" aria-hidden="true">screen_rotation</span>
                        Ver girado
                    </button>
                </div>
            </div>
            ${buildNavigationHtml()}
        </div>
    `);

    bindNavigationListeners();

    document
        .getElementById('cuidadora-media-view-normal')
        ?.addEventListener('click', () => {
            currentViewMode = 'normal';
            renderModalContent();
        });

    document
        .getElementById('cuidadora-media-view-rotated')
        ?.addEventListener('click', () => {
            currentViewMode = 'rotated';
            renderModalContent();
        });
}

function renderVideoPlayer(video) {
    const safeTitle = escapeHtml(video.titulo);
    const safeDate = escapeHtml(video.fecha);
    const safeDescription = escapeHtml(video.descripcion);
    const shortDescription = escapeHtml(truncateText(video.descripcion, 180));
    const hasLongDescription = String(video.descripcion ?? '').length > 180;

    const isVertical = video.formato === 'vertical';
    const isRotated = currentViewMode === 'rotated';
    const embedUrl = getYouTubeEmbedUrl(video.videoId);

    let iframeClass = 'cuidadora-media-iframe';

    if (isVertical) {
        iframeClass += ' cuidadora-media-iframe--vertical';
    } else if (isRotated) {
        iframeClass += ' cuidadora-media-iframe--rotated';
    } else {
        iframeClass += ' cuidadora-media-iframe--horizontal';
    }

    openModalHtml(`
        <div class="cuidadora-media-modal-layout ${isVertical ? 'is-vertical' : 'is-horizontal'}">
            <div class="${iframeClass}">
                <iframe
                    src="${embedUrl}"
                    title="${safeTitle}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy">
                </iframe>

                ${
                    isRotated
                        ? `<button class="cuidadora-media-switch-btn" id="cuidadora-media-switch-normal" type="button">Ver completo</button>`
                        : ''
                }
            </div>

            <div class="cuidadora-media-modal-info">
                <div class="cuidadora-media-modal-meta">
                    <span>
                        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                        ${safeDate}
                    </span>
                </div>

                <h3>${safeTitle}</h3>

                <div class="cuidadora-media-modal-desc-wrap">
                    <p id="cuidadora-media-modal-desc">${shortDescription}</p>
                    ${
                        hasLongDescription
                            ? `<button class="cuidadora-media-desc-toggle" id="cuidadora-media-desc-toggle" type="button">Ver más</button>`
                            : ''
                    }
                </div>
            </div>

            ${buildNavigationHtml()}
        </div>
    `);

    bindNavigationListeners();
    bindDescriptionToggle(safeDescription, shortDescription);
    bindOrientationListener();

    document
        .getElementById('cuidadora-media-switch-normal')
        ?.addEventListener('click', () => {
            currentViewMode = 'normal';
            renderModalContent();
        });
}

function openModalHtml(html) {
    ensureModal();

    modalBody.innerHTML = html;
    modalElement.classList.add('is-open');
    modalElement.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cuidadora-media-modal-open');
}

function buildNavigationHtml() {
    if (currentVideos.length <= 1) {
        return '';
    }

    return `
        <div class="cuidadora-media-nav">
            <button class="cuidadora-media-nav__btn" id="cuidadora-media-prev" type="button" aria-label="Video anterior">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <span class="cuidadora-media-nav__counter">
                ${currentIndex + 1} / ${currentVideos.length}
            </span>
            <button class="cuidadora-media-nav__btn" id="cuidadora-media-next" type="button" aria-label="Video siguiente">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
        </div>
    `;
}

function bindNavigationListeners() {
    document
        .getElementById('cuidadora-media-prev')
        ?.addEventListener('click', (event) => {
            event.stopPropagation();
            currentIndex = (currentIndex - 1 + currentVideos.length) % currentVideos.length;
            currentViewMode = null;
            renderModalContent();
        });

    document
        .getElementById('cuidadora-media-next')
        ?.addEventListener('click', (event) => {
            event.stopPropagation();
            currentIndex = (currentIndex + 1) % currentVideos.length;
            currentViewMode = null;
            renderModalContent();
        });
}

function bindDescriptionToggle(fullDescription, shortDescription) {
    const button = document.getElementById('cuidadora-media-desc-toggle');
    const description = document.getElementById('cuidadora-media-modal-desc');

    if (!button || !description) {
        return;
    }

    let expanded = false;

    button.addEventListener('click', () => {
        expanded = !expanded;
        description.textContent = expanded ? fullDescription : shortDescription;
        button.textContent = expanded ? 'Ver menos' : 'Ver más';
        description.classList.toggle('is-expanded', expanded);
    });
}

function bindOrientationListener() {
    removeOrientationListener();

    orientationHandler = () => {
        const video = currentVideos[currentIndex];

        if (!video) {
            return;
        }

        const isLandscape = window.matchMedia('(orientation: landscape)').matches;

        if (
            video.formato === 'horizontal' &&
            isLandscape &&
            currentViewMode === 'rotated'
        ) {
            currentViewMode = 'normal';
            renderModalContent();
        }
    };

    window.addEventListener('resize', orientationHandler);
    window.addEventListener('orientationchange', orientationHandler);
}

function removeOrientationListener() {
    if (!orientationHandler) {
        return;
    }

    window.removeEventListener('resize', orientationHandler);
    window.removeEventListener('orientationchange', orientationHandler);
    orientationHandler = null;
}
