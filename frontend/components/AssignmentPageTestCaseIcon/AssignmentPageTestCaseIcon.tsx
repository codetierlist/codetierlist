import { ToolTipIcon } from '@/components';
import {
    ArrowCounterclockwiseDashes24Filled,
    CheckmarkCircle24Regular,
    DismissCircle24Regular,
} from '@fluentui/react-icons';
import { TestCaseStatus as TestCaseStatusType } from 'codetierlist-types';

export declare type TestCaseStatusIconProps = {
    /** the status of the testcase */
    status: TestCaseStatusType;
};

/**
 * return an icon reflecting the status of the testcase
 */
export const TestCaseStatusIcon = ({ status }: TestCaseStatusIconProps): JSX.Element => {
    switch (status) {
        case 'INVALID':
            return (
                <DismissCircle24Regular
                    fill={'var(--colorStatusDangerForeground1)'}
                    primaryFill={'var(--colorStatusDangerForeground1)'}
                />
            );

        case 'PENDING':
            return (
                <ArrowCounterclockwiseDashes24Filled
                    fill={'var(--colorPaletteGoldForeground2)'}
                    primaryFill={'var(--colorPaletteGoldForeground2)'}
                />
            );

        case 'VALID':
            return (
                <CheckmarkCircle24Regular
                    fill={'var(--colorStatusSuccessForeground1)'}
                    primaryFill={'var(--colorStatusSuccessForeground1)'}
                />
            );

        default:
            return <></>;
    }
};

export declare type TestCaseStatusProps = {
    /** the status of the testcase */
    status?: TestCaseStatusType;
};

/**
 * return an icon with tooltip reflecting the status of the testcase
 */
export const TestCaseStatus = ({
    status,
}: TestCaseStatusProps): JSX.Element | undefined => {
    if (!status || status === 'EMPTY') {
        return undefined;
    }

    const contents: Record<Exclude<TestCaseStatusType, 'EMPTY'>, string> = {
        INVALID:
            'One or more of your uploaded tests are invalid and did not pass the solution',
        VALID: 'All uploaded testcases are valid and passed the solution',
        PENDING: 'Your testcases are currently in the queue for validation',
    };

    return (
        <ToolTipIcon tooltip={contents[status]} icon={TestCaseStatusIcon({ status })} />
    );
};
