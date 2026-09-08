import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// SweetAlert utility functions
const alert = {
    success: (title, message) =>
        MySwal.fire({
            title: title || 'Success',
            text: message,
            icon: 'success',
            confirmButtonColor: '#3085d6',
        }),

    error: (title, message) =>
        MySwal.fire({
            title: title || 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#d33',
        }),

    info: (title, message) =>
        MySwal.fire({
            title: title || 'Info',
            text: message,
            icon: 'info',
            confirmButtonColor: '#3085d6',
        }),

    warning: (title, message) =>
        MySwal.fire({
            title: title || 'Warning',
            text: message,
            icon: 'warning',
            confirmButtonColor: '#d33',
        }),

    confirm: (title, message, onConfirm, onCancel) =>
        MySwal.fire({
            title: title || 'Are you sure?',
            text: message || "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, do it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                onConfirm && onConfirm();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                onCancel && onCancel();
            }
        }),
};

export default alert;
