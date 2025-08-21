"use client";

import { deleteDiary } from "@/lib/client-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface DiaryActionsProps {
  diaryId: string;
}

/*
* 일기 삭제 및 수정 액션
* */
export default function DiaryActions({ diaryId }: DiaryActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        await deleteDiary(diaryId);
        alert("일기가 성공적으로 삭제되었습니다."); // Success notification
        router.push("/my-diaries");
        router.refresh(); // Refresh the list page
      } catch (error) {
        console.error("Failed to delete diary:", error);
        alert("일기 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/my-diaries/${diaryId}/update`}>
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Link>
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        삭제
      </Button>
    </div>
  );
}
