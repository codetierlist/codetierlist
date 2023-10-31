import { TierChip } from "..";
import { InitialsAvatar } from "../../components/InitialsAvatar/InitialsAvatar";
import styles from "./TierList.module.css";
import { Fragment } from "react";

export declare type Tierlist = {
    tier: string,
    people: string[],
}[];

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
export const TierList = ({ tierlist = Hardcode }: { tierlist?: Tierlist }): JSX.Element => {
    return (
        <section className="row">
            {
                tierlist.map((tier, index) => {
                    return (
                        <Fragment key={index}>
                            <div
                                style={{
                                    textAlign: "center",
                                }}
                                className="col-12 col-lg-2 px-0"
                            >
                                <TierChip
                                    tier={tier.tier}
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
                                        tier.people.map((person, i) => {
                                            return (
                                                <InitialsAvatar
                                                    name={person}
                                                    key={i}
                                                    className={person === "You" ? styles.you : ""}
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
