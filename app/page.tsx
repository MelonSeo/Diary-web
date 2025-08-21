import {Metadata} from "next";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import LandingHome from "@/components/(home)/landingHome";

export default async function HomePage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")
    if (!token) {
        redirect("/login");
    }
    return <LandingHome />;
}