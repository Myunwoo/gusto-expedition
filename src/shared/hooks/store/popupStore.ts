import { create } from 'zustand'
import { hashParam } from '@/shared/utils/hashParam.helper'
import { waitForHashChange } from '@/shared/utils/misc.helper'

// 팝업 데이터 타입 맵 (각 팝업 타입별 데이터 구조 정의)
type PopupDataMap = {
  commonAlertPopup: CommonAlertPopupData
  commonConfirmPopup: CommonConfirmPopupData
  zipCodeSrchPopup: ZipCodeSrchPopupData
  ingredientSelectPopup: IngredientSelectPopupData
  // 다른 팝업 타입들을 여기에 추가
}

// 공통 팝업 정보 구조
type BasePopupInfoShared = {
  instanceId?: string
  addHashYn?: 'Y' | 'N'
  openCallback?: () => void
  closeCallback?: () => void
}

// 알려진 팝업 타입 (타입 안전)
export type KnownPopupInfo = {
  [K in keyof PopupDataMap]: {
    id: K
    data?: PopupDataMap[K]
  } & BasePopupInfoShared
}[keyof PopupDataMap]

// 알 수 없는 팝업 타입 (확장성)
export type UnknownPopupInfo = {
  id: Exclude<string, keyof PopupDataMap>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
} & BasePopupInfoShared

// 팝업 정보 파라미터 (열 때 사용)
export type PopupInfoParam = KnownPopupInfo | UnknownPopupInfo

// 실제 팝업 정보 (스토어에 저장되는 형태)
export type PopupInfo = PopupInfoParam & {
  instanceId: string // 필수
  addHashYn: string // 필수
}

// 스토어 상태
export type PopupStoreState = {
  popupStack: string[] // 인스턴스 ID 배열
  popupInfoMap: Record<string, PopupInfo> // 인스턴스 ID -> 팝업 정보
}

// 스토어 액션
export type PopupStoreAction = {
  open: (popupInfo: PopupInfoParam) => Promise<void>
  close: (closeParam?: { instanceId?: string }) => Promise<void>
  closeAll: () => Promise<void>
  get: (instanceId: string) => PopupInfo | undefined
  handleHashChange: () => void
}

export type PopupStore = PopupStoreState & PopupStoreAction

export const POPUP_HASH_KEY = 'popupId'

// 팝업 데이터 타입 정의
export type CommonAlertPopupData = {
  title?: string
  content: string
  buttonText?: string
  onConfirm?: () => void
  onClose?: () => void
}

export type CommonConfirmPopupData = {
  title?: string
  content: string
  buttonOneId?: string
  buttonOneText?: string
  buttonTwoId?: string
  buttonTwoText?: string
  onCancel?: () => void
  onConfirm?: () => void
  onClose?: () => void
}

export type ZipCodeSrchPopupData = {
  selectCallback?: (zip: string, address: string) => void
}

export type IngredientSelectPopupData = {
  onSelect: (ingredient: { ingredientId: number; name: string; isActive: boolean }) => void
}

// 보조 함수: 팝업 정보 삭제
const deletePopupInfoAfter = (
  targetId: string | undefined, // 이 ID 이후의 팝업들을 삭제
  popupStack: string[],
  popupInfoMap: Record<string, PopupInfo>,
  doNotCloseNoHashPopups?: boolean // 해시 없는 팝업 유지 여부
) => {
  const popupIdx = targetId ? popupStack.indexOf(targetId) : -1

  if (doNotCloseNoHashPopups ?? popupIdx > -1) {
    const stack = [...popupStack]
    const newStack = stack.splice(0, popupIdx + 1) // 타겟까지 유지

    let hashPopupFound = false

    // 이후 스택의 팝업 삭제
    stack.forEach((instanceId) => {
      const popupInfo = popupInfoMap[instanceId]
      if (!popupInfo) return

      if (doNotCloseNoHashPopups) {
        // 해시 없는 팝업은 유지 (해시 팝업 위에 있는 경우)
        if (!hashPopupFound && popupInfo.addHashYn === 'N') {
          newStack.push(instanceId)
          return
        }
        if (popupInfo.addHashYn === 'Y') hashPopupFound = true
      }

      delete popupInfoMap[instanceId]
    })

    return {
      popupStack: newStack,
      popupInfoMap: { ...popupInfoMap },
    }
  }

  return {
    popupStack: [],
    popupInfoMap: {},
  }
}

