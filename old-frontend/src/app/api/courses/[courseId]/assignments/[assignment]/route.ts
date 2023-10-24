import prisma from '@/lib/prisma';
import { getCourse, getUser, isProf } from '@/lib/apiUtils';

/**
 * Gets information on an assignment.
 * @returns {Promise<Response>} assignment information
 */
export async function GET (request: Request, { params }: {
  params: {
    /** unique id of the course */
    courseId: string

    /** unique id of the assignment */
    assignment: string
  }
}) {
    const course = await getCourse(params.courseId, await getUser(request));
    if (course === null) {
        throw new Error('Course not found');
    }
    const user = await getUser(request);
    const { courseId, assignment: assignmentName } = params;
    const assignment = await prisma.assignment.findUnique({
        where: { id: { course_id: courseId, title: assignmentName } },
        include: {
            submissions: {
                include: { scores: true },
                where: isProf(course, user)
                    ? {}
                    : {
                        author: { utorid: user.utorid }
                    }
            }
        }
    });
    if (assignment === null) {
        return Response.json(JSON.stringify({ error: 'Assignment not found.' }), { status: 404 });
    }

    const res: Omit<typeof assignment, 'submissions'> & {
    submissions?: typeof assignment.submissions
  } = assignment;

    if (!isProf(course, user)) {
        delete res.submissions;
    }

    return Response.json(assignment);
}
