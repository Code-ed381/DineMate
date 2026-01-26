import Swal from 'sweetalert2';

export const errorHandler = (error: Error) => Swal.fire({
    icon: 'error',
    title: 'Oops... Something went wrong!',
    text: error.message
});
