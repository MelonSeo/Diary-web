// app/api/auth/reissue/route.ts
import {cookies} from "next/headers";
import {NextResponse} from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
        return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // 백엔드에 재발급 요청
    const backendRes = await fetch(`${process.env.API_BASE_URL}/auth/reissue`, {
        method: "POST",
        headers: { "Refresh-Token": refreshToken },
    });

    if (!backendRes.ok) {
        return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }

    const { accessToken, tokenType } = await backendRes.json();

    /*res.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
    });*/
    /*res.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });*/

    return NextResponse.json({accessToken, tokenType});
}
