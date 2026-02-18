/**
 * Date Utilities
 */

export const isoTodayLocal = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Use Intl for better formatting
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const getTimestamp = (dateStr) => new Date(dateStr).getTime();
