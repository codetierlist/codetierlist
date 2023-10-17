"use client"

import { useMemo } from "react";
import { Avatar } from "@fluentui/react-components";
import type { AvatarProps } from "@fluentui/react-components";

export declare type InitialsAvatarProps = AvatarProps & {
    /** the name to get the initials of */
    name?: string;
    /** the props to pass to the avatar */
    props?: AvatarProps;
}

/**
 * Given a name get the initials of the name up to 2 characters into an avatar
 * @returns {JSX.Element} the avatar with the initials
 */
export const InitialsAvatar = ({ name = '', ...props }: InitialsAvatarProps): JSX.Element => {
    const initials = useMemo(() => {
        let notNullName = name ?? "hello";

        return notNullName
            .match(/(^\S\S?|\s\S)?/g) // matches the first character of each word
            ?.map((v) => v.trim())    // removes the spaces
            .join('')                 // joins the characters
            .match(/(^\S|\S$)?/g)     // matches the first and last character
            ?.join('')                // joins the characters
            .toLocaleUpperCase();     // makes the characters uppercase
    }, [name]);

    return (
        <Avatar
            aria-label={name}
            initials={initials}
            color="colorful"
            {...props}
        />
    );
};
