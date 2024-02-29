import axios, { handleError } from '@/axios';
import { ToastIntent } from '@fluentui/react-components';

/** delete a file from the server
 * @param fullRoute - the full route to the server
 * @param path - the path to the file to delete
 * @param currentPath - the current path
 * @param changePath - a function to change the current path
 * @param showSnackSev - a function to show a snack
 * @param update - a function to update the page
 */
export const deletePath = async <T extends string | undefined>({
    fullRoute,
    path,
    currentPath,
    changePath,
    showSnackSev,
    update,
}: {
    fullRoute: string;
    path: string;
    showSnackSev: (message?: string, sev?: ToastIntent) => void;
    currentPath: T;
    changePath: T extends string ? (val: string) => void : undefined;
    update?: () => void;
}) => {
    if (currentPath === path) {
        changePath && changePath('');
    }
    await axios
        .delete(`${fullRoute}${path}`, {
            skipErrorHandling: true,
        })
        .then((res) => {
            if (res.status === 200) {
                showSnackSev('File deleted', 'success');
            }
        })
        .catch((e) => {
            handleError(showSnackSev)(e);
        })
        .finally(() => {
            if (currentPath === path) {
                changePath && changePath('');
            }
            update && update();
        });
};
