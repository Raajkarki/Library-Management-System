/**
 * Topbar Component
 */
import { setHTML, qs } from '../dom.js';

export const renderTopbar = () => {
    const wrapper = qs('#page-content-wrapper');
    if (!wrapper) return;

    if (!qs('.top-navbar', wrapper)) {
        const topbar = document.createElement('div');
        topbar.className = 'top-navbar';
        setHTML(topbar, `
            <button class="btn-toggle" type="button" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
            <span class="ms-3 fw-bold text-secondary">School Library Management System</span>
        `);
        wrapper.prepend(topbar);
    }
};
