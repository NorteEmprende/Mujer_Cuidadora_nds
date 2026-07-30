/**
 * consulta.js
 * Inicializador de la sección "Consulta tu resultado".
 *
 * Privacidad: el número de documento ingresado solo existe como variable
 * local mientras dura la consulta. Nunca se guarda en localStorage,
 * sessionStorage, cookies, la URL, ni se imprime en la consola.
 */

import { createElement } from './ui-helpers.js';
import { CONSULTA_DOCUMENTO_NORMALIZED_MAX_LENGTH } from './consulta-config.js';
import {
    consultarDocumento,
    normalizeDocumento,
    CONSULTA_RESULT,
    ConsultaFuenteError
} from './consulta-data.js';

const MENSAJE_CAMPO_VACIO = 'Por favor, ingresa tu número de documento.';
const MENSAJE_FORMATO_INVALIDO = 'Verifica el número de documento ingresado e intenta nuevamente.';
const MENSAJE_ERROR_GENERAL = 'En este momento no fue posible realizar la consulta. Por favor, intenta nuevamente más tarde o comunícate mediante los canales oficiales del proyecto.';

export function initConsultaSection() {
    const form = document.getElementById('consulta-form');

    if (!form) {
        return;
    }

    const input = document.getElementById('consulta-documento');
    const submitButton = document.getElementById('consulta-submit');
    const submitText = submitButton.querySelector('.consulta__submit-text');
    const resetButton = document.getElementById('consulta-reset');
    const errorEl = document.getElementById('consulta-error');
    const resultEl = document.getElementById('consulta-result');

    let isLoading = false;

    input.addEventListener('input', () => {
        const filtered = input.value.replace(/[^0-9.\-\s]/g, '');

        if (filtered !== input.value) {
            input.value = filtered;
        }

        clearFieldError();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSubmit();
    });

    resetButton.addEventListener('click', () => {
        resetConsulta();
    });

    function handleSubmit() {
        if (isLoading) {
            return;
        }

        clearFieldError();
        hideResult();

        const rawValue = input.value;

        if (!rawValue.trim()) {
            showFieldError(MENSAJE_CAMPO_VACIO);
            input.focus();
            return;
        }

        const normalized = normalizeDocumento(rawValue);

        if (!normalized || normalized.length > CONSULTA_DOCUMENTO_NORMALIZED_MAX_LENGTH) {
            showFieldError(MENSAJE_FORMATO_INVALIDO);
            input.focus();
            return;
        }

        runConsulta(normalized);
    }

    async function runConsulta(normalizedDocumento) {
        setLoading(true);

        try {
            const resultado = await consultarDocumento(normalizedDocumento);
            renderResultado(resultado);
        } catch (error) {
            if (error instanceof ConsultaFuenteError) {
                console.error('[Consulta] Error al consultar la fuente de datos:', error.reason);
            } else {
                console.error('[Consulta] Error inesperado al realizar la consulta.');
            }

            renderErrorGeneral();
        } finally {
            setLoading(false);
        }
    }

    function setLoading(loading) {
        isLoading = loading;
        submitButton.disabled = loading;
        input.disabled = loading;
        submitButton.classList.toggle('is-loading', loading);
        submitText.textContent = loading ? 'Consultando...' : 'Consultar resultado';
    }

    function showFieldError(message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
        input.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError() {
        if (errorEl.hidden) {
            return;
        }

        errorEl.textContent = '';
        errorEl.hidden = true;
        input.removeAttribute('aria-invalid');
    }

    function hideResult() {
        resultEl.hidden = true;
        resultEl.textContent = '';
        resultEl.className = 'consulta__result';
        resetButton.hidden = true;
    }

    function renderResultado(resultado) {
        if (resultado === CONSULTA_RESULT.SELECCIONADA) {
            buildResultPanel('success', 'celebration', '¡Felicitaciones!', [
                'Nos complace informarte que has sido seleccionada para formar parte del proyecto. Muy pronto recibirás información relacionada con las siguientes etapas del proceso.',
                'Te agradecemos por tu participación y compromiso.'
            ]);
            return;
        }

        if (resultado === CONSULTA_RESULT.NO_SELECCIONADA) {
            buildResultPanel('neutral', 'volunteer_activism', 'Resultado de la consulta', [
                'Agradecemos sinceramente tu participación y el interés demostrado durante el proceso. En esta oportunidad no has sido seleccionada para formar parte del proyecto.',
                'Valoramos el tiempo y la dedicación que brindaste durante la convocatoria y te invitamos a continuar atenta a futuras oportunidades.'
            ]);
            return;
        }

        buildResultPanel('warning', 'search_off', 'Documento no encontrado', [
            'No encontramos el número de documento ingresado en nuestras bases de consulta. Por favor, verifica que lo hayas escrito correctamente, sin puntos, espacios ni caracteres especiales, e intenta nuevamente.',
            'Si después de verificarlo el resultado continúa igual, comunícate a través de los canales oficiales del proyecto.'
        ]);
    }

    function renderErrorGeneral() {
        buildResultPanel('error', 'error', 'No fue posible completar la consulta', [MENSAJE_ERROR_GENERAL]);
    }

    function buildResultPanel(variant, iconName, heading, paragraphs) {
        resultEl.textContent = '';
        resultEl.className = `consulta__result consulta__result--${variant}`;

        resultEl.appendChild(createElement(
            'span',
            { className: 'consulta__result-icon material-symbols-outlined', 'aria-hidden': 'true' },
            iconName
        ));
        resultEl.appendChild(createElement('h3', { className: 'consulta__result-title' }, heading));

        paragraphs.forEach((text) => {
            resultEl.appendChild(createElement('p', { className: 'consulta__result-text' }, text));
        });

        resultEl.hidden = false;
        resetButton.hidden = false;
        resultEl.focus();
    }

    function resetConsulta() {
        input.value = '';
        clearFieldError();
        hideResult();
        input.focus();
    }
}
