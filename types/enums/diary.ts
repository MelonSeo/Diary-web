/**
 * @file types/enums/diary.ts
 * @description 일기 관련 열거형(enum)을 정의하는 파일입니다.
 */

/**
 * @enum AnalysisStatus
 * @description 일기 감정 분석의 현재 상태를 나타내는 열거형입니다.
 */
export enum AnalysisStatus {
    PENDING = "PENDING", // 분석 대기 중
    DONE = "DONE",       // 분석 완료
    FAILED = "FAILED",   // 분석 실패
}

/**
 * @enum Emotion
 * @description 분석된 감정의 종류를 나타내는 열거형입니다.
 */
export enum Emotion {
    JOY="#FFD700",
    SADNESS="#4682B4",
    SURPRISE="#9370DB",
    ANGER="#DC143C",
    FEAR="#2F4F4F",
    DISGUST="#556B2F",
    NEUTRAL="#D3D3D3",
}
