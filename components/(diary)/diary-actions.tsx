"use client";

import { deleteDiary } from "@/lib/client-api";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import styles from "@/styles/DiaryActions.module.css"; // Import the new CSS module

interface DiaryActionsProps {
  diaryId: string;
}

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
    <div className={styles.actionsContainer}>
      <Link href={`/my-diaries/${diaryId}/update`} className={styles.editButton}>
        <Pencil className={styles.buttonIcon} />
        수정
      </Link>
      <button type="button" onClick={handleDelete} className={styles.deleteButton}>
        <Trash2 className={styles.buttonIcon} />
        삭제
      </button>
    </div>
  );
}