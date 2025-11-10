import {Metadata} from "next";
import "../styles/global.css";
import Script from "next/script";
import {Inter} from "next/font/google";
import HeaderWrapper from "@/components/(home)/header-wrapper";
import React from "react";
import AnimatedBackground from "@/components/(home)/animated-background";



const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: "나의 일기장 - 소중한 순간들을 기록하세요",
  description: "카카오톡과 구글 로그인으로 간편하게 시작하는 개인 일기장",
  verification: {
    google: "htCk4iYR67b62O53ATJ_8HqiRdRdipaI2cng0gRC42Q",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
      <AnimatedBackground>
        
        <HeaderWrapper />
        <main>{children}</main>
      </AnimatedBackground>
      <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"
              integrity="sha384-dok87au0gKqJdxs7msEdBPNnKSRT+/mhTVzq+qOhcL464zXwvcrpjeWvyj1kCdq6"
              crossOrigin="anonymous"></Script>
      </body>
      </html>
  )
}
