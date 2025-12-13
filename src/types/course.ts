// types/course.ts - Cải thiện
export interface AllCoursesRequest {
    fromDate: string | null;
    toDate: string | null;
    title: string | null;
    categories: string[];
    page?: number;
    size?: number;
    sort?: string | null;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string | null;
    categoryName: string | null;
    categoryId?: number; // ✅ Thêm categoryId - từ backend response
    updatedAt: string | null;
    createdAt: string;
    isDelete: boolean;
    isActive: boolean;
    isBought: boolean | null;
    authorName: string | null;
    createdByName: string | null;
    updatedByName: string | null;
    author: Author | null;
    createdBy: Author | null;
    updatedBy: Author | null;
    lessons: Lesson[] | null;
}

// ✅ Thêm interface cho Author từ API response
export interface Author {
    id: number;
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    dob: string | null;
    gender: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    isDelete: boolean;
    education: string | null;
    major: string | null;
    role: string;
    student: any | null;
    consultant: any | null;
    teacher: any | null;
    manager: any | null;
    createdAt: string;
    updatedAt: string | null;
    code: string;
}

// ✅ Thêm interface cho Lesson từ API response
export interface Lesson {
    id: number;
    title: string;
    content: string;
    videoUrl: string;
    duration: number;
    orderIndex: number;
    isPreviewAble: boolean;
    courseId: string;
    isBought: boolean;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    createdBy: Author | null;
    updatedBy: Author | null;
    createdByName: string | null;
    updatedByName: string | null;
}

export interface CourseResponse {
    code: number;
    message: string;
    data: {
        content: Course[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: {
                empty: boolean;
                sorted: boolean;
                unsorted: boolean;
            };
            offset: number;
            paged: boolean;
            unpaged: boolean;
        };
        totalPages: number;
        totalElements: number;
        last: boolean;
        size: number;
        number: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        numberOfElements: number;
        first: boolean;
        empty: boolean;
    };
}

export interface CourseDetailResponse {
    code: number;
    message: string;
    data: Course;
}

export interface CourseCreateRequest {
    title: string;
    description: string;
    price: number;
    authorId: number;
    categoryId: number;
    thumbnailUrl: string;
    isActive?: boolean; // ✅ Optional với default
    isDelete?: boolean; // ✅ Optional với default
}

export interface CourseUpdateRequest {
    id: number;
    title?: string; // ✅ Optional cho update
    description?: string; // ✅ Optional cho update
    price?: number; // ✅ Optional cho update
    categoryId?: number; // ✅ Optional cho update
    authorId?: number; // ✅ Thêm authorId cho update
    thumbnailUrl?: string; // ✅ Optional cho update
    isActive?: boolean; // ✅ Optional cho update
    isDelete?: boolean; // ✅ Optional cho update
}

// ✅ Thêm interface riêng cho status update
export interface CourseStatusUpdateRequest {
    id: number;
    isActive?: boolean;
    isDelete?: boolean;
}

export interface UploadResponse {
    code: number;
    message: string;
    data: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface CategoryResponse {
    code: number;
    message: string;
    data: Category[];
}
