/**
 * whatsapp.js
 * Controla la lógica del botón flotante de WhatsApp
 */

export function initWhatsApp() {
    const toggleBtn = document.getElementById('whatsapp-toggle');
    const optionsContainer = document.getElementById('whatsapp-options');
    const mainIcon = document.getElementById('wa-main-icon');
    const closeIcon = document.getElementById('wa-close-icon');

    if (!toggleBtn || !optionsContainer) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isActive = toggleBtn.classList.contains('active');
        
        if (isActive) {
            closeWhatsAppMenu();
        } else {
            openWhatsAppMenu();
        }
    });

    document.addEventListener('click', (e) => {
        const isClickInside = 
            toggleBtn.contains(e.target) || 
            optionsContainer.contains(e.target);
            
        if (!isClickInside && toggleBtn.classList.contains('active')) {
            closeWhatsAppMenu();
        }
    });

    function openWhatsAppMenu() {
        toggleBtn.classList.add('active');
        optionsContainer.classList.add('show');
        
        if (mainIcon) mainIcon.style.display = 'none';
        if (closeIcon) closeIcon.style.display = 'block';
    }

    function closeWhatsAppMenu() {
        toggleBtn.classList.remove('active');
        optionsContainer.classList.remove('show');
        
        if (mainIcon) mainIcon.style.display = 'block';
        if (closeIcon) closeIcon.style.display = 'none';
    }
}
