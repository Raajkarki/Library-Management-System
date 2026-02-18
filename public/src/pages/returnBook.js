/**
 * Return Book Page
 */
import { setHTML } from '../dom.js';
import { selectBooks, selectEmployees, selectActiveBorrows } from '../state/selectors.js';
import { isoTodayLocal, formatDate } from '../utils/date.js';

export const renderReturnBookPage = (root) => {
    const today = isoTodayLocal();
    const itemsToReturn = selectActiveBorrows();
    const books = selectBooks();
    const employees = selectEmployees();

    if (itemsToReturn.length === 0) {
        setHTML(root, `<div class="content-section" data-aos="fade-up"><h2>Return Book</h2><div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No books currently borrowed to return.</div></div>`);
        return;
    }

    const rows = itemsToReturn.map(item => {
        const book = books.find(b => b.id === item.bookId);
        const employee = employees.find(s => s.id === item.employeeId);
        const isOverdue = item.dueDate < today;
        const lateFee = isOverdue ? Math.ceil((new Date() - new Date(item.dueDate)) / 86400000) : 0;
        return `<tr><td>${book?.title}</td><td>${employee?.name}</td><td>${formatDate(item.borrowDate)}</td><td>${formatDate(item.dueDate)}</td><td>${isOverdue ? '<span class="badge bg-danger">Overdue</span>' : 'Pending'}</td><td>$${lateFee}</td><td><button class="btn btn-sm btn-success return-now-btn" data-borrow-id="${item.id}" data-late-fee="${lateFee}" aria-label="Return book now">Return</button></td></tr>`;
    }).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2>Return Book</h2>
            <div class="table-responsive">
                <table id="returnTable" class="table table-striped">
                    <thead><tr><th>Book</th><th>Employee</th><th>Borrowed</th><th>Due</th><th>Status</th><th>Fee</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `);

    $('#returnTable').DataTable();

    return () => {
        if ($.fn.DataTable.isDataTable('#returnTable')) {
            $('#returnTable').DataTable().destroy();
        }
    };
};
