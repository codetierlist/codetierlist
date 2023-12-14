import axios, { handleError } from "@/axios";
import { UserContext } from "@/contexts/UserContext";
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
import { useRouter } from 'next/router';
import { useContext } from "react";
import { SnackbarContext } from '../../contexts/SnackbarContext';

export const AdminToolbarDeleteCourseButton = ({ courseID }: { courseID: string }) => {
    const { showSnackSev } = useContext(SnackbarContext);
    const { fetchUserInfo } = useContext(UserContext);

    const router = useRouter();

    const deleteCourse = async () => {
        await axios.delete(`/courses/${courseID}`)
            .then(() => router.push('/'))
            .catch(handleError(showSnackSev))
            .finally(() => fetchUserInfo());
    };

    return (
        <Dialog>
            <DialogTrigger disableButtonEnhancement>
                <ToolbarButton
                    appearance="subtle"
                    icon={<BinRecycle24Regular />}
                >
                    Delete course
                </ToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Delete course</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this course? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Cancel</Button>
                        </DialogTrigger>
                        <Button appearance="primary" onClick={deleteCourse}>Delete</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>

    );
}
