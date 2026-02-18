/**
 * Router
 */
import { qs, setHTML } from './dom.js';

let routes = {};
let currentPath = '';

export const initRouter = (appRoutes) => {
    routes = appRoutes;
};

export const navigateTo = async (page, params = {}, resetView = true) => {
    const mainContent = qs('#main-content');
    const sidebar = qs('#sidebar');
    const sidebarOverlay = qs('#sidebarOverlay');
    const pageContentWrapper = qs('#page-content-wrapper');

    if (resetView) {
        setHTML(mainContent, '<div class="d-flex justify-content-center align-items-center" style="min-height: 300px;"><div class="spinner-border text-primary" role="status"></div></div>');
        if (window.innerWidth < 992 && sidebar?.classList.contains('open')) {
            sidebar.classList.remove('open');
            pageContentWrapper?.classList.remove('sidebar-active'); // This class is mostly vestigial now but harmless
            if (sidebarOverlay) sidebarOverlay.style.display = 'none';
        }
        window.scrollTo(0, 0);
    }

    setTimeout(() => {
        if (routes[page]) {
            currentPath = page;
            routes[page](mainContent, params);
            updateActiveLink(page);
            if (window.AOS) window.AOS.refresh();
        } else {
            setHTML(mainContent, '<div class="alert alert-danger">Page not found.</div>');
        }
    }, 50);
};

const updateActiveLink = (page) => {
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
};

export const getCurrentPath = () => currentPath;
