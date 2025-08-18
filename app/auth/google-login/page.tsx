import LoginForm from "@/components/login-form";

type PageProps = {
    searchParams?: { error?: string } };
export default function SignInPage({ searchParams }: PageProps) {
    return <LoginForm errorMessage={searchParams?.error ?? null} />;
}