import { Display } from "@fluentui/react-text";

import { Dummy } from "@/backend/src/types/global";

export default function NotFound () {
    const dummy: Dummy = {
        dummy: '404',
    };

    return (
        <main>
            <Display>{dummy.dummy}</Display>
        </main>
    );
}
