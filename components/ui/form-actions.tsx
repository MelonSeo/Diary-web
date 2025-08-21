"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="flex items-center justify-end gap-4 mt-8">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        취소
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? '저장 중...' : '일기 저장'}
      </Button>
    </div>
  );
};

export default FormActions;
