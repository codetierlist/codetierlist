/* eslint-disable @typescript-eslint/no-unused-vars */
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { createContext, useContext } from 'react';

/**
 * File listing context to avoid recursive prop drilling
 */
export const FileListingContext = createContext({
    /** a function to call when the files are updated */
    update: () => {
        return;
    },

    /** a function to call when the file is changed */
    changeFile: (file: string) => {
        return;
    },
    /** the current file */
    currentFile: '',

    /** a function to call when the folder is changed */
    changeFolder: (folder: string) => {
        return;
    },
    /** the current folder */
    currentFolder: '',

    /** a function to submit files */
    submitFiles: (files: File[], path?: string) => {
        return;
    },

    /** is the file editable */
    isEditable: false,

    /** the current assignment id */
    assignmentId: '',
    /** the current assignment object */
    assignment: {},

    /** the current commit obj */
    commit: {},
    /** the commit id */
    commitId: '',

    /** api route to get the file */
    route: 'submissions',
    /** full api route */
    fullRoute: '',
} as {
    update?: () => void;
    changeFile?: (file: string) => void;
    currentFile?: string;
    changeFolder?: (folder: string) => void;
    currentFolder: string;
    submitFiles: (files: File[], path?: string) => void;
    isEditable: boolean;
    assignmentId: string;
    assignment: UserFetchedAssignment;
    commit: Commit;
    commitId: string;
    route: 'testcases' | 'submissions';
    fullRoute: string;
});

export const useFileListingProps = () => {
    return useContext(FileListingContext);
};
