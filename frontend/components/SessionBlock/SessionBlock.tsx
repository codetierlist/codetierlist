import { Title3 } from '@fluentui/react-components';

export declare interface SessionBlockProps {
    session: string;
}

export const SessionBlock = ({ session }: SessionBlockProps): JSX.Element => {
    if (session === 'F') {
        return (
            <div>
                <Title3 style={{color: 'white', fontSize: 12, backgroundColor: '#012E8A', padding: '1px 5px'}}>FALL</Title3>
            </div>
        );
    } else {
        return (
            <div>
                <Title3 style={{color: 'white', fontSize: 12, backgroundColor: '#018A27', padding: '1px 5px'}}>WINTER</Title3>
            </div>
        );
    }
};
