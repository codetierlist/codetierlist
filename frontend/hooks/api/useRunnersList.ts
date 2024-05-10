import axios, { handleError } from '@/axios';
import { SnackbarContext } from '@/hooks';
import { RunnerImage } from 'codetierlist-types';
import { useEffect, useContext, useState } from 'react';

/**
 * Custom hook to fetch the runner images list and allow the user to select a runner
 */
export const useRunnersList = () => {
    const [runners, setRunners] = useState<Record<string, string[]>>({});
    const [selectedRunner, setSelectedRunner] = useState<RunnerImage | null>(null);
    const { showSnack } = useContext(SnackbarContext);

    useEffect(() => {
        const fetchRunners = async () => {
            const res = await axios.get<RunnerImage[]>('/runner/images').catch((e) => {
                handleError(showSnack)(e);
            });
            if (!res) {
                return;
            }
            setRunners(
                res.data.reduce(
                    (acc, runner) => {
                        acc[runner.runner_image] = acc[runner.runner_image] ?? [];
                        acc[runner.runner_image].push(runner.image_version);
                        return acc;
                    },
                    {} as Record<string, string[]>
                )
            );

            setSelectedRunner(res.data[0]);
        };

        void fetchRunners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { runners, setSelectedRunner, selectedRunner };
};
