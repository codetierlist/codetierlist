import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    ToolbarButton,
} from '@fluentui/react-components';
import { BinRecycle24Regular } from '@fluentui/react-icons';
import styles from './BaseAdminToolbarDeleteButton.module.css';

export declare type BaseAdminToolbarDeleteButtonProps = {
    /**
     * The function to call when the delete button is clicked
     * @returns {Promise<void>} a promise that resolves when the delete is complete
     */
    deleteFunction: () => Promise<void>;
    /**
     * The noun to use in the delete confirmation dialog
     * @example "course"
     * @example "assignment"
     */
    noun: string;
};

/**
 * A button that deletes an object
 */
export const BaseAdminToolbarDeleteButton = ({
    deleteFunction,
    noun,
}: BaseAdminToolbarDeleteButtonProps) => {
    return (
        <Dialog>
            <DialogTrigger disableButtonEnhancement>
                <ToolbarButton
                    appearance="subtle"
                    icon={<BinRecycle24Regular />}
                    className={styles.deleteButton}
                >
                    Delete {noun}
                </ToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Delete {noun}</DialogTitle>

                    <DialogContent>
                        Are you sure you want to delete this {noun}? This action cannot be
                        undone.
                    </DialogContent>

                    <DialogActions>
                        <Button
                            appearance="secondary"
                            onClick={deleteFunction}
                            className={styles.deleteButton}
                        >
                            Delete
                        </Button>

                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="primary">Cancel</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
