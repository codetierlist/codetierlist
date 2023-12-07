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
                minimap: {
                    enabled: false,
                },
                scrollBeyondLastLine: false,
                scrollbar: {
                    vertical: 'hidden',
                },
                ...props.options,
            }}
        />
    );
};
