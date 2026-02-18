/**
 * Employee Records Page
 */
import { setHTML } from '../dom.js';
import { selectEmployees } from '../state/selectors.js';
import { formatDate } from '../utils/date.js';

export const renderEmployeeRecords = (root) => {
    const employees = selectEmployees();

    let rows = employees.map(s => `<tr><td>${s.name}</td><td>${s.email}</td><td>${s.department}</td><td>${s.branch || '-'}</td><td>${s.borrowedBooksCount || 0}</td><td><button class="btn btn-sm btn-info view-employee-history-btn" data-employee-id="${s.id}" aria-label="View employee history">History</button></td></tr>`).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2>Employee Records</h2>
            <div class="table-responsive">
                <table id="empTable" class="table table-striped">
                    <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Branch</th><th>Borrows</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `);

    $('#empTable').DataTable();

    return () => {
        if ($.fn.DataTable.isDataTable('#empTable')) {
            $('#empTable').DataTable().destroy();
        }
    };
};
