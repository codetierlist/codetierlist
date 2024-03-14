import { convertDate, TierChip } from '@/components';
import { CompoundButton, Subtitle1 } from '@fluentui/react-components';
import { type Tier, type UserTier } from 'codetierlist-types';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import styles from './AssignmentCard.module.css';

export declare type AssignmentCardProps = {
    /** The ID of the assignment */
    assignmentID: string;

    /** The name of the assignment */
    name: string;

    /** The due date of the assignment */
    dueDate?: Date;

    /** The tier of the user */
    tier: UserTier | Tier;

    /** The ID of the course this assignment belongs to */
    courseID: string;
};

export const AssignmentCard = ({
    assignmentID,
    courseID,
    name,
    dueDate,
    tier,
}: AssignmentCardProps): JSX.Element => {
    /** The formatted due date of the assignment */
    const formattedDueDate = useMemo(() => {
        if (dueDate) {
            return convertDate(dueDate);
        }
        return null;
    }, [dueDate]);

    const router = useRouter();

    return (
        <CompoundButton
            className={`${styles.card} p-0`}
            size="medium"
            aria-label={`View assignment ${name}, due ${formattedDueDate}. ${tier == '?' ? 'Tier not set.' : `You are in ${tier} tier.`}`}
            appearance="secondary"
            icon={<TierChip tier={tier as UserTier} className="p-m" />}
            secondaryContent={
                dueDate && (
                    <>
                        <strong>Due</strong> {formattedDueDate}
                    </>
                )
            }
            onClick={() => {
                router.push(`/courses/${courseID}/${assignmentID}`);
            }}
        >
            <Subtitle1 className={styles.cardText}>{name}</Subtitle1>
        </CompoundButton>
    );
};
