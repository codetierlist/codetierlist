import { useState } from 'react';

/**
 * random seed to update the cover image
 */
export const useSeed = () => {
    const [seed, updateSeed] = useState(Math.random());

    const setSeed = () => {
        updateSeed(Math.random());
    };

    return { seed, setSeed };
};
