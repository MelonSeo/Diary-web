import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * @file app/api/auth/get-tokens/route.ts
 * @description httpOnly 쿠키에서 토큰을 안전하게 가져오는 API Route.
 *              클라이언트 사이드에서 httpOnly 쿠키에 직접 접근할 수 없으므로,
 *              서버 사이드 API Route를 통해 토큰을 제공합니다.
 */

export async function GET(request: NextRequest) {
    try {
        // 서버에서 httpOnly 쿠키에 접근
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")
        const refreshToken = cookieStore.get("refreshToken")

        // 토큰 정보를 JSON으로 반환 (값만 반환, 민감한 정보는 제외)
        return NextResponse.json({
            accessToken: accessToken?.value || undefined,
            refreshToken: refreshToken?.value || undefined,
        })
    } catch (error) {
        console.error("Failed to get tokens from cookies:", error)
        return NextResponse.json({ error: "Failed to retrieve tokens" }, { status: 500 })
    }
}
