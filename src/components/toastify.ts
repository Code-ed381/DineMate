import { toast, TypeOptions } from "react-toastify";

export const toastify = (message: string, type?: TypeOptions) => {
    toast(message, {
        position: "bottom-right",
        autoClose: 4000,
        type: type,
        theme: "colored",
    });
};
