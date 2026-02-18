import {
    db,
    collection,
    onSnapshot,
    query,
    orderBy
} from '../lib/firebase.js';

const initialState = {
    books: [],
    employees: [],
    borrowedItems: [],
    lastViewedActivityCount: 0,
    currentUser: { name: 'Admin User', role: 'Librarian' },
    feedback: []
};

let state = initialState;
const observers = new Set();

export const getState = () => state;

export const setState = (newState) => {
    state = { ...state, ...newState };
    observers.forEach(cb => cb(state));
};

export const subscribe = (cb) => {
    observers.add(cb);
    return () => observers.delete(cb);
};

// --- Firestore Real-time Listeners ---

const initListeners = () => {
    // Books
    onSnapshot(collection(db, "books"), (snapshot) => {
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState({ books });
    }, (error) => console.error("[Firestore] Books listener error:", error));

    // Employees
    onSnapshot(collection(db, "employees"), (snapshot) => {
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState({ employees });
    }, (error) => console.error("[Firestore] Employees listener error:", error));

    // Borrowed Items
    onSnapshot(collection(db, "borrowedItems"), (snapshot) => {
        const borrowedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState({ borrowedItems });
    }, (error) => console.error("[Firestore] BorrowedItems listener error:", error));

    // Feedback (Sorted by date)
    const feedbackQuery = query(collection(db, "feedback"), orderBy("date", "desc"));
    onSnapshot(feedbackQuery, (snapshot) => {
        const feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState({ feedback });
    }, (error) => console.error("[Firestore] Feedback listener error:", error));
};

initListeners();
