import { Avatar } from '@fluentui/react-components';
import type { AvatarProps } from '@fluentui/react-components';
import { FetchedUser } from 'codetierlist-types';

export const generateInitals = (user: FetchedUser): string =>
    `${user.givenName.substring(0, 1)}${user.surname.substring(0, 1)}`;

/**
 * Given a name get the initials of the name up to 2 characters into an avatar
 * @returns {AvatarProps} the props to pass to the avatar
 */
export const generateInitalsAvatarProps = (
    initials: string,
    props?: AvatarProps
): AvatarProps => {
    return {
        'aria-hidden': true,
        initials: initials.substring(0, 2).toUpperCase(),
        color: 'colorful',
        idForColor: initials,
        ...props,
    };
};

export declare type InitialsAvatarProps = AvatarProps & {
    /** the name to get the initials of */
    name?: string;
    /** the props to pass to the avatar */
    props?: AvatarProps;
};

/**
 * Given a name get the initials of the name up to 2 characters into an Avatar
 */
export const InitialsAvatar = ({
    name = '',
    ...props
}: InitialsAvatarProps): JSX.Element => {
    return <Avatar {...generateInitalsAvatarProps(name, props)} />;
};
