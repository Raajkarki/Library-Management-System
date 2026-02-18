/**
 * Overlay & Loading Component
 */
import { qs, hide } from '../dom.js';

export const updateOverlay = () => {
    const overlay = qs('#sidebarOverlay');
    const sidebar = qs('#sidebar');
    if (!overlay || !sidebar) return;

    const isMobile = window.innerWidth < 992;
    const sidebarIsOpen = sidebar.classList.contains('open');

    if (isMobile && sidebarIsOpen) {
        overlay.classList.add('visible');
    } else {
        overlay.classList.remove('visible');
    }
};

export const initOverlays = () => {
    // Mobil sidebar overlay click to close
    const overlay = qs('#sidebarOverlay');
    const sidebar = qs('#sidebar');
    const pageWrapper = qs('#page-content-wrapper');

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar?.classList.remove('open');
            pageWrapper?.classList.remove('sidebar-active'); // Still used for secondary logic or keep it for now
            updateOverlay();
        });
    }

    // Initial check
    updateOverlay();
};

export const hideLoading = () => {
    const loading = qs('#loadingOverlay');
    if (loading) hide(loading);
};
