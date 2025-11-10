import {OAuth2Client} from "google-auth-library";
import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";
import {router} from "next/client";

const isProd = process.env.NODE_ENV === "production";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL


export async function GET(req: NextRequest) {
    console.log("google process");
    const jwt = await getToken({req, secret: process.env.NEXTAUTH_SECRET });
    const idToken = jwt.google_id_token as string;

    if (!idToken) {
        console.error("No idToken provided");
        return NextResponse.redirect(new URL("/error", req.nextUrl.origin));
    }

    let verifiedProfile: any;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        verifiedProfile = ticket.getPayload();
        console.log(verifiedProfile);
        if (!verifiedProfile){
            throw new Error("Not payload in");
        }
    } catch(e) {
            return NextResponse.redirect(new URL("/error", req.nextUrl.origin));
    }
    const provider = "GOOGLE";
    const providerId = verifiedProfile.sub.toString();
    const email = verifiedProfile.email.toString();
    const username = verifiedProfile.name.toString();

try {
    const requestBody = {
        provider, providerId, email, username,
    };

    console.log("--- Sending Login Request to Backend (Google) ---");
    console.log("Request URL:", `${apiBaseUrl}/auth/login`);
    console.log("Request Method:", "POST");
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("-------------------------------------------------");

    const backendRes = await fetch(`${apiBaseUrl}/auth/login`!, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(requestBody),
    });
    if (!backendRes.ok) {
        const errorData = await backendRes.json();
        console.error("Backend login failed:", backendRes.status, errorData)
        const url = new URL("/login", req.nextUrl.origin);
        url.searchParams.set("error", "Backend authentication failed.");
        return NextResponse.redirect(url);
    }


    const data = await backendRes.json();
    const accessToken = data.accessToken.toString();
    const refreshToken = data.refreshToken.toString();

    const nextUrl = req.nextUrl.searchParams.get("next") || "/";
    const callbackUrl = new URL("/auth/callback", req.nextUrl.origin);
    callbackUrl.searchParams.set("next", nextUrl);

    const res = NextResponse.redirect(callbackUrl);
    if (accessToken) {
        res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1시간
        });
    }
    if (refreshToken) {
        res.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7일
        });
    }


    return res;
} catch (e) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("error", "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    return NextResponse.redirect(url);
}

}