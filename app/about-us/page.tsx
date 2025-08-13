import Link from "next/link"
import type { Metadata } from "next"
import styles from "@/styles/LandingHome.module.css" // 기존 랜딩 페이지 스타일 재활용

/**
 * @file app/about-us/page.tsx
 * @description About Us 페이지의 Next.js Server Component.
 *              현재는 플레이스홀더이며, 향후 애플리케이션 소개 정보를 표시할 예정입니다.
 */

export const metadata: Metadata = {
    title: "About Us - 나의 일기장",
    description: "나의 일기장 서비스에 대해 알아보세요",
}

export default function AboutUsPage() {
    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <section className={styles.heroSection}>
                    <h1 className={styles.heroTitle}>About Us</h1>
                    <p className={styles.heroDescription}>
                        나의 일기장 서비스에 대한 소개가 표시될 페이지입니다.
                        <br />
                        (현재는 개발 중입니다.)
                    </p>
                    <Link href="/" className={styles.primaryButton}>
                        홈으로 돌아가기
                    </Link>
                </section>
            </main>
        </div>
    )
}
