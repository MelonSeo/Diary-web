import {Metadata} from "next";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";


interface PageProps{
    searchParams: Promise<{page?: string}>
}

async function getDiaries(page: number) {
    try {
        return await api.getDiaries(page, 8);
    } catch (error) {
        console.warn("API 연결 실패, mock 데이터 사용", error);

        return {
            data: null
        }
    }
}
export default async function HomePage({searchParams}: PageProps) {
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")
    const pageNumber = await searchParams
    const currentPage = Number(pageNumber.page) || 1
    if (!token) {
        redirect("/login");
    }

    const diariesData = await getDiaries(currentPage);

    return (
        <div>
            <main>
                <div>
                    <div>
                        <h1>나의 일기</h1>
                        <p>일기를 기록해보세요.</p>
                    </div>
                </div>
            </main>
        </div>

        <DiaryList diariesData={diariesData} currentPage = {currentPage} />
    )
}