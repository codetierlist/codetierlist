import { headers } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Reads the utorid from the request headers.
 *
 * @returns {string} the utorid of the user
 */
export const getUtorid = (): string => {
    const utorid = headers().get('utorid');

    if (utorid === null) {
        notFound();
    }

    return utorid;
};


/**
 * Reads the email from the request headers.
 *
 * @returns {string} the email of the user
 */
export const getEmail = (): string => {
    const email = headers().get('http_mail');

    if (email === null) {
        notFound();
    }

    return email;
};
