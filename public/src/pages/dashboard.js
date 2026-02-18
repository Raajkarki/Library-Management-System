/**
 * Dashboard Page
 */
import { setHTML } from '../dom.js';
import { selectStats, selectBooks } from '../state/selectors.js';

let dashboardChart = null;

export const resizeDashboardChart = () => {
    if (dashboardChart) dashboardChart.resize();
};

export const renderDashboard = (root) => {
    const stats = selectStats();

    setHTML(root, `
        <div class="dashboard-grid" data-aos="fade-down">
            <div class="card dashboard-card bg-primary-custom" data-nav="catalog"><div class="card-body"><div><h5 class="card-title">Total Book Titles</h5><h2 class="mb-0">${stats.totalTitles}</h2></div><div class="card-icon"><i class="fas fa-layer-group"></i></div></div></div>
            <div class="card dashboard-card bg-success-custom" data-nav="catalog"><div class="card-body"><div><h5 class="card-title">Total Book Copies</h5><h2 class="mb-0">${stats.totalCopies}</h2></div><div class="card-icon"><i class="fas fa-book"></i></div></div></div>
            <div class="card dashboard-card bg-info-custom" data-nav="issuedBooks"><div class="card-body"><div><h5 class="card-title">Books Borrowed</h5><h2 class="mb-0">${stats.activeLoans}</h2></div><div class="card-icon"><i class="fas fa-hand-holding-heart"></i></div></div></div>
            <div class="card dashboard-card bg-danger-custom" data-nav="overdueBooks"><div class="card-body"><div><h5 class="card-title">Overdue Books</h5><h2 class="mb-0">${stats.overdueCount}</h2></div><div class="card-icon"><i class="fas fa-exclamation-triangle"></i></div></div></div>
            <div class="card dashboard-card bg-warning-custom" data-nav="employees"><div class="card-body"><div><h5 class="card-title">Registered Employees</h5><h2 class="mb-0">${stats.totalEmployees}</h2></div><div class="card-icon"><i class="fas fa-users"></i></div></div></div>
            <div class="card dashboard-card bg-info-custom" data-nav="feedback">
                <div class="card-body">
                    <div>
                        <h5 class="card-title">System Feedback</h5>
                        <h2 class="mb-0">${stats.feedbackCount}</h2>
                    </div>
                    <div class="card-icon"><i class="fas fa-comment-dots"></i></div>
                </div>
            </div>
        </div>
        <div class="content-section" data-aos="fade-up">
            <h2>System Overview</h2>
            <canvas id="booksChart" style="max-height: 400px;"></canvas>
        </div>
    `);

    // Chart init
    if (window.Chart) {
        const books = selectBooks();
        const genres = [...new Set(books.map(b => b.genre))];
        const booksPerGenre = genres.map(g => books.filter(b => b.genre === g).length);

        const canvas = document.getElementById('booksChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (dashboardChart) dashboardChart.destroy();

            dashboardChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: genres,
                    datasets: [{
                        label: 'Books per Genre',
                        data: booksPerGenre,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    plugins: { legend: { display: false } }
                }
            });
        }
    } else {
        // Chart.js not loaded
    }

    // Return cleanup
    return () => {
        if (dashboardChart) dashboardChart.destroy();
        dashboardChart = null;
    };
};
