import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

/*export async function GET(req: NextRequest) {
    return apiRequest(req, "GET");
}
export async function DELETE(req: NextRequest) {
    return apiRequest(req, "DELETE");
}

export async function PUT(req: NextRequest) {
    return apiRequest(req, "PUT");
}
export async function PATCH(req: NextRequest) {
    return apiRequest(req, "PATCH");
}*/

// CORS configuration
const allowedOrigins = [
    'https://diary-web-qyme.vercel.app', // Production
    'http://localhost:3000', // Local development
];

const handleCors = (req: NextRequest, response: NextResponse): NextResponse => {
    const origin = req.headers.get('origin');
    if (!origin) return response;

    const isAllowed =
        allowedOrigins.includes(origin) ||
        (origin.startsWith('https://diary-web-qyme-') && origin.endsWith('.vercel.app'));

    if (isAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    }

    return response;
};

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    const isAllowed =
        origin &&
        (allowedOrigins.includes(origin) ||
            (origin.startsWith('https://diary-web-qyme-') && origin.endsWith('.vercel.app')));

    if (isAllowed) {
        const headers = {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        };
        return new NextResponse(null, { status: 204, headers });
    }

    return new NextResponse(null, { status: 403 });
}


export async function POST(req: NextRequest) {
    const response = await apiRequest(req);
    return handleCors(req, response);
}
interface apiBody {
    endpoint : string;
    requestMethod: string;
    data?: any;
}

async function apiRequest(req: NextRequest) {
    console.log("[bff] Received request. Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));

    if (!API_BASE) return NextResponse.json({ error: "API_BASE 설정 누락" }, { status: 500 });

    let body: apiBody | null = null;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({error: "잘못된 요청 body", status: 400});
    }

    try {
        const cookieHeader = req.headers.get("cookie") || "";
        const accessToken = (cookieHeader.match(/accessToken=([^;]+)/) || [])[1];
        const refreshToken = (cookieHeader.match(/refreshToken=([^;]+)/) || [])[1];
        console.log("[bff] Parsed tokens from cookie header:", { accessToken, refreshToken });

        const endpoint = body?.endpoint;
        const method = body?.requestMethod;
        const data = body?.data;

        if (!endpoint) {
            return NextResponse.json({error: "endpoint 누락"}, {status: 400});
        }
        console.log("[bff]endpoint:", endpoint);
        console.log("[bff]data:", data);

        if (endpoint === "/users/me") {
            console.log("[bff] Processing /users/me request");
        }

        // @description logout 요청 시 백엔드 로그아웃 호출 후 여부 관계없이 쿠키 삭제
        if (endpoint === "/auth/logout") {
            const isProd = process.env.NODE_ENV === "production";
            console.log("[bff]logout");

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
                // JSON 전송은 POST/PUT/PATCH일 때만
                ...(["POST", "PUT", "PATCH"].includes(method) ? { "Content-Type": "application/json" } : {}),
            },
            body: ["POST", "PUT", "PATCH"].includes(method) && data !== undefined ? JSON.stringify(data) : undefined,
        };

        console.log("[bff] Final fetch config:", JSON.stringify(config, null, 2));
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

            const { accessToken : newAccess, refreshToken: newRefresh } = await reissueRes.json();
            const isProd = process.env.NODE_ENV === "production";

            const cookieCarrier = new NextResponse(); //쿠키를 담아두기 위함
            cookieCarrier.cookies.set("accessToken", newAccess, {
                httpOnly: true,
                secure: isProd,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60,
            });
            if (newRefresh) {
                cookieCarrier.cookies.set("refreshToken", newRefresh, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 7일
                });
            }


            backendResponse = await fetch(`${API_BASE}${endpoint}`, { ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${newAccess}`,
            },
            });
            return await resWithCookies(backendResponse, cookieCarrier);
        }

        return await res(backendResponse);
    } catch (e) {
        console.error(e);
        console.error("Proxy Error");
        if (e.message.includes("fetch")) {
            console.log("API_SERVER_UNAVAILABLE");
            throw new Error("API_SERVER_UNAVAILABLE");
        }
        return NextResponse.json( { error: e.message || "Route Error", status: 500 });
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