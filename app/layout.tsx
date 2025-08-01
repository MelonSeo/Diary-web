import {Metadata} from "next";
import {ThemeProvider} from "../components/theme-provider";
import Header from "../components/header";
import {Inter} from "next/dist/compiled/@next/font/dist/google";
import "../styles/global.css";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "나의 일기장 - 소중한 순간들을 기록하세요",
  description: "카카오톡과 구글 로그인으로 간편하게 시작하는 개인 일기장",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
      <Header />
        {children}
      </body>
      </html>
  )
}
