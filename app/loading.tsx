/**
 * @file app/loading.tsx
 * @description Next.js App Router의 로딩 UI 컴포넌트.
 *              `Suspense` 경계 내에서 데이터 로딩이 진행되는 동안 표시됩니다.
 *              사용자에게 페이지가 로드 중임을 시각적으로 알려주어 사용자 경험을 향상시킵니다.
 */

/**
 * @function Loading
 * @description 페이지 로딩 중 표시되는 스피너와 메시지 UI.
 *              이 컴포넌트는 Server Component이며, 자동으로 Suspense 폴백으로 사용됩니다.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                {/* 로딩 스피너 */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                {/* 로딩 메시지 */}
                <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
            </div>
        </div>
    )
}
