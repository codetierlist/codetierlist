/* eslint-disable @typescript-eslint/no-unused-vars */
import { ToastIntent } from '@fluentui/react-components';
import { createContext } from 'react';

export type ShowSnackSevType = (message?: string, severity?: ToastIntent, title?: string) => void;

/**
 * The context for the global snackbar. Just use `showSnack` to display a
 * snackbar!
 */
export const SnackbarContext = createContext({
    /**
     * Displays a snackbar with the given message and action. By default it
     * automatically closes after 6000ms.
     *
     * @param message The message to display.
     * @param action An optional element to display as an action.
     * @param content An optional element to set the children of the snackbar.
     */
    showSnack: (message?: string, action?: JSX.Element, content?: JSX.Element) => {},

    /**
     * Displays a snackbar with the given message and severity. By default it
     * automatically closes after 6000ms.
     * @param message The message to display.
     * @param sev The severity of the snackbar.
     */
    showSnackSev: (message?: string, severity?: ToastIntent, title?: string) => {},
});
