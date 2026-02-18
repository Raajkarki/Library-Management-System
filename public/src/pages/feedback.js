/**
 * Feedback Page
 */
import { setHTML, qs, on } from '../dom.js';
import { selectFeedback } from '../state/selectors.js';
import { addFeedback } from '../state/actions.js';
import { showMessage } from '../utils/messages.js';

export const renderFeedbackPage = (root) => {
    const renderContent = () => {
        const feedbacks = selectFeedback();

        const feedbackListHtml = feedbacks.length > 0
            ? feedbacks.map(f => `
                <div class="card mb-3 feedback-card shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${f.category}</span>
                            <div class="text-muted small">
                                <i class="fas fa-calendar-alt me-1"></i> ${f.date}
                            </div>
                        </div>
                        <p class="card-text">${f.comment}</p>
                    </div>
                </div>
            `).join('')
            : '<p class="text-center text-muted py-4">No feedback yet. Be the first to share your thoughts!</p>';

        setHTML(root, `
            <div class="content-section" data-aos="fade-up">
                <h2>Feedback System</h2>
                <div class="row">
                    <div class="col-lg-5 mb-4">
                        <div class="card border-0 shadow-sm p-3">
                            <h4>Submit Feedback</h4>
                            <form id="feedbackForm" class="needs-validation" novalidate>
                                <div class="mb-3">
                                    <label class="form-label">Category</label>
                                    <select id="fCategory" class="form-select" required>
                                        <option value="" selected disabled>Select category...</option>
                                        <option value="UI/Design">UI/Design</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Performance">Performance</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div class="invalid-feedback">Please select a category.</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Comments</label>
                                    <textarea id="fComment" class="form-control" rows="4" required placeholder="Tell us what you think..."></textarea>
                                    <div class="invalid-feedback">Please enter your comments.</div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-paper-plane me-1"></i> Submit Feedback
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <h4>Recent Feedback</h4>
                        <div id="feedbackListContainer" class="mt-3">
                            ${feedbackListHtml}
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Handle Form Submission
        const form = qs('#feedbackForm');
        on(form, 'submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            const feedbackData = {
                category: qs('#fCategory').value,
                comment: qs('#fComment').value
            };

            const res = addFeedback(feedbackData);
            if (res.success) {
                showMessage('Success!', 'Thank you for your feedback.', 'success');
                form.reset();
                form.classList.remove('was-validated');
                renderContent(); // Re-render to show updated list
            }
        });
    };

    renderContent();
};
