/**
 * Issued Books Page
 */
import { setHTML } from '../dom.js';
import { selectBooks, selectEmployees, selectActiveBorrows } from '../state/selectors.js';
import { isoTodayLocal, formatDate } from '../utils/date.js';

export const renderIssuedBooks = (root) => {
    const today = isoTodayLocal();
    const issuedItems = selectActiveBorrows();
    const books = selectBooks();
    const employees = selectEmployees();

    if (issuedItems.length === 0) {
        setHTML(root, `<div class="content-section" data-aos="fade-up"><h2>Issued Books</h2><div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No books are currently issued.</div></div>`);
        return;
    }

    const rows = issuedItems.map(item => {
        const book = books.find(b => b.id === item.bookId);
        const employee = employees.find(s => s.id === item.employeeId);
        const isOverdue = item.dueDate < today;
        return `<tr><td>${book?.title}</td><td>${employee?.name}</td><td>${formatDate(item.borrowDate)}</td><td>${formatDate(item.dueDate)}</td><td>${isOverdue ? '<span class="badge bg-danger">Overdue</span>' : 'Issued'}</td><td><button class="btn btn-sm btn-success mark-returned-quick-btn" data-borrow-id="${item.id}" aria-label="Mark book as returned">Return</button></td></tr>`;
    }).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2>Issued Books</h2>
            <div class="table-responsive">
                <table id="issueTable" class="table table-striped">
                    <thead><tr><th>Book</th><th>Employee</th><th>Borrowed</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `);

    $('#issueTable').DataTable();

    return () => {
        if ($.fn.DataTable.isDataTable('#issueTable')) {
            $('#issueTable').DataTable().destroy();
        }
    };
};
