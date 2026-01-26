/**
 * @file types/diary.ts
 * @description 애플리케이션에서 사용되는 주요 TypeScript 타입 정의 파일.
 *              데이터 구조의 일관성과 타입 안전성을 보장합니다.
 */

import Long from "long";
import {AnalysisStatus, Emotion} from "@/types/enums/diary";


/**
 * @interface DiaryEntry
 * @description 단일 일기 항목의 데이터 구조를 정의합니다.
 */
export interface DiaryEntry {
    id: Long | string; // 일기의 고유 식별자
    title: string; // 일기의 제목
    content: string; // 일기의 내용
    imageKey?: string | null; // 일기에 첨부된 이미지의 S3 키 (이미지가 없으면 null)
    diaryDate: string; // 일기 작성 날짜 (YYYY-MM-DD 형식)
    analysisStatus: AnalysisStatus; // 감정 분석의 현재 상태
    emotion?: Emotion | null; // 분석된 감정 (analysisStatus가 DONE일 때 유효)
    colorCode?: string | null; // 분석된 감정에 해당하는 색상 코드 (analysisStatus가 DONE일 때 유효)
}

/**
 * @interface CreateDiaryRequest
 * @description 새 일기를 생성할 때 백엔드로 전송되는 요청 데이터 구조를 정의합니다.
 *              이미지 파일은 `File` 객체 배열로 전송됩니다.
 */
export interface CreateDiaryRequest {
    title: string // 새 일기 제목
    content: string // 새 일기 내용
    diaryDate: string // 일기 날짜
    imageKey?: string // S3에 업로드된 이미지 키 (선택적)
}

export interface CreateDiaryResponse {
    id: Long | string
}

/**
 * @interface UpdateDiaryRequest
 * @description 일기를 수정할 때 백엔드로 전송되는 요청 데이터 구조를 정의합니다.
 */
export interface UpdateDiaryRequest {
    title?: string; // 수정할 일기 제목 (선택적)
    content?: string; // 수정할 일기 내용 (선택적)
    diaryDate?: string; // 일기 날짜
    newImageKey?: string;
    clearImage?: boolean;
}


/**
 * @interface PaginatedResponse
 * @description 페이지네이션이 적용된 API 응답의 구조를 정의합니다.
 *              데이터 배열과 페이지네이션 정보를 포함합니다.
 * @template T - 페이지네이션된 항목들의 타입.
 */
export interface PaginatedResponse<T> {
    content: T[] // 현재 페이지의 항목 배열
    page: number // 현재 페이지 번호
    size: number // 페이지당 항목 수
    hasNext: boolean // 다음 페이지 존재 여부
}

/**
 * @interface UserProfile
 * @description 사용자 프로필 정보의 데이터 구조를 정의합니다.
 *              API 명세에 따라 `username`, `profileImageUrl`, `providerId` 필드를 포함합니다.
 */
export interface UserProfile {
    id: Long | string // 사용자 고유 ID
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
