/**
 * historias-modal.js
 * Modal accesible para leer una historia completa y su video.
 * A diferencia del modal de la bitácora, abre el video directamente
 * sin mensajes previos sobre la orientación.
 */

import { escapeHtml, getYouTubeEmbedUrl } from './media-cuidadora-utils.js';

let modalElement = null;
let modalBody = null;
let currentStories = [];
let currentIndex = 0;
let listenersReady = false;
let lastFocusedElement = null;

export function openHistoriaModal(stories = [], index = 0) {
    if (!stories.length || !stories[index]) {
        return;
    }

    lastFocusedElement = document.activeElement;

    ensureModal();

    currentStories = stories;
    currentIndex = index;

    renderModalContent();

    modalElement.classList.add('is-open');
    modalElement.setAttribute('aria-hidden', 'false');
    document.body.classList.add('historia-modal-open');

    const closeButton = modalElement.querySelector('.historia-modal__close');
    closeButton?.focus();
}

export function closeHistoriaModal() {
    if (!modalElement || !modalBody) {
        return;
    }

    modalElement.classList.remove('is-open');
    modalElement.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
    document.body.classList.remove('historia-modal-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }

    lastFocusedElement = null;
}

function ensureModal() {
    if (modalElement && modalBody) {
        return;
    }

    modalElement = document.getElementById('historia-modal');

    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = 'historia-modal';
        modalElement.className = 'historia-modal';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.setAttribute('role', 'dialog');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.setAttribute('aria-labelledby', 'historia-modal-title');

        modalElement.innerHTML = `
            <div class="historia-modal__content" role="document">
                <button class="historia-modal__close" type="button" aria-label="Cerrar historia">
                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
                <div class="historia-modal__body" id="historia-modal-body"></div>
            </div>
        `;

        document.body.appendChild(modalElement);
    }

    modalBody = modalElement.querySelector('#historia-modal-body');

    if (!listenersReady) {
        bindBaseListeners();
        listenersReady = true;
    }
}

function bindBaseListeners() {
    const closeButton = modalElement.querySelector('.historia-modal__close');

    closeButton?.addEventListener('click', closeHistoriaModal);

    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            closeHistoriaModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!modalElement || !modalElement.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            closeHistoriaModal();
            return;
        }

        if (event.key === 'Tab') {
            trapFocus(event);
        }
    });
}

function trapFocus(event) {
    const focusableSelectors = 'button, [href], [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modalElement.querySelectorAll(focusableSelectors))
        .filter((el) => !el.hasAttribute('disabled'));

    if (!focusable.length) {
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function renderModalContent() {
    const story = currentStories[currentIndex];

    if (!story) {
        return;
    }

    const safeTitle = escapeHtml(story.titulo);
    const safeBody = escapeHtml(story.cuerpo || '');

    modalBody.innerHTML = `
        <div class="historia-modal-layout">
            ${buildVideoHtml(story, safeTitle)}
            <div class="historia-modal-info">
                <h3 id="historia-modal-title">${safeTitle}</h3>
                ${safeBody ? `<p class="historia-modal-body-text">${safeBody}</p>` : ''}
            </div>
            ${buildNavigationHtml()}
        </div>
    `;

    bindNavigationListeners();
}

function buildVideoHtml(story, safeTitle) {
    const video = story.video || { type: null };
    const orientationClass = story.formato === 'vertical'
        ? 'story-video--vertical'
        : 'story-video--horizontal';

    if (video.type === 'youtube') {
        const embedUrl = getYouTubeEmbedUrl(video.videoId);

        return `
            <div class="story-video ${orientationClass}">
                <iframe
                    src="${embedUrl}"
                    title="${safeTitle}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
        `;
    }

    if (video.type === 'file') {
        const safeSrc = escapeHtml(video.src);

        return `
            <div class="story-video ${orientationClass}">
                <video controls preload="metadata" src="${safeSrc}"></video>
            </div>
        `;
    }

    return `
        <div class="historia-modal-no-video">
            <span class="material-symbols-outlined" aria-hidden="true">auto_stories</span>
        </div>
    `;
}

function buildNavigationHtml() {
    if (currentStories.length <= 1) {
        return '';
    }

    return `
        <div class="historia-modal-nav">
            <button class="historia-modal-nav__btn" id="historia-modal-prev" type="button" aria-label="Historia anterior">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
            </button>
            <span class="historia-modal-nav__counter">
                ${currentIndex + 1} / ${currentStories.length}
            </span>
            <button class="historia-modal-nav__btn" id="historia-modal-next" type="button" aria-label="Historia siguiente">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
        </div>
    `;
}

function bindNavigationListeners() {
    document
        .getElementById('historia-modal-prev')
        ?.addEventListener('click', (event) => {
            event.stopPropagation();
            currentIndex = (currentIndex - 1 + currentStories.length) % currentStories.length;
            renderModalContent();
        });

    document
        .getElementById('historia-modal-next')
        ?.addEventListener('click', (event) => {
            event.stopPropagation();
            currentIndex = (currentIndex + 1) % currentStories.length;
            renderModalContent();
        });
}
