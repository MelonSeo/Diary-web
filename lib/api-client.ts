// API 클라이언트 (Spring Boot 서버와 통신)
// nookies 라이브러리 사용으로 클라이언트 사이드 쿠키 관리 개선

import { parseCookies, destroyCookie, setCookie } from "nookies" // nookies 임포트: 클라이언트/서버 통합 쿠키 관리를 위해 사용
import type { UserProfile, UpdateUserProfileRequest, ReissueTokenResponse } from "@/types/diary" // 새로 추가된 타입 임포트

/**
 * @file lib/api-client.ts
 * @description 클라이언트 사이드에서 Spring Boot 백엔드 API와 통신하는 범용 API 클라이언트.
 *              JWT 토큰을 사용하여 인증 헤더를 자동으로 추가하고,
 *              API 응답 및 네트워크 오류를 처리합니다.
 *              `nookies`를 사용하여 브라우저 쿠키를 관리합니다.
 *              401 Unauthorized 에러 발생 시 refresh token으로 access token을 재발급 시도합니다.
 */

/**
 * @class ApiClient
 * @description API 요청을 처리하고 응답을 표준화하는 클래스.
 *              싱글톤 패턴으로 인스턴스를 관리하여 전역적으로 사용합니다.
 */
class ApiClient {
    private baseURL: string // API 서버의 기본 URL
    private isRefreshing = false // 토큰 재발급 중인지 여부를 나타내는 플래그
    private failedQueue: {
        resolve: (value: any) => void
        reject: (reason?: any) => void
        request: () => Promise<any>
    }[] = [] // 재발급 중 실패한 요청들을 저장하는 큐

