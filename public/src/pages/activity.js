/**
 * Recent Activity Page
 */
import { setHTML } from '../dom.js';
import { selectActivities } from '../state/selectors.js';
import { setLastViewedActivityCount } from '../state/actions.js';
import { formatDate, getTimestamp } from '../utils/date.js';

export const renderActivityPage = (root) => {
    const activities = selectActivities();

    // Update seen count
    setLastViewedActivityCount(activities.length);

    const rows = activities.map(a => `
        <tr data-aos="fade-up">
            <td><i class="fas ${a.icon} text-${a.type} me-2"></i> ${a.description}</td>
            <td data-order="${getTimestamp(a.date)}">${formatDate(a.date)}</td>
            <td><span class="badge bg-${a.type}">${a.type === 'success' ? 'Returned' : 'Borrowed'}</span></td>
        </tr>`).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2><i class="fas fa-history me-2"></i>Recent Activity</h2>
            <div class="table-responsive">
                <table id="activityTable" class="table table-striped table-hover">
                    <thead><tr><th>Activity</th><th>Date</th><th>Type</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `);

    $('#activityTable').DataTable({
        order: [[1, 'desc']]
    });

    return () => {
        if ($.fn.DataTable.isDataTable('#activityTable')) {
            $('#activityTable').DataTable().destroy();
        }
    };
};
