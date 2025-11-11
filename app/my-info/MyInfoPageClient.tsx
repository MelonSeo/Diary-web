"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import UserProfileForm from "@/components/(user)/user-profile-form"
import type { UserProfile } from "@/types/diary";

/**
 * @file app/my-info/MyInfoPageClient.tsx
 * @description 사용자 정보 페이지의 Next.js 클라이언트 컴포넌트.
 *              서버 컴포넌트로부터 받은 사용자 정보를 UserProfileForm으로 전달합니다.
 */

interface MyInfoPageClientProps {
    userProfile: UserProfile;
}

export default function MyInfoPageClient({ userProfile }: MyInfoPageClientProps) {
    return <UserProfileForm userProfile={userProfile} />
}
