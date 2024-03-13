import axios, { handleError } from '@/axios';
import { ControlCard, defaultAccentColor } from '@/components';
import { SnackbarContext, UserContext } from '@/hooks';
import favicon from '@/public/favicon.svg';
import {
    Caption1,
    Caption2,
    Dropdown,
    Link,
    Option,
    Subtitle2,
    Title3,
} from '@fluentui/react-components';
import {
    Color24Regular,
    Image24Regular,
    PaintBrush24Regular,
} from '@fluentui/react-icons';
import { Theme } from 'codetierlist-types';
import Head from 'next/head';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { Container } from 'react-grid-system';
import useLocalStorage from 'use-local-storage';
import pkg from '../../package.json';
import styles from './settings.module.css';

/**
 * Friendly labels for the theme options.
 */
const themeOptions: Record<Theme, string> = {
    SYSTEM: 'System',
    LIGHT: 'Light',
    DARK: 'Dark',
    CONTRAST: 'High Contrast',
};

const ThemeSelector = () => {
    const { userInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnack } = useContext(SnackbarContext);

    /**
     * Change the user's theme.
     * @param theme the theme to change to
     */
    const changeTheme = (theme: Theme) => {
        axios
            .post('/users/theme', {
                theme,
            })
            .catch((e) => {
                handleError(showSnack)(e);
            })
            .finally(() => {
                fetchUserInfo();
            });
    };

    return (
        <Dropdown
            value={themeOptions[userInfo.theme as Theme]}
            appearance="filled-darker"
        >
            {Object.keys(themeOptions).map((theme) => (
                <Option
                    key={theme}
                    value={theme}
                    onClick={() => changeTheme(theme as Theme)}
                >
                    {themeOptions[theme as Theme]}
                </Option>
            ))}
        </Dropdown>
    );
};

declare interface Background {
    name: string;
    url: string | undefined;
}

const backgrounds = [
    {
        name: 'Default',
        url: undefined,
    },
    {
        name: 'Solid color',
        url: 'unset',
    },
    {
        name: 'UTM Deer 1',
        url: 'url("https://i.imgur.com/WsYfjnZ.jpeg")',
    },
    {
        name: 'UTM Deer 2',
        url: 'url("https://i.imgur.com/YccJwOS.jpg")',
    },
    {
        name: 'Daksh',
        url: 'url("/hello-kitty.png")',
    },
    {
        name: 'Glow',
        url: 'url("https://logonoff.co/assets/FirstLogonAnim.svg")',
    },
    {
        name: 'Galaxy',
        url: 'url("/galaxy.webp")',
    },
];

const BackgroundSelector = () => {
    const [background, setBackground] = useLocalStorage<string | undefined>(
        'background',
        undefined
    );

    // avoid hydration mismatch
    const [dropdownValue, setDropdownValue] = useState<string>('');

    useEffect(() => {
        const value = backgrounds.find((bg) => bg.url === background)?.name;

        if (value) {
            setDropdownValue(value);
        } else {
            setDropdownValue('Custom');
        }
    }, [background]);

    return (
        <Dropdown value={dropdownValue} appearance="filled-darker">
            {backgrounds.map((bg: Background) => (
                <Option
                    key={bg.name}
                    value={bg.url}
                    onClick={() => setBackground(bg.url)}
                >
                    {bg.name}
                </Option>
            ))}
        </Dropdown>
    );
};

const AccentSelector = () => {
    const { userInfo, setUserInfo, fetchUserInfo } = useContext(UserContext);
    const { showSnack } = useContext(SnackbarContext);
    const [accentColor, setAccentColor] = useState(
        userInfo.accent_color || defaultAccentColor
    );
    const [accentTimeout, setAccentTimeout] = useState<NodeJS.Timeout | undefined>(
        undefined
    );
    const [lastResolvedAccent, setLastResolvedAccent] = useState(0);

    return (
        <div className={styles.accentSelector}>
            <Caption2 className={styles.color} aria-hidden={true}>
                {accentColor}
            </Caption2>
            <input
                style={{
                    border: 'none',
                }}
                type="color"
                value={accentColor}
                onChange={(e) => {
                    setAccentColor(e.target.value);
                    if (accentTimeout) {
                        clearTimeout(accentTimeout);
                    }
                    if (Date.now() - lastResolvedAccent > 100) {
                        setLastResolvedAccent(Date.now());
                        setUserInfo({ ...userInfo, accent_color: e.target.value });
                    } else {
                        setAccentTimeout(
                            setTimeout(() => {
                                setLastResolvedAccent(Date.now());
                                setUserInfo({
                                    ...userInfo,
                                    accent_color: e.target.value,
                                });
                            }, 100)
                        );
                    }
                }}
                onBlur={(e) => {
                    // save the accent color
                    axios
                        .post('/users/accent', { accent_color: e.target.value })
                        .then(async () => {
                            await fetchUserInfo();
                            showSnack('Accent color updated', 'success');
                        })
                        .catch((err) => {
                            handleError(showSnack)(err);
                        });
                }}
            />
        </div>
    );
};
export const Settings = () => {
    return (
        <>
            <Head>
                <title>Settings - Codetierlist</title>
            </Head>
            <Container component="main" className="m-t-xxxl">
                <Title3 block className="m-b-xl">
                    Settings
                </Title3>
                <Subtitle2 className="m-t-xl">Appearance</Subtitle2>
                <form className={`m-t-l m-b-xxxl ${styles.form}`}>
                    <ControlCard
                        title="Theme"
                        description="Select which app theme to display"
                        icon={<PaintBrush24Regular />}
                    >
                        <ThemeSelector />
                    </ControlCard>

                    <ControlCard
                        title="Background image"
                        description="A picture background that will be displayed behind the app."
                        icon={<Image24Regular />}
                    >
                        <BackgroundSelector />
                    </ControlCard>

                    <ControlCard
                        title="Accent Colour"
                        description="Select the accent colour for the app"
                        icon={<Color24Regular />}
                    >
                        <AccentSelector />
                    </ControlCard>
                </form>

                <Subtitle2 className="m-t-xl">About</Subtitle2>
                <div className="m-t-l m-b-xxxl">
                    <ControlCard
                        title="Codetierlist"
                        description={
                            <Caption1>
                                &copy; 2024{' '}
                                <Link
                                    as="a"
                                    href="https://www.linkedin.com/in/idobenhaim/"
                                >
                                    Ido
                                </Link>
                                ,{' '}
                                <Link as="a" href="https://www.linkedin.com/in/leejacks/">
                                    Jackson
                                </Link>
                                ,{' '}
                                <Link
                                    as="a"
                                    href="https://www.linkedin.com/in/daksh-malhotra/"
                                >
                                    Daksh
                                </Link>
                                ,{' '}
                                <Link
                                    as="a"
                                    href="https://www.linkedin.com/in/yousef-bulbulia/"
                                >
                                    Yousef
                                </Link>
                                ,{' '}
                                <Link
                                    as="a"
                                    href="https://www.linkedin.com/in/brianzhang/"
                                >
                                    Brian
                                </Link>
                                .
                            </Caption1>
                        }
                        icon={
                            <Image
                                src={favicon}
                                alt="Codetierlist"
                                width={24}
                                height={24}
                            />
                        }
                    >
                        <>v{pkg.version}</>
                    </ControlCard>
                </div>
            </Container>
        </>
    );
};

export default Settings;
