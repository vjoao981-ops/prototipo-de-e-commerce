/**
 * Funções utilitárias compartilhadas entre os módulos da aplicação.
 */

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

/**
 * Formata um valor numérico como moeda brasileira.
 * @param {number} valor
 * @returns {string} Ex.: "R$ 7.850,90"
 */
export function formatarMoeda(valor) {
    return formatadorMoeda.format(valor);
}

/**
 * Normaliza um texto para comparação: minúsculas, sem acentos e sem
 * espaços nas extremidades.
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto) {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

const SUBSTITUICOES_HTML = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

/**
 * Escapa caracteres especiais de HTML para uso seguro em templates
 * inseridos via innerHTML.
 * @param {string} texto
 * @returns {string}
 */
export function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => SUBSTITUICOES_HTML[caractere]);
}