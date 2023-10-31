/** @filesummary This file contains small utility functions for time. */

/**
 * Converts ISP 8601 date string to more readable format
 * @property date The date string in DD-MM-YYYY or ISP 8601 format
 * @returns The localized date string
 */
export const convertDate = (date?: string | Date): string => {
    if(date === undefined){
        return "No date";
    }
    let dateObj: Date;

    // parse the date string into a date object
    if (typeof date === 'string') {
        // parse the date string into a date object
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }

    // convert the date object into a string with the desired format
    // undefined to use the browser's locale
    const dateStr = dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // return the date string
    return dateStr;
};

/**
 * adds `number` hours to `date`
 * @property date date to add hours to
 * @property hours the number of hours to add
 * @return the new date with the hours added
 */
export const addHoursToDate = (date: Date, hours: number): Date => {
    const newDate = new Date(date.getTime());
    newDate.setTime(newDate.getTime() + hours * 60 * 60 * 1000);
    return newDate;
};

/**
 * Given a start and end time, return a localized string its the time range.
 *
 * Be aware that there be one hour added to the end time, this is to account
 * for the fact that HB only allows bookings to be made in hour increments with
 * non-inclusive end times.
 *
 * @property startDate The start date of the booking
 * @property endDate The end date of the booking
 * @return A formatted string of the time range of the booking
 */
export const convertTime = (date?: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    if(date === undefined){
        return "No time";
    }

    let dateObj: Date;

    // parse the date string into a date object
    if (typeof date === 'string') {
        // parse the date string into a date object
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }
    const formatDateOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        ...options,
    };

    return dateObj.toLocaleTimeString('en-CA', formatDateOptions);
};

/**
 * Given a start and end time, return a localized string its the time range.
 *
 * Be aware that there be one hour added to the end time, this is to account
 * for the fact that HB only allows bookings to be made in hour increments with
 * non-inclusive end times.
 *
 * @property startDate The start date of the booking
 * @property endDate The end date of the booking
 * @return A formatted string of the time range of the booking
 */
export const formatRangedTime = (startDate: Date, endDate: Date): string => {
    return `${convertTime(startDate)} - ${convertTime(endDate)}`;
};
