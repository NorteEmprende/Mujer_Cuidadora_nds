/**
 * bitacora-card.js
 * Generación de tarjetas de la Bitácora con carrusel automático.
 */

import { BITACORA_FALLBACK_IMAGE } from './bitacora-config.js';
import { escapeHtml, truncateText } from './media-cuidadora-utils.js';

/**
 * Crea un elemento article con la tarjeta de una noticia de la Bitácora.
 * @param {Object} data - Datos de la noticia.
 * @param {Function} onClickCallback - Callback cuando se hace clic en la tarjeta.
 * @returns {HTMLElement}
 */
export function createBitacoraCard(data, onClickCallback) {
    const card = document.createElement('article');
    card.className = 'bitacora-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Leer noticia: ${data.titulo}`);

    const safeTitle = escapeHtml(data.titulo);
    const safeMunicipio = escapeHtml(data.municipio);
    const safeDate = escapeHtml(data.fecha);
    const safeExcerpt = escapeHtml(truncateText(data.descripcion, 120));
    const hasMultipleImages = data.imagenes.length > 1;

    card.innerHTML = `
        <div class="bitacora-card__media">
            ${hasMultipleImages ? buildCarousel(data.imagenes, safeTitle) : buildSingleImage(data.imagenes[0], safeTitle)}
            <span class="bitacora-card__tag">${safeMunicipio}</span>
        </div>
        <div class="bitacora-card__content">
            <span class="bitacora-card__date">
                <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                ${safeDate}
            </span>
            <h3 class="bitacora-card__title">${safeTitle}</h3>
            <p class="bitacora-card__excerpt">${safeExcerpt}</p>
            <div class="bitacora-card__footer">
                <span class="bitacora-card__cta">Leer más <span class="bitacora-card__arrow">&rarr;</span></span>
            </div>
        </div>
    `;

    // Fallback para imágenes rotas
    const images = card.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', () => {
            img.src = BITACORA_FALLBACK_IMAGE;
            img.classList.add('is-fallback');
        }, { once: true });
    });

    // Click para abrir modal (no en dots)
    card.addEventListener('click', (event) => {
        if (event.target.closest('.bitacora-carousel__dot')) {
            return;
        }
        if (onClickCallback) {
            onClickCallback(data);
        }
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (onClickCallback) {
                onClickCallback(data);
            }
        }
    });

    // Inicializar carrusel si hay múltiples imágenes
    if (hasMultipleImages) {
        requestAnimationFrame(() => {
            initBitacoraCardCarousel(card, data.imagenes.length);
        });
    }

    return card;
}

/**
 * Construye HTML para imagen única.
 */
function buildSingleImage(imgUrl, alt) {
    const safeUrl = escapeHtml(imgUrl);
    return `<img src="${safeUrl}" alt="${alt}" loading="lazy" class="bitacora-card__image">`;
}

/**
 * Construye HTML para carrusel de imágenes.
 */
function buildCarousel(imagenes, alt) {
    const slides = imagenes.map((url, index) => {
        const safeUrl = escapeHtml(url);
        const activeClass = index === 0 ? ' is-active' : '';
        return `<div class="bitacora-carousel__slide${activeClass}">
            <img src="${safeUrl}" alt="${alt} - Foto ${index + 1}" loading="lazy" class="bitacora-card__image">
        </div>`;
    }).join('');

    const dots = imagenes.map((_, index) => {
        const activeClass = index === 0 ? ' is-active' : '';
        return `<button class="bitacora-carousel__dot${activeClass}" data-index="${index}" aria-label="Foto ${index + 1}" type="button"></button>`;
    }).join('');

    return `
        <div class="bitacora-carousel" data-bitacora-carousel>
            <div class="bitacora-carousel__slides">${slides}</div>
            <div class="bitacora-carousel__controls">
                <div class="bitacora-carousel__dots">${dots}</div>
                <span class="bitacora-carousel__counter">1/${imagenes.length}</span>
            </div>
        </div>
    `;
}

/**
 * Inicializa el carrusel automático dentro de una tarjeta.
 * @param {HTMLElement} cardEl - Elemento de la tarjeta.
 * @param {number} totalSlides - Total de slides.
 */
function initBitacoraCardCarousel(cardEl, totalSlides) {
    let currentIndex = 0;
    let intervalId = null;

    const carousel = cardEl.querySelector('[data-bitacora-carousel]');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.bitacora-carousel__slide');
    const dots = carousel.querySelectorAll('.bitacora-carousel__dot');
    const counter = carousel.querySelector('.bitacora-carousel__counter');

    if (slides.length < 2) return;

    function goToSlide(index) {
        slides[currentIndex].classList.remove('is-active');
        dots[currentIndex]?.classList.remove('is-active');

        currentIndex = index;

        slides[currentIndex].classList.add('is-active');
        dots[currentIndex]?.classList.add('is-active');

        if (counter) {
            counter.textContent = `${currentIndex + 1}/${totalSlides}`;
        }
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % totalSlides);
    }

    function startAutoPlay() {
        if (intervalId) return;
        intervalId = setInterval(nextSlide, 3500);
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Click en dots
    dots.forEach(dot => {
        dot.addEventListener('click', event => {
            event.stopPropagation();
            const index = Number(dot.dataset.index);
            goToSlide(index);
            stopAutoPlay();
            startAutoPlay();
        });
    });

    // IntersectionObserver para auto-play cuando visible
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoPlay();
                } else {
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(cardEl);
    } else {
        startAutoPlay();
    }
}
