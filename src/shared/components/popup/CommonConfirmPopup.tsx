'use client'

import { useState } from 'react'
import type { ReactElement } from 'react'
import PopupContainer from './common/PopupContainer'
import { usePopupStore } from '@/shared/hooks/store/popupStore'
import type { CommonConfirmPopupData } from '@/shared/hooks/store/popupStore'

export default function CommonConfirmPopup() {
  const [data, setData] = useState<CommonConfirmPopupData>()
  const popupStore = usePopupStore()

  let popupBody: ReactElement | null = null
  if (data) {
    const {
      title,
      content,
      buttonOneId,
      buttonOneText = '취소',
      buttonTwoId,
      buttonTwoText = '확인',
      onCancel,
      onConfirm,
    } = data

    // 취소 핸들러: 콜백이 있으면 콜백만 호출, 없으면 기본 동작(닫기)
    const handleCancel = () => {
      if (typeof onCancel === 'function') {
        onCancel()
      } else {
        popupStore.close()
      }
    }

    // 확인 핸들러: 콜백이 있으면 콜백만 호출, 없으면 기본 동작(닫기)
    const handleConfirm = () => {
      if (typeof onConfirm === 'function') {
        onConfirm()
      } else {
        popupStore.close()
      }
    }

    popupBody = (
      <>
        <div
          className="popup-background cursor-pointer"
          onClick={handleCancel}
        ></div>
        <div className="popup-container">
          <div className="popup-inner bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <div className="popup-content mb-6">
              {title && (
                <div className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {title}
                </div>
              )}
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {content}
              </div>
            </div>
            <div className="btn-group flex gap-2">
              <button
                id={buttonOneId}
                className="btn-cancel flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={handleCancel}
              >
                <span>{buttonOneText}</span>
              </button>
              <button
                id={buttonTwoId}
                className="btn-confirm flex-1 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                onClick={handleConfirm}
              >
                <span>{buttonTwoText}</span>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <PopupContainer
      popupId="commonConfirmPopup"
      setData={(data) => setData(data as CommonConfirmPopupData)}
      onVisibilityChange={(isVisible) => {
        if (!isVisible && typeof data?.onClose === 'function') {
          data.onClose()
        }
      }}
    >
      {popupBody}
    </PopupContainer>
  )
}
