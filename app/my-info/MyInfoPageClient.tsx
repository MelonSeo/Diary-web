"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import UserProfileForm from "@/components/user-profile-form" // 새로 생성할 컴포넌트 임포트

/**
 * @file app/my-info/page.tsx
 * @description 사용자 정보 페이지의 Next.js 클라이언트 컴포넌트.
 *              사용자 프로필 정보를 표시하고 수정, 회원 탈퇴 기능을 제공합니다.
 */

export default function MyInfoPageClient() {
    return <UserProfileForm />
}
