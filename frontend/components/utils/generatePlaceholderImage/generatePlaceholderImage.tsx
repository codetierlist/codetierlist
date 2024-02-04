/**
 * generates a placeholder image for the course
 * @param course the course id
 */
export const generatePlaceholderImage = (course: string): string =>
    `data:image/svg+xml,%3Csvg viewBox='0 0 300 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23777' d='M0 0h300v200H0z'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' fill='%23fff' font-family='sans-serif' font-size='50' text-anchor='middle' %3E${course}%3C/text%3E%3C/svg%3E`;
