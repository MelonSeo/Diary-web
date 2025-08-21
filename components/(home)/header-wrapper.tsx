"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import { usePathname } from "next/navigation" // 현재 경로를 가져오는 훅
import Header from "@/components/(home)/header" // 기존 헤더 컴포넌트 임포트

/**
 * @file components/app-header-wrapper.tsx
 * @description 특정 경로(예: 로그인 페이지)에서 헤더를 조건부로 렌더링하는 클라이언트 컴포넌트.
 *              `app/layout.tsx`에서 사용되어 전역 헤더의 가시성을 제어합니다.
 */

export default function HeaderWrapper() {
    const pathname = usePathname() // 현재 URL 경로 가져오기

    // 로그인 페이지(/login)가 아닐 때만 Header 컴포넌트를 렌더링합니다.
    if (pathname === "/login") {
        return null // 로그인 페이지에서는 헤더를 렌더링하지 않습니다.
    }

    return <Header /> // 그 외의 페이지에서는 헤더를 렌더링합니다.
}
