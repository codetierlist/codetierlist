/* eslint-disable @typescript-eslint/no-unused-vars */
import { Commit, UserFetchedAssignment } from 'codetierlist-types';
import { createContext, useContext } from 'react';

/**
 * File listing context to avoid recursive prop drilling
 */
export const FileListingContext = createContext({
    update: () => {
        return;
    },

    changeFile: (file: string) => {
        return;
    },
    currentFile: '',

    changeFolder: (folder: string) => {
        return;
    },
    currentFolder: '',

    submitFiles: (files: File[], path?: string) => {
        return;
    },

    submitFolder: (files: File[], path?: string) => {
        return;
    },

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

    /** the current file */
    currentFile?: string;

    /** a function to call when the folder is changed */
    changeFolder?: (folder: string) => void;
    /** the current folder */
    currentFolder: string;

    /** a function to submit a folder */
    submitFiles: (files: File[], path?: string) => void;
    /** a function to submit files */
    submitFolder: (files: File[], path?: string) => void;

    /** is the file editable */
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
    /** full api route */
    fullRoute: string;
});

export const useFileListingProps = () => {
    return useContext(FileListingContext);
};
