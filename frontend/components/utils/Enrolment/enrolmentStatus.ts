import { isUTORid } from 'is-utorid';
import axios from "@/axios";

/**
 * given a csv of students, enroll them in or remove them from the course
 *
 * @param courseID the course to modify
 * @param csv the csv of students in the format utorid with a header row
 * @param action the action to perform on the enrolment of students (enrol or remove from course)
 *
 * @returns void on success, throws an error on failure
 */
export async function modifyEnrollment(courseID: string, csv: string, action: "enroll" | "remove") {
    const table = csv.split("\n").map((row) => row.trim().split(","));

    if (table.length < 2) {
        throw new Error("CSV must have at least 2 rows");
    }

    const headers = table.shift() || [];
    const utoridIndex = headers.indexOf("utorid");

    const students = table.map((row) => ({
        utorid: row[utoridIndex],
    }));

    students.forEach((student) => {
        if (!isUTORid(student.utorid)) {
            throw new Error(`Invalid UTORid: ${student.utorid}`);
        }
    });

    const utoridList = students.map((student) => student.utorid);

    await axios.post(`/courses/${courseID}/${action}`, {
        utorids: utoridList,
        role: "STUDENT"
    })
        .catch((e) => { throw new Error(e.message); });
}