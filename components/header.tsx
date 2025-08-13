"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import { useState, useEffect } from "react"
import { LogOut, User } from "lucide-react" // Lucide React 아이콘
import Link from "next/link" // Next.js Link 컴포넌트 추가
import { Button } from "@/components/ui/button" // shadcn/ui 버튼
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu" // shadcn/ui 드롭다운 메뉴
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // shadcn/ui 아바타
import { destroyCookie } from "nookies" // nookies 라이브러리 임포트: 클라이언트/서버 통합 쿠키 관리를 위해 사용
import styles from "@/styles/Header.module.css" // Import the CSS Module
import type { UserProfile } from "@/types/diary"
import {getUserProfile, logout} from "@/lib/client-api"; // UserProfile 타입 임포트

/**
 * @file components/header.tsx
 * @description 애플리케이션의 상단 헤더 컴포넌트.
 *              사용자 정보를 표시하고, 드롭다운 메뉴를 통해 로그아웃 기능을 제공합니다.
 *              클라이언트 컴포넌트로, 사용자 상태를 관리하고 API 호출을 수행합니다.
 *              새로운 내비게이션 링크를 포함합니다.
 */

/**
 * @function Header
 * @description 애플리케이션 헤더 컴포넌트.
 *              사용자 정보 표시 및 로그아웃 기능을 포함합니다.
 */
export default function Header() {
    const [user, setUser] = useState<UserProfile | null>(null) // 사용자 정보를 저장하는 상태

    // 1. 사용자 정보 조회 (컴포넌트 마운트 시 한 번 실행)
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserProfile() // API 클라이언트를 통해 사용자 정보 조회
                setUser(response) // 조회된 사용자 정보로 상태 업데이트
            } catch (error) {
                console.warn("Failed to fetch user info:", error)
                // API 서버가 연결되지 않았을 때 목업 데이터 사용
                if (error instanceof Error && error.message.includes("API_SERVER_UNAVAILABLE")) {
                    setUser({
                        id: "mock-user-1",
                        username: "테스트 사용자", // 'name' 대신 'username' 사용
                        email: "test@example.com",
                        profileImageUrl: "/placeholder.svg?height=32&width=32&text=User", // 'profileImage' 대신 'profileImageUrl' 사용
                        provider: "KAKAO",
                        providerId: "mock-provider-id-1",
                        //createdAt: new Date().toISOString(),
                    })
                }
            }
        }

        fetchUserInfo() // 함수 호출
    }, []) // 빈 의존성 배열: 컴포넌트가 마운트될 때 한 번만 실행

    // 2. 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            await logout(); // 백엔드 로그아웃 API 호출
        } catch (error) {
            console.warn("Logout API call failed:", error)
            // API 서버가 없어도 클라이언트 측 로그아웃은 진행
        }
        window.location.href = "/login"
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <h1 className={styles.title}>
                        <Link href="/">나의 일기장</Link> {/* 홈으로 이동하는 링크 */}
                    </h1>
                    {/* 새로운 내비게이션 링크들 */}
                    <nav className={styles.navigation}>
                        <Link href="/" className={styles.navLink}>
                            홈
                        </Link>
                        <Link href="/my-diaries" className={styles.navLink}>
                            내 일기장 목록
                        </Link>
                        <Link href="/my-info" className={styles.navLink}>
                            내 정보
                        </Link>
                        <Link href="/about-us" className={styles.navLink}>
                            About Us
                        </Link>
                    </nav>
                </div>

                <div className={styles.rightSection}>
                    {user && ( // 사용자 정보가 있을 때만 드롭다운 메뉴 렌더링
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={styles.avatarButton}>
                                    <Avatar className={styles.avatar}>
                                        {/* 사용자 프로필 이미지 또는 플레이스홀더 */}
                                        <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.username} />
                                        {/* 이미지 로드 실패 시 대체 아이콘 */}
                                        <AvatarFallback>
                                            <User className={styles.avatarFallbackIcon} />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className={styles.dropdownContent} align="end" forceMount>
                                <div className={styles.userInfo}>
                                    <div className={styles.userNameEmail}>
                                        <p className={styles.userName}>{user.username}</p>
                                        <p className={styles.userEmail}>{user.email}</p>
                                    </div>
                                </div>
                                {/* 내 정보 페이지로 이동 */}
                                <DropdownMenuItem onClick={() => (window.location.href = "/my-info")}>
                                    <User className={styles.logoutIcon} />
                                    <span>내 정보</span>
                                </DropdownMenuItem>
                                {/* 로그아웃 버튼 */}
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className={styles.logoutIcon} />
                                    <span>로그아웃</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
