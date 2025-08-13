"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Trash2, Save, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import type { UserProfile, UpdateUserProfileRequest } from "@/types/diary"
import { destroyCookie } from "nookies"
import styles from "@/styles/UserProfileForm.module.css" // CSS Modules 임포트

/**
 * @file components/user-profile-form.tsx
 * @description 사용자 프로필 정보를 표시하고 수정, 회원 탈퇴 기능을 제공하는 클라이언트 컴포넌트.
 *              API 명세에 따라 사용자 정보를 가져오고, 업데이트하며, 계정을 삭제합니다.
 */

export default function UserProfileForm() {
    const router = useRouter()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [username, setUsername] = useState("")
    const [profileImageUrl, setProfileImageUrl] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, startUpdateTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.getUserProfile()
                setUser(response)
                setUsername(response.username)
                setProfileImageUrl(response.profileImageUrl || "")
            } catch (err) {
                console.error("Failed to fetch user profile:", err)
                setError("프로필 정보를 불러오는 데 실패했습니다.")
                // API 서버 연결 실패 시 목업 데이터 사용
                if (err instanceof Error && err.message.includes("API_SERVER_UNAVAILABLE")) {
                    const mockUser: UserProfile = {
                        id: "mock-user-1",
                        username: "테스트 사용자",
                        email: "test@example.com",
                        profileImageUrl: "/placeholder.svg?height=100&width=100&text=Mock User",
                        provider: "KAKAO",
                        providerId: "mock-provider-id-1",
                        //createdAt: new Date().toISOString(),
                    }
                    setUser(mockUser)
                    setUsername(mockUser.username)
                    setProfileImageUrl(mockUser.profileImageUrl || "")
                    setError("API 서버에 연결할 수 없습니다. 목업 데이터를 표시합니다.")
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchUserProfile()
    }, [])

    const handleUpdateProfile = () => {
        startUpdateTransition(async () => {
            setError(null)
            if (!username.trim()) {
                setError("닉네임을 입력해주세요.")
                return
            }

            const updateData: UpdateUserProfileRequest = {
                username: username.trim(),
                profileImageUrl: profileImageUrl.trim() || undefined, // 빈 문자열이면 undefined로 보내지 않음
            }

            try {
                const response = await apiClient.updateUserProfile(updateData)
                setUser(response)
                setUsername(response.username)
                setProfileImageUrl(response.profileImageUrl || "")
                alert("프로필이 성공적으로 업데이트되었습니다!")
            } catch (err) {
                console.error("Failed to update profile:", err)
                setError("프로필 업데이트에 실패했습니다. 다시 시도해주세요.")
            }
        })
    }

    const handleDeleteAccount = () => {
        startDeleteTransition(async () => {
            setError(null)
            if (!confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                return
            }

            try {
                await apiClient.deleteUser()
                destroyCookie(null, "accessToken", { path: "/" })
                destroyCookie(null, "refreshToken", { path: "/" })
                alert("계정이 성공적으로 삭제되었습니다. 로그인 페이지로 이동합니다.")
                router.push("/login")
            } catch (err) {
                console.error("Failed to delete account:", err)
                setError("계정 삭제에 실패했습니다. 다시 시도해주세요.")
            }
        })
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className="text-center">
                    <div className={styles.loadingSpinner}></div>
                    <p className={styles.loadingText}>프로필 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (!user && !error) {
        return (
            <div className={styles.container}>
                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle>프로필 정보를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">로그인 상태를 확인하거나 다시 시도해주세요.</p>
                        <Button onClick={() => router.push("/login")} className="mt-4">
                            로그인 페이지로 이동
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.headerSection}>
                    <Button variant="ghost" onClick={() => router.back()} className={styles.backButton}>
                        <ArrowLeft className={styles.backButton.split(" ").find((cls) => cls.includes("svg"))} />
                        뒤로가기
                    </Button>
                    <h1 className={styles.title}>내 정보</h1>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        <p>{error}</p>
                    </div>
                )}

                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle className={styles.cardTitle}>프로필 정보</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                        <div className={styles.profileInfo}>
                            <div className={styles.profileImageWrapper}>
                                <img
                                    src={profileImageUrl || "/placeholder.svg?height=100&width=100&text=Mock User"}
                                    alt="프로필 이미지"
                                    className={styles.profileImage}
                                />
                            </div>
                            <div className={styles.profileDetails}>
                                <p className={styles.usernameText}>
                                    <User className={styles.usernameText.split(" ").find((cls) => cls.includes("svg"))} />
                                    {user?.username}
                                </p>
                                <p className={styles.emailText}>
                                    <Mail className={styles.emailText.split(" ").find((cls) => cls.includes("svg"))} />
                                    {user?.email}
                                </p>
                                {/*<p className={styles.createdAtText}>
                                    가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "N/A"}
                                </p>*/}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle className={styles.cardTitle}>프로필 수정</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                        <div className={styles.inputGroup}>
                            <Label htmlFor="username" className={styles.label}>
                                닉네임
                            </Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="새 닉네임을 입력하세요"
                                disabled={isUpdating}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <Label htmlFor="profileImageUrl" className={styles.label}>
                                프로필 이미지 URL
                            </Label>
                            <Input
                                id="profileImageUrl"
                                value={profileImageUrl}
                                onChange={(e) => setProfileImageUrl(e.target.value)}
                                placeholder="새 프로필 이미지 URL을 입력하세요"
                                disabled={isUpdating}
                                className={styles.input}
                            />
                        </div>
                        <Button
                            onClick={handleUpdateProfile}
                            disabled={isUpdating}
                            className={`${styles.button} ${styles.saveButton}`}
                        >
                            <Save className={styles.buttonIcon} />
                            {isUpdating ? "저장 중..." : "프로필 저장"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle className={`${styles.cardTitle} ${styles.cardTitleRed}`}>계정 삭제</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                        <p className={styles.deleteDescription}>
                            계정을 삭제하면 모든 일기 및 프로필 정보가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <Button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            variant="destructive"
                            className={`${styles.button} ${styles.deleteButton}`}
                        >
                            <Trash2 className={styles.buttonIcon} />
                            {isDeleting ? "삭제 중..." : "계정 삭제"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
