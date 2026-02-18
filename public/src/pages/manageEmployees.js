/**
 * Manage Employees Page
 */
import { setHTML, qs, on } from '../dom.js';
import { selectEmployees } from '../state/selectors.js';
import { addEmployee, updateEmployee } from '../state/actions.js';
import { navigateTo } from '../router.js';

export const renderManageEmployeesPage = (root, params = {}) => {
    if (params.isEdit) {
        return renderAddEditEmployeeForm(root, params);
    }
    const employees = selectEmployees();

    let rows = employees.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.department}</td>
            <td>${s.branch || '-'}</td>
            <td>
                <button type="button" class="btn btn-sm btn-warning edit-employee-btn" data-employee-id="${s.id}" aria-label="Edit employee">
                    <i class="fas fa-edit"></i>
                </button> 
                <button type="button" class="btn btn-sm btn-danger delete-employee-btn" data-employee-id="${s.id}" aria-label="Delete employee">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`).join('');

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <div class="d-flex justify-content-between">
                <h2>Manage Employees</h2>
                <button class="btn btn-primary" id="addNewEmployeeBtn">Add Employee</button>
            </div>
            <div class="table-responsive">
                <table id="manEmpTable" class="table table-striped">
                    <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Branch</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `);

    on(qs('#addNewEmployeeBtn'), 'click', () => renderAddEditEmployeeForm(root));

    $('#manEmpTable').DataTable({
        columnDefs: [{ targets: [4], orderable: false, searchable: false }]
    });

    return () => {
        if ($.fn.DataTable.isDataTable('#manEmpTable')) {
            $('#manEmpTable').DataTable().destroy();
        }
    };
};

export const renderAddEditEmployeeForm = (root, params = {}) => {
    const isEdit = Boolean(params.isEdit);
    const employees = selectEmployees();
    const stud = isEdit ? employees.find(s => s.id === params.employeeId) : null;

    setHTML(root, `
        <div class="content-section" data-aos="fade-up">
            <h2>${isEdit ? 'Edit' : 'Add'} Employee</h2>
            <form id="empForm" class="needs-validation" novalidate>
                <div class="mb-3"><label>Name</label><input type="text" class="form-control" id="eName" value="${isEdit ? stud.name : ''}" required></div>
                <div class="mb-3"><label>Email</label><input type="email" class="form-control" id="eEmail" value="${isEdit ? stud.email : ''}" required></div>
                <div class="row">
                    <div class="col-md-6 mb-3"><label class="form-label">Department</label><input type="text" class="form-control" id="eDepartment" value="${isEdit ? stud.department : ''}"></div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Branch</label>
                        <select class="form-select" id="eBranch" required>
                            <option value="">Select branch...</option>
                            <option value="Jawalakhel" ${isEdit && stud.branch === 'Jawalakhel' ? 'selected' : ''}>Jawalakhel</option>
                            <option value="Bagdole 1" ${isEdit && stud.branch === 'Bagdole 1' ? 'selected' : ''}>Bagdole 1</option>
                            <option value="Bagdole 2" ${isEdit && stud.branch === 'Bagdole 2' ? 'selected' : ''}>Bagdole 2</option>
                        </select>
                        <div class="invalid-feedback">Please select a branch.</div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Save</button> 
                <button type="button" class="btn btn-secondary" id="cancelEmpBtn">Cancel</button>
            </form>
        </div>`);

    on(qs('#cancelEmpBtn'), 'click', () => navigateTo('manageEmployees'));

    on(qs('#empForm'), 'submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

        const data = {
            name: qs('#eName').value,
            email: qs('#eEmail').value,
            department: qs('#eDepartment').value,
            branch: qs('#eBranch').value
        };

        if (isEdit) {
            updateEmployee(stud.id, data);
        } else {
            addEmployee(data);
        }
        navigateTo('manageEmployees');
    });
};
