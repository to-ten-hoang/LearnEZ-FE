// types/questionBank.ts - Types for Question Bank feature

// Common sort interface
export interface SortInfo {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

// ==================== User Reference (simplified) ====================
export interface UserReference {
    id: number;
    fullName?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    dob?: string;
    gender?: string;
    avatarUrl?: string;
    isActive?: boolean;
    isDelete?: boolean;
    education?: string;
    major?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    code?: string;
}

// ==================== Answer ====================
export interface Answer {
    id?: number;
    content: string;
    correct: boolean;
    createdBy?: UserReference;
    updatedBy?: UserReference;
    isActive?: boolean;
    isDelete?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AnswerRequest {
    id?: number;
    content: string;
    correct: boolean;
}

// ==================== Explanation ====================
export interface Explanation {
    id?: number;
    explanationVietnamese?: string;
    explanationEnglish?: string;
    createdBy?: UserReference;
    updatedBy?: UserReference;
    isActive?: boolean;
    isDelete?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExplanationRequest {
    id?: number;
    explanationVietnamese?: string;
    explanationEnglish?: string;
    isActive?: boolean;
    isDelete?: boolean;
}

// ==================== Question ====================
export interface Question {
    id?: number;
    questionContent: string;
    category?: string;
    difficulty?: string;
    answers: Answer[];
    explanation?: Explanation;
    createdBy?: UserReference;
    updatedBy?: UserReference;
    isActive?: boolean;
    isDelete?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuestionRequest {
    id?: number;
    questionContent: string;
    category?: string;
    difficulty?: string;
    answers: AnswerRequest[];
    explanation?: ExplanationRequest;
    active?: boolean;
    delete?: boolean;
}

export interface QuestionFilterRequest {
    searchString?: string;
    scoreScales?: number[];
    rangeTopics?: number[];
    idQuestionBank?: number;
    isActive?: boolean;
    isDelete?: boolean;
}

export interface QuestionResponse {
    code: number;
    message: string;
    data: Question;
}

export interface QuestionListResponse {
    code: number;
    message: string;
    data: {
        content: Question[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: SortInfo;
            offset: number;
            paged: boolean;
            unpaged: boolean;
        };
        totalPages: number;
        totalElements: number;
        last: boolean;
        size: number;
        number: number;
        sort: SortInfo;
        numberOfElements: number;
        first: boolean;
        empty: boolean;
    };
}

// ==================== Question Bank ====================
export interface QuestionBank {
    id?: number;
    url?: string;
    questionBankTitle: string;
    questions?: Question[];
    createdBy?: UserReference;
    updatedBy?: UserReference;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuestionBankCreateRequest {
    url?: string;
    questionBankTitle: string;
    questions?: Question[];
}

export interface QuestionBankUpdateRequest {
    id: number;
    url?: string;
    questionBankTitle?: string;
    questions?: Question[];
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface QuestionBankFilterRequest {
    searchString?: string;
    createByIds?: number[];
    isActive?: boolean;
    isDelete?: boolean;
}

export interface QuestionBankResponse {
    code: number;
    message: string;
    data: QuestionBank;
}

export interface QuestionBankListResponse {
    code: number;
    message: string;
    data: {
        content: QuestionBank[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: SortInfo;
            offset: number;
            paged: boolean;
            unpaged: boolean;
        };
        totalPages: number;
        totalElements: number;
        last: boolean;
        size: number;
        number: number;
        sort: SortInfo;
        numberOfElements: number;
        first: boolean;
        empty: boolean;
    };
}

// ==================== AI Analysis ====================
export interface AiResponse {
    url: string;
    questionBankTitle: string;
    questions: Question[];
}

export interface AIAnalysisResponse {
    code: number;
    message: string;
    data: AiResponse;
}

// ==================== Cloud Upload ====================
// Note: The actual upload uses FormData with File object, not this interface
// This interface represents the raw API request body format from Swagger
export interface CloudUploadRequest {
    file: string;
}

export interface CloudUploadResponse {
    code: number;
    message: string;
    data: string;
}

// ==================== Create Question Bank from AI ====================
export interface CreateQuestionBankFromAIRequest {
    url?: string;
    questionBankTitle: string;
    questions: Question[];
}

// Range Topic (Chủ đề câu hỏi)
export interface RangeTopic {
    id: number;
    rangeTopicId?: number; // Keep for backward compatibility
    content: string;
    description: string;
    vietnamese: string;
    isDelete: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface RangeTopicCreateRequest {
    content: string;
    description: string;
    vietnamese: string;
    isDelete?: boolean;
    isActive?: boolean;
}

export interface RangeTopicUpdateRequest {
    rangeTopicId: number;
    content: string;
    description: string;
    vietnamese: string;
    isDelete?: boolean;
    isActive?: boolean;
}

export interface RangeTopicFilterRequest {
    searchString: string | null;
}

export interface RangeTopicResponse {
    code: number;
    message: string;
    data: RangeTopic;
}

export interface RangeTopicListResponse {
    code: number;
    message: string;
    data: {
        content: RangeTopic[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: SortInfo;
            offset: number;
            paged: boolean;
            unpaged: boolean;
        };
        totalPages: number;
        totalElements: number;
        last: boolean;
        size: number;
        number: number;
        sort: SortInfo;
        numberOfElements: number;
        first: boolean;
        empty: boolean;
    };
}

// Pagination params
export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string[];
}

// Score Scale (Mức độ câu hỏi)
export interface ScoreScale {
    id: number;
    scoreScaleId?: number; // Keep for backward compatibility
    title: string;
    fromScore: number;
    toScore: number;
    isActive: boolean;
    isDelete: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ScoreScaleCreateRequest {
    title: string;
    fromScore: number;
    toScore: number;
    isActive?: boolean;
    isDelete?: boolean;
}

export interface ScoreScaleUpdateRequest {
    scoreScaleId: number;
    title: string;
    fromScore: number;
    toScore: number;
    isActive?: boolean;
    isDelete?: boolean;
}

export interface ScoreScaleFilterRequest {
    searchString: string | null;
}

export interface ScoreScaleResponse {
    code: number;
    message: string;
    data: ScoreScale;
}

export interface ScoreScaleListResponse {
    code: number;
    message: string;
    data: {
        content: ScoreScale[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: SortInfo;
            offset: number;
            paged: boolean;
            unpaged: boolean;
        };
        totalPages: number;
        totalElements: number;
        last: boolean;
        size: number;
        number: number;
        sort: SortInfo;
        numberOfElements: number;
        first: boolean;
        empty: boolean;
    };
}
