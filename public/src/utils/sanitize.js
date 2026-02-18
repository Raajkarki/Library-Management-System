/**
 * Sanitize Utility (XSS Prevention)
 */

export const esc = (str) => {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};
