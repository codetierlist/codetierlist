import { createContext } from 'react';

export declare interface Course {
  id: string
  name: string
  code: string
  session: 'Fall' | 'Winter' | 'Summer'
}

/** defines a user pre-integration */
export declare interface NotTheRealUserType {
  role: string
  name: string
  admin: boolean
}

export const UserContext = createContext<NotTheRealUserType>({
    role: 'admin',
    name: 'John Doe',
    admin: true
});

export const getCourses = () => {
    return [
        {
            id: '1',
            name: 'Computer Science',
            code: 'CSC108',
            session: 'Fall'
        },
        {
            id: '2',
            name: 'Political Science',
            code: 'CSC109',
            session: 'Fall'
        },
        {
            id: '3',
            name: 'Management Engineering',
            code: 'CSC110',
            session: 'Fall'
        }
    ] as Course[];
};
