/**
 * Borrow Book Page
 */
import { setHTML, qs, on } from '../dom.js';
import { selectBooks, selectEmployees, selectBorrowedItems } from '../state/selectors.js';
import { borrowBook } from '../state/actions.js';
import { navigateTo } from '../router.js';
import { isoTodayLocal } from '../utils/date.js';
import { showMessage } from '../utils/messages.js';

export const renderBorrowBookForm = (root, params = {}) => {
    const preselectedBookId = params.bookId;
    const books = selectBooks();
    const employees = selectEmployees();

    const bookOpts = books.filter(b => b.available > 0).map(b => `<option value="${b.id}" ${b.id === preselectedBookId ? 'selected' : ''}>${b.title}</option>`).join('');
    const empOpts = employees.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2><i class="fas fa-hand-holding-heart me-2"></i>Borrow Book</h2>
            <form id="borrowBookForm" class="needs-validation" novalidate>
                <div class="mb-3"><label class="form-label">Employee</label><select class="form-select" id="borrowEmployee" required><option value="">Select...</option>${empOpts}</select></div>
                <div class="mb-3"><label class="form-label">Book</label><select class="form-select" id="borrowBook" required><option value="">Select...</option>${bookOpts}</select></div>
                <div class="mb-3"><label class="form-label">Return Date</label><input type="text" class="form-control" id="borrowReturnDate" required></div>
                <button type="submit" class="btn btn-primary mt-3">Borrow</button>
            </form>
        </div>
    `);

    flatpickr("#borrowReturnDate", { dateFormat: "Y-m-d", minDate: "today" });

    on(qs('#borrowBookForm'), 'submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

        const eId = qs('#borrowEmployee').value;
        const bId = qs('#borrowBook').value;
        const rDate = qs('#borrowReturnDate').value;

        const result = borrowBook({
            bookId: bId,
            employeeId: eId,
            borrowDate: isoTodayLocal(),
            dueDate: rDate,
            returned: false
        });

        if (result.success) {
            navigateTo('catalog');
        } else {
            showMessage('Error', result.message, 'error');
        }
    });
};
