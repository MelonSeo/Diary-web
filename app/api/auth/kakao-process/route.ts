import { type NextRequest, NextResponse } from "next/server"
import { setCookie } from "nookies"

/**
 * @file app/api/auth/kakao-process/route.ts
 * @description 카카오 OAuth 인가 코드를 받아 토큰을 교환하고 사용자 정보를 백엔드로 전송하는 Next.js API Route Handler.
 *              이 핸들러는 클라이언트로부터 인가 코드를 받아 카카오 인증 서버와 직접 통신하여 토큰 및 사용자 정보를 획득합니다.
 *              획득한 사용자 정보를 Spring Boot 백엔드로 전송하고, 백엔드로부터 받은 JWT 토큰을 쿠키에 저장합니다.
 */
export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json() // 클라이언트로부터 받은 인가 코드

        if (!code) {
            console.error("Missing authorization code for Kakao process.")
            return NextResponse.json({ error: "Authorization code is missing." }, { status: 400 })
        }

        const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_REST_KEY
        const kakaoRedirectUri = process.env.NEXT_PUBLIC_KAKAO_LOGIN_REDIRECT_URI
        const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL

        if (!kakaoClientId || !kakaoRedirectUri || !apiBaseUrl) {
            console.error("Missing environment variables for Kakao or API base URL.")
            return NextResponse.json({ error: "Server configuration error." }, { status: 500 })
        }

        // 1. 카카오 인증 서버에 토큰 요청 (인가 코드를 액세스 토큰으로 교환)
        console.log("Requesting Kakao tokens...")
        const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: kakaoClientId,
                redirect_uri: kakaoRedirectUri,
                code: code,
            }).toString(),
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error("Failed to get Kakao tokens:", tokenResponse.status, errorData)
            return NextResponse.json({ error: "Failed to get Kakao tokens." }, { status: tokenResponse.status })
        }

        const kakaoTokens = await tokenResponse.json()
        const kakaoAccessToken = kakaoTokens.access_token
        console.log("Successfully obtained Kakao access token.")

        // 2. 카카오 API 서버에 사용자 정보 요청
        console.log("Requesting Kakao user info...")
        const userInfoResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${kakaoAccessToken}`,
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
        })

        if (!userInfoResponse.ok) {
            const errorData = await userInfoResponse.json()
            console.error("Failed to get Kakao user info:", userInfoResponse.status, errorData)
            return NextResponse.json({ error: "Failed to get Kakao user info." }, { status: userInfoResponse.status })
        }

        const kakaoUserInfo = await userInfoResponse.json()
        console.log("Successfully obtained Kakao user info:", kakaoUserInfo)

        // 3. 우리 Spring Boot 백엔드 서버로 사용자 정보 전송
        // 백엔드는 이 정보를 바탕으로 로그인/회원가입 처리 및 우리 서비스의 JWT 발급
        console.log("Sending user info to backend for login...")
        const backendLoginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider: "KAKAO",
                providerId: kakaoUserInfo.id.toString(), // 카카오 사용자 ID
                email: kakaoUserInfo.kakao_account?.email, // 이메일
                username: kakaoUserInfo.kakao_account?.profile.nickname, // 닉네임
                //profileImage: kakaoUserInfo.properties?.profile_image, // 프로필 이미지
                // 필요한 다른 정보 추가
            }),
        })

        if (!backendLoginResponse.ok) {
            const errorData = await backendLoginResponse.json()
            console.error("Backend login failed:", backendLoginResponse.status, errorData)
            return NextResponse.json({ error: "Backend authentication failed." }, { status: backendLoginResponse.status })
        }

        const backendTokens = await backendLoginResponse.json()
        const { tokenType, accessToken, refreshToken } = backendTokens
        console.log("Successfully obtained backend JWT tokens.")

        if (!accessToken || !refreshToken) {
            console.error("Invalid token response from backend:", {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
            })
            return NextResponse.json({ error: "Invalid token response from backend." }, { status: 500 })
        }

        // 4. JWT 토큰을 httpOnly 쿠키에 저장
        const response = NextResponse.json({ success: true })
        const isProduction = process.env.NODE_ENV === "production"
        const cookieOptions = {
            httpOnly: true, // JavaScript에서 접근 불가
            secure: isProduction, // 프로덕션 환경에서만 HTTPS 강제
            sameSite: "lax" as const, // CSRF 보호
            path: "/", // 모든 경로에서 유효
        }

        setCookie({ res: response }, "accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 , // 1시간 유효
        })
        setCookie({ res: response }, "refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7, // 7일 유효
        })

        /*if (user) {
            setCookie({ res: response }, "user", JSON.stringify(user), {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 7, // 7일 유효
            })
        }*/

        console.log("Kakao login process completed successfully.")
        return response
    } catch (error) {
        console.error("Error during Kakao login process:", error)
        return NextResponse.json({ error: "Internal server error during Kakao login." }, { status: 500 })
    }
}
