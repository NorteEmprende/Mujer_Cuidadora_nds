/**
 * smooth-scroll.js
 * Scroll suave entre secciones con offset del header sticky.
 * Soporta enlaces internos (#), cross-page (index.html#seccion),
 * y ajuste al cargar página con hash.
 */

/**
 * Inicializa el scroll suave para todos los enlaces con hash.
 */
export function initSmoothScroll() {
    const links = document.querySelectorAll('a[href*="#"]');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (!href || href === '#') return;

            const url = new URL(href, window.location.href);
            const currentUrl = new URL(window.location.href);

            const isSamePage =
                url.pathname === currentUrl.pathname &&
                url.origin === currentUrl.origin;

            if (!isSamePage) {
                // Dejar que el navegador navegue normalmente
                return;
            }

            const target = document.querySelector(url.hash);

            if (!target) return;

            event.preventDefault();

            scrollToTarget(target);

            history.pushState(null, '', url.hash);
        });
    });

    // Ajustar scroll al cargar página con hash
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);

        if (target) {
            setTimeout(() => {
                scrollToTarget(target);
            }, 100);
        }
    }
}

/**
 * Hace scroll suave a un elemento con offset del header sticky.
 * @param {HTMLElement} target
 */
function scrollToTarget(target) {
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const offset = 16;

    const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        offset;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}
