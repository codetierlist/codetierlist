import { UserContext, useSystemTheme } from '@/hooks';
import Editor, { EditorProps } from '@monaco-editor/react';
import { Theme } from 'codetierlist-types';
import { useContext } from 'react';

const editorThemes: Record<Exclude<Theme, 'SYSTEM'>, string> = {
    CONTRAST: 'hc-black',
    LIGHT: 'vs-light',
    DARK: 'vs-dark',
};

/**
 * The Monaco editor is a wrapper around the monaco editor which is
 * the editor used by VSCode.
 *
 * @param props the props to pass to the editor
 */
export const Monaco = (props: EditorProps): JSX.Element => {
    const { userInfo } = useContext(UserContext);
    const theme = useSystemTheme(userInfo.theme);

    return (
        <Editor
            {...props}
            theme={props.theme || editorThemes[theme]}
            options={{
                scrollbar: {
                    alwaysConsumeMouseWheel: false,
                },
                minimap: {
                    enabled: false,
                },
                inlineSuggest: {
                    enabled: false,
                    suppressSuggestions: true,
                },
                quickSuggestions: false,
                screenReaderAnnounceInlineSuggestion: false,
                snippetSuggestions: 'none',
                suggest: {
                    showStatusBar: false,
                    showIcons: false,
                    showMethods: false,
                    showFunctions: false,
                    showConstructors: false,
                    showFields: false,
                    showVariables: false,
                    showClasses: false,
                    showStructs: false,
                    showInterfaces: false,
                    showModules: false,
                    showProperties: false,
                    showEvents: false,
                    showOperators: false,
                    showUnits: false,
                    showValues: false,
                    showConstants: false,
                    showEnums: false,
                    showEnumMembers: false,
                    showKeywords: false,
                    showWords: false,
                    showColors: false,
                    showFiles: false,
                    showReferences: false,
                    showFolders: false,
                    showTypeParameters: false,
                    showIssues: false,
                    showUsers: false,
                    showSnippets: false,
                    preview: false,
                    shareSuggestSelections: false,
                },
                scrollBeyondLastLine: false,
                ...props.options,
            }}
            onMount={(editor, monaco) => {
                // bind ctrl+space, ctrl+i, ctrl+alt+space (suggestions) to do nothing
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {});
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {});
                editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.Space,
                    () => {}
                );
                if (props.onMount) props.onMount(editor, monaco);
            }}
        />
    );
};
