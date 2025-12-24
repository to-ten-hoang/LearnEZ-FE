// services/quizService.ts - Service functions for Quiz feature
import { message } from 'antd';
import {
    convertBankToQuiz,
    createQuiz,
    updateQuiz,
    addQuestionsToQuiz,
    removeQuestionsFromQuiz,
    searchQuizzes,
    getQuizById,
} from '../api/quizApi';
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
export const convertBankToQuizService = async (idBank: number): Promise<QuizResponse> => {
    try {
        const response = await convertBankToQuiz(idBank);
        if (response.code === 200 || response.code === 201) {
            message.success('Chuyển đổi thành bài kiểm tra thành công!');
            return response;
        }
        throw new Error(response.message || 'Chuyển đổi thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi chuyển đổi.');
        throw error;
    }
};

// Create a new quiz
export const createQuizService = async (data: QuizCreateRequest): Promise<QuizResponse> => {
    try {
        const response = await createQuiz(data);
        if (response.code === 200 || response.code === 201) {
            message.success('Tạo bài kiểm tra thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo bài kiểm tra thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi tạo bài kiểm tra.');
        throw error;
    }
};

// Update quiz
export const updateQuizService = async (data: QuizUpdateRequest): Promise<QuizResponse> => {
    try {
        const response = await updateQuiz(data);
        if (response.code === 200 || response.code === 201) {
            message.success('Cập nhật bài kiểm tra thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật bài kiểm tra thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi cập nhật bài kiểm tra.');
        throw error;
    }
};

// Add questions to quiz
export const addQuestionsToQuizService = async (
    data: QuizAddRemoveQuestionsRequest
): Promise<QuizResponse> => {
    try {
        const response = await addQuestionsToQuiz(data);
        if (response.code === 200 || response.code === 201) {
            message.success('Thêm câu hỏi vào bài kiểm tra thành công!');
            return response;
        }
        throw new Error(response.message || 'Thêm câu hỏi thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi thêm câu hỏi.');
        throw error;
    }
};

// Remove questions from quiz
export const removeQuestionsFromQuizService = async (
    data: QuizAddRemoveQuestionsRequest
): Promise<QuizResponse> => {
    try {
        const response = await removeQuestionsFromQuiz(data);
        if (response.code === 200 || response.code === 201) {
            message.success('Xóa câu hỏi khỏi bài kiểm tra thành công!');
            return response;
        }
        throw new Error(response.message || 'Xóa câu hỏi thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi xóa câu hỏi.');
        throw error;
    }
};

// Search quizzes
export const searchQuizzesService = async (
    searchData: SearchQuizDto,
    pagination?: QuizPaginationParams
): Promise<QuizListResponse> => {
    try {
        const response = await searchQuizzes(searchData, pagination);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Tìm kiếm bài kiểm tra thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi tìm kiếm bài kiểm tra.');
        throw error;
    }
};

// Get quiz by id
export const getQuizByIdService = async (id: number): Promise<QuizResponse> => {
    try {
        const response = await getQuizById(id);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết bài kiểm tra thất bại.');
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        message.error(err.response?.data?.message || 'Lỗi khi lấy chi tiết bài kiểm tra.');
        throw error;
    }
};
