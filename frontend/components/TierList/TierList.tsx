import { AvatarGroup, AvatarGroupItem, AvatarGroupPopover, partitionAvatarGroupItems } from "@fluentui/react-components";
import { Tier, Tierlist, UserTier } from "codetierlist-types";
import { Col, Row } from "react-grid-system";
import { TierChip } from "..";
import { GenerateInitalsAvatarProps } from "../../components/InitialsAvatar/InitialsAvatar";
import styles from "./TierList.module.css";

const Hardcode = [
    {
        tier: "S",
        people: [
            "Clara",
            "Haruno Sora",
            "Kobayashi Matcha",
        ]
    },
    {
        tier: "A",
        people: [
            "Yuezheng Ling",
            "Vocaloid Matryoshka Names",
            "Nekomura Iroha",
            "Yuezheng Longya",
            "Kobayashi Matcha",
            "Kizuna Akari",
        ]
    },
    {
        tier: "B",
        people: [
            "Megurine Luka",
            "Yuzuki Yukari",
            "Utatane Piko",
            "You"
        ]
    },
    {
        tier: "C",
        people: [
            "Tone Rion",
            "Sweet Ann",
        ]
    },
    {
        tier: "F",
        people: [
            "Sf-A2 Miki",
            "Masaoka Azuki",
        ]
    },
].reduce((acc, { tier, people }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[tier] = people.map((name) => ({
        name,
        you: name === "You",
    }));
    return acc;
}, {} as Tierlist);

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
            style={{
                backgroundColor: "var(--colorNeutralBackground1Hover)",
                borderBottom: "1px solid var(--colorNeutralBackground1Pressed)",
            }}
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
    return (
        <>
            <TierIndicator tier={tier as Tier} />

            <TierAvatars people={tierlist[tier as Tier]} maxInlineItems={20} />
        </>
    );
};

/**
 * A tier list displays a list of people in a tier list format.
 * @property {Tierlist} tierlist the tierlist to display
 * @returns {JSX.Element} the tier list
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TierList = ({ tierlist = Hardcode }: { tierlist: Tierlist }): JSX.Element => {
    return (
        <Row component="section">
            {
                Object.keys(Hardcode).map((tier, index) => {
                    return (
                        <TierRow key={index} tier={tier} tierlist={Hardcode} />
                    );
                })
            }
        </Row>
    );
};

export default TierList;
