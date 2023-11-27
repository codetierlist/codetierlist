import { AvatarGroup, AvatarGroupItem } from "@fluentui/react-components";
import { Tier, Tierlist, UserTier } from "codetierlist-types";
import { Fragment } from "react";
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
 * A tier list displays a list of people in a tier list format.
 * @property {Tierlist} tierlist the tierlist to display
 * @returns {JSX.Element} the tier list
 */
export const TierList = ({ tierlist = Hardcode }: { tierlist: Tierlist }): JSX.Element => {
    return (
        <Row component="section">
            {
                Object.keys(tierlist).map((tier, index) => {
                    return (
                        <Fragment key={index}>
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

                            <Col
                                style={{
                                    backgroundColor: "var(--colorNeutralBackground1Hover)",
                                    borderBottom: "1px solid var(--colorNeutralBackground1Pressed)",
                                }}
                                sm={12} lg={10}
                            >
                                <AvatarGroup className={styles.avatarGroup}>
                                    {
                                        tierlist[tier as Tier].map((person, i) => {
                                            return (
                                                <AvatarGroupItem
                                                    key={i}
                                                    className={person.you ? `${styles.you} ${styles.avatar}` : styles.avatar}
                                                    {...GenerateInitalsAvatarProps(person.name)}
                                                />
                                            );
                                        })
                                    }
                                </AvatarGroup>
                            </Col>
                        </Fragment>
                    );
                })
            }
        </Row>
    );
};

export default TierList;
