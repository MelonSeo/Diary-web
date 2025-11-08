import {Metadata} from "next";
import LoginForm from "@/components/login-form";


export const metadata: Metadata ={
    title: "로그인 - 내 일기장",
}

interface LoginPageProps {
    searchParams: {
        error?: string;
        error_description?: string;
    }
}

/*async function getKakaoAuthUrl() {

    const kakaoJsKey = process.env.KAKAO_JS_KEY;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    if (!kakaoJsKey || !redirectUri) {
        throw new Error(
            "카카오 OAuth 설정이 없습니다. NEXT_PUBLIC_KAKAO_CLIENT_ID와 NEXT_PUBLIC_KAKAO_REDIRECT_URI를 확인해주세요.",
        )
    }

    return `${redirectUri}?redirect_uri=${encodeURIComponent(redirectUri)}`
}*/

function getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        // OAuth 제공자로부터의 에러
        oauth_access_denied: "로그인이 취소되었습니다.",
        oauth_invalid_request: "잘못된 로그인 요청입니다.",
        oauth_server_error: "소셜 로그인 서버에 문제가 발생했습니다.",

        // 콜백 처리 중 발생한 에러
        invalid_request: "잘못된 요청입니다.",
        missing_params: "필수 정보가 누락되었습니다.",
        unsupported_provider: "지원하지 않는 로그인 방식입니다.",
        server_config: "서버 설정에 문제가 있습니다. API_BASE_URL 환경 변수를 확인해주세요.",

        // API 통신 중 발생한 에러
        auth_failed: "로그인에 실패했습니다. 자격 증명을 확인해주세요.",
        auth_rejected: "인증이 거부되었습니다. 권한을 확인해주세요.",
        network_error: "네트워크 연결에 문제가 있습니다. API 서버가 실행 중인지 확인해주세요.",
        api_response_format_error: "서버 응답 형식이 올바르지 않습니다. 서버 로그를 확인해주세요.",
        invalid_token_data: "서버로부터 유효하지 않은 토큰 데이터를 받았습니다.",

        // 기타 알 수 없는 에러
        invalid_callback: "잘못된 콜백 요청입니다.",
        default_error: "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.",
    }

    // 에러 코드에 해당하는 메시지가 없으면 기본 에러 메시지 반환
    return errorMessages[errorCode] || errorMessages.default_error
}

export default function LoginPage({searchParams}: LoginPageProps) {
    const errorMessage = searchParams.error ? getErrorMessage(searchParams.error) : null

    return (
        <LoginForm errorMessage={errorMessage} />
    )
}