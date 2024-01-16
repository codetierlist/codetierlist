import { Tierlist, TierlistEntry } from "codetierlist-types";

/**
 * Generate mock data for one tier of the tier list.
 * @param {number} count the number of people to generate
 * @param {boolean} you whether or not to include yourself in the list
 */
export const generatePeople = (count: number, you: boolean): TierlistEntry[] => {
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

export const generateMockData = (): Tierlist => {
    return {
        "S": [
            {
                "you": true,
                "name": "JL",
                "utorid": "leehung4"
            },
            {
                "you": false,
                "name": "IB",
                "utorid": "benhaimi"
            }
        ],
        "A": [],
        "B": [],
        "C": [
            {
                "you": false,
                "name": "YB",
                "utorid": "bulbuli5"
            },
            {
                "you": false,
                "name": "BZ",
                "utorid": "zhan8725"
            }
        ],
        "D": [],
        "F": []
    };
};
