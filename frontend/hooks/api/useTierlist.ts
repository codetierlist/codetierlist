import axios, { handleError } from '@/axios';
import { Tierlist } from 'codetierlist-types';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { SnackbarContext } from '@/hooks';

/**
 * A hook that fetches the tierlist for the assignment page
 */
export const useTierlist = (courseID: string, assignmentID: string) => {
    const [tierlist, setTierlist] = useState<Tierlist | null>(null);
    const { showSnack } = useContext(SnackbarContext);
    const searchParams = useSearchParams();

    const fetchTierlist = async () => {
        await axios
            .get<Tierlist>(`/courses/${courseID}/assignments/${assignmentID}/tierlist`, {
                skipErrorHandling: true,
                params: {
                    utorid: searchParams.get('utorid') ?? undefined,
                },
            })
            .then((res) => setTierlist(res.data))
            .catch((e) => {
                handleError(showSnack)(e);
            });
    };

    /**
     * the polling rate for fetching the assignment and tierlist
     */
    const POLLING_RATE = 60000;

    useEffect(() => {
        const interval = setInterval(() => {
            if (!courseID || !assignmentID) {
                return;
            }
            void fetchTierlist();
        }, POLLING_RATE);

        return () => clearInterval(interval);
    });

    useEffect(() => {
        void fetchTierlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, assignmentID]);

    return { tierlist, fetchTierlist };
};
