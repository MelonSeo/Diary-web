"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu" // shadcn/ui 드롭다운 메뉴
import {useEffect, useState} from "react";
import {destroyCookie} from "nookies";
import styles from "../styles/Header.module.css";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {LogOut, User} from "lucide-react";

interface UserInfo {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
}

export default function Header() {
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await apiClient.get("/user/me") // API 클라이언트를 통해 사용자 정보 조회
                setUser(response.data) // 조회된 사용자 정보로 상태 업데이트
            } catch (error) {
                console.warn("Failed to fetch user info:", error)
                // API 서버가 연결되지 않았을 때 목업 데이터 사용
                if (error instanceof Error && error.message.includes("API_SERVER_UNAVAILABLE")) {
                    setUser({
                        id: 3000,
                        name: "테스트 사용자",
                        email: "test@example.com",
                        profileImage: "/placeholder.svg?height=32&width=32&text=User", // 플레이스홀더 이미지
                    })
                }
            }
        }

        fetchUserInfo() // 함수 호출
    }, []);

    const handleLogout = async () => {
        try {
            await apiClient.post("/auth/logout") // 백엔드 로그아웃 API 호출
        } catch (error) {
            console.warn("Logout API call failed:", error)
            // API 서버가 없어도 클라이언트 측 로그아웃은 진행
        }

        // nookies를 사용하여 accessToken과 refreshToken 쿠키 삭제
        // `null`은 클라이언트 사이드 컨텍스트를 의미하며, `path: "/"`는 모든 경로에서 쿠키를 삭제
        destroyCookie(null, "accessToken", { path: "/" })
        destroyCookie(null, "refreshToken", { path: "/" })
        // 로그인 페이지로 리다이렉트하여 세션 종료
        window.location.href = "/login"
    }
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <h1 className={styles.title}>
                        <a href="/">나의 일기장</a> {/* 홈으로 이동하는 링크 */}
                    </h1>
                </div>

                <div className={styles.rightSection}>
                    {user && ( // 사용자 정보가 있을 때만 드롭다운 메뉴 렌더링
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={styles.avatarButton}>
                                    <Avatar className={styles.avatar}>
                                        {/* 사용자 프로필 이미지 또는 플레이스홀더 */}
                                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
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
                                        <p className={styles.userName}>{user.name}</p>
                                        <p className={styles.userEmail}>{user.email}</p>
                                    </div>
                                </div>
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