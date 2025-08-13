import { type NextRequest, NextResponse } from "next/server"
import { setCookie } from "nookies" // nookies 라이브러리 임포트: 서버/클라이언트 통합 쿠키 관리를 위해 사용

/**
 * @file app/auth/callback/route.ts
 * @description OAuth 콜백을 처리하는 Next.js API Route Handler.
 *              카카오톡 또는 구글 OAuth 인증 후 리다이렉트되는 엔드포인트입니다.
 *              인증 코드를 받아 Spring Boot 백엔드 서버로 전송하고,
 *              백엔드로부터 받은 JWT 토큰을 쿠키에 저장하여 사용자 세션을 관리합니다.
 *              nookies를 사용하여 서버 사이드에서 쿠키를 안전하게 설정합니다.
 */
export async function GET(request: NextRequest) {
    try {
        // 1. URL 파싱 및 쿼리 파라미터 추출
        // request.url을 사용하여 URL 객체를 생성, searchParams로 쿼리 파라미터에 안전하게 접근
        const requestUrl = new URL(request.url)
        const searchParams = requestUrl.searchParams

        console.log("Callback URL:", request.url)
        console.log("Search params:", Object.fromEntries(searchParams.entries()))

        const code = searchParams.get("code") // OAuth 인증 코드
        const provider = searchParams.get("provider") // OAuth 제공자 (예: 'kakao', 'google')
        const error = searchParams.get("error") // OAuth 인증 과정에서 발생한 에러 코드

        // 2. OAuth 에러 처리: 소셜 로그인 제공자로부터 에러가 전달된 경우
        if (error) {
            console.error("OAuth error:", error)
            // 에러 메시지와 함께 로그인 페이지로 리다이렉트
            return NextResponse.redirect(new URL(`/login?error=oauth_${error}`, request.url))
        }

        // 3. 필수 파라미터 검증: code와 provider가 누락된 경우
        if (!code || !provider) {
            console.error("Missing required parameters:", { code: !!code, provider })
            return NextResponse.redirect(new URL("/login?error=missing_params", request.url))
        }

        // 4. 지원되지 않는 OAuth 제공자 검증
        if (!["kakao", "google"].includes(provider)) {
            console.error("Unsupported provider:", provider)
            return NextResponse.redirect(new URL("/login?error=unsupported_provider", request.url))
        }

        // 5. API 서버 URL 검증 및 개발 모드 목업 처리
        const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
        if (!apiBaseUrl) {
            console.error("API base URL not configured")

            // 개발 환경에서 API_BASE_URL이 설정되지 않은 경우, 목업 인증 처리
            if (process.env.NODE_ENV === "development") {
                console.warn("Development mode: Creating mock authentication due to missing API_BASE_URL")
                const mockToken = `dev-token-${provider}-${Date.now()}`
                const redirectResponse = NextResponse.redirect(new URL("/", request.url))

                // nookies를 사용하여 목업 토큰을 쿠키에 설정
                setCookie({ res: redirectResponse }, "accessToken", mockToken, {
                    httpOnly: true, // JavaScript에서 접근 불가
                    secure: false, // 개발 환경에서는 HTTPS 강제 안 함
                    sameSite: "lax", // CSRF 보호
                    maxAge: 60 * 60 * 24 * 7, // 7일 유효
                    path: "/", // 모든 경로에서 유효
                })
                setCookie({ res: redirectResponse }, "refreshToken", `refresh-${mockToken}`, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 30, // 30일 유효
                    path: "/",
                })

                return redirectResponse
            }

            // 프로덕션 환경에서 API_BASE_URL이 없는 경우 에러 리다이렉트
            return NextResponse.redirect(new URL("/login?error=server_config", request.url))
        }

        try {
            // 6. Spring Boot API 서버로 인증 코드 전송
            const response = await fetch(`${apiBaseUrl}/auth/${provider}/callback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // JSON 형식으로 데이터 전송
                },
                body: JSON.stringify({ code }), // 인증 코드를 JSON 본문에 담아 전송
            })

            // 7. API 응답 Content-Type 검증: 응답이 JSON 형식인지 확인
            const contentType = response.headers.get("content-type")
            if (!contentType || !contentType.includes("application/json")) {
                const errorText = await response.text() // JSON이 아니면 텍스트로 읽어 로그에 기록
                console.error("API response was not JSON:", {
                    status: response.status,
                    contentType: contentType,
                    body: errorText.substring(0, 500) + (errorText.length > 500 ? "..." : ""), // 본문 일부만 로깅
                })
                throw new Error(
                    `API response error: Expected JSON, but received ${contentType || "unknown type"}. Server might be down or misconfigured.`,
                )
            }

            // 8. API 응답 상태 코드 검증: 2xx 범위가 아닌 경우 에러 처리
            if (!response.ok) {
                const errorData = await response.json() // 에러 응답도 JSON으로 파싱 시도
                console.error("API authentication failed (non-2xx status):", response.status, errorData)
                throw new Error(`Authentication failed: ${errorData.message || response.statusText}`)
            }

            // 9. 성공적인 API 응답 데이터 파싱 및 토큰 추출
            const data = await response.json()
            const { accessToken, refreshToken, user } = data

            // 10. 토큰 유효성 검증: 필수 토큰이 누락된 경우
            if (!accessToken || !refreshToken) {
                console.error("Invalid token response:", { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })
                throw new Error("Invalid token response: Access or refresh token missing.")
            }

            // 11. JWT 토큰을 쿠키에 저장하고 메인 페이지로 리다이렉트
            const redirectResponse = NextResponse.redirect(new URL("/", request.url))
            const isProduction = process.env.NODE_ENV === "production"
            const cookieOptions = {
                httpOnly: true,
                secure: isProduction, // 프로덕션 환경에서만 HTTPS 강제
                sameSite: "lax" as const, // CSRF 보호
                path: "/", // 모든 경로에서 유효
            }

            // nookies를 사용하여 accessToken 쿠키 설정
            setCookie({ res: redirectResponse }, "accessToken", accessToken, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 7, // 7일 유효
            })
            // nookies를 사용하여 refreshToken 쿠키 설정
            setCookie({ res: redirectResponse }, "refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30, // 30일 유효
            })

            // 사용자 정보가 있다면 쿠키에 저장 (선택적)
            if (user) {
                setCookie({ res: redirectResponse }, "user", JSON.stringify(user), {
                    ...cookieOptions,
                    maxAge: 60 * 60 * 24 * 7, // 7일 유효
                })
            }

            console.log("Authentication successful for provider:", provider)
            return redirectResponse
        } catch (apiError) {
            // 12. API 호출 중 발생한 에러 처리
            console.error("API call error:", apiError)

            // 개발 환경에서 API 에러 발생 시 목업 인증 처리
            if (process.env.NODE_ENV === "development") {
                console.warn("Development mode: Creating mock authentication due to API error")
                const mockToken = `dev-token-${provider}-${Date.now()}`
                const redirectResponse = NextResponse.redirect(new URL("/", request.url))

                setCookie({ res: redirectResponse }, "accessToken", mockToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 7,
                    path: "/",
                })
                setCookie({ res: redirectResponse }, "refreshToken", `refresh-${mockToken}`, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 30,
                    path: "/",
                })

                return redirectResponse
            }

            // 실제 에러 메시지를 기반으로 에러 코드 결정 및 로그인 페이지로 리다이렉트
            let errorCode = "auth_failed"
            if (apiError instanceof Error) {
                if (apiError.message.includes("API response error")) {
                    errorCode = "api_response_format_error" // API 응답 형식 오류
                } else if (apiError.message.includes("Authentication failed")) {
                    errorCode = "auth_rejected" // 인증 실패 (백엔드에서 거부)
                } else if (apiError.message.includes("Invalid token response")) {
                    errorCode = "invalid_token_data" // 유효하지 않은 토큰 데이터
                } else if (apiError.message.includes("fetch")) {
                    errorCode = "network_error" // 네트워크 오류 (서버 연결 불가 등)
                }
            }
            return NextResponse.redirect(new URL(`/login?error=${errorCode}`, request.url))
        }
    } catch (error) {
        // 13. OAuth 콜백 처리 중 발생한 일반적인 에러
        console.error("Auth callback general error:", error)

        let errorCode = "auth_failed"
        if (error instanceof Error) {
            if (error.message.includes("fetch")) {
                errorCode = "network_error"
            } else if (error.message.includes("Authentication failed")) {
                errorCode = "auth_rejected"
            }
        }

        return NextResponse.redirect(new URL(`/login?error=${errorCode}`, request.url))
    }
}
