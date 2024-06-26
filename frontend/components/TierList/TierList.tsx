import {
    TierChip,
    ToolTipIcon,
    generateInitialsAvatarProps,
    getTierClass,
} from '@/components';
import { useStage } from '@/pages/courses/[courseID]/[assignmentID]';
import {
    AvatarGroup,
    AvatarGroupItem,
    Link,
    partitionAvatarGroupItems,
} from '@fluentui/react-components';
import { Tier, Tierlist, TierlistEntry } from 'codetierlist-types';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-grid-system';
import styles from './TierList.module.css';

const EMPTY_DATA: Tierlist = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
};

declare type TierIndicatorProps = {
    /** The tier to display */
    tier: Tier;
};

/**
 * A tier indicator displays the tier of the tier list.
 */
const TierIndicator = ({ tier }: TierIndicatorProps): JSX.Element => {
    return (
        <Col xs={2} className={`${getTierClass(tier)} ${styles.tierIndicator}`}>
            <TierChip tier={tier} className="p-y-2 p-x-0" />
        </Col>
    );
};

declare type TierAvatarsProps = {
    /** The people to display */
    people: TierlistEntry[];
    /** The maximum number of people to display before showing a +x */
    maxInlineItems: number;
};

/**
 * A tier avatar displays the avatar of a person in the tier.
 */
const TierAvatar = ({ person }: { person: TierlistEntry }) => {
    const { setStage } = useStage();

    /** Load the uploads of the person. */
    const loadUploads = () => {
        setStage('upload', person.utorid);
    };

    /** The avatar of the person. */
    const avatar = (
        <AvatarGroupItem
            className={person.you ? `${styles.you} ${styles.avatar}` : styles.avatar}
            {...generateInitialsAvatarProps(person.name, {
                active: person.you ? 'active' : undefined,
            })}
        />
    );

    if (person.utorid && person.utorid !== '') {
        return (
            <ToolTipIcon
                tooltip={`View ${person.utorid}'s uploads`}
                icon={
                    <Link onClick={loadUploads} appearance="subtle">
                        {avatar}
                    </Link>
                }
            />
        );
    }

    return avatar;
};

/**
 * A tier avatars displays the avatars of the people in the tier.
 */
const TierAvatars = forwardRef<HTMLDivElement, TierAvatarsProps>(
    ({ people, maxInlineItems }, ref): JSX.Element => {
        const { inlineItems, overflowItems } = partitionAvatarGroupItems({
            items: people,
            maxInlineItems,
        });

        // get index of you in tier for swapping
        const youIndex = overflowItems
            ? overflowItems.findIndex((person) => person.you)
            : -1;

        // remove any potential undefined or null values
        const newInlineItems = inlineItems.filter((person) => person);

        // whether or not you are in this tier
        const youInTier = people.some((person) => person.you);

        // partitionAvatarGroupItems splices the last items for inline .. ?
        if (youIndex !== -1 && overflowItems) {
            newInlineItems.push(overflowItems[youIndex]);
        }

        return (
            <Col
                className={styles.tierAvatars}
                xs={10}
                role="rowgroup"
                aria-label={`${people.length} people in this tier. ${youInTier ? 'You are in this tier.' : ''}`}
            >
                <AvatarGroup className={styles.avatarGroup} ref={ref} aria-hidden="true">
                    {newInlineItems
                        .filter((person) => person)
                        .map((person, i) => {
                            return <TierAvatar key={i} person={person} />;
                        })}
                    {overflowItems && (
                        <AvatarGroupItem
                            overflowLabel={`${overflowItems.length} more`}
                            className={styles.avatar}
                            initials={`+${youIndex !== -1 ? overflowItems.length - 1 : overflowItems.length}`}
                            color={'neutral'}
                        />
                    )}
                </AvatarGroup>
            </Col>
        );
    }
);

TierAvatars.displayName = 'TierAvatars';

declare type TierRowProps = {
    /** The tier to display */
    tier: string;
    /** The tierlist to display */
    tierlist: Tierlist;
};

/**
 * A tier displays a tier and the people in the tier.
 */
const TierRow = ({ tier, tierlist }: TierRowProps): JSX.Element => {
    const [maxInlineItems, setMaxInlineItems] = useState(20);

    // ref for the tier avatars
    const tierAvatarsRef = useRef<HTMLDivElement>(null);

    // current tier, remove any potential undefined or null values
    const thisTier = tierlist[tier as Tier].filter((person) => person);

    const handleResize = () => {
        // calculate the largest tier length based on the width of the tierlist
        const TIERLIST_WIDTH = tierAvatarsRef.current?.clientWidth || 0;

        // avatar is 32px wide
        const MAX_INLINE_ITEMS = Math.floor(TIERLIST_WIDTH / 32);

        // to make the data visualization more readable, we want to scale the
        // number of people in each tier so that when all tiers exceed the max inline
        // items, it is still easy to tell who has the most people in their tier
        const LARGEST_TIER_LENGTH = Math.max(
            ...Object.values(tierlist).map((t) => t.length)
        );
        const SCALED_TIER_PERCENT = thisTier.length / LARGEST_TIER_LENGTH;
        const SCALED_TIER_LENGTH = Math.ceil(SCALED_TIER_PERCENT * MAX_INLINE_ITEMS);

        setMaxInlineItems(
            LARGEST_TIER_LENGTH > MAX_INLINE_ITEMS ? SCALED_TIER_LENGTH : MAX_INLINE_ITEMS
        );
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tierlist, thisTier]);

    return (
        <>
            <TierIndicator tier={tier as Tier} />

            <TierAvatars
                ref={tierAvatarsRef}
                people={thisTier}
                maxInlineItems={maxInlineItems}
            />
        </>
    );
};

export declare type TierListProps = {
    /** The tierlist to display */
    tierlist: Tierlist;
};

/**
 * A tier list displays a list of people in a tier list format.
 */
export const TierList = ({ tierlist = EMPTY_DATA }: TierListProps): JSX.Element => {
    return (
        <Row className={styles.tierList}>
            {Object.keys(tierlist).map((tier, index) => {
                return <TierRow key={index} tier={tier} tierlist={tierlist} />;
            })}
        </Row>
    );
};

export default TierList;
