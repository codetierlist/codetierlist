import Editor, { EditorProps } from '@monaco-editor/react';
import { UserContext } from '@/contexts/UserContext';
import { useContext } from 'react';

/**
 * The Monaco editor is a wrapper around the monaco editor which is
 * the editor used by VSCode.
 *
 * @param props the props to pass to the editor
 */
export const Monaco = (props: EditorProps): JSX.Element => {
    const { userInfo } = useContext(UserContext);

    return (
        <Editor
            {...props}
            theme={userInfo.theme === 'DARK' ? 'vs-dark' : 'vs-light'}
            options={{
                scrollbar: {
                    alwaysConsumeMouseWheel: false,
                },
                minimap: {
                    enabled: false,
                },
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
                },
                scrollBeyondLastLine: false,
                ...props.options,
            }}
        />
    );
};
