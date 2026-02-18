import {
    db,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    runTransaction,
    serverTimestamp
} from '../lib/firebase.js';
import { getState } from './store.js';

export const addBook = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "books"), {
            ...data,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding book:", error);
        return { success: false, message: error.message };
    }
};

export const updateBook = async (id, data) => {
    try {
        await updateDoc(doc(db, "books", id), data);
        return { success: true };
    } catch (error) {
        console.error("Error updating book:", error);
        return { success: false, message: error.message };
    }
};

export const deleteBook = async (id) => {
    const { borrowedItems } = getState();
    if (borrowedItems.some(i => i.bookId === id && !i.returned)) {
        return { success: false, message: 'Book currently borrowed.' };
    }
    try {
        await deleteDoc(doc(db, "books", id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting book:", error);
        return { success: false, message: error.message };
    }
};

export const addEmployee = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "employees"), {
            ...data,
            borrowedBooksCount: 0,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding employee:", error);
        return { success: false, message: error.message };
    }
};

export const updateEmployee = async (id, data) => {
    try {
        await updateDoc(doc(db, "employees", id), data);
        return { success: true };
    } catch (error) {
        console.error("Error updating employee:", error);
        return { success: false, message: error.message };
    }
};

export const deleteEmployee = async (id) => {
    const { borrowedItems } = getState();
    if (borrowedItems.some(i => i.employeeId === id && !i.returned)) {
        return { success: false, message: 'Employee has unreturned books.' };
    }
    try {
        await deleteDoc(doc(db, "employees", id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return { success: false, message: error.message };
    }
};

export const borrowBook = async (data) => {
    try {
        return await runTransaction(db, async (transaction) => {
            const bookDoc = await transaction.get(doc(db, "books", data.bookId));
            const empDoc = await transaction.get(doc(db, "employees", data.employeeId));

            if (!bookDoc.exists()) throw new Error("Book not found.");
            if (!empDoc.exists()) throw new Error("Employee not found.");

            const book = bookDoc.data();
            const emp = empDoc.data();

            if (book.available <= 0) throw new Error("No copies available for borrowing.");

            // Check if already borrowed (local state check for simplicity, or transaction read)
            const { borrowedItems } = getState();
            const alreadyBorrowed = borrowedItems.some(i => !i.returned && i.employeeId === data.employeeId && i.bookId === data.bookId);
            if (alreadyBorrowed) throw new Error("Employee already has an active borrow for this book.");

            // 1. Create borrow record
            const newBorrowRef = doc(collection(db, "borrowedItems"));
            transaction.set(newBorrowRef, {
                ...data,
                returned: false,
                createdAt: serverTimestamp()
            });

            // 2. Update book availability
            transaction.update(doc(db, "books", data.bookId), {
                available: book.available - 1
            });

            // 3. Update employee count
            transaction.update(doc(db, "employees", data.employeeId), {
                borrowedBooksCount: (emp.borrowedBooksCount || 0) + 1
            });

            return { success: true };
        });
    } catch (error) {
        console.error("Borrow transaction failed:", error);
        return { success: false, message: error.message };
    }
};

export const returnBook = async (borrowId, returnDate) => {
    try {
        return await runTransaction(db, async (transaction) => {
            const borrowDoc = await transaction.get(doc(db, "borrowedItems", borrowId));
            if (!borrowDoc.exists()) throw new Error("Borrow record not found.");

            const borrowData = borrowDoc.data();
            const bookDoc = await transaction.get(doc(db, "books", borrowData.bookId));
            const empDoc = await transaction.get(doc(db, "employees", borrowData.employeeId));

            // 1. Update borrow record
            transaction.update(doc(db, "borrowedItems", borrowId), {
                returned: true,
                returnDate: returnDate
            });

            // 2. Update book availability
            if (bookDoc.exists()) {
                const b = bookDoc.data();
                transaction.update(doc(db, "books", borrowData.bookId), {
                    available: Math.min(b.quantity, b.available + 1)
                });
            }

            // 3. Update employee count
            if (empDoc.exists()) {
                const e = empDoc.data();
                transaction.update(doc(db, "employees", borrowData.employeeId), {
                    borrowedBooksCount: Math.max(0, (e.borrowedBooksCount || 0) - 1)
                });
            }

            return { success: true };
        });
    } catch (error) {
        console.error("Return transaction failed:", error);
        return { success: false, message: error.message };
    }
};

export const setLastViewedActivityCount = (count) => {
    // This could stay local or be moved to a user profile in Firestore
    setState({ lastViewedActivityCount: count });
};

export const addFeedback = async (data) => {
    try {
        await addDoc(collection(db, "feedback"), {
            ...data,
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding feedback:", error);
        return { success: false, message: error.message };
    }
};
