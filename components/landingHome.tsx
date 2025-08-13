import styles from "@/styles/LandingHome.module.css";
import Link from "next/link";
import {Plus} from "lucide-react";


export default function LandingHome() {
    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <section className={styles.heroSection}>
                    <h1 className={styles.heroTitle}>
                        당신의 모든 순간을 <br className={styles.desktopBr} />
                        기록하고 기억하세요
                    </h1>
                    <p className={styles.heroDescription}>
                        나의 일기장은 당신의 소중한 생각과 경험을 안전하게 보관하고,
                        <br className={styles.desktopBr} />
                        언제든 다시 꺼내볼 수 있도록 돕는 개인 일기장입니다.
                    </p>
                    <div className={styles.ctaButtons}>
                        <Link href="/diary/new" className={styles.primaryButton}>
                            <Plus className={styles.buttonIcon} />새 일기 작성
                        </Link>
                        <Link href="/my-diaries" className={styles.secondaryButton}>
                            내 일기장 목록 보기
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    )
}