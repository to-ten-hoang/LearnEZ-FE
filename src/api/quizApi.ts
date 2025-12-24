// api/quizApi.ts - API functions for Quiz feature
import api from '../lib/axios';
import type {
    QuizCreateRequest,
    QuizUpdateRequest,
    QuizAddRemoveQuestionsRequest,
    QuizResponse,
    QuizListResponse,
    SearchQuizDto,
    QuizPaginationParams,
} from '../types/quiz';

// Convert question bank to quiz
export const convertBankToQuiz = async (idBank: number): Promise<QuizResponse> => {
    const response = await api.get('/api/v1/quiz/convert-bank-to-quiz', {
        params: { idBank },
    });
    return response.data;
};

// Create a new quiz
export const createQuiz = async (data: QuizCreateRequest): Promise<QuizResponse> => {
    const response = await api.post('/api/v1/quiz/create-quizz', data);
    return response.data;
};

// Update quiz
export const updateQuiz = async (data: QuizUpdateRequest): Promise<QuizResponse> => {
    const response = await api.post('/api/v1/quiz/update-quiz', data);
    return response.data;
};

// Add questions to quiz
export const addQuestionsToQuiz = async (
    data: QuizAddRemoveQuestionsRequest
): Promise<QuizResponse> => {
    const response = await api.post('/api/v1/quiz/add-questions-to-quiz', data);
    return response.data;
};

// Remove questions from quiz
export const removeQuestionsFromQuiz = async (
    data: QuizAddRemoveQuestionsRequest
): Promise<QuizResponse> => {
    const response = await api.post('/api/v1/quiz/remove-questions-from-quiz', data);
    return response.data;
};

// Search quizzes
export const searchQuizzes = async (
    searchData: SearchQuizDto,
    pagination: QuizPaginationParams = {}
): Promise<QuizListResponse> => {
    const { page = 0, size = 10, sort = [] } = pagination;
    const sortParam = sort.length > 0 ? sort.join(',') : 'createAt,desc';
    const response = await api.post('/api/v1/quiz/search-quizz', searchData, {
        params: { page, size, sort: sortParam },
    });
    return response.data;
};

// Get quiz by id
export const getQuizById = async (id: number): Promise<QuizResponse> => {
    const response = await api.get('/api/v1/quiz', {
        params: { id },
    });
    return response.data;
};
