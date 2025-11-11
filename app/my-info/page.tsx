import type { Metadata } from "next"
import MyInfoPageClient from "./MyInfoPageClient"
import { getUserProfile } from "@/lib/client-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/styles/UserProfileForm.module.css"
import { AlertTriangle } from "lucide-react"

/**
 * @file app/my-info/page.tsx
 * @description 사용자 정보 페이지의 Next.js 서버 컴포넌트.
 *              서버 사이드에서 사용자 프로필 정보를 미리 가져옵니다.
 */

export const metadata: Metadata = {
    title: "내 정보 - 나의 일기장",
    description: "나의 일기장 사용자 프로필 정보",
}

export default async function MyInfoPage() {
    console.log("[MyInfoPage] Attempting to fetch user profile on the server...");

    try {
        const userProfile = await getUserProfile();
        console.log("[MyInfoPage] Successfully fetched user profile on the server.");

        // 클라이언트 컴포넌트로 전달하기 전, Long 타입을 string으로 변환
        const serializableUserProfile = {
            ...userProfile,
            id: userProfile.id.toString(),
            // uid가 있다면 변환
            ...(userProfile.uid && { uid: userProfile.uid.toString() }),
        };

        return <MyInfoPageClient userProfile={serializableUserProfile} />;
    } catch (error) {
        console.error("[MyInfoPage] Failed to fetch user profile on the server:", error);
        // API 호출 실패 시 에러 UI 렌더링
        return (
            <div className={styles.container}>
                <div className={styles.mainContent}>
                    <h1 className={styles.title}>내 정보</h1>
                    <Card className={styles.card}>
                        <CardHeader>
                            <CardTitle className={styles.cardTitleRed}>
                                <AlertTriangle className={styles.iconSmall} />
                                오류
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>사용자 정보를 불러오는 데 실패했습니다.</p>
                            <p>잠시 후 다시 시도해주세요.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
}
