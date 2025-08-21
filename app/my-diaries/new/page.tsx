import NewDiaryForm from "@/components/(diary)/new-diary-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "새 일기 작성 - 나의 일기장",
    description: "새로운 일기를 작성하고 소중한 순간을 기록하세요.",
};

export default function NewDiaryPage() {
    return <NewDiaryForm />;
}