'use client'

import { usePopupStore } from '@/shared/hooks/store/popupStore'

export default function PopupDemoPage() {
  const popupStore = usePopupStore()

  const handleOpenBasicAlert = () => {
    popupStore.open({
      id: 'commonAlertPopup',
      data: {
        title: '기본 알림',
        content: '이것은 기본 알림 팝업입니다.',
        buttonText: '확인',
        onConfirm: () => {
          console.log('확인 버튼 클릭됨')
        },
      },
    })
  }

  const handleOpenSuccessAlert = () => {
    popupStore.open({
      id: 'commonAlertPopup',
      data: {
        title: '성공',
        content: '작업이 성공적으로 완료되었습니다!',
        buttonText: '확인',
        onConfirm: () => {
          console.log('성공 알림 확인')
        },
      },
    })
  }

  const handleOpenErrorAlert = () => {
    popupStore.open({
      id: 'commonAlertPopup',
      data: {
        title: '오류',
        content: '오류가 발생했습니다. 다시 시도해주세요.',
        buttonText: '확인',
        onConfirm: () => {
          console.log('오류 알림 확인')
        },
      },
    })
  }

  const handleOpenNoHashAlert = () => {
    popupStore.open({
      id: 'commonAlertPopup',
      addHashYn: 'N', // URL 해시에 추가하지 않음
      data: {
        title: '해시 없는 팝업',
        content: '이 팝업은 브라우저 뒤로가기로 닫히지 않습니다.',
        buttonText: '확인',
      },
    })
  }

  const handleOpenMultiplePopups = () => {
    // 첫 번째 팝업
    popupStore.open({
      id: 'commonAlertPopup',
      instanceId: 'popup-1',
      data: {
        title: '첫 번째 팝업',
        content: '이것은 첫 번째 팝업입니다.',
        buttonText: '다음',
        onConfirm: () => {
          // 두 번째 팝업 열기
          popupStore.open({
            id: 'commonAlertPopup',
            instanceId: 'popup-2',
            data: {
              title: '두 번째 팝업',
              content: '이것은 두 번째 팝업입니다. 뒤로가기로 첫 번째 팝업으로 돌아갈 수 있습니다.',
              buttonText: '확인',
            },
          })
        },
      },
    })
  }

  const handleOpenWithCallbacks = () => {
    popupStore.open({
      id: 'commonAlertPopup',
      data: {
        title: '콜백 테스트',
        content: '이 팝업은 열릴 때와 닫힐 때 콜백을 호출합니다.',
        buttonText: '확인',
      },
      openCallback: () => {
        console.log('팝업이 열렸습니다!')
        alert('팝업이 열렸습니다! (콘솔도 확인해보세요)')
      },
      closeCallback: () => {
        console.log('팝업이 닫혔습니다!')
      },
    })
  }

  const handleOpenConfirm = () => {
    popupStore.open({
      id: 'commonConfirmPopup',
      data: {
        title: '확인',
        content: '이 작업을 진행하시겠습니까?',
        buttonOneText: '취소',
        buttonTwoText: '확인',
        onCancel: () => {
          console.log('취소 버튼 클릭됨')
        },
        onConfirm: () => {
          popupStore.close()
            // console.log('확인 버튼 클릭됨')
            // popupStore.open({
            //   id: 'commonAlertPopup',
            //   data: {
            //     title: '완료',
            //     content: '작업이 완료되었습니다.',
            //     buttonText: '확인',
            //   },
            // })
        },
      },
    })
  }

  const handleOpenDeleteConfirm = () => {
    popupStore.open({
      id: 'commonConfirmPopup',
      data: {
        title: '삭제 확인',
        content: '정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
        buttonOneText: '취소',
        buttonTwoText: '삭제',
        onCancel: () => {
          console.log('삭제 취소')
        },
        onConfirm: () => {
          console.log('삭제 확인')
          popupStore.open({
            id: 'commonAlertPopup',
            data: {
              title: '삭제 완료',
              content: '항목이 삭제되었습니다.',
              buttonText: '확인',
            },
          })
        },
      },
    })
  }

  const handleOpenCustomButtonConfirm = () => {
    popupStore.open({
      id: 'commonConfirmPopup',
      data: {
        title: '커스텀 버튼',
        content: '버튼 텍스트와 ID를 커스터마이징할 수 있습니다.',
        buttonOneId: 'custom-cancel-btn',
        buttonOneText: '아니오',
        buttonTwoId: 'custom-confirm-btn',
        buttonTwoText: '예',
        onCancel: () => {
          console.log('아니오 클릭')
        },
        onConfirm: () => {
          console.log('예 클릭')
        },
      },
    })
  }

  const handleCloseAll = () => {
    popupStore.closeAll()
  }

  return (
    <main className="min-h-dvh p-8">
      <h1 className="text-3xl font-bold mb-2">팝업 시스템 데모</h1>
      <p className="text-sm opacity-80 mb-8">
        Popup.md 문서를 기반으로 구현한 팝업 아키텍처 테스트 페이지
      </p>

      <div className="space-y-4 max-w-2xl">
        <section className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Alert 팝업</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenBasicAlert}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              기본 알림
            </button>
            <button
              onClick={handleOpenSuccessAlert}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              성공 알림
            </button>
            <button
              onClick={handleOpenErrorAlert}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              오류 알림
            </button>
          </div>
        </section>

        <section className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Confirm 팝업</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenConfirm}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              기본 확인
            </button>
            <button
              onClick={handleOpenDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제 확인
            </button>
            <button
              onClick={handleOpenCustomButtonConfirm}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              커스텀 버튼
            </button>
          </div>
        </section>

        <section className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">고급 기능</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenNoHashAlert}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              해시 없는 팝업
            </button>
            <button
              onClick={handleOpenMultiplePopups}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              중첩 팝업
            </button>
            <button
              onClick={handleOpenWithCallbacks}
              className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              콜백 테스트
            </button>
          </div>
        </section>

        <section className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">제어</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCloseAll}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              모든 팝업 닫기
            </button>
          </div>
        </section>

        <section className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-4">사용 방법</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>
              <strong>Alert 팝업:</strong> 단일 버튼으로 확인만 가능한 알림 팝업입니다.
            </li>
            <li>
              <strong>Confirm 팝업:</strong> 취소/확인 두 개의 버튼이 있는 확인 팝업입니다.
            </li>
            <li>
              <strong>해시 없는 팝업:</strong> URL 해시에 추가되지 않아 브라우저
              뒤로가기로 닫히지 않습니다.
            </li>
            <li>
              <strong>중첩 팝업:</strong> 여러 팝업을 순서대로 열 수 있습니다.
              브라우저 뒤로가기로 이전 팝업으로 돌아갈 수 있습니다.
            </li>
            <li>
              <strong>콜백 테스트:</strong> 팝업이 열리고 닫힐 때 콜백 함수가
              호출됩니다.
            </li>
            <li>
              <strong>브라우저 뒤로가기:</strong> 해시가 있는 팝업은 브라우저
              뒤로가기 버튼으로 닫을 수 있습니다.
            </li>
          </ul>
        </section>

        <section className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-xl font-semibold mb-4">현재 상태</h2>
          <div className="text-sm space-y-2">
            <p>
              <strong>열린 팝업 수:</strong>{' '}
              {popupStore.popupStack.length}
            </p>
            <p>
              <strong>URL 해시:</strong>{' '}
              {typeof window !== 'undefined' ? window.location.hash || '(없음)' : '(서버)'}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
