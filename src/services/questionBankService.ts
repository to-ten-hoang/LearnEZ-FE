// services/questionBankService.ts - Service functions for Question Bank feature
import { message } from 'antd';
import {
    createRangeTopic,
    updateRangeTopic,
    getRangeTopicById,
    filterRangeTopics,
    createScoreScale,
    updateScoreScale,
    getScoreScaleById,
    filterScoreScales,
    uploadFileToCloud,
    analysisQuestion,
    createQuestionBank,
    updateQuestionBank,
    getQuestionBankById,
    filterQuestionBanks,
    createQuestionBankFromAI,
    addQuestionToBank,
    filterQuestions,
    updateQuestion,
    getQuestionDetail,
} from '../api/questionBankApi';
import type {
    RangeTopicCreateRequest,
    RangeTopicUpdateRequest,
    RangeTopicFilterRequest,
    RangeTopicResponse,
    RangeTopicListResponse,
    ScoreScaleCreateRequest,
    ScoreScaleUpdateRequest,
    ScoreScaleFilterRequest,
    ScoreScaleResponse,
    ScoreScaleListResponse,
    PaginationParams,
    QuestionBankCreateRequest,
    QuestionBankUpdateRequest,
    QuestionBankFilterRequest,
    QuestionBankResponse,
    QuestionBankListResponse,
    QuestionRequest,
    QuestionFilterRequest,
    QuestionResponse,
    QuestionListResponse,
    AIAnalysisResponse,
    CloudUploadResponse,
    CreateQuestionBankFromAIRequest,
} from '../types/questionBank';

// ==================== RANGE TOPIC SERVICES ====================

