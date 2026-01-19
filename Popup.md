# 팝업 시스템 아키텍처 가이드

이 문서는 React 프로젝트에서 Zustand 기반의 팝업 관리 시스템을 구현하는 방법을 설명합니다. 팝업의 열기/닫기, 해시 관리, 브라우저 히스토리 연동 등을 포함합니다.

## 목차

1. [시스템 개요](#시스템-개요)
2. [핵심 개념](#핵심-개념)
3. [파일 구조](#파일-구조)
4. [구현 상세](#구현-상세)
5. [사용 방법](#사용-방법)
6. [데이터 관리 방식](#데이터-관리-방식)
7. [해시 관리 메커니즘](#해시-관리-메커니즘)
8. [적용 가이드](#적용-가이드)

---

## 시스템 개요

이 팝업 시스템은 다음과 같은 특징을 가집니다:

- **Zustand 기반 상태 관리**: 전역 팝업 상태를 Zustand 스토어로 관리
- **스택 기반 팝업 관리**: 여러 팝업을 순서대로 관리하는 스택 구조
- **URL 해시 연동**: 브라우저 뒤로가기/앞으로가기 지원
- **타입 안전성**: TypeScript로 팝업 데이터 타입 정의
- **애니메이션 지원**: GSAP 기반 팝업 열기/닫기 애니메이션

### 주요 장점

1. **브라우저 히스토리 연동**: 뒤로가기 버튼으로 팝업 닫기 가능
2. **중첩 팝업 지원**: 여러 팝업을 동시에 관리 가능
3. **해시 선택적 사용**: 필요에 따라 URL 해시 추가 여부 제어
4. **타입 안전성**: TypeScript로 팝업 데이터 타입 보장

---

## 핵심 개념

### 1. 팝업 스택 (Popup Stack)

열린 팝업의 순서를 관리하는 배열입니다. 가장 최근에 열린 팝업이 스택의 마지막에 위치합니다.

```typescript
popupStack: ['popup1', 'popup2', 'popup3']  // popup3가 가장 최근에 열린 팝업
```

### 2. 팝업 정보 맵 (Popup Info Map)

각 팝업 인스턴스의 상세 정보를 저장하는 객체입니다.

```typescript
popupInfoMap: {
  'popup1': { id: 'alert', data: {...}, instanceId: 'popup1', addHashYn: 'Y' },
  'popup2': { id: 'confirm', data: {...}, instanceId: 'popup2', addHashYn: 'Y' }
}
```

### 3. 인스턴스 ID vs 팝업 ID

- **팝업 ID (`id`)**: 팝업의 타입을 식별 (예: `'commonAlertPopup'`)
- **인스턴스 ID (`instanceId`)**: 팝업의 고유 인스턴스 식별자 (기본값: `id`와 동일, 필요시 별도 지정 가능)

같은 타입의 팝업을 여러 개 열 수 있도록 인스턴스 ID를 사용합니다.

### 4. 해시 파라미터

URL 해시에 팝업 상태를 저장하여 브라우저 히스토리와 연동합니다.

```
#popupId=popup1,popup2,popup3
```

여러 팝업이 열려있을 때 콤마(`,`)로 구분하여 저장합니다.

---

## 파일 구조

```
src/
├── common/
│   ├── hooks/
│   │   └── store/
│   │       └── popupStore.ts          # Zustand 팝업 스토어
│   ├── components/
│   │   └── popup/
│   │       ├── common/
│   │       │   └── PopupContainer.tsx # 팝업 컨테이너 컴포넌트
│   │       └── CommonAlertPopup.tsx    # 실제 팝업 컴포넌트 예시
│   └── utils/
│       ├── hashParam.helper.ts         # 해시 파라미터 유틸리티
│       └── misc.helper.tsx             # waitForHashChange 유틸리티
```

---

## 구현 상세

### 1. 해시 파라미터 유틸리티 (`hashParam.helper.ts`)

URL 해시를 파라미터 형태로 관리하는 유틸리티입니다.

```typescript
export const hashParam = {
  get(key: string): string | null {
    return new URLSearchParams(location.hash.slice(1)).get(key)
  },

  set(key: string, value: string): void {
    const params = new URLSearchParams(location.hash.slice(1))
    params.set(key, value)
    this._update(params)
  },

  remove(key: string): void {
    const params = new URLSearchParams(location.hash.slice(1))
    params.delete(key)
    this._update(params)
  },

  getAll(): Record<string, string> {
    const params = new URLSearchParams(location.hash.slice(1))
    const result: Record<string, string> = {}
    for (const [key, value] of params.entries()) {
      result[key] = value
    }
    return result
  },

  _update(params: URLSearchParams): void {
    const newHash = params.toString()
    location.hash = newHash ? `#${newHash}` : ''
  },
}
```

**사용 예시:**
```typescript
// 해시 읽기
const popupId = hashParam.get('popupId')  // "popup1,popup2"

// 해시 설정
hashParam.set('popupId', 'popup1,popup2,popup3')

// 해시 제거
hashParam.remove('popupId')
```

### 2. 해시 변경 대기 유틸리티 (`misc.helper.tsx`)

해시 변경을 비동기로 감지하는 유틸리티입니다.

```typescript
export const waitForHashChange = async (func: () => void) => {
  const currentHash = window.location.hash

  func()  // 해시 변경 함수 실행
  return await new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (window.location.hash !== currentHash) {
        clearInterval(intervalId)
        resolve(true)
      }
    }, 100)  // 100ms마다 체크
  })
}
```

**사용 목적:**
- `history.back()` 호출 후 해시가 실제로 변경될 때까지 대기
- 해시 변경이 완료된 후 다음 로직 실행 보장

### 3. 팝업 스토어 (`popupStore.ts`)

#### 타입 정의

```typescript
// 팝업 데이터 타입 맵 (각 팝업 타입별 데이터 구조 정의)
type PopupDataMap = {
  commonAlertPopup: CommonAlertPopupData
  commonConfirmPopup: ConfirmPopupData
  // ... 다른 팝업 타입들
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
  data?: any
} & BasePopupInfoShared

// 팝업 정보 파라미터 (열 때 사용)
export type PopupInfoParam = KnownPopupInfo | UnknownPopupInfo

// 실제 팝업 정보 (스토어에 저장되는 형태)
export type PopupInfo = PopupInfoParam & {
  instanceId: string  // 필수
  addHashYn: string   // 필수
}

// 스토어 상태
export type PopupStoreState = {
  popupStack: string[]  // 인스턴스 ID 배열
  popupInfoMap: Record<string, PopupInfo>  // 인스턴스 ID -> 팝업 정보
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
```

#### 핵심 로직: 팝업 열기

```typescript
open: async(popupInfoParam) => {
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
      popupStack: [...popupStack, popupInfo.instanceId],  // 스택에 추가
      popupInfoMap,
    }
  })

  // 3. 해시 추가 (addHashYn === 'Y'이고, 이미 해시에 없을 때만)
  if (
    popupInfo.addHashYn === 'Y' && 
    hashParam.get(POPUP_HASH_KEY)?.split(',').pop() !== popupInfo.instanceId
  ) {
    return await waitForHashChange(() => {
      const curHashParam = hashParam.get(POPUP_HASH_KEY)
      
      let newHash = popupInfo.instanceId
      if (curHashParam) {
        // 기존 해시가 있으면 콤마로 연결
        newHash = `${curHashParam},${newHash}`
      }
      hashParam.set(POPUP_HASH_KEY, newHash)
    })
  }
}
```

**동작 흐름:**
1. 팝업 정보를 스택과 맵에 추가
2. 해시 사용 여부 확인 (`addHashYn`)
3. 해시에 추가 (기존 해시가 있으면 콤마로 연결)

#### 핵심 로직: 팝업 닫기

```typescript
close: async(closeParam) => {
  const state = get()
  
  // 닫을 팝업 인스턴스 ID 결정 (지정 안 하면 마지막 팝업)
  const targetInstanceId = 
    (closeParam && closeParam.instanceId) ?? 
    state.popupStack[state.popupStack.length - 1]
  
  const targetPopupInfo = state.popupInfoMap[targetInstanceId]
  const popupIdx = state.popupStack.indexOf(targetInstanceId)
  const closeAfter = state.popupStack[popupIdx - 1]  // 닫은 후 남을 팝업

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
}
```

**동작 흐름:**
1. 닫을 팝업 결정 (지정 안 하면 마지막 팝업)
2. 타겟 팝업과 그 이후 팝업들을 스택에서 제거
3. 해시가 있으면 `history.back()`으로 해시 제거

#### 핵심 로직: 해시 변경 감지

```typescript
handleHashChange: () => {
  const state = get()
  
  // 현재 해시에서 마지막 팝업 ID 추출
  const lastPopupInstanceId = hashParam.get(POPUP_HASH_KEY)?.split(',').pop()

  // 해시에 없는 팝업들은 모두 닫음
  const { popupStack, popupInfoMap } = deletePopupInfoAfter(
    lastPopupInstanceId,
    state.popupStack,
    state.popupInfoMap,
    true  // doNotCloseNoHashPopups: 해시 없는 팝업은 유지
  )
  
  set((state) => ({
    ...state,
    popupStack,
    popupInfoMap,
  }))
}
```

**동작 흐름:**
1. 브라우저 뒤로가기/앞으로가기로 해시 변경 감지
2. 현재 해시에 없는 팝업들을 자동으로 닫음
3. 해시 없는 팝업(`addHashYn === 'N'`)은 유지

#### 보조 함수: 팝업 정보 삭제

```typescript
const deletePopupInfoAfter = (
  targetId: string | undefined,  // 이 ID 이후의 팝업들을 삭제
  popupStack: string[],
  popupInfoMap: Record<string, PopupInfo>,
  doNotCloseNoHashPopups?: boolean  // 해시 없는 팝업 유지 여부
) => {
  const popupIdx = targetId ? popupStack.indexOf(targetId) : -1

  if (doNotCloseNoHashPopups ?? popupIdx > -1) {
    const stack = [...popupStack]
    const newStack = stack.splice(0, popupIdx + 1)  // 타겟까지 유지

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
      popupInfoMap,
    }
  }
  
  return {
    popupStack: [],
    popupInfoMap: {},
  }
}
```

**특징:**
- `doNotCloseNoHashPopups === true`일 때, 해시 없는 팝업은 유지
- 해시 팝업 위에 있는 해시 없는 팝업은 보존

#### 해시 변경 이벤트 리스너 등록

```typescript
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', popupStore.getState().handleHashChange)
}
```

---

### 4. PopupContainer 컴포넌트 (`PopupContainer.tsx`)

팝업을 감싸는 컨테이너 컴포넌트로, 스토어 상태를 구독하여 팝업을 표시/숨김 처리합니다.

#### Props

```typescript
type PopupContainerProps = {
  popupId: string              // 팝업 타입 ID
  setData?: (data: any) => void // 팝업 데이터 설정 콜백
  onVisibilityChange?: (isVisible: boolean) => void  // 표시 상태 변경 콜백
  children?: React.ReactNode    // 팝업 내용
  isBottomSheet?: boolean      // 바텀시트 여부
}
```

#### 핵심 로직

```typescript
const PopupContainer = ({ popupId, children, setData, onVisibilityChange, isBottomSheet }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [startToHide, setStartToHide] = useState(false)
  const [curPopupInfo, setCurPopupInfo] = useState<PopupInfo | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const popupStore = usePopupStore()

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
        setData(popupInfo.data)  // 데이터 전달
      }
      
      setIsVisible(true)
    } else {
      // 팝업이 닫혀있음
      if (!isVisibleRef.current) return
      setStartToHide(true)  // 애니메이션 후 숨김
    }
  }, [popupStore.popupStack])

  // 표시 상태 변경 시 콜백 호출
  useEffect(() => {
    if (isVisible) {
      if (typeof curPopupInfo?.openCallback === 'function') {
        curPopupInfo.openCallback()
      }
      openPopupGsap()  // 열기 애니메이션
    } else {
      if (typeof curPopupInfo?.closeCallback === 'function') {
        curPopupInfo.closeCallback()
      }
    }
  }, [isVisible])

  // 숨김 시작 시 닫기 애니메이션
  useEffect(() => {
    if (startToHide) {
      setStartToHide(false)
      closePopupGsap()
    }
  }, [startToHide])

  // ... GSAP 애니메이션 함수들 ...

  return isVisible ? <section ref={popupRef}>{children}</section> : null
}
```

**동작 흐름:**
1. `popupStack` 변경 감지
2. 스택에서 현재 `popupId`와 일치하는 팝업 정보 검색
3. 찾으면 `setData`로 데이터 전달하고 표시
4. 없으면 애니메이션 후 숨김

---

## 사용 방법

### 1. 팝업 컴포넌트 생성

```typescript
// CommonAlertPopup.tsx
import React, { useState } from 'react'
import PopupContainer from './common/PopupContainer'
import popupStore from '../../hooks/store/popupStore'

