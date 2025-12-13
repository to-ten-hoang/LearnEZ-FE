// api/questionBankApi.ts - API functions for Question Bank feature
import api from '../lib/axios';
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

// ==================== RANGE TOPIC (Chủ đề câu hỏi) ====================

// Create a new range topic
export const createRangeTopic = async (
    data: RangeTopicCreateRequest
): Promise<RangeTopicResponse> => {
    const response = await api.post('/api/v1/range-topic/create', null, {
        params: data,
    });
    return response.data;
};

// Update an existing range topic
export const updateRangeTopic = async (
    data: RangeTopicUpdateRequest
): Promise<RangeTopicResponse> => {
    const response = await api.post('/api/v1/range-topic/update', null, {
        params: data,
    });
    return response.data;
};

// Get range topic by ID
export const getRangeTopicById = async (id: number): Promise<RangeTopicResponse> => {
    const response = await api.get('/api/v1/range-topic', {
        params: { id },
    });
    return response.data;
};

// Filter/Search range topics
export const filterRangeTopics = async (
    filterData: RangeTopicFilterRequest,
    pagination: PaginationParams = {}
): Promise<RangeTopicListResponse> => {
    const { page = 0, size = 10, sort = [] } = pagination;
    const response = await api.post('/api/v1/range-topic/filter', null, {
        params: {
            ...filterData,
            page,
            size,
            // Sort format: "field,direction" (e.g., "content,asc")
            sort: sort.length > 0 ? sort : undefined,
        },
        paramsSerializer: {
            indexes: null, // This allows arrays to be serialized without brackets
        },
    });
    return response.data;
};

// ==================== SCORE SCALE (Mức độ câu hỏi) ====================

// Create a new score scale
export const createScoreScale = async (
    data: ScoreScaleCreateRequest
): Promise<ScoreScaleResponse> => {
    const response = await api.post('/api/v1/score-scale/create', null, {
        params: data,
    });
    return response.data;
};

// Update an existing score scale
export const updateScoreScale = async (
    data: ScoreScaleUpdateRequest
): Promise<ScoreScaleResponse> => {
    const response = await api.post('/api/v1/score-scale/update', null, {
        params: data,
    });
    return response.data;
};

// Get score scale by ID
export const getScoreScaleById = async (id: number): Promise<ScoreScaleResponse> => {
    const response = await api.get('/api/v1/score-scale', {
        params: { id },
    });
    return response.data;
};

// Filter/Search score scales
export const filterScoreScales = async (
    filterData: ScoreScaleFilterRequest,
    pagination: PaginationParams = {}
): Promise<ScoreScaleListResponse> => {
    const { page = 0, size = 10, sort = [] } = pagination;
    const response = await api.post('/api/v1/score-scale/filter', null, {
        params: {
            ...filterData,
            page,
            size,
            // Sort format: "field,direction" (e.g., "title,asc")
            sort: sort.length > 0 ? sort : undefined,
        },
        paramsSerializer: {
            indexes: null, // This allows arrays to be serialized without brackets
        },
    });
    return response.data;
};

// ==================== CLOUD UPLOAD ====================

// Upload file to cloud
export const uploadFileToCloud = async (file: File): Promise<CloudUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/cloud/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ==================== AI ANALYSIS ====================

// Analyze question from file URL
export const analysisQuestion = async (url: string): Promise<AIAnalysisResponse> => {
    const response = await api.get('/api/v1/ai/analysis-question', {
        params: { url },
    });
    return response.data;
};

// ==================== QUESTION BANK ====================

// Create a new question bank
export const createQuestionBank = async (
    data: QuestionBankCreateRequest
): Promise<QuestionBankResponse> => {
    const response = await api.post('/api/v1/question-bank/create', data);
    return response.data;
};

// Update an existing question bank
export const updateQuestionBank = async (
    data: QuestionBankUpdateRequest
): Promise<QuestionBankResponse> => {
    const response = await api.post('/api/v1/question-bank/update', data);
    return response.data;
};

// Get question bank by ID
export const getQuestionBankById = async (id: number): Promise<QuestionBankResponse> => {
    const response = await api.get('/api/v1/question-bank', {
        params: { id },
    });
    return response.data;
};

// Filter/Search question banks
export const filterQuestionBanks = async (
    filterData: QuestionBankFilterRequest,
    pagination: PaginationParams = {}
): Promise<QuestionBankListResponse> => {
    const { page = 0, size = 10, sort = [] } = pagination;
    const pageable = {
        page,
        size,
        sort: sort.length > 0 ? sort : undefined,
    };
    const response = await api.post('/api/v1/question-bank/filter', filterData, {
        params: { pageable: JSON.stringify(pageable) },
    });
    return response.data;
};

// ==================== QUESTION ====================

// Create question bank from AI
export const createQuestionBankFromAI = async (
    data: CreateQuestionBankFromAIRequest
): Promise<QuestionBankResponse> => {
    const response = await api.post('/api/v1/question/create-for-ai', data);
    return response.data;
};

// Add question to bank
export const addQuestionToBank = async (
    bankId: number,
    data: QuestionRequest
): Promise<QuestionResponse> => {
    const response = await api.post('/api/v1/question/add-question-to-bank', data, {
        params: { bankId },
    });
    return response.data;
};

// Filter questions
export const filterQuestions = async (
    filterData: QuestionFilterRequest,
    pagination: PaginationParams = {}
): Promise<QuestionListResponse> => {
    const { page = 0, size = 10, sort = [] } = pagination;
    const pageable = {
        page,
        size,
        sort: sort.length > 0 ? sort : undefined,
    };
    const response = await api.post('/api/v1/question/filter-question', filterData, {
        params: { pageable: JSON.stringify(pageable) },
    });
    return response.data;
};

// Update question
export const updateQuestion = async (data: QuestionRequest): Promise<QuestionResponse> => {
    const response = await api.post('/api/v1/question/update', data);
    return response.data;
};

// Get question detail
export const getQuestionDetail = async (questionId: number): Promise<QuestionResponse> => {
    const response = await api.get('/api/v1/question/detail', {
        params: { questionId },
    });
    return response.data;
};
