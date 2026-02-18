/**
 * Main Entry Point
 */
import { on, delegate, qs, setHTML } from './dom.js';
import { initRouter, navigateTo, getCurrentPath } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { initOverlays, hideLoading, updateOverlay } from './components/overlay.js';

// State & Actions
import { subscribe, getState } from './state/store.js';
import { deleteBook, deleteEmployee, returnBook } from './state/actions.js';
import { showMessage, confirm } from './utils/messages.js';
import { isoTodayLocal, formatDate } from './utils/date.js';

// Pages
import { renderDashboard, resizeDashboardChart } from './pages/dashboard.js';
import { renderBookCatalog } from './pages/catalog.js';
import { renderAddNewBookForm } from './pages/addBook.js';
import { renderBorrowBookForm } from './pages/borrowBook.js';
import { renderReturnBookPage } from './pages/returnBook.js';
import { renderEmployeeRecords } from './pages/employees.js';
import { renderManageEmployeesPage, renderAddEditEmployeeForm } from './pages/manageEmployees.js';
import { renderIssuedBooks } from './pages/issuedBooks.js';
import { renderOverdueBooks } from './pages/overdueBooks.js';
import { renderReports } from './pages/reports.js';
import { renderActivityPage } from './pages/activity.js';
import { renderFeedbackPage } from './pages/feedback.js';

let cleanupFn = null;

const routes = {
    dashboard: (root) => renderDashboard(root),
    catalog: (root) => renderBookCatalog(root),
    addBook: (root, params) => renderAddNewBookForm(root, params),
    borrowBook: (root, params) => renderBorrowBookForm(root, params),
    returnBook: (root) => renderReturnBookPage(root),
    employees: (root) => renderEmployeeRecords(root),
    manageEmployees: (root, params) => renderManageEmployeesPage(root, params),
    issuedBooks: (root) => renderIssuedBooks(root),
    overdueBooks: (root) => renderOverdueBooks(root),
    reports: (root) => renderReports(root),
    activity: (root) => renderActivityPage(root),
    feedback: (root) => renderFeedbackPage(root)
};

// --- Boostrap ---
const init = () => {
    try {
        // Initialize core UI shell components
        renderSidebar();
        renderTopbar();
        initOverlays();

        // Setup Router
        initRouter(Object.keys(routes).reduce((acc, key) => {
            acc[key] = (root, params) => {
                try {
                    if (cleanupFn) cleanupFn();
                    cleanupFn = routes[key](root, params);
                } catch (err) {
                    console.error(`Router: Error rendering page ${key}:`, err);
                    setHTML(root, `<div class="alert alert-danger m-3"><h4>Component Error</h4><p>${err.message}</p></div>`);
                }
            };
            return acc;
        }, {}));

        // Initialize Animations
        if (window.AOS) {
            window.AOS.init({ duration: 800, once: true });
        }

        // 4. Global Subscriptions
        subscribe(() => {
            try { renderSidebar(); } catch (e) { console.error("Sidebar update failed", e); }
        });

        setupDelegations();
        navigateTo('dashboard');

        // 7. Responsive Listeners
        window.addEventListener('resize', updateOverlay);

    } catch (criticalError) {
        console.error("Critical Start Error:", criticalError);
        const main = qs('#main-content');
        if (main) setHTML(main, `<div class="alert alert-danger mt-5"><h4>Critical Failure</h4><pre>${criticalError.stack || criticalError.message}</pre></div>`);
    } finally {
        setTimeout(hideLoading, 300);
    }
};

