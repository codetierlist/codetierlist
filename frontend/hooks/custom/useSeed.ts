import { useState } from 'react';

/**
 * random seed to force updates
 */
export const useSeed = () => {
    const [seed, updateSeed] = useState(Math.random());

    const setSeed = () => {
        updateSeed(Math.random());
    };

    return { seed, setSeed };
};
