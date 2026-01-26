import Swal from 'sweetalert2';

export const handleError = (error: Error | { message: string }) => {
    Swal.fire({ title: "Failed", text: error.message, icon: "error" });
};
