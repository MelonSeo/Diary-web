/*
* 비활성화
* 구글 로그인 시 로그인 페이지로 대체
* */

import LoginForm from "@/components/login-form";

type PageProps = {
    searchParams?: { error?: string } };
export default function SignInPage({ searchParams }: PageProps) {
    return <LoginForm errorMessage={searchParams?.error ?? null} />;
}