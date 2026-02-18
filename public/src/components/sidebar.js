/**
 * Sidebar Component
 */
import { setHTML, qs } from '../dom.js';
import { getState } from '../state/store.js';
import { selectActivities } from '../state/selectors.js';

export const renderSidebar = () => {
    const { lastViewedActivityCount } = getState();
    const activities = selectActivities();
    const hasNewActivity = activities.length > lastViewedActivityCount;

    const sidebar = qs('#sidebar');
    if (!sidebar) return;

    // We only update the dynamic parts if needed, but for simplicity we re-render shell parts if not present
    if (!qs('.sidebar-header', sidebar)) {
        setHTML(sidebar, `
            <div class="sidebar-header">
                <a class="navbar-brand d-flex align-items-center" href="#" data-page="dashboard">
                    <img src="assets/img/logo.png" alt="Home Loan Experts" style="height: 30px; margin-right: 10px;">
                </a>
            </div>
            <ul class="nav flex-column">
                <li class="nav-item"><a class="nav-link" href="#" data-page="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="catalog"><i class="fas fa-book"></i> Book Catalog</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="addBook"><i class="fas fa-plus-circle"></i> Add New Book</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="borrowBook"><i class="fas fa-hand-holding-heart"></i> Borrow Book</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="returnBook"><i class="fas fa-undo-alt"></i> Return Book</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="employees"><i class="fas fa-users"></i> Employee Records</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="manageEmployees"><i class="fas fa-user-cog"></i> Manage Employees</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="issuedBooks"><i class="fas fa-tasks"></i> Issued Books</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="overdueBooks"><i class="fas fa-exclamation-triangle"></i> Overdue Books</a></li>
                <li class="nav-item"><a class="nav-link" href="#" data-page="reports"><i class="fas fa-chart-bar"></i> Reports</a></li>
                <li class="nav-item">
                    <a class="nav-link d-flex align-items-center justify-content-between" href="#" data-page="activity">
                        <span><i class="fas fa-history"></i> Recent Activity</span>
                        <span id="activityNotification" class="notification-dot ${hasNewActivity ? '' : 'd-none'}"></span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-page="feedback">
                        <i class="fas fa-comment-dots"></i> Feedback
                    </a>
                </li>
            </ul>
        `);
    } else {
        // Just update notification dot
        const dot = qs('#activityNotification');
        if (dot) dot.classList.toggle('d-none', !hasNewActivity);
    }
};
