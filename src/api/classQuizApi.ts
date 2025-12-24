// api/classQuizApi.ts - API functions for Quiz-in-Class feature
import api from '../lib/axios';
import type {
    PullQuizToClassRequest,
    UpdateQuizInClassRequest,
    SearchQuizInClassDto,
    SearchSubmittedDto,
    QuizAnswerSubmit,
    SharedQuizPagedResponse,
    SubmittedQuizPagedResponse,
    SubmittedQuizDetailResponse,
    QuizStatisticResponse,
    GenericResponse,
} from '../types/classQuiz';

interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
}

// ==================== Teacher/Manager APIs ====================

/**
 * Pull a quiz into a class (TEACHER, CONSULTANT, MANAGER only)
 */
export const pullQuizToClass = async (data: PullQuizToClassRequest): Promise<GenericResponse> => {
    const response = await api.post('/api/v1/quiz/pull-quiz-to-class', data);
    return response.data;
};

/**
 * Update quiz settings in a class (TEACHER, CONSULTANT, MANAGER only)
 */
export const updateQuizInClass = async (
    data: UpdateQuizInClassRequest
): Promise<GenericResponse> => {
    const response = await api.post('/api/v1/quiz/update-quiz-in-class', data);
    return response.data;
};

// ==================== Common APIs (All authenticated users) ====================

/**
 * Get list of quizzes in a class
 */
export const listQuizzesInClass = async (
    classId: number,
    searchData: SearchQuizInClassDto = {},
    pagination: PaginationParams = {}
): Promise<SharedQuizPagedResponse> => {
    const { page = 0, size = 20, sort = 'createdAt,desc' } = pagination;
    const response = await api.post(
        `/api/v1/quiz/list-quiz-in-class?id-class=${classId}&page=${page}&size=${size}&sort=${sort}`,
        searchData
    );
    return response.data;
};

/**
 * Submit quiz answers in a class (Student)
 */
export const submitQuizInClass = async (
    quizId: number,
    answers: QuizAnswerSubmit[]
): Promise<GenericResponse> => {
    const response = await api.post(`/api/v1/quiz/submit-quiz-in-class?id-quiz=${quizId}`, answers);
    return response.data;
};

/**
 * Search submitted quizzes by students in a class
 */
export const searchSubmittedQuizzes = async (
    quizId: number,
    classId: number,
    searchData: SearchSubmittedDto = {},
    pagination: PaginationParams = {}
): Promise<SubmittedQuizPagedResponse> => {
    const { page = 0, size = 20 } = pagination;
    const response = await api.post(
        `/api/v1/quiz/search-submitted-quiz-by-student-in-class?id-quiz=${quizId}&id-class=${classId}&page=${page}&size=${size}`,
        searchData
    );
    return response.data;
};

/**
 * View detailed submitted quiz by a student
 */
export const getSubmittedQuizDetail = async (
    submittedId: number
): Promise<SubmittedQuizDetailResponse> => {
    const response = await api.post(
        `/api/v1/quiz/view-detail-submitted-quiz-by-student-in-class?id-submitted=${submittedId}`
    );
    return response.data;
};

// ==================== Statistics APIs (TEACHER, CONSULTANT, MANAGER only) ====================

/**
 * Get overview statistics of all quizzes in a class
 */
export const getQuizStatisticOverview = async (
    classId: number,
    score: number,
    searchData: SearchQuizInClassDto = {}
): Promise<QuizStatisticResponse> => {
    const response = await api.post(
        `/api/v1/quiz/statistic-overview-quizzes-in-class?id-class=${classId}&score=${score}`,
        searchData
    );
    return response.data;
};

/**
 * Get detailed statistics of a specific quiz in a class
 */
export const getQuizStatisticDetail = async (
    quizId: number,
    classId: number,
    score: number,
    searchData: SearchSubmittedDto = {}
): Promise<QuizStatisticResponse> => {
    const response = await api.post(
        `/api/v1/quiz/statistic-detail-quiz-in-class?id-quiz=${quizId}&id-class=${classId}&score=${score}`,
        searchData
    );
    return response.data;
};
