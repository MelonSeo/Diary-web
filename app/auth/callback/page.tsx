import type { Metadata } from "next"
import CallbackClientPage from "./CallbackClientPage"

/**
 * @file app/auth/callback/page.tsx
 * @description OAuth 콜백을 처리하는 Next.js Server Component 페이지.
 *              이 페이지는 클라이언트 컴포넌트인 `CallbackClientPage`를 래핑하여
 *              메타데이터를 설정하고, `searchParams`를 안전하게 전달합니다.
 *              실제 OAuth 인증 처리는 `app/auth/callback/route.ts` (API Route Handler)에서 이루어집니다.
 */

// 페이지의 메타데이터 정의
export const metadata: Metadata = {
    title: "로그인 처리 중... - 나의 일기장",
    description: "소셜 로그인을 처리하고 있습니다.",
}

interface CallbackPageProps {
    searchParams: {
        code?: string // OAuth 인증 코드
        provider?: string // OAuth 제공자 (kakao, google)
        error?: string // OAuth 에러 코드
        error_description?: string // OAuth 에러 상세 설명
    }
}

/**
 * @function CallbackPage
 * @description OAuth 콜백 페이지의 Server Component.
 *              `searchParams`는 Next.js 15에서 Promise로 제공될 수 있으므로 `await Promise.resolve`로 안전하게 처리합니다.
 * @param {CallbackPageProps} { searchParams } - URL 쿼리 파라미터
 */
export default async function CallbackPage({ searchParams }: CallbackPageProps) {
    // searchParams가 Promise일 수 있으므로 await으로 해결
    const params = await Promise.resolve(searchParams)
    // 클라이언트 컴포넌트인 CallbackClientPage를 렌더링하고 searchParams를 전달
    return <CallbackClientPage searchParams={params} />
}
