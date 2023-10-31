import { TierChip } from "..";
import { InitialsAvatar } from "../../components/InitialsAvatar/InitialsAvatar";
import styles from "./TierList.module.css";
import { Fragment } from "react";
import {Tier, Tierlist} from "codetierlist-types";

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
];

/**
 * A tier list displays a list of people in a tier list format.
 * @property {Tierlist} tierlist the tierlist to display
 * @returns {JSX.Element} the tier list
 */
export const TierList = ({ tierlist }: { tierlist?: Tierlist }): JSX.Element => {
    return (
        <section className="row">
            {
                Object.keys(tierlist).map((tier, index) => {
                    return (
                        <Fragment key={index}>
                            <div
                                style={{
                                    textAlign: "center",
                                }}
                                className="col-12 col-lg-2 px-0"
                            >
                                <TierChip
                                    tier={tier}
                                    className="py-2 px-0"
                                    style={{
                                        borderRadius: "0",
                                        height: "100%",
                                        lineHeight: "2em",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    backgroundColor: "var(--colorNeutralBackground1Hover)",
                                    borderBottom: "1px solid var(--colorNeutralBackground1Pressed)",
                                }}
                                className="col-12 col-lg-10 d-flex align-items-center py-2"
                            >
                                <div>
                                    {
                                        tierlist[tier as Tier].map((person, i) => {
                                            return (
                                                <InitialsAvatar
                                                    name={person.name}
                                                    key={i}
                                                    className={person.you ? styles.you : ""}
                                                    style={{
                                                        margin: "1em",
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </Fragment>
                    );
                })
            }
        </section>
    );
};

export default TierList;
