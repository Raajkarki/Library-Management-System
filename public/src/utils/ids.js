/**
 * ID Utilities
 */

let counter = Date.now();

export const nextId = (prefix = 'id') => `${prefix}-${++counter}`;
