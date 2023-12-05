/* eslint-disable @next/next/no-img-element */
import {
    Button,
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Link,
    Title3
} from '@fluentui/react-components';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import styles from './CourseOverviewCard.module.css';
import {SessionBlock} from '@/components/SessionBlock/SessionBlock';
import {Session} from 'codetierlist-types';
import {ImageAdd20Regular} from "@fluentui/react-icons";
import axios from "@/axios";
import {promptForFileObject} from "@/components";

export declare interface CourseSessionChipProps {
    /** the session of the course */
    session: Session

    /** the children of the component */
    children?: React.ReactNode

    /** the props of the component */
    props?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * @returns a generic div so it's easier to style
 */
export const CourseSessionChip = ({
    session,
    children,
    props
}: CourseSessionChipProps): JSX.Element => {
    return (
        <div className={styles.sessionChip + ' ' + styles[session]} {...props}>
            {children || session}
        </div>
    );
};

export declare interface CourseOverviewCardProps {
    /** the id of the course */
    id: string
    /** the name of the course */
    name: string
    /** the image of the course */
    image: string
    /** the session of the course */
    session: "Fall",
    /** whether the user can change cover image */
    admin: boolean,
    /** the props of the component */
    props?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * A card shown in the dashboard representing the overview of a course.
 * @property {string} name the name of the course
 * @property {string} image the image of the course
 * @property {Session} session the session of the course
 * @returns {JSX.Element} the course overview card
 */
export const CourseOverviewCard = ({
    id,
    name,
    image,
    session,
    props,
    admin
}: CourseOverviewCardProps): JSX.Element => {
    // trigger reset of image
    const [seed, setSeed] = useState(1);
    const reset = () => {
        setSeed(Math.random());
    };
    const [isSelected, setSelected] = useState(false);
    const router = useRouter();

    return (
        <Card
            className={styles.courseCard}
            selected={isSelected}
            onSelectionChange={(_, {selected}) => {
                setSelected(selected);
            }}
            onClick={() => {
                router.push(`/courses/${id}`);
            }}
            {...props}
        >
            <CardPreview style={{maxHeight: 200, maxWidth: 300}}>
                <img
                    style={{objectFit:"cover", height:200, width:300}}
                    src={image+"?"+seed}
                    width={300}
                    height={200}
                    onError={(event)=>{event.currentTarget.onerror=null; event.currentTarget.src='https://placehold.co/300x200';}}
                />
                {admin ? <Button appearance="primary" style={{
                    position: "absolute",
                    top: "5%",
                    right: "5%",
                    maxWidth: 30,
                    minWidth:30,
                    minHeight:30,
                    maxHeight: 30,
                    padding:0,
                    alignItems:"center",
                    textAlign:"center",
                    justifyContent:"center",
                    display:"flex",
                    borderRadius: "50%",
                    zIndex:100
                }} onClick={async (event) => {
                    event.stopPropagation();
                    const files = await promptForFileObject("image/*");
                    if (!files || files.length != 1) {
                        return;
                    }
                    const formData = new FormData();
                    formData.append("file", files[0]);

                    axios.post(`/courses/${id}/cover`,
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" }
                        })
                        .then(() => {
                            reset();
                        });
                }}>
                    <ImageAdd20Regular></ImageAdd20Regular>
                </Button>: undefined}
            </CardPreview>

            <CardHeader
                header={
                    <Title3 className={styles.courseTitle}>
                        {name}
                    </Title3>
                }
                className={styles.courseHeader}
                description={<SessionBlock session={session}/>}
            />

            <CardFooter>
                <Link appearance="subtle">
                    View more
                </Link>
            </CardFooter>
        </Card>
    );
};
