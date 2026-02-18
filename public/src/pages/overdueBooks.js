/**
 * Overdue Books Page
 */
import { setHTML } from '../dom.js';
import { selectBooks, selectEmployees, selectOverdueItems } from '../state/selectors.js';
import { isoTodayLocal, formatDate } from '../utils/date.js';

export const renderOverdueBooks = (root) => {
    const today = isoTodayLocal();
    const overdueItems = selectOverdueItems();
    const books = selectBooks();
    const employees = selectEmployees();

    if (overdueItems.length === 0) {
        setHTML(root, `<div class="content-section" data-aos="fade-up"><h2>Overdue Books</h2><div class="alert alert-success"><i class="fas fa-check-circle me-2"></i>Great! There are no overdue books at the moment.</div></div>`);
        return;
    }

    const rows = overdueItems.map(item => {
        const book = books.find(b => b.id === item.bookId);
        const employee = employees.find(s => s.id === item.employeeId);
        const days = Math.ceil((new Date() - new Date(item.dueDate)) / 86400000);
        return `<tr class="table-danger"><td>${book?.title}</td><td>${employee?.name}</td><td>${formatDate(item.dueDate)}</td><td>${days}</td><td>$${days}</td><td><button class="btn btn-sm btn-warning remind-employee-btn" data-employee-id="${item.employeeId}" data-book-title="${book?.title}" aria-label="Send reminder to employee">Remind</button> <button class="btn btn-sm btn-success mark-returned-late-btn" data-borrow-id="${item.id}" data-late-fee="${days}" aria-label="Mark book as returned with late fee">Return</button></td></tr>`;
    }).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2>Overdue Books</h2>
            <div class="table-responsive">
                <table id="overdueTable" class="table table-striped">
                    <thead><tr><th>Book</th><th>Employee</th><th>Due</th><th>Days</th><th>Fee</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `);

    $('#overdueTable').DataTable();

    return () => {
        if ($.fn.DataTable.isDataTable('#overdueTable')) {
            $('#overdueTable').DataTable().destroy();
        }
    };
};
