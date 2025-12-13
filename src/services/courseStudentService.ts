import type { AllCoursesRequest, CourseResponse } from 'types/course';

export const getCourseRoleStudentService = async (
    data: AllCoursesRequest
): Promise<CourseResponse> => {
    try {
        const { getCourseRoleStudent } = await import('api/courseApi');
        const response = await getCourseRoleStudent(data);
        return response;
    } catch (error) {
        console.error('Failed to fetch course role student', error);
        throw error;
    }
};
