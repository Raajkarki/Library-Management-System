/**
 * DOM Helpers
 */

export const qs = (selector, parent = document) => parent.querySelector(selector);
export const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

export const on = (element, event, handler) => {
    if (!element) return;
    element.addEventListener(event, handler);
};

export const delegate = (parent, event, selector, handler) => {
    on(parent, event, (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e);
        }
    });
};

export const setHTML = (element, html) => {
    if (!element) return;
    element.innerHTML = html;
};

export const show = (element) => element && element.classList.remove('d-none');
export const hide = (element) => element && element.classList.add('d-none');
export const toggle = (element, force) => element && element.classList.toggle('d-none', force);
