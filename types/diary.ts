/**
 * @file types/diary.ts
 * @description 애플리케이션에서 사용되는 주요 TypeScript 타입 정의 파일.
 *              데이터 구조의 일관성과 타입 안전성을 보장합니다.
 */

/**
 * @interface DiaryEntry
 * @description 단일 일기 항목의 데이터 구조를 정의합니다.
 */
export interface DiaryEntry {
    id: string // 일기 고유 ID
    title: string // 일기 제목
    content: string // 일기 내용
    images: DiaryImage[] // 일기에 첨부된 이미지 배열
    createdAt: string // 일기 생성 날짜 (ISO 8601 형식 문자열)
    updatedAt: string // 일기 마지막 업데이트 날짜 (ISO 8601 형식 문자열)
    uid?: string
}

/**
 * @interface DiaryImage
 * @description 일기에 첨부된 이미지 파일의 데이터 구조를 정의합니다.
 */
export interface DiaryImage {
    id: string // 이미지 고유 ID
    url: string // 이미지 접근 URL
    filename: string // 원본 파일명
    size: number // 파일 크기 (바이트)
    mimeType: string // 파일 MIME 타입 (예: "image/jpeg")
}

/**
 * @interface CreateDiaryRequest
 * @description 새 일기를 생성할 때 백엔드로 전송되는 요청 데이터 구조를 정의합니다.
 *              이미지 파일은 `File` 객체 배열로 전송됩니다.
 */
export interface CreateDiaryRequest {
    title: string // 새 일기 제목
    content: string // 새 일기 내용
    images?: File[] // 첨부할 이미지 파일 배열 (선택적)
}


/**
 * @interface PaginatedResponse
 * @description 페이지네이션이 적용된 API 응답의 구조를 정의합니다.
 *              데이터 배열과 페이지네이션 정보를 포함합니다.
 * @template T - 페이지네이션된 항목들의 타입.
 */
export interface PaginatedResponse<T> {
    data: T[] // 현재 페이지의 항목 배열
    pagination: {
        page: number // 현재 페이지 번호
        limit: number // 페이지당 항목 수
        total: number // 전체 항목 수
        totalPages: number // 전체 페이지 수
    }
}

/**
 * @interface UserProfile
 * @description 사용자 프로필 정보의 데이터 구조를 정의합니다.
 *              API 명세에 따라 `username`, `profileImageUrl`, `providerId` 필드를 포함합니다.
 */
export interface UserProfile {
    id: string // 사용자 고유 ID
    username: string // 사용자 이름 (닉네임)
    email: string // 사용자 이메일
    profileImageUrl?: string // 사용자 프로필 이미지 URL (선택적)
    provider: "KAKAO" | "GOOGLE" // 로그인 제공자
    providerId: string // OAuth 제공자로부터 받은 고유 ID
    //createdAt?: string // 사용자 계정 생성 날짜 (ISO 8601 형식 문자열)
}

/**
 * @interface UpdateUserProfile
 * @description 사용자 프로필 수정 요청 데이터 구조를 정의합니다.
 */
export interface UpdateUserProfile {
    username?: string // 수정할 사용자 이름 (선택적)
    profileImageUrl?: string // 수정할 프로필 이미지 URL (선택적)
}
