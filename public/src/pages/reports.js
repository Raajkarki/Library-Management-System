/**
 * Reports Page
 */
import { setHTML } from '../dom.js';
import { selectBooks, selectEmployees, selectBorrowedItems } from '../state/selectors.js';

let charts = [];

export const renderReports = (root) => {
    const books = selectBooks();
    const employees = selectEmployees();
    const borrowedItems = selectBorrowedItems();

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2>Reports & Statistics</h2>
            <div class="row g-4 mb-4">
                <div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Most Read Books</div><div class="card-body"><canvas id="mostReadBooksChart" style="max-height: 300px;"></canvas></div></div></div>
                <div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Top Readers</div><div class="card-body"><canvas id="topReadersChart" style="max-height: 300px;"></canvas></div></div></div>
            </div>
            <div class="row g-4">
                <div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Books by Genre</div><div class="card-body"><canvas id="genrePieChart" style="max-height: 300px;"></canvas></div></div></div>
                <div class="col-lg-6"><div class="card h-100"><div class="card-header fw-bold">Monthly Borrows</div><div class="card-body"><canvas id="monthlyBorrowsChart" style="max-height: 300px;"></canvas></div></div></div>
            </div>
            <div class="row mt-4"><div class="col-12"><div class="card h-100"><div class="card-header fw-bold">Overall Availability</div><div class="card-body"><canvas id="availabilityChart" style="max-height: 300px;"></canvas></div></div></div></div>
        </div>
    `);

    // Chart Cleanups
    charts.forEach(c => c.destroy());
    charts = [];

    if (!window.Chart) {
        console.warn("Chart.js not loaded. Skipping reports charts.");
        return () => { };
    }

    // Most Read Books Chart
    const bookBorrowCounts = {};
    borrowedItems.forEach(item => {
        const book = books.find(b => b.id === item.bookId);
        if (book) bookBorrowCounts[book.title] = (bookBorrowCounts[book.title] || 0) + 1;
    });
    const sortedBooks = Object.entries(bookBorrowCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const mostReadCtx = document.getElementById('mostReadBooksChart')?.getContext('2d');
    if (mostReadCtx) {
        charts.push(new Chart(mostReadCtx, {
            type: 'bar', data: { labels: sortedBooks.map(i => i[0]), datasets: [{ data: sortedBooks.map(i => i[1]), backgroundColor: 'rgba(75, 192, 192, 0.7)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        }));
    }

    // Top Readers Chart
    const employeeBorrowCounts = {};
    borrowedItems.forEach(item => {
        const emp = employees.find(e => e.id === item.employeeId);
        if (emp) employeeBorrowCounts[emp.name] = (employeeBorrowCounts[emp.name] || 0) + 1;
    });
    const sortedEmployees = Object.entries(employeeBorrowCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topReadersCtx = document.getElementById('topReadersChart')?.getContext('2d');
    if (topReadersCtx) {
        charts.push(new Chart(topReadersCtx, {
            type: 'bar', data: { labels: sortedEmployees.map(i => i[0]), datasets: [{ data: sortedEmployees.map(i => i[1]), backgroundColor: 'rgba(153, 102, 255, 0.7)' }] },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
        }));
    }

    // Genre Pie Chart
    const genreCounts = books.reduce((acc, b) => { acc[b.genre] = (acc[b.genre] || 0) + 1; return acc; }, {});
    const genreCtx = document.getElementById('genrePieChart')?.getContext('2d');
    if (genreCtx) {
        charts.push(new Chart(genreCtx, {
            type: 'pie', data: { labels: Object.keys(genreCounts), datasets: [{ data: Object.values(genreCounts), backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'] }] }
        }));
    }

    // Monthly Borrows Chart (Mocked)
    const monthlyCtx = document.getElementById('monthlyBorrowsChart')?.getContext('2d');
    if (monthlyCtx) {
        charts.push(new Chart(monthlyCtx, {
            type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], datasets: [{ label: 'Borrows', data: [12, 19, 3, 5], borderColor: '#4bc0c0', tension: 0.1 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        }));
    }

    // Availability Chart
    const avail = books.reduce((sum, b) => sum + b.available, 0);
    const total = books.reduce((sum, b) => sum + b.quantity, 0);
    const availCtx = document.getElementById('availabilityChart')?.getContext('2d');
    if (availCtx) {
        charts.push(new Chart(availCtx, {
            type: 'doughnut', data: { labels: ['Available', 'Borrowed'], datasets: [{ data: [avail, total - avail], backgroundColor: ['#4bc0c0', '#ff9f40'] }] }
        }));
    }

    return () => {
        charts.forEach(c => c.destroy());
        charts = [];
    };
};
