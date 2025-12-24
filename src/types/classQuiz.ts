// types/classQuiz.ts - Types for Quiz-in-Class feature
import type { Quiz } from './quiz';
import type { Class } from './class';

// ==================== User Reference ====================
export interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role?: string;
    code?: string;
    address?: string;
    dob?: string;
    gender?: string;
    isActive?: boolean;
    isDelete?: boolean;
}

// ==================== Shared Quiz (Quiz pulled to class) ====================
export interface SharedQuiz {
    sharedQuizId: number;
    startAt: string | null;
    endAt: string | null;
    clazz: Class;
    quiz: Quiz;
    createdBy: UserResponse;
    updatedBy: UserResponse | null;
    isDelete: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

// ==================== Class Schedule ====================
export interface ClassSchedule {
    id: number;
    clazz: Class;
    title: string;
    startAt: string;
    endAt: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    isActive: boolean;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string | null;
    createdBy: UserResponse;
    updatedBy: UserResponse | null;
}

// ==================== Quiz Submit Types ====================
export interface QuizAnswerSubmit {
    questionId: number;
    answerId: number;
    startAt: string;
    endAt: string;
}

// ==================== Submitted Quiz ====================
export interface SubmittedQuiz {
    idSubmitted: number;
    titleQuiz: string;
    quiz: Quiz | null;
    user: UserResponse;
    score: number;
    startAt: string;
    endAt: string;
}

// ==================== Quiz Statistics ====================
export interface QuizStatistic {
    total: number;
    overScore: number;
    overScorePercent: number;
    underScore: number;
    underScorePercent: number;
}

// ==================== Homework Submit Types ====================
export interface SubmitExercise {
    id: number;
    linkUrl: string;
    isActive: boolean;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string | null;
    createdBy: UserResponse;
}

// ==================== Request Types ====================
export interface PullQuizToClassRequest {
    classId: number;
    quizId: number;
    startAt?: string;
    endAt?: string;
}

export interface UpdateQuizInClassRequest {
    sharedQuizId: number;
    classId: number;
    startAt?: string;
    endAt?: string;
    isActive?: boolean;
    isDelete?: boolean;
}

export interface SearchQuizInClassDto {
    searchString?: string;
    fromDate?: string;
    toDate?: string;
}

export interface SearchSubmittedDto {
    searchString?: string;
    fromScore?: number;
    toScore?: number;
}

export interface GetSchedulesRequest {
    classId?: number[];
    teacherId?: number[];
    status?: string[];
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
}

export interface SubmitExerciseRequest {
    notificationId: number;
    linkUrl: string;
}

export interface UpdateExerciseRequest {
    submitId: number;
    linkUrl: string;
}

export interface CancelExerciseRequest {
    submitId: number;
}

// ==================== Response Types ====================
export interface SharedQuizPagedResponse {
    code: string;
    message: string;
    object: string;
    data: {
        content: SharedQuiz[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: { sorted: boolean; empty: boolean };
        };
        totalPages: number;
        totalElements: number;
        first: boolean;
        last: boolean;
        empty: boolean;
    };
}

export interface SubmittedQuizPagedResponse {
    code: string;
    message: string;
    object: string;
    data: {
        content: SubmittedQuiz[];
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
        totalPages: number;
        totalElements: number;
    };
}

export interface SubmittedQuizDetailResponse {
    code: string;
    message: string;
    object: string;
    data: SubmittedQuiz;
}

export interface QuizStatisticResponse {
    code: string;
    message: string;
    object: string;
    data: QuizStatistic;
}

export interface ClassSchedulePagedResponse {
    code: string;
    message: string;
    data: {
        content: ClassSchedule[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

export interface ClassScheduleDetailResponse {
    code: string;
    message: string;
    data: ClassSchedule;
}

export interface SubmitExerciseResponse {
    code: string;
    message: string;
    data: SubmitExercise;
}

export interface GenericResponse {
    code: string;
    message: string;
    object: string;
    data: null;
}

// ==================== Quiz Configuration ====================
export interface QuizConfig {
    allowRetake: boolean;
    showCorrectAnswers: boolean;
    showCountdown: boolean;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
    allowRetake: false, // Can be changed to true when needed
    showCorrectAnswers: true,
    showCountdown: true,
};
