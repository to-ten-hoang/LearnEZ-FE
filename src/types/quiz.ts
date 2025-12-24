// types/quiz.ts - Types for Quiz feature

import type { Question, UserReference, SortInfo } from './questionBank';

// ==================== Quiz Status ====================
export const EQuizStatus = {
    PRIVATE: 1,
    OWNER: 2,
    PUBLIC: 3,
} as const;

export type EQuizStatus = (typeof EQuizStatus)[keyof typeof EQuizStatus];

export const QuizStatusLabels: Record<number, string> = {
    1: 'Private',
    2: 'Owner',
    3: 'Public',
};

export const QuizStatusColors: Record<string, string> = {
    Private: 'default',
    Owner: 'blue',
    Public: 'green',
};

// ==================== Quiz ====================
export interface Quiz {
    id?: number;
    title: string;
    description?: string;
    totalQuestions?: number;
    status?: string;
    questions?: Question[];
    createAt?: string;
    updateAt?: string;
    createBy?: UserReference;
    updateBy?: UserReference;
    isActive?: boolean;
    isDelete?: boolean;
}

// ==================== Quiz Request ====================
export interface QuizCreateRequest {
    title: string;
    description?: string;
}

export interface QuizUpdateRequest {
    id: number;
    title?: string;
    description?: string;
    status?: number;
    isActive?: boolean;
    isDelete?: boolean;
}

export interface QuizAddRemoveQuestionsRequest {
    id: number;
    idQuestions: number[];
}

// ==================== Quiz Response ====================
export interface QuizResponse {
    code: number;
    message: string;
    data: Quiz;
}

export interface QuizListResponse {
    code: number;
    message: string;
    data: {
        content: Quiz[];
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

// ==================== Search Quiz ====================
export interface SearchQuizDto {
    searchString?: string;
    fromDate?: string;
    toDate?: string;
}

// ==================== Pagination Params ====================
export interface QuizPaginationParams {
    page?: number;
    size?: number;
    sort?: string[];
}
