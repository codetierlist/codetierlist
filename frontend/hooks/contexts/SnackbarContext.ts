/* eslint-disable @typescript-eslint/no-unused-vars */
import { ToastIntent } from '@fluentui/react-components';
import { createContext } from 'react';

/**
 * Displays a snackbar with the given message and severity. By default it
 * automatically closes after 6000ms.
 * @param message The message to display.
 * @param sev The severity of the snackbar.
 * @param title The title of the snackbar.
 * @param action The action to display on the snackbar.
 */
export type ShowSnackType = (
    message?: string,
    severity?: ToastIntent,
    title?: string,
    action?: JSX.Element
) => void;

/**
 * The context for the global snackbar. Just use `showSnack` to display a
 * snackbar!
 */
export const SnackbarContext = createContext({
    showSnack: (
        message?: string,
        severity?: ToastIntent,
        title?: string,
        action?: JSX.Element
    ) => {},

    toasterId: '',
} as {
    /**
     * Displays a snackbar with the given message and severity. By default it
     * automatically closes after 6000ms.
     * @param message The message to display.
     * @param sev The severity of the snackbar.
     * @param title The title of the snackbar.
     * @param action The action to display on the snackbar.
     */
    showSnack: ShowSnackType;

    /**
     * the id of the toaster in case you need it.
     *
     * use by using the useToastController hook from @fluentui/react-components
     */
    toasterId: string;
});
