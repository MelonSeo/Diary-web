// lib/getTokens.ts
import { cookies } from "next/headers";

interface Tokens {
    accessToken?: string;
    refreshToken?: string;
}

// 서버/클라이언트 실행 환경 모두 지원
export async function getTokens(): Promise<Tokens> {
    if (typeof window === "undefined") {
        // ===== 서버 환경 =====
        const cookieStore = await cookies();
        return {
            accessToken: cookieStore.get("accessToken")?.value,
            refreshToken: cookieStore.get("refreshToken")?.value,
        };
    } else {
        // ===== 클라이언트 환경 =====
        const res = await fetch("/api/auth/get-token", {
            credentials: "include",
        });
        if (res.ok) {
            return res.json();
        }
        return {};
    }
}
