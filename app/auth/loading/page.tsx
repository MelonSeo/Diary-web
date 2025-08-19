/*
* 구글 로그인 로딩 화면
* 구글 로그인 프로세스로 바로 라우트
* */
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "@/styles/LoginForm.module.css";

export default function LoadingPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const next = sp.get("next") || "/";

    useEffect(() => {
        // finalize 경로로 이동(브라우저가 직접 응답을 받아 쿠키 저장 보장)
        router.replace(`/api/auth/google-process?next=${encodeURIComponent(next)}`);
    }, [next, router]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h1 className={styles.cardTitle}>구글 로그인 처리 중...</h1>
                    <p className={styles.cardDescription}>잠시만 기다려 주세요.</p>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            </div>
        </div>
    );
}
