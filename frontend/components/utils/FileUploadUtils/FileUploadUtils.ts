/**
 * prompt the user to select a file
 * @param type the file types to accept
 * @returns the contents of the file
 */
export const promptForFileReader = async (type: string): Promise<FileReader> => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = type;

    return new Promise((resolve) => {
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader);
                    }
                });
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });
};

/**
 * prompt the user to select a file
 * @returns the file object
 */
export const promptForFileObject = async ({
    type = '*/*',
    multiple = false,
    folders = false,
}: {
    /** the file types to accept */
    type?: string;
    /** whether multiple files can be uploaded */
    multiple?: boolean;
    /** whether folders can be uploaded */
    folders?: boolean;
}): Promise<FileList> => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = type;
    fileInput.multiple = multiple;
    if (folders) {
        fileInput.webkitdirectory = true;
    }

    return new Promise((resolve) => {
        fileInput.addEventListener('change', () => {
            if (fileInput.files) {
                resolve(fileInput.files);
            } else {
                throw new Error('Select a file!');
            }
        });
        fileInput.click();
        setTimeout(() => {
            fileInput.remove();
        }, 1);
    });
};
