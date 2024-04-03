import axios, { handleError } from '@/axios';
import { ShowSnackType } from '@/hooks';

/** delete a file from the server */
export const deletePath = async <T extends string | undefined>({
    fullRoute,
    path,
    currentPath,
    changePath,
    showSnack,
    update,
    editable = true,
}: {
    /** the full route to the server */
    fullRoute: string;
    /** the path to the file to delete */
    path: string;
    /** a function to show a snack */
    showSnack: ShowSnackType;
    /** the current path */
    currentPath: T;
    /** a function to change the current path */
    changePath: T extends string ? (val: string) => void : undefined;
    /** a function to update the page */
    update?: () => void;
    /** is the file editable */
    editable?: boolean;
}) => {
    if (!editable) {
        showSnack('You can only update the latest submission', 'error');
        return;
    }

    if (currentPath === path) {
        changePath && changePath('');
    }

    await axios
        .delete(`${fullRoute}${path}`, {
            skipErrorHandling: true,
        })
        .then((res) => {
            if (res.status === 200) {
                showSnack('File deleted', 'success');
            }
        })
        .catch((e) => {
            handleError(showSnack)(e);
        })
        .finally(() => {
            if (currentPath === path) {
                changePath && changePath('');
            }
            update && update();
        });
};