// 팝업 데이터 타입 정의
export type CommonAlertPopupData = {
  title?: string
  content: string
  buttonText?: string
  onConfirm?: () => void
  onClose?: () => void
}

export default () => {
  const [data, setData] = useState<CommonAlertPopupData>()

  let popupBody: JSX.Element | null = null
  if (data) {
    const { title, content, buttonText = '확인', onConfirm = () => {} } = data

    popupBody = (
      <div className="popup popup-custom">
        <div className="popup-background"></div>
        <div className="popup-container">
          <div className="popup-inner">
            <div className="popup-content">
              {title && <div className="txt-title">{title}</div>}
              <div className="txt-sub">{content}</div>
            </div>
            <div className="btn-group">
              <button
                onClick={() => {
                  popupStore.getState().close()
                  onConfirm()
                }}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PopupContainer
      popupId="commonAlertPopup"
      setData={setData}
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
```

### 2. 팝업 열기

```typescript
import popupStore from './hooks/store/popupStore'

// 기본 사용
popupStore.getState().open({
  id: 'commonAlertPopup',
  data: {
    title: '알림',
    content: '메시지 내용',
    buttonText: '확인',
    onConfirm: () => {
      console.log('확인 버튼 클릭')
    }
  }
})

// 해시 없이 열기
popupStore.getState().open({
  id: 'commonAlertPopup',
  addHashYn: 'N',  // URL 해시에 추가하지 않음
  data: { ... }
})

// 고유 인스턴스 ID 지정 (같은 타입 팝업 여러 개 열기)
popupStore.getState().open({
  id: 'commonAlertPopup',
  instanceId: 'alert-1',  // 고유 ID 지정
  data: { ... }
})

// 콜백 함수 지정
popupStore.getState().open({
  id: 'commonAlertPopup',
  data: { ... },
  openCallback: () => {
    console.log('팝업이 열렸습니다')
  },
  closeCallback: () => {
    console.log('팝업이 닫혔습니다')
  }
})
```

### 3. 팝업 닫기

```typescript
// 마지막 팝업 닫기
popupStore.getState().close()

// 특정 팝업 닫기
popupStore.getState().close({ instanceId: 'alert-1' })

// 모든 팝업 닫기
popupStore.getState().closeAll()
```

### 4. 팝업 정보 조회

```typescript
const popupInfo = popupStore.getState().get('alert-1')
console.log(popupInfo?.data)
```

---

## 데이터 관리 방식

### 데이터 흐름

```
1. popupStore.open({ id: 'alert', data: {...} })
   ↓
2. popupStore.popupInfoMap[instanceId] = { id: 'alert', data: {...} }
   ↓
3. PopupContainer가 popupStack 변경 감지
   ↓
4. popupInfo.data를 찾아서 setData(popupInfo.data) 호출
   ↓
5. 팝업 컴포넌트의 useState가 업데이트되어 리렌더링
```

### 핵심 포인트

1. **데이터는 스토어에 저장**: 팝업 데이터는 `popupInfoMap`에 저장됩니다.
2. **setData 콜백으로 전달**: `PopupContainer`가 `setData` 콜백을 통해 데이터를 팝업 컴포넌트에 전달합니다.
3. **스택 기반 검색**: 같은 타입의 팝업이 여러 개 열려있을 때, 스택을 역순으로 검색하여 가장 최근 인스턴스의 데이터를 사용합니다.

### 데이터 업데이트 예시

```typescript
// 팝업 열 때 데이터 전달
popupStore.getState().open({
  id: 'commonAlertPopup',
  data: { content: '초기 메시지' }
})

// 같은 인스턴스로 다시 열면 데이터 업데이트
popupStore.getState().open({
  id: 'commonAlertPopup',
  instanceId: 'same-instance',  // 같은 인스턴스 ID
  data: { content: '업데이트된 메시지' }
})
```

---

## 해시 관리 메커니즘

### 해시 형식

```
#popupId=instance1,instance2,instance3
```

- 키: `popupId` (상수)
- 값: 콤마로 구분된 인스턴스 ID 목록
- 순서: 가장 오래된 팝업부터 최신 팝업 순서

### 해시 추가 조건

```typescript
if (
  popupInfo.addHashYn === 'Y' &&  // 해시 사용 여부
  hashParam.get(POPUP_HASH_KEY)?.split(',').pop() !== popupInfo.instanceId  // 중복 방지
) {
  // 해시 추가
}
```

### 해시 제거 조건

```typescript
if (
  targetPopupInfo?.addHashYn === 'Y' &&  // 해시 사용 팝업
  hashParam.get(POPUP_HASH_KEY)?.split(',').pop() === targetInstanceId  // 마지막 팝업
) {
  history.back()  // 브라우저 뒤로가기로 해시 제거
}
```

### 브라우저 히스토리 연동

1. **뒤로가기**: 해시가 제거되면 `handleHashChange`가 호출되어 해당 팝업이 닫힘
2. **앞으로가기**: 해시가 추가되면 해당 팝업이 다시 열림 (구현 필요 시)

### 해시 없는 팝업의 역할

- `addHashYn === 'N'`: URL 해시에 추가하지 않음
- 해시 변경 시에도 유지됨 (임시 알림 등에 유용)
- 브라우저 뒤로가기로 닫히지 않음

---

## 적용 가이드

### 1단계: 의존성 설치

```bash
npm install zustand gsap
# 또는
yarn add zustand gsap
```

### 2단계: 파일 생성

1. `src/utils/hashParam.helper.ts` - 해시 파라미터 유틸리티
2. `src/utils/misc.helper.tsx` - `waitForHashChange` 유틸리티
3. `src/hooks/store/popupStore.ts` - 팝업 스토어
4. `src/components/popup/common/PopupContainer.tsx` - 팝업 컨테이너

### 3단계: 타입 정의

`popupStore.ts`에서 `PopupDataMap`에 팝업 타입 추가:

```typescript
type PopupDataMap = {
  commonAlertPopup: CommonAlertPopupData
  commonConfirmPopup: ConfirmPopupData
  // 새로운 팝업 타입 추가
  myNewPopup: MyNewPopupData
}
```

### 4단계: 팝업 컴포넌트 생성

`PopupContainer`를 사용하여 팝업 컴포넌트 생성 (위의 "사용 방법" 참조)

### 5단계: 앱에 팝업 컴포넌트 추가

```typescript
// App.tsx 또는 최상위 컴포넌트
import CommonAlertPopup from './components/popup/CommonAlertPopup'
import CommonConfirmPopup from './components/popup/CommonConfirmPopup'

function App() {
  return (
    <div>
      {/* 다른 컴포넌트들 */}
      <CommonAlertPopup />
      <CommonConfirmPopup />
    </div>
  )
}
```

### 6단계: 스타일링

GSAP 애니메이션에 필요한 CSS 클래스 추가:

```css
.popup {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
}

.popup.active {
  display: block;
}

.popup-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
}

.popup-container {
  position: relative;
  z-index: 1;
  opacity: 0;
}
```

---

## 주의사항

1. **같은 타입 팝업 여러 개 열기**: `instanceId`를 다르게 지정해야 합니다.
2. **해시 없는 팝업**: 브라우저 뒤로가기로 닫히지 않으므로 수동으로 닫아야 합니다.
3. **애니메이션**: GSAP 애니메이션이 완료된 후 DOM에서 제거되므로, 애니메이션 시간을 고려해야 합니다.
4. **메모리 관리**: 팝업이 닫히면 스토어에서 제거되므로 메모리 누수 걱정 없음

---

## 확장 가능성

### 1. 팝업 우선순위

`popupStack`의 순서를 활용하여 z-index 자동 관리

### 2. 팝업 그룹

같은 그룹의 팝업만 동시에 열리도록 제한

### 3. 팝업 라우팅

해시 기반으로 특정 팝업을 직접 열 수 있는 라우팅 시스템

### 4. 팝업 히스토리

열었던 팝업 목록을 히스토리로 관리

---

## 요약

이 팝업 시스템은 다음과 같은 특징을 가집니다:

- ✅ **Zustand 기반 전역 상태 관리**
- ✅ **스택 기반 다중 팝업 관리**
- ✅ **URL 해시 연동 (브라우저 히스토리 지원)**
- ✅ **TypeScript 타입 안전성**
- ✅ **GSAP 애니메이션 지원**
- ✅ **해시 선택적 사용**
- ✅ **콜백 함수 지원**

이 구조를 다른 React 프로젝트에 적용하면 일관된 팝업 관리 시스템을 구축할 수 있습니다.
