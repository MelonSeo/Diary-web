import type { Metadata } from "next"
import MyInfoPageClient from "./MyInfoPageClient"

/**
 * @file app/my-info/page.tsx
 * @description 사용자 정보 페이지의 Next.js 서버 컴포넌트.
 */

export const metadata: Metadata = {
    title: "내 정보 - 나의 일기장",
    description: "나의 일기장 사용자 프로필 정보",
}

export default function MyInfoPage() {
    return <MyInfoPageClient />
}
