'use client'

import { useRouter } from 'next/navigation'

const AdminPage = () => {
  const router = useRouter()

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          어드민
        </h1>
        <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
          재료/조합 데이터 입력 · 수정 · 삭제 UI가 들어갈 자리
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/admin/ingredient')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              재료 관리
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              재료 목록 조회 및 관리
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/recipe')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              레시피 관리
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              레시피 목록 조회 및 관리
            </p>
          </button>
        </div>
      </div>
    </main>
  )
}

export default AdminPage
