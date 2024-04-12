import axios, { handleError } from '@/axios';
import { ControlCard, defaultAccentColor, limits } from '@/components';
import { SnackbarContext, UserContext } from '@/hooks';
import favicon from '@/public/favicon.svg';
import {
    Button,
    Caption1,
    Caption2,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Dropdown,
    Link,
    Option,
    Subtitle2,
    Title3
} from '@fluentui/react-components';
import {
    Color24Regular,
    Image24Regular,
    PaintBrush24Regular,
    TopSpeed24Regular,
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

const LimitsViewer = () => {
    return (
        <div className={styles.accentSelector}>
            <Dialog>
                <DialogTrigger disableButtonEnhancement>
                    <Button>View limits</Button>
                </DialogTrigger>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Codetierlist limits</DialogTitle>
                        <DialogContent>
                            Maximum file size: <strong>{limits.max_file_size / 1000 / 1000} MB</strong>
                            <br />
                            Maximum number of files in a repo: <strong>{limits.max_file_count}</strong>
                            <br />
                            Maximum number of seconds per your whole test suite: <strong>{limits.max_seconds}</strong>
                            <br />
                            Maximum memory per your whole test suite: <strong>{limits.max_memory}</strong>
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary">Close</Button>
                            </DialogTrigger>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

const developers: Record<string, string> = {
    ido: 'https://www.linkedin.com/in/idobenhaim/',
    jackson: 'https://www.linkedin.com/in/leejacks/',
    daksh: 'https://www.linkedin.com/in/daksh-malhotra/',
    yousef: 'https://www.linkedin.com/in/yousef-bulbulia/',
    brian: 'https://www.linkedin.com/in/brianzhang/',
}

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
                <div className={`m-t-l m-b-xxxl ${styles.form}`}>
                    <ControlCard
                        title="Current limits"
                        description="The current limits for the app"
                        icon={<TopSpeed24Regular />}
                    >
                        <LimitsViewer />
                    </ControlCard>

                    <ControlCard
                        title="Codetierlist"
                        description={
                            <Caption1>
                                &copy; 2024{' '}
                                {
                                    Object.keys(developers).map((developer, index) => (
                                        <>
                                            <Link
                                                as="a"
                                                href={developers[developer]}
                                                key={index}
                                            >
                                                {developer.charAt(0).toUpperCase() + developer.slice(1)}
                                            </Link>
                                            {(index === Object.keys(developers).length - 1 ? '' : ', ')}
                                        </>
                                    ))
                                }.
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
