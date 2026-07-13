/**
 * main.js
 * Archivo inicializador - coordina módulos del proyecto
 */

import { initNavigation } from './navigation.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initPlaceholders } from './placeholders.js';
import { initDocumentationGuard } from './documentation-guard.js';
import { initScrollAnimations } from './ui-helpers.js';
import { initWhatsApp } from './whatsapp.js';
import { initMujerCuidadoraMedia } from './media-cuidadora.js';
import { initBitacoraPreview, initBitacoraPage } from './bitacora.js';
import { initHistoriasSection } from './historias.js';
import { initConsultaSection } from './consulta.js';

/**
 * Inicialización principal al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSmoothScroll();
    initPlaceholders();
    initConsultaSection();
    initHistoriasSection();
    initMujerCuidadoraMedia();
    initBitacoraPreview();
    initBitacoraPage();
    initScrollAnimations();
    initDocumentationGuard();
    initWhatsApp();
});