const setupDelegations = () => {
    const main = qs('#main-content');
    const side = qs('#sidebar');

    // Sidebar navigation
    delegate(side, 'click', '.nav-link', function (e) {
        e.preventDefault();
        navigateTo(this.dataset.page);
    });
    delegate(side, 'click', '.navbar-brand', (e) => {
        e.preventDefault();
        navigateTo('dashboard');
    });

    // Sidebar Toggle
    on(qs('#sidebarToggle'), 'click', () => {
        const sidebar = qs('#sidebar');
        const wrapper = qs('#page-content-wrapper');
        const isMobile = window.innerWidth < 992;

        if (isMobile) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
            wrapper.classList.toggle('sidebar-collapsed');
        }

        updateOverlay();
        // Resize charts if dashboard is active
        if (getCurrentPath() === 'dashboard') {
            setTimeout(resizeDashboardChart, 310); // Wait for CSS transition
        }
    });

    // Global Actions
    delegate(main, 'click', '.borrow-book-btn', function () { navigateTo('borrowBook', { bookId: this.dataset.bookId }); });
    delegate(main, 'click', '.edit-book-btn', function () { navigateTo('addBook', { isEdit: true, bookId: this.dataset.bookId }); });
    delegate(main, 'click', '.view-book-btn', function () { showBookDetails(this.dataset.bookId); });
    delegate(main, 'click', '.dashboard-card', function () { navigateTo(this.dataset.nav); });

    delegate(main, 'click', '.delete-book-btn', async function () {
        if (await confirm('Are you sure?', 'Delete this book?')) {
            const res = deleteBook(this.dataset.bookId);
            if (!res.success) showMessage('Error', res.message, 'error');
            else navigateTo(getCurrentPath(), {}, false);
        }
    });


    // Use jQuery delegation for ALL table-based buttons as they frequently rebuild DOM
    $(document).off('click', '.edit-employee-btn').on('click', '.edit-employee-btn', function (e) {
        e.preventDefault();
        const id = $(this).attr('data-employee-id') || $(this).data('employee-id');
        if (id) {
            navigateTo('manageEmployees', { isEdit: true, employeeId: id });
        }
    });

    $(document).off('click', '.delete-employee-btn').on('click', '.delete-employee-btn', async function (e) {
        e.preventDefault();
        const id = $(this).attr('data-employee-id');
        if (!id) return;
        if (await confirm('Delete?', 'Remove this employee?')) {
            const res = deleteEmployee(id);
            if (!res.success) showMessage('Error', res.message, 'error');
            else navigateTo('manageEmployees', {}, false);
        }
    });

    delegate(main, 'click', '.return-now-btn, .mark-returned-quick-btn, .mark-returned-late-btn', function () {
        const bid = this.dataset.borrowId;
        const fee = this.dataset.lateFee || 0;
        confirm('Return Book', fee > 0 ? `Late fee: $${fee}` : 'Mark as returned?', 'Return', '#198754').then(ok => {
            if (ok) {
                returnBook(bid, isoTodayLocal());
                navigateTo('returnBook');
            }
        });
    });

    delegate(main, 'click', '.remind-employee-btn', function () {
        showMessage('Reminder Sent', `Notification sent to employee regarding "${this.dataset.bookTitle}".`, 'success');
    });

    delegate(main, 'click', '.view-employee-history-btn', function () {
        showEmployeeHistory(this.dataset.employeeId);
    });
};

const showBookDetails = (id) => {
    const { books } = getState();
    const book = books.find(b => b.id === id);
    if (!book) return;

    const isAvailable = book.available > 0;
    const badgeClass = isAvailable ? 'bg-success' : 'bg-danger';
    const statusText = isAvailable ? 'Available' : 'Out of Stock';

    const html = `
        <div class="row text-start mt-3">
            <div class="col-md-4">
                <img src="${book.cover}" alt="${book.title}" class="img-fluid rounded shadow-sm" 
                     onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            </div>
            <div class="col-md-8">
                <div class="mb-2"><span class="badge ${badgeClass}">${statusText}</span></div>
                <p class="mb-1"><strong>Author:</strong> ${book.author}</p>
                <p class="mb-1"><strong>Genre:</strong> ${book.genre}</p>
                <p class="mb-1"><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
                <p class="mb-1"><strong>Availability:</strong> ${book.available} / ${book.quantity} copies</p>
                <hr>
                <small class="text-muted">ID: ${book.id}</small>
            </div>
        </div>
    `;

    showMessage(book.title, html, 'info');
};

const showEmployeeHistory = (id) => {
    const { employees, borrowedItems, books } = getState();
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    // Filter and sort by most recent borrow date
    const history = borrowedItems
        .filter(i => i.employeeId === id)
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

    let html = history.length ? `<ul class="list-group text-start mt-2">${history.map(i => {
        const b = books.find(x => x.id === i.bookId);
        const statusBadge = i.returned
            ? '<span class="badge bg-secondary">Returned</span>'
            : '<span class="badge bg-primary">Pending</span>';

        return `
            <li class="list-group-item">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong>${b?.title || 'Unknown Book'}</strong>
                    ${statusBadge}
                </div>
                <div class="small text-muted">
                    <div><strong>Borrowed:</strong> ${formatDate(i.borrowDate)}</div>
                    <div><strong>Due:</strong> ${formatDate(i.dueDate)}</div>
                    ${i.returned ? `<div><strong>Returned:</strong> ${formatDate(i.returnDate)}</div>` : ''}
                </div>
            </li>`;
    }).join('')}</ul>` : '<p class="mt-3 text-muted text-center">No history record found for this employee.</p>';

    showMessage(`History: ${emp.name}`, html, 'info');
};

on(document, 'DOMContentLoaded', init);
