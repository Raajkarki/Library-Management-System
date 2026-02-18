/**
 * Messages Utility (SweetAlert2 Wrapper)
 */

export const showMessage = (title, html, icon = 'info') => {
    return Swal.fire({
        title,
        html,
        icon,
        confirmButtonColor: '#0d6efd',
        width: '600px'
    });
};

export const confirm = (title, html, confirmButtonText = 'Yes', confirmButtonColor = '#dc3545') => {
    return Swal.fire({
        title,
        html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor,
        confirmButtonText
    }).then(result => result.isConfirmed);
};