    /**
     * @constructor
     * @description ApiClient 인스턴스를 초기화하고 API 기본 URL을 설정합니다.
     *              환경 변수 `NEXT_PUBLIC_API_BASE_URL`을 사용하며, 없으면 로컬 개발 서버 URL을 기본값으로 합니다.
     */
    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
    }

    /**
     * @private
     * @function processQueue
     * @description 토큰 재발급이 완료된 후 대기 중인 요청 큐를 처리합니다.
     * @param {Error | null} error - 재발급 중 발생한 에러 (성공 시 null).
     * @param {string | null} newToken - 새로 발급된 access token (실패 시 null).
     */
    private processQueue(error: Error | null, newToken: string | null = null) {
        this.failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error)
            } else if (newToken) {
                prom.resolve(prom.request()) // 새 토큰으로 요청 재시도
            }
        })
        this.failedQueue = []
    }

    /**
     * @private
     * @function request
     * @description 모든 HTTP 요청을 처리하는 내부 범용 메서드.
     *              인증 헤더 추가, 응답 유효성 검사, 에러 처리를 담당합니다.
     *              401 Unauthorized 에러 발생 시 토큰 재발급 로직을 포함합니다.
     * @param {string} endpoint - API 엔드포인트 경로 (예: "/diaries").
     * @param {RequestInit} [options={}] - `fetch` API의 옵션 객체.
     * @returns {Promise<T>} - 타입이 지정된 실제 응답 데이터.
     * @template T - 응답 데이터의 타입.
     * @throws {Error} - API 응답 오류, 네트워크 오류, 인증 오류 등.
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}` // 완전한 요청 URL 생성

        // 기본 헤더 설정 (JSON Content-Type)
        const defaultHeaders: HeadersInit = {
            "Content-Type": "application/json",
        }

        // 1. 인증 토큰 자동 추가
        const cookies = parseCookies() // nookies를 사용하여 현재 브라우저의 모든 쿠키 파싱
        const token = cookies.accessToken // 'accessToken' 쿠키 값 가져오기
        if (token) {
            defaultHeaders.Authorization = `Bearer ${token}` // 토큰이 있으면 Authorization 헤더에 추가
        }

        // 최종 요청 설정 객체 병합
        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders, // 기본 헤더
                ...options.headers, // 사용자 지정 헤더 (기본 헤더를 덮어쓸 수 있음)
            },
        }

        try {
            let response = await fetch(url, config) // HTTP 요청 실행

            // 2. 401 Unauthorized 에러 처리: 토큰 만료 또는 유효하지 않은 경우
            if (response.status === 401) {
                // 재발급 요청이 아닌 경우에만 토큰 재발급 로직 실행
                if (!endpoint.includes("/auth/reissue")) {
                    // 토큰 재발급 중이면 큐에 요청 추가
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject, request: () => this.request(endpoint, options) })
                        }).then((res) => res as T) // 타입 단언 추가
                    }

                    this.isRefreshing = true // 재발급 시작 플래그 설정

                    try {
                        const refreshToken = cookies.refreshToken
                        if (!refreshToken) {
                            throw new Error("Refresh token missing. Please log in again.")
                        }

                        // refresh token으로 access token 재발급 요청
                        const reissueResponse = await this.post<ReissueTokenResponse>("/auth/reissue", { refreshToken })

                        const newAccessToken = reissueResponse.accessToken // .data 제거
                        const newTokenType = reissueResponse.tokenType // .data 제거

                        // 새로 발급받은 토큰을 쿠키에 저장
                        const isProduction = process.env.NODE_ENV === "production"
                        const cookieOptions = {
                            httpOnly: true,
                            secure: isProduction,
                            sameSite: "lax" as const,
                            path: "/",
                        }
                        setCookie(null, "accessToken", newAccessToken, {
                            ...cookieOptions,
                            maxAge: 60 * 60, // 1시간 유효
                        })

                        // 대기 중인 요청 큐 처리
                        this.processQueue(null, newAccessToken)

                        // 원래 요청을 새 토큰으로 재시도
                        config.headers = {
                            ...config.headers,
                            Authorization: `${newTokenType} ${newAccessToken}`,
                        }
                        response = await fetch(url, config) // 원래 요청 재시도
                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError)
                        this.processQueue(refreshError as Error) // 큐에 있는 요청들 에러 처리
                        // 재발급 실패 시 모든 토큰 삭제 및 로그인 페이지로 리다이렉트
                        destroyCookie(null, "accessToken", { path: "/" })
                        destroyCookie(null, "refreshToken", { path: "/" })
                        if (typeof window !== "undefined") {
                            window.location.href = "/login"
                        }
                        throw new Error("Session expired. Please log in again.")
                    } finally {
                        this.isRefreshing = false // 재발급 완료 플래그 해제
                    }
                } else {
                    // 재발급 요청 자체가 401을 받은 경우 (refresh token 만료 등)
                    destroyCookie(null, "accessToken", { path: "/" })
                    destroyCookie(null, "refreshToken", { path: "/" })
                    if (typeof window !== "undefined") {
                        window.location.href = "/login"
                    }
                    throw new Error("Refresh token expired or invalid. Please log in again.")
                }
            }

            // 3. 응답 상태 코드 검증: 2xx 범위가 아닌 경우 에러 처리
            if (!response.ok) {
                // 응답 Content-Type 검증: JSON이 아닐 경우 텍스트로 읽어 에러 처리
                const contentType = response.headers.get("content-type")
                if (!contentType || !contentType.includes("application/json")) {
                    const errorText = await response.text()
                    console.error("API response was not JSON:", {
                        status: response.status,
                        contentType: contentType,
                        body: errorText.substring(0, 500) + (errorText.length > 500 ? "..." : ""),
                    })
                    throw new Error(
                        `API response error: Expected JSON, but received ${contentType || "unknown type"}. Server might be down or misconfigured.`,
                    )
                }
                // JSON 형식의 에러 응답 파싱
                const errorData = await response.json()
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
            }

            // 4. 성공적인 응답 데이터 파싱
            const data: T = await response.json()
            return data
        } catch (error) {
            // 5. 네트워크 오류 (fetch 실패) 처리
            if (error instanceof TypeError && error.message.includes("fetch")) {
                console.warn(`API server not available: ${url}`)
                throw new Error(`API_SERVER_UNAVAILABLE: ${endpoint}`) // 서버 연결 불가 에러
            }
            console.error("API request failed:", error)
            throw error // 기타 에러 다시 던지기
        }
    }

    /**
     * @function get
     * @description HTTP GET 요청을 수행합니다.
     * @param {string} endpoint - API 엔드포인트.
     * @returns {Promise<T>} - API 응답.
     * @template T - 응답 데이터의 타입.
     */
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" })
    }

    /**
     * @function post
     * @description HTTP POST 요청을 수행합니다.
     * @param {string} endpoint - API 엔드포인트.
     * @param {any} [data] - 전송할 데이터 (JSON 또는 FormData).
     * @param {RequestInit} [options] - 추가 fetch 옵션.
     * @returns {Promise<T>} - API 응답.
     * @template T - 응답 데이터의 타입.
     */
    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            // 데이터 타입에 따라 본문 직렬화 방식 결정 (FormData는 자동으로 Content-Type 설정)
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options,
        })
    }

    /**
     * @function put
     * @description HTTP PUT 요청을 수행합니다 (리소스 전체 업데이트).
     * @param {string} endpoint - API 엔드포인트.
     * @param {any} [data] - 전송할 데이터.
     * @returns {Promise<T>} - API 응답.
     * @template T - 응답 데이터의 타입.
     */
    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    /**
     * @function patch
     * @description HTTP PATCH 요청을 수행합니다 (리소스 부분 업데이트).
     * @param {string} endpoint - API 엔드포인트.
     * @param {any} [data] - 전송할 데이터.
     * @returns {Promise<T>} - API 응답.
     * @template T - 응답 데이터의 타입.
     */
    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    }

    /**
     * @function delete
     * @description HTTP DELETE 요청을 수행합니다 (리소스 삭제).
     * @param {string} endpoint - API 엔드포인트.
     * @returns {Promise<void>} - API 응답.
     * @template T - 응답 데이터의 타입.
     */
    async delete(endpoint: string): Promise<void> {
        await this.request<void>(endpoint, { method: "DELETE" })
    }

    /**
     * @function getUserProfile
     * @description 현재 로그인한 사용자 프로필 정보를 조회하는 메서드.
     *              GET /api/users/me
     * @returns {Promise<UserProfile>} - 사용자 프로필 정보.
     */
    async getUserProfile(): Promise<UserProfile> {
        const response = await this.get<UserProfile>("/users/me")
        return response
    }

    /**
     * @function deleteUser
     * @description 현재 로그인한 사용자 계정을 삭제하는 메서드.
     *              DELETE /api/users/me
     * @returns {Promise<void>} - 반환값 없음.
     */
    async deleteUser(): Promise<void> {
        await this.delete("/users/me")
    }

    /**
     * @function updateUserProfile
     * @description 현재 로그인한 사용자 프로필을 수정하는 메서드.
     *              PATCH /api/users/me/profile
     * @param {UpdateUserProfileRequest} data - 수정할 프로필 데이터 (username, profileImageUrl).
     * @returns {Promise<UserProfile>} - 수정된 사용자 프로필 정보.
     */
    async updateUserProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
        const response = await this.patch<UserProfile>("/users/me/profile", data)
        return response
    }

    /**
     * @function reissueToken
     * @description refresh token으로 access token을 재발급받는 메서드.
     *              POST /api/auth/reissue
     * @param {string} refreshToken - 재발급에 사용할 refresh token.
     * @returns {Promise<ReissueTokenResponse>} - 새로 발급된 access token 정보.
     */
    async reissueToken(refreshToken: string): Promise<ReissueTokenResponse> {
        const response = await this.post<ReissueTokenResponse>(
            "/auth/reissue",
            { refreshToken },
            {
                headers: {
                    // 재발급 요청 시에는 Authorization 헤더 대신 refresh token을 직접 본문에 포함
                    "Content-Type": "application/json",
                },
            },
        )
        return response
    }
}

/**
 * @constant apiClient
 * @description ApiClient 클래스의 싱글톤 인스턴스.
 *              애플리케이션 전반에서 동일한 API 클라이언트 설정을 공유합니다.
 */
export const apiClient = new ApiClient()
