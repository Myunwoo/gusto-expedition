'use client'

import { useEffect, useRef, useState } from 'react'
import { usePopupStore, type PopupInfo } from '@/shared/hooks/store/popupStore'
import { gsap } from 'gsap'

type PopupContainerProps = {
  popupId: string // 팝업 타입 ID
  setData?: (data: unknown) => void // 팝업 데이터 설정 콜백
  onVisibilityChange?: (isVisible: boolean) => void // 표시 상태 변경 콜백
  children?: React.ReactNode // 팝업 내용
  isBottomSheet?: boolean // 바텀시트 여부
}

const PopupContainer = ({
  popupId,
  children,
  setData,
  onVisibilityChange,
  isBottomSheet = false,
}: PopupContainerProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [startToHide, setStartToHide] = useState(false)
  const [curPopupInfo, setCurPopupInfo] = useState<PopupInfo | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const popupStore = usePopupStore()
  const isVisibleRef = useRef(false)

  const openPopupGsap = () => {
    if (!popupRef.current) return

    const background = popupRef.current.querySelector('.popup-background')
    const container = popupRef.current.querySelector('.popup-container')

    if (isBottomSheet) {
      // 바텀시트 애니메이션
      gsap.fromTo(
        container,
        { y: '100%', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      gsap.fromTo(
        background,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
    } else {
      // 일반 팝업 애니메이션
      gsap.fromTo(
        background,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
      gsap.fromTo(
        container,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      )
    }
  }

  const closePopupGsap = () => {
    if (!popupRef.current) return

    const background = popupRef.current.querySelector('.popup-background')
    const container = popupRef.current.querySelector('.popup-container')

    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false)
        isVisibleRef.current = false
        setCurPopupInfo(null)
      },
    })

    if (isBottomSheet) {
      // 바텀시트 애니메이션
      tl.to(container, { y: '100%', opacity: 0, duration: 0.3, ease: 'power2.in' })
      tl.to(background, { opacity: 0, duration: 0.3 }, '<')
    } else {
      // 일반 팝업 애니메이션
      tl.to(container, { scale: 0.9, opacity: 0, duration: 0.2, ease: 'power2.in' })
      tl.to(background, { opacity: 0, duration: 0.2 }, '<')
    }
  }

  // 팝업 스택 변경 감지
  useEffect(() => {
    let popupInfo: PopupInfo | null = null

    // 스택을 역순으로 검색하여 현재 팝업과 일치하는 정보 찾기
    const stack = popupStore.popupStack
    for (let i = stack.length - 1; i >= 0; i--) {
      const key = stack[i]
      const info = popupStore.popupInfoMap[key]

      if (info && info.id === popupId) {
        popupInfo = info
        break
      }
    }

    if (popupInfo) {
      // 팝업이 열려있음
      setCurPopupInfo(popupInfo)

      if (typeof setData === 'function') {
        setData(popupInfo.data) // 데이터 전달
      }

      setIsVisible(true)
      isVisibleRef.current = true
    } else {
      // 팝업이 닫혀있음
      if (!isVisibleRef.current) return
      setStartToHide(true) // 애니메이션 후 숨김
    }
  }, [popupStore.popupStack, popupStore.popupInfoMap, popupId, setData])

  // 표시 상태 변경 시 콜백 호출
  useEffect(() => {
    if (isVisible) {
      if (typeof curPopupInfo?.openCallback === 'function') {
        curPopupInfo.openCallback()
      }
      openPopupGsap() // 열기 애니메이션
    } else {
      if (typeof curPopupInfo?.closeCallback === 'function') {
        curPopupInfo.closeCallback()
      }
    }
    if (typeof onVisibilityChange === 'function') {
      onVisibilityChange(isVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, curPopupInfo, onVisibilityChange])

  // 숨김 시작 시 닫기 애니메이션
  useEffect(() => {
    if (startToHide) {
      setStartToHide(false)
      closePopupGsap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startToHide])

  return isVisible ? (
    <section ref={popupRef} className="popup">
      {children}
    </section>
  ) : null
}

export default PopupContainer
