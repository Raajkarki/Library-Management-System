/**
 * Selectors - Derived Data
 */
import { getState } from './store.js';
import { isoTodayLocal } from '../utils/date.js';

export const selectBooks = () => getState().books;
export const selectEmployees = () => getState().employees;
export const selectBorrowedItems = () => getState().borrowedItems;
export const selectFeedback = () => getState().feedback || [];

export const selectActiveBorrows = () =>
    selectBorrowedItems().filter(i => !i.returned);

export const selectOverdueItems = () => {
    const today = isoTodayLocal();
    return selectActiveBorrows().filter(i => i.dueDate < today);
};

export const selectStats = () => {
    const books = selectBooks();
    const feedbacks = selectFeedback();

    return {
        totalTitles: books.length,
        totalCopies: books.reduce((sum, b) => sum + b.quantity, 0),
        totalEmployees: selectEmployees().length,
        activeLoans: selectActiveBorrows().length,
        overdueCount: selectOverdueItems().length,
        feedbackCount: feedbacks.length
    };
};

export const selectActivities = () => {
    const items = selectBorrowedItems();
    const books = selectBooks();
    const emps = selectEmployees();

    return items.map(item => {
        const book = books.find(b => b.id === item.bookId);
        const emp = emps.find(e => e.id === item.employeeId);
        return {
            id: item.id,
            description: `${emp?.name || 'Unknown'} ${item.returned ? 'returned' : 'borrowed'} "${book?.title || 'Unknown'}"`,
            date: item.returnDate || item.borrowDate,
            type: item.returned ? 'success' : 'info',
            icon: item.returned ? 'fa-undo-alt' : 'fa-hand-holding-heart'
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
};