export const createRangeTopicService = async (
    data: RangeTopicCreateRequest
): Promise<RangeTopicResponse> => {
    try {
        const response = await createRangeTopic(data);
        if (response.code === 200) {
            message.success('Tạo chủ đề thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo chủ đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo chủ đề.');
        throw error;
    }
};

export const updateRangeTopicService = async (
    data: RangeTopicUpdateRequest
): Promise<RangeTopicResponse> => {
    try {
        const response = await updateRangeTopic(data);
        if (response.code === 200) {
            message.success('Cập nhật chủ đề thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật chủ đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật chủ đề.');
        throw error;
    }
};

export const getRangeTopicByIdService = async (id: number): Promise<RangeTopicResponse> => {
    try {
        const response = await getRangeTopicById(id);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết chủ đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết chủ đề.');
        throw error;
    }
};

export const filterRangeTopicsService = async (
    filterData: RangeTopicFilterRequest,
    pagination?: PaginationParams
): Promise<RangeTopicListResponse> => {
    try {
        const response = await filterRangeTopics(filterData, pagination);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lọc chủ đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lọc danh sách chủ đề.');
        throw error;
    }
};

// ==================== SCORE SCALE SERVICES ====================

export const createScoreScaleService = async (
    data: ScoreScaleCreateRequest
): Promise<ScoreScaleResponse> => {
    try {
        const response = await createScoreScale(data);
        if (response.code === 200) {
            message.success('Tạo mức độ thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo mức độ thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo mức độ.');
        throw error;
    }
};

export const updateScoreScaleService = async (
    data: ScoreScaleUpdateRequest
): Promise<ScoreScaleResponse> => {
    try {
        const response = await updateScoreScale(data);
        if (response.code === 200) {
            message.success('Cập nhật mức độ thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật mức độ thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật mức độ.');
        throw error;
    }
};

export const getScoreScaleByIdService = async (id: number): Promise<ScoreScaleResponse> => {
    try {
        const response = await getScoreScaleById(id);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết mức độ thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết mức độ.');
        throw error;
    }
};

export const filterScoreScalesService = async (
    filterData: ScoreScaleFilterRequest,
    pagination?: PaginationParams
): Promise<ScoreScaleListResponse> => {
    try {
        const response = await filterScoreScales(filterData, pagination);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lọc mức độ thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lọc danh sách mức độ.');
        throw error;
    }
};

// ==================== CLOUD UPLOAD SERVICES ====================

export const uploadFileToCloudService = async (file: File): Promise<CloudUploadResponse> => {
    try {
        const response = await uploadFileToCloud(file);
        if (response.code === 200) {
            message.success('Tải file lên thành công!');
            return response;
        }
        throw new Error(response.message || 'Tải file lên thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tải file lên.');
        throw error;
    }
};

// ==================== AI ANALYSIS SERVICES ====================

export const analysisQuestionService = async (url: string): Promise<AIAnalysisResponse> => {
    try {
        const response = await analysisQuestion(url);
        if (response.code === 200) {
            message.success('Phân tích đề thành công!');
            return response;
        }
        throw new Error(response.message || 'Phân tích đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi phân tích đề.');
        throw error;
    }
};

// ==================== QUESTION BANK SERVICES ====================

export const createQuestionBankService = async (
    data: QuestionBankCreateRequest
): Promise<QuestionBankResponse> => {
    try {
        const response = await createQuestionBank(data);
        if (response.code === 200) {
            message.success('Tạo ngân hàng đề thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo ngân hàng đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo ngân hàng đề.');
        throw error;
    }
};

export const updateQuestionBankService = async (
    data: QuestionBankUpdateRequest
): Promise<QuestionBankResponse> => {
    try {
        const response = await updateQuestionBank(data);
        if (response.code === 200) {
            message.success('Cập nhật ngân hàng đề thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật ngân hàng đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật ngân hàng đề.');
        throw error;
    }
};

export const getQuestionBankByIdService = async (id: number): Promise<QuestionBankResponse> => {
    try {
        const response = await getQuestionBankById(id);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết ngân hàng đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết ngân hàng đề.');
        throw error;
    }
};

export const filterQuestionBanksService = async (
    filterData: QuestionBankFilterRequest,
    pagination?: PaginationParams
): Promise<QuestionBankListResponse> => {
    try {
        const response = await filterQuestionBanks(filterData, pagination);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lọc ngân hàng đề thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lọc danh sách ngân hàng đề.');
        throw error;
    }
};

// ==================== QUESTION SERVICES ====================

export const createQuestionBankFromAIService = async (
    data: CreateQuestionBankFromAIRequest
): Promise<QuestionBankResponse> => {
    try {
        const response = await createQuestionBankFromAI(data);
        if (response.code === 200) {
            message.success('Tạo ngân hàng đề từ AI thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo ngân hàng đề từ AI thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo ngân hàng đề từ AI.');
        throw error;
    }
};

export const addQuestionToBankService = async (
    bankId: number,
    data: QuestionRequest
): Promise<QuestionResponse> => {
    try {
        const response = await addQuestionToBank(bankId, data);
        if (response.code === 200) {
            message.success('Thêm câu hỏi vào ngân hàng đề thành công!');
            return response;
        }
        throw new Error(response.message || 'Thêm câu hỏi thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi thêm câu hỏi vào ngân hàng đề.');
        throw error;
    }
};

export const filterQuestionsService = async (
    filterData: QuestionFilterRequest,
    pagination?: PaginationParams
): Promise<QuestionListResponse> => {
    try {
        const response = await filterQuestions(filterData, pagination);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lọc câu hỏi thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lọc danh sách câu hỏi.');
        throw error;
    }
};

export const updateQuestionService = async (data: QuestionRequest): Promise<QuestionResponse> => {
    try {
        const response = await updateQuestion(data);
        if (response.code === 200) {
            message.success('Cập nhật câu hỏi thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật câu hỏi thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật câu hỏi.');
        throw error;
    }
};

export const getQuestionDetailService = async (questionId: number): Promise<QuestionResponse> => {
    try {
        const response = await getQuestionDetail(questionId);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết câu hỏi thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết câu hỏi.');
        throw error;
    }
};
