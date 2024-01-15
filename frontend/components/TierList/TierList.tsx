import { AvatarGroup, AvatarGroupItem, partitionAvatarGroupItems } from "@fluentui/react-components";
import { Tier, Tierlist, TierlistEntry, UserTier } from "codetierlist-types";
import { Col, Row } from "react-grid-system";
import { TierChip } from "..";
import { GenerateInitalsAvatarProps } from "../../components/InitialsAvatar/InitialsAvatar";
import styles from "./TierList.module.css";

/**
 * Generate mock data for one tier of the tier list.
 * @param {number} count the number of people to generate
 * @param {boolean} you whether or not to include yourself in the list
 */
const generatePeople = (count: number, you: boolean): TierlistEntry[] => {
    const getRandomLetter = (): string => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        return `${alphabet[Math.floor(Math.random() * alphabet.length)]}`;
    };

    const getRandomLetters = (lettersCount: number): string => {
        return [...Array(lettersCount)].map(() => getRandomLetter()).join("");
    };

    return [...Array(count)].map((_, i) => {
        return {
            name: getRandomLetters(2),
            you: you && (i == Math.floor(count / 2)),
            utorid: getRandomLetters(8).toLowerCase()
        };
    });
};


const EMPTY_DATA: Tierlist = {
    "S": [],
    "A": [],
    "B": [],
    "C": [],
    "D": [],
    "F": [],
};

const _generate_mock_data = (): Tierlist => {
    return {
        "S": generatePeople(Math.floor(Math.random() * 2000), false),
        "A": generatePeople(Math.floor(Math.random() * 3000), false),
        "B": generatePeople(Math.floor(Math.random() * 4000), true),
        "C": generatePeople(Math.floor(Math.random() * 3000), false),
        "D": generatePeople(Math.floor(Math.random() * 2000), false),
        "F": generatePeople(Math.floor(Math.random() * 1000), false),
    };
};

function swap<T>(arr: T[], i: number, j: number): void {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

/**
 * A tier indicator displays the tier of the tier list.
 * @property {Tier} tier the tier to display
 */
const TierIndicator = ({ tier }: { tier: Tier }): JSX.Element => {
    return (
        <Col
            style={{
                textAlign: "center",
                padding: 0
            }}
            sm={12} lg={2}
        >
            <TierChip
                tier={tier as UserTier}
                className={`py-2 px-0 ${styles.tier}`}
            />
        </Col>
    );
};

/**
 * A tier avatars displays the avatars of the people in the tier.
 * @property {string[]} people the people to display
 * @property {number} maxInlineItems the maximum number of people to display before showing a +x
 */
const TierAvatars = ({ people, maxInlineItems }: { people: { name: string, you: boolean }[], maxInlineItems: number }): JSX.Element => {
    const { inlineItems, overflowItems } = partitionAvatarGroupItems({ items: people, maxInlineItems });

    return (
        <Col
            className={styles.tierAvatars}
            sm={12} lg={10}
        >
            <AvatarGroup className={styles.avatarGroup}>
                {
                    inlineItems.map((person, i) => {
                        return (
                            <AvatarGroupItem
                                key={i}
                                className={person.you ? `${styles.you} ${styles.avatar}` : styles.avatar}
                                {...GenerateInitalsAvatarProps(person.name)}
                            />
                        );
                    })
                }
                {
                    overflowItems && (
                        <AvatarGroupItem
                            overflowLabel={`${overflowItems.length} more`}
                            className={styles.avatar}
                            initials={`+${overflowItems.length}`}
                            color={"neutral"}
                        />
                    )
                }
            </AvatarGroup>
        </Col>
    );
};

/**
 * A tier displays a tier and the people in the tier.
 * @property {string} tier the tier to display
 * @property {Tierlist} tierlist the tierlist to display
 */
const TierRow = ({ tier, tierlist }: { tier: string, tierlist: Tierlist }): JSX.Element => {
    const MAX_INLINE_ITEMS = 20;

    // current tier, remove any potential undefined or null values
    const thisTier = tierlist[tier as Tier].filter((person) => person);

    // get index of you in tier for swapping
    const youIndex = thisTier.findIndex((person) => person.you);

    // to make the data visualization more readable, we want to scale the
    // number of people in each tier so that when all tiers exceed the max inline
    // items, it is still easy to tell who has the most people in their tier
    const LARGEST_TIER_LENGTH = Math.max(...Object.values(tierlist).map((t) => t.length));
    const SCALED_TIER_PERCENT = thisTier.length / LARGEST_TIER_LENGTH;
    const SCALED_TIER_LENGTH = Math.ceil(SCALED_TIER_PERCENT * MAX_INLINE_ITEMS);

    // partitionAvatarGroupItems splices the last items for inline  .. ?
    if (youIndex !== -1) {
        swap(thisTier,
            youIndex,
            thisTier.length - SCALED_TIER_LENGTH + 1 + (thisTier[youIndex].name[0].charCodeAt(0) % SCALED_TIER_LENGTH));
    }

    return (
        <>
            <TierIndicator tier={tier as Tier} />

            <TierAvatars
                people={thisTier}

                maxInlineItems={
                    LARGEST_TIER_LENGTH > MAX_INLINE_ITEMS ?
                        SCALED_TIER_LENGTH :
                        MAX_INLINE_ITEMS
                }
            />
        </>
    );
};

/**
 * A tier list displays a list of people in a tier list format.
 * @property {Tierlist} tierlist the tierlist to display
 * @returns {JSX.Element} the tier list
 */
export const TierList = ({ tierlist = EMPTY_DATA }: { tierlist: Tierlist }): JSX.Element => {
    return (
        <Row component="section">
            {
                Object.keys(tierlist).map((tier, index) => {
                    return (
                        <TierRow key={index} tier={tier} tierlist={tierlist} />
                    );
                })
            }
        </Row>
    );
};

export default TierList;
