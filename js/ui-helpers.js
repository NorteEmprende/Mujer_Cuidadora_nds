/**
 * ui-helpers.js
 * Funciones reutilizables de utilidad para DOM e interfaz
 */

/**
 * Selecciona un elemento del DOM de forma segura
 * @param {string} selector - Selector CSS
 * @param {Element} parent - Elemento padre (por defecto document)
 * @returns {Element|null}
 */
export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Selecciona múltiples elementos del DOM
 * @param {string} selector - Selector CSS
 * @param {Element} parent - Elemento padre (por defecto document)
 * @returns {NodeListOf<Element>}
 */
export function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Crea un elemento con atributos y contenido
 * @param {string} tag - Nombre de la etiqueta
 * @param {Object} attrs - Atributos del elemento
 * @param {string} textContent - Contenido de texto
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, textContent = '') {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else {
            el.setAttribute(key, value);
        }
    });
    if (textContent) el.textContent = textContent;
    return el;
}

/**
 * Sanitiza texto para prevenir inyección de HTML
 * @param {string} str - Texto a sanitizar
 * @returns {string}
 */
export function safeText(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Formatea un número con separador de miles (formato colombiano)
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

/**
 * Añade animación de entrada al entrar en viewport
 * @param {string} selector - Selector de elementos a animar
 */
export function initScrollAnimations(selector = '.info-card, .municipality-card, .benefit-card, .timeline-card, .requirement-card') {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        observer.observe(el);
    });
}
