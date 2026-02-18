/**
 * Catalog Page
 */
import { setHTML } from '../dom.js';
import { selectBooks } from '../state/selectors.js';

export const renderBookCatalog = (root) => {
    const books = selectBooks();

    let tableRows = books.map(book => `
        <tr data-aos="fade-up">
            <td><img src="${book.cover}" width="40" class="img-thumbnail me-2 rounded" onerror="this.onerror=null;this.src='https://placehold.co/40x60/ccc/fff?text=N/A';"> ${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.genre}</td>
            <td>${book.quantity}</td>
            <td><span class="badge bg-${book.available > 0 ? 'success' : 'danger'}">${book.available > 0 ? book.available + ' Available' : 'Out of Stock'}</span></td>
            <td class="d-flex">
                <button class="btn btn-sm btn-primary borrow-book-btn ${book.available === 0 ? 'disabled' : ''}" data-book-id="${book.id}" ${book.available === 0 ? 'disabled' : ''} aria-label="Borrow book"><i class="fas fa-hand-holding-heart"></i></button>
                <button class="btn btn-sm btn-info view-book-btn ms-1" data-book-id="${book.id}" aria-label="View book details"><i class="fas fa-eye"></i></button>
                <button type="button" class="btn btn-sm btn-warning edit-book-btn ms-1" data-book-id="${book.id}" aria-label="Edit book"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-book-btn ms-1" data-book-id="${book.id}" aria-label="Delete book"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2><i class="fas fa-book me-2"></i>Book Catalog</h2>
            <div class="table-responsive">
                <table id="booksTable" class="table table-striped table-hover" style="width:100%">
                    <thead>
                        <tr><th>Title</th><th>Author</th><th>ISBN</th><th>Genre</th><th>Total</th><th>Available</th><th>Actions</th></tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        </div>
    `);

    const table = $('#booksTable').DataTable({
        "pageLength": 10,
        columnDefs: [{ targets: [6], orderable: false, searchable: false }]
    });

    return () => {
        if ($.fn.DataTable.isDataTable('#booksTable')) {
            $('#booksTable').DataTable().destroy();
        }
    };
};
