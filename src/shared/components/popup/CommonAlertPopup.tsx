'use client'

import { useState } from 'react'
import type { ReactElement } from 'react'
import PopupContainer from './common/PopupContainer'
import { usePopupStore } from '@/shared/hooks/store/popupStore'
import type { CommonAlertPopupData } from '@/shared/hooks/store/popupStore'

export default function CommonAlertPopup() {
  const [data, setData] = useState<CommonAlertPopupData>()
  const popupStore = usePopupStore()

  let popupBody: ReactElement | null = null
  if (data) {
    const {
      title,
      content,
      buttonText = '확인',
      onConfirm,
    } = data

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
        <div className="popup-background"></div>
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
            <div className="btn-group flex justify-end">
              <button
                onClick={handleConfirm}
                className="btn-confirm px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <PopupContainer
      popupId="commonAlertPopup"
      setData={(data) => setData(data as CommonAlertPopupData)}
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
