/**
 * bitacora-modal.js
 * Modal de detalle para noticias de la Bitácora con galería de imágenes.
 */

import { BITACORA_FALLBACK_IMAGE } from './bitacora-config.js';
import { escapeHtml } from './media-cuidadora-utils.js';

let currentModal = null;

/**
 * Abre el modal con los detalles completos de una noticia.
 * @param {Object} data - Datos de la noticia.
 */
export function openBitacoraModal(data) {
    closeBitacoraModal();

    const safeTitle = escapeHtml(data.titulo);
    const safeMunicipio = escapeHtml(data.municipio);
    const safeDate = escapeHtml(data.fecha);
    const safeDescripcion = escapeHtml(data.descripcion);
    const safeMainImg = escapeHtml(data.imagenes[0] || BITACORA_FALLBACK_IMAGE);

    const modal = document.createElement('div');
    modal.className = 'bitacora-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', safeTitle);

    const thumbsHtml = data.imagenes.length > 1
        ? `<div class="bitacora-modal__thumbs">
            ${data.imagenes.map((url, index) => {
                const safeUrl = escapeHtml(url);
                const activeClass = index === 0 ? ' is-active' : '';
                return `<button class="bitacora-modal__thumb${activeClass}" data-index="${index}" type="button">
                    <img src="${safeUrl}" alt="${safeTitle} - Miniatura ${index + 1}" loading="lazy">
                </button>`;
            }).join('')}
        </div>`
        : '';

    modal.innerHTML = `
        <div class="bitacora-modal__overlay"></div>
        <div class="bitacora-modal__container">
            <button class="bitacora-modal__close" aria-label="Cerrar modal" type="button">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>

            <div class="bitacora-modal__image">
                <img id="bitacora-modal-main-img" src="${safeMainImg}" alt="${safeTitle}">
            </div>

            ${thumbsHtml}

            <div class="bitacora-modal__meta">
                <span class="bitacora-modal__municipio">
                    <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                    ${safeMunicipio}
                </span>
                <span class="bitacora-modal__date">
                    <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                    ${safeDate}
                </span>
            </div>

            <h2 class="bitacora-modal__title">${safeTitle}</h2>

            <div class="bitacora-modal__description">
                <p>${safeDescripcion}</p>
            </div>

            <button class="btn btn--secondary bitacora-modal__back" type="button">
                <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                Volver
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Animación de entrada
    requestAnimationFrame(() => {
        modal.classList.add('is-open');
    });

    // Listeners
    const closeBtn = modal.querySelector('.bitacora-modal__close');
    const backBtn = modal.querySelector('.bitacora-modal__back');
    const overlay = modal.querySelector('.bitacora-modal__overlay');
    const mainImg = modal.querySelector('#bitacora-modal-main-img');

    closeBtn.addEventListener('click', closeBitacoraModal);
    backBtn.addEventListener('click', closeBitacoraModal);
    overlay.addEventListener('click', closeBitacoraModal);

    // Fallback para imagen principal
    mainImg.addEventListener('error', () => {
        mainImg.src = BITACORA_FALLBACK_IMAGE;
        mainImg.classList.add('is-fallback');
    }, { once: true });

    // Click en miniaturas para cambiar imagen principal
    const thumbs = modal.querySelectorAll('.bitacora-modal__thumb');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = Number(thumb.dataset.index);
            const newUrl = data.imagenes[index];

            if (newUrl && mainImg) {
                mainImg.src = newUrl;
                mainImg.classList.remove('is-fallback');

                // Actualizar estado activo
                thumbs.forEach(t => t.classList.remove('is-active'));
                thumb.classList.add('is-active');
            }
        });

        // Fallback para miniaturas rotas
        const thumbImg = thumb.querySelector('img');
        if (thumbImg) {
            thumbImg.addEventListener('error', () => {
                thumbImg.src = BITACORA_FALLBACK_IMAGE;
            }, { once: true });
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', handleEscape);

    // Focus trap
    closeBtn.focus();
}

/**
 * Cierra el modal de la Bitácora.
 */
export function closeBitacoraModal() {
    if (!currentModal) return;

    currentModal.classList.remove('is-open');
    currentModal.classList.add('is-closing');

    setTimeout(() => {
        if (currentModal && currentModal.parentNode) {
            currentModal.parentNode.removeChild(currentModal);
        }
        currentModal = null;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
    }, 300);
}

/**
 * Maneja la tecla Escape para cerrar el modal.
 */
function handleEscape(event) {
    if (event.key === 'Escape') {
        closeBitacoraModal();
    }
}
