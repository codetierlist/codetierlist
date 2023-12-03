import { ToastIntent } from '@fluentui/react-components';
import { createContext } from 'react';

/**
 * The context for the global snackbar. Just use `enqueue` to display a
 * snackbar!
 */
export const SnackbarContext = createContext({
    /**
     * Displays a snackbar with the given message and action. By default it
     * automatically closes after 6000ms.
     *
     * @property message The message to display.
     * @property action An optional element to display as an action.
     * @property content An optional element to set the children of the snackbar.
     */
    showSnack: (message?: string, action?: JSX.Element, content?: JSX.Element) => {},

    /**
     * Displays a snackbar with the given message and severity. By default it
     * automatically closes after 6000ms.
     * @property message The message to display.
     * @property sev The severity of the snackbar.
     */
    showSnackSev: (message?: string, sev?: ToastIntent) => {},
});
