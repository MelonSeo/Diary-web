import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest) {
    return apiRequest(req, "GET");
}
export async function DELETE(req: NextRequest) {
    return apiRequest(req, "DELETE");
}
export async function POST(req: NextRequest) {
    return apiRequest(req, "POST");
}
export async function PUT(req: NextRequest) {
    return apiRequest(req, "PUT");
}
export async function PATCH(req: NextRequest) {
    return apiRequest(req, "PATCH");
}

async function apiRequest(req: NextRequest, method: string) {
    if (!API_BASE) return NextResponse.json({ error: "API_BASE 설정 누락" }, { status: 500 });

    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken").value;
        const refreshToken = cookieStore.get("refreshToken").value;

        const {endpoint, data} = await req.json();
        if (!endpoint) {
            return NextResponse.json({error: "endpoint 누락"}, {status: 400});
        }

        // @description logout 요청 시 백엔드 로그아웃 호출 후 여부 관계없이 쿠키 삭제
        if (endpoint === "/auth/logout") {
            const isProd = process.env.NODE_ENV === "production";

            // 백엔드 로그아웃 호출 (바디 없음)
            const backendRes = await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                headers: {
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
                }
            });

            let resBody: any = { success: true };

            if (!backendRes.ok) {
                const errorText = await backendRes.text().catch(() => "Logout failed");
                resBody = { success: false, error: errorText };
            }

            const res = NextResponse.json(resBody, { status: 200 });
            res.cookies.delete("accessToken");
            res.cookies.delete("refreshToken");

            return res;
        }

        const config: RequestInit = {
            method,
            headers: {
                ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
                ...(data ? {"Content-Type": "application/json"} : {})
            },
            body: data ? JSON.stringify(data) : undefined,
        };

        let backendResponse = await fetch(`${API_BASE}${endpoint}`, config);
        if (backendResponse.status === 401 && refreshToken) {
            const reissueRes = await fetch(`${API_BASE}/auth/reissue`, {
                method: "POST",
                headers: {"Refresh-Token": refreshToken}, // refreshToken을 헤더로 전달
            });

            if(!reissueRes.ok) {
                const clear = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                clear.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
                clear.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
                return clear; //프론트쪽에서 redirect해야할듯
            }

            const { accessToken : newAccess } = await reissueRes.json();
            const isProd = process.env.NODE_ENV === "production";

            const cookieCarrier = NextResponse.next(); //쿠키를 담아두기 위함
            cookieCarrier.cookies.set("accessToken", newAccess, {
                httpOnly: true,
                secure: isProd,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60,
            });

            backendResponse = await fetch(`${API_BASE}${endpoint}`, { ...config,
            headers: {
            ...(newAccess ? {Authorization: `Bearer ${newAccess}`} : {}),
            ...(data ? {"Content-Type": "application/json"} : {}),
            },
            });
            return await resWithCookies(backendResponse, cookieCarrier);
        }

        return await res(backendResponse);
    } catch (e) {
        return NextResponse.json({ error: e.message || "Proxy error" }, { status: 500 });
    }
}

async function res(backendResponse: Response) {
    const contentType = backendResponse.headers.get("Content-Type") || "";

    if(!backendResponse.ok) {
        const text = await backendResponse.text().catch(() => "");
        return NextResponse.json(
            { error: text || backendResponse.statusText },
            { status: backendResponse.status }
        );
    }

    if(contentType === "application/json") {
        const backendJson = await backendResponse.json();
        return NextResponse.json(
            backendJson,
            {status: backendResponse.status}
        );
    }

    const backendText = await backendResponse.text();
    return NextResponse.json(
        { data : backendText},
        { status : backendResponse.status}
    );
}

async function resWithCookies(backendResponse: Response, cookieCarrier:NextResponse)  {
    const headers = Object.fromEntries(cookieCarrier.headers); // 새 Set-Cookie 포함
    const contentType = backendResponse.headers.get("Content-Type") || "";

    if (!backendResponse.ok) {
        const text = await backendResponse.text().catch(() => "");
        return new NextResponse(
            JSON.stringify({ error: text || backendResponse.statusText }),
            { status: backendResponse.status, headers: { "Content-Type": "application/json", ...headers } }
        );
    }

    if (contentType === "application/json") {
        const backendJson = await backendResponse.json();
        return new NextResponse(JSON.stringify(backendJson),{
            status:backendResponse.status,
            headers: {"Content-Type": "application/json", ...headers}
        });
    }

    const backendJson = await backendResponse.text();
    return new NextResponse(JSON.stringify( {data: backendJson} ), {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json", ...headers }
    });
}