/**
 * Add/Edit Book Page
 */
import { setHTML, qs, on } from '../dom.js';
import { selectBooks } from '../state/selectors.js';
import { addBook, updateBook } from '../state/actions.js';
import { navigateTo } from '../router.js';

export const renderAddNewBookForm = (root, params = {}) => {
    const isEdit = params.isEdit || false;
    const bookId = params.bookId;
    const books = selectBooks();
    let book = isEdit && bookId ? books.find(b => b.id === bookId) : null;

    if (isEdit && !book) { navigateTo('catalog'); return; }

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2><i class="fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'} me-2"></i> ${isEdit ? 'Edit Book' : 'Add New Book'}</h2>
            <form id="addBookForm" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-md-6"><label class="form-label">Title</label><input type="text" class="form-control" id="bookTitle" value="${isEdit ? book.title : ''}" required></div>
                    <div class="col-md-6"><label class="form-label">Author</label><input type="text" class="form-control" id="bookAuthor" value="${isEdit ? book.author : ''}" required></div>
                    <div class="col-md-6"><label class="form-label">ISBN</label><input type="text" class="form-control" id="bookIsbn" value="${isEdit ? book.isbn : ''}" required></div>
                    <div class="col-md-6"><label class="form-label">Genre</label><input type="text" class="form-control" id="bookGenre" value="${isEdit ? book.genre : ''}" required></div>
                    <div class="col-md-12"><label class="form-label">Quantity</label><input type="number" class="form-control" id="bookQuantity" value="${isEdit ? book.quantity : '1'}" min="1" required></div>
                    <div class="col-md-12">
                        <label class="form-label">Cover Image</label>
                        <div class="input-group mb-2"><input type="file" class="form-control" id="bookCoverFile" accept="image/*"></div>
                        <input type="text" class="form-control" id="bookCover" placeholder="Or enter Image URL" value="${isEdit ? book.cover : ''}">
                        <div id="coverPreview" class="mt-2 text-center">${isEdit && book.cover ? `<img src="${book.cover}" style="max-height: 150px;">` : ''}</div>
                    </div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary me-2">Save</button>
                    <button type="button" class="btn btn-secondary" id="cancelBookBtn">Cancel</button>
                </div>
            </form>
        </div>
    `);

    // Image preview
    on(qs('#bookCoverFile'), 'change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                qs('#bookCover').value = re.target.result;
                setHTML(qs('#coverPreview'), `<img src="${re.target.result}" style="max-height: 150px; border-radius: 5px;">`);
            };
            reader.readAsDataURL(file);
        }
    });

    on(qs('#cancelBookBtn'), 'click', () => navigateTo('catalog'));

    on(qs('#addBookForm'), 'submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

        const title = qs('#bookTitle').value;
        const author = qs('#bookAuthor').value;
        const isbn = qs('#bookIsbn').value;
        const genre = qs('#bookGenre').value;
        const quantity = parseInt(qs('#bookQuantity').value);
        const cover = qs('#bookCover').value || `https://placehold.co/150x220/6c757d/white?text=${title.substring(0, 10)}`;

        const data = { title, author, isbn, genre, quantity, cover, available: quantity };

        if (isEdit) {
            const borrowedCount = book.quantity - book.available;
            data.available = quantity - borrowedCount;
            updateBook(bookId, data);
        } else {
            addBook(data);
        }
        navigateTo('catalog');
    });
};