// 팝업 스토어 생성
export const usePopupStore = create<PopupStore>((set, get) => ({
  popupStack: [],
  popupInfoMap: {},

  open: async (popupInfoParam) => {
    // 1. 기본값 설정
    const popupInfo: PopupInfo = {
      ...popupInfoParam,
      instanceId: popupInfoParam.instanceId ?? popupInfoParam.id,
      addHashYn: popupInfoParam.addHashYn ?? 'Y',
    }

    // 2. 스토어 상태 업데이트
    set((state) => {
      const popupInfoMap = { ...state.popupInfoMap }

      // 이미 열려있는 같은 인스턴스가 있으면 스택에서 제거 (중복 방지)
      const popupStack = state.popupStack.filter(
        (instanceId) => instanceId !== popupInfo.instanceId
      )

      // 팝업 정보 저장
      popupInfoMap[popupInfo.instanceId] = popupInfo

      return {
        ...state,
        popupStack: [...popupStack, popupInfo.instanceId], // 스택에 추가
        popupInfoMap,
      }
    })

    // 3. 해시 추가 (addHashYn === 'Y'이고, 이미 해시에 없을 때만)
    if (
      popupInfo.addHashYn === 'Y' &&
      hashParam.get(POPUP_HASH_KEY)?.split(',').pop() !== popupInfo.instanceId
    ) {
      await waitForHashChange(() => {
        const curHashParam = hashParam.get(POPUP_HASH_KEY)

        let newHash = popupInfo.instanceId
        if (curHashParam) {
          // 기존 해시가 있으면 콤마로 연결
          newHash = `${curHashParam},${newHash}`
        }
        hashParam.set(POPUP_HASH_KEY, newHash)
      })
    }
  },

  close: async (closeParam) => {
    const state = get()

    // 닫을 팝업 인스턴스 ID 결정 (지정 안 하면 마지막 팝업)
    const targetInstanceId =
      (closeParam && closeParam.instanceId) ??
      state.popupStack[state.popupStack.length - 1]

    if (!targetInstanceId) return

    const targetPopupInfo = state.popupInfoMap[targetInstanceId]
    const popupIdx = state.popupStack.indexOf(targetInstanceId)
    const closeAfter = state.popupStack[popupIdx - 1] // 닫은 후 남을 팝업

    // 타겟 팝업과 그 이후 팝업들 제거
    const { popupStack, popupInfoMap } = deletePopupInfoAfter(
      closeAfter,
      state.popupStack,
      state.popupInfoMap
    )

    set((state) => ({
      ...state,
      popupStack,
      popupInfoMap,
    }))

    // 해시가 있는 팝업이면 브라우저 뒤로가기로 해시 제거
    if (
      targetPopupInfo?.addHashYn === 'Y' &&
      hashParam.get(POPUP_HASH_KEY)?.split(',').pop() === targetInstanceId
    ) {
      await waitForHashChange(() => {
        history.back()
      })
    }
  },

  closeAll: async () => {
    set((state) => ({
      ...state,
      popupStack: [],
      popupInfoMap: {},
    }))
  },

  get: (instanceId: string) => {
    return get().popupInfoMap[instanceId]
  },

  handleHashChange: () => {
    const state = get()

    // 현재 해시에서 마지막 팝업 ID 추출
    const lastPopupInstanceId = hashParam
      .get(POPUP_HASH_KEY)
      ?.split(',')
      .pop()

    // 해시에 없는 팝업들은 모두 닫음
    const { popupStack, popupInfoMap } = deletePopupInfoAfter(
      lastPopupInstanceId,
      state.popupStack,
      state.popupInfoMap,
      true // doNotCloseNoHashPopups: 해시 없는 팝업은 유지
    )

    set((state) => ({
      ...state,
      popupStack,
      popupInfoMap,
    }))
  },
}))

// 해시 변경 이벤트 리스너 등록
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    usePopupStore.getState().handleHashChange()
  })
}
