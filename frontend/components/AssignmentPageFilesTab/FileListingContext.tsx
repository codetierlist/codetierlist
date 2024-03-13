/* eslint-disable @typescript-eslint/no-unused-vars */
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { createContext, useContext } from 'react';

/**
 * File listing context to avoid recursive prop drilling
 */
export const FileListingContext = createContext({
    update: () => {},

    changeFile: (file: string) => {},
    submitFiles: (files: File[], path?: string) => {},
    currentFile: '',

    changeFolder: (folder: string) => {},
    submitFolder: (files: File[], path?: string) => {},
    currentFolder: '',


    isEditable: false,

    assignmentId: '',
    assignment: {},

    commit: {},
    commitId: '',

    route: 'submissions',
    fullRoute: '',
} as {
    /** a function to call when the files are updated */
    update?: () => void;

    /** a function to call when the file is changed */
    changeFile?: (file: string) => void;
    /** a function to submit a folder */
    submitFiles: (files: File[], path?: string) => void;
    /** the full path to the current file */
    currentFile?: string;

    /** a function to call when the folder is changed */
    changeFolder?: (folder: string) => void;
    /** a function to submit files */
    submitFolder: (files: File[], path?: string) => void;
    /** the full path to the current folder */
    currentFolder: string;

    /** is this files tab currently editable? otherwise it is read only */
    isEditable: boolean;

    /** the current assignment id */
    assignmentId: string;
    /** the current assignment object */
    assignment: UserFetchedAssignment;

    /** the current commit obj */
    commit: Commit;
    /** the commit id */
    commitId: string;

    /** api route to get the file */
    route: 'testcases' | 'submissions';
    /** full api route that can be used right away after adding a path */
    fullRoute: string;
});

export const useFileListingProps = () => {
    return useContext(FileListingContext);
};
