/**
 * navigation.js
 * Menú móvil, estados activos y accesibilidad de navegación
 */

/**
 * Inicializa la navegación: menú móvil, scroll spy y cierre automático
 */
export function initNavigation() {
    const toggle = document.querySelector('.site-nav__toggle');
    const navList = document.querySelector('.site-nav__list');
    const overlay = document.querySelector('.site-nav__overlay');
    const links = document.querySelectorAll('.site-nav__link');
    const header = document.querySelector('.site-header');

    if (!toggle || !navList) return;

    // Apertura/cierre del menú móvil
    toggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('site-nav__list--open');
        toggle.classList.toggle('site-nav__toggle--open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));

        if (overlay) {
            overlay.classList.toggle('site-nav__overlay--visible', isOpen);
        }

        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar menú al hacer clic en overlay
    if (overlay) {
        overlay.addEventListener('click', () => closeMenu(toggle, navList, overlay));
    }

    // Cerrar menú al hacer clic en un enlace
    links.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu(toggle, navList, overlay);
        });
    });

    // Cerrar menú con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('site-nav__list--open')) {
            closeMenu(toggle, navList, overlay);
            toggle.focus();
        }
    });

    // Header con sombra al hacer scroll
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('site-header--scrolled', window.scrollY > 10);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Scroll spy para enlaces activos
    initScrollSpy(links);
}

/**
 * Cierra el menú móvil
 */
function closeMenu(toggle, navList, overlay) {
    navList.classList.remove('site-nav__list--open');
    toggle.classList.remove('site-nav__toggle--open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (overlay) {
        overlay.classList.remove('site-nav__overlay--visible');
    }
}

/**
 * Scroll spy: marca el enlace activo según la sección visible
 */
function initScrollSpy(links) {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.classList.add('site-nav__link--active');
                    } else {
                        link.classList.remove('site-nav__link--active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}
