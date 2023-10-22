import { getAssignment, getUser } from '@/lib/apiUtils';

export async function GET (request: Request, { params }: {
  params: {
    assignment: string
    courseId: string
  }
}) {
    const { courseId, assignment } = params;
    const user = await getUser(request);
    const assignmentObj = await getAssignment(courseId, assignment);

    return Response.json(assignmentObj.submissions.map(submission => {
        return {
            you: submission.author.utorid === user.utorid,
            name: submission.author.email[0] + submission.author.email[submission.author.email.indexOf('.') + 1],
            // TODO possibly have to hide scores later
            score: submission.scores.filter(x => x.pass).length / submission.scores.length
        };
    }));
}
