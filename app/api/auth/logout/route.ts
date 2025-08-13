import { NextResponse } from "next/server"

/**
 * @description 로그아웃 시 쿠키를 안전하게 삭제하는 API 라우트
 */
export async function POST() {
    const response = NextResponse.json({ success: true })

    // 모든 인증 관련 쿠키 삭제
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
}
