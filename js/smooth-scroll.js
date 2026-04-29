/**
 * smooth-scroll.js
 * Scroll suave entre secciones con offset del header sticky
 */

/**
 * Inicializa el scroll suave para todos los enlaces internos (#)
 */
export function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            // Calcular offset del header sticky
            const header = document.querySelector('.site-header');
            const headerHeight = header ? header.offsetHeight : 0;
            const offset = 16; // Espacio extra

            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Actualizar hash sin saltar
            history.pushState(null, '', href);
        });
    });
}
