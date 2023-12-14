import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    ToolbarButton
} from "@fluentui/react-components";
import { BinRecycle24Regular } from '@fluentui/react-icons';

export const BaseToolbarDeleteButton = ({ deleteFunction, noun }: { deleteFunction: () => Promise<void>, noun: string }) => {
    return (
        <Dialog>
            <DialogTrigger disableButtonEnhancement>
                <ToolbarButton
                    appearance="subtle"
                    icon={<BinRecycle24Regular />}
                >
                    Delete {noun}
                </ToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Delete {noun}</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this {noun}? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Cancel</Button>
                        </DialogTrigger>
                        <Button appearance="primary" onClick={deleteFunction}>Delete</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>

    );
};
