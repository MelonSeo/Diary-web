"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Trash2, Save, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { UserProfile, UpdateUserProfile } from "@/types/diary"
import styles from "@/styles/UserProfileForm.module.css"
import {deleteUser, updateUserProfile, logout} from "@/lib/client-api";

/**
 * @file components/user/user-profile-form.tsx
 * @description 사용자 프로필 정보를 표시하고 수정, 회원 탈퇴 기능을 제공하는 클라이언트 컴포넌트.
 *              데이터는 상위 컴포넌트로부터 props로 전달받습니다.
 */

interface UserProfileFormProps {
    userProfile: UserProfile;
}

export default function UserProfileForm({ userProfile }: UserProfileFormProps) {
    const router = useRouter()
    // 폼 입력을 위한 상태. 초기값은 prop으로 받은 데이터로 설정.
    const [username, setUsername] = useState(userProfile.username)
    const [profileImageUrl, setProfileImageUrl] = useState(userProfile.profileImageUrl || "")
    const [isUpdating, startUpdateTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()
    const [formError, setFormError] = useState<string | null>(null)

    const handleUpdateProfile = () => {
        startUpdateTransition(async () => {
            setFormError(null)
            if (!username.trim()) {
                setFormError("닉네임을 입력해주세요.")
                return
            }

            const updateData: UpdateUserProfile = {
                username: username.trim(),
                profileImageUrl: profileImageUrl.trim() || undefined,
            }

            console.log("[UserProfileForm] Attempting to update profile...");
            console.log("[UserProfileForm] Update data:", updateData);

            try {
                await updateUserProfile(updateData)
                console.log("[UserProfileForm] Profile update API call successful.");
                alert("프로필이 성공적으로 업데이트되었습니다!")
                // 부모 컴포넌트나 다른 컴포넌트에 변경을 알리기 위한 이벤트
                window.dispatchEvent(new CustomEvent("profileUpdated"))
                router.refresh(); // 서버 컴포넌트 데이터를 새로고침하여 UI에 반영
            } catch (err) {
                console.error("[UserProfileForm] Failed to update profile:", err)
                setFormError("프로필 업데이트에 실패했습니다. 다시 시도해주세요.")
            }
        })
    }

    const handleDeleteAccount = () => {
        startDeleteTransition(async () => {
            setFormError(null)
            if (!confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                return
            }

            console.log("[UserProfileForm] Attempting to delete account...");
            try {
                await deleteUser();
                console.log("[UserProfileForm] Delete account API call successful.");
                await logout();
                console.log("[UserProfileForm] Logout successful after deletion.");
                alert("계정이 성공적으로 삭제되었습니다. 로그인 페이지로 이동합니다.")
                window.location.href = "/login"
            } catch (err) {
                console.error("[UserProfileForm] Failed to delete account:", err)
                setFormError("계정 삭제에 실패했습니다. 다시 시도해주세요.")
            }
        })
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.headerSection}>
                    <Button variant="ghost" onClick={() => router.back()} className={styles.backButton}>
                        <ArrowLeft className={styles.iconSmall} />
                        뒤로가기
                    </Button>
                    <h1 className={styles.title}>내 정보</h1>
                </div>

                {formError && (
                    <div className={styles.errorMessage}>
                        <p>{formError}</p>
                    </div>
                )}

                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle className={styles.cardTitle}>프로필 정보</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                        <div className={styles.profileInfo}>
                            <div className={styles.profileImageWrapper}>
                                <Avatar className={styles.profileImage}>
                                    <AvatarImage src={profileImageUrl} alt="프로필 이미지" />
                                    <AvatarFallback>
                                        <User className={styles.avatarFallbackIcon} />
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className={styles.profileDetails}>
                                <p className={styles.usernameText}>
                                    <User className={styles.iconSmall} />
                                    {userProfile.username}
                                </p>
                                <p className={styles.emailText}>
                                    <Mail className={styles.iconSmall} />
                                    {userProfile.email}
                                </p>
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
