# [DESIGN ORDER / IMPLEMENTATION SPEC] Gusto Expedition Admin — Ingredient (MVP)

> 목적: Cursor(또는 디자이너)가 **바로 화면을 만들 수 있도록** “결정 완료된 기준 + 해야 할 것/하지 말 것 + 화면별 스펙”을 명령형으로 정리한다.

---

## 0) High-level Principles (DO / DON’T)

### DO

* Light / Neutral 업무용 대시보드 톤으로 만든다.
* “나 혼자 쓰는 어드민”이므로 **입력 효율 + 가독성 + 실수 방지**를 최우선으로 한다.
* Ingredient 관리는 **재료 1개를 깊게 공부**하는 워크플로우에 최적화한다.
* **View → Edit 토글**을 동일한 페이지 레이아웃에서 수행한다(페이지 전환 금지).
* 장문 메모(근거/설명)를 편하게 쓰고 읽을 수 있게 한다(접기/펼치기 + 확장 편집 제공).

### DON’T

* 화려한 그라데이션/장식/애니메이션을 과하게 넣지 않는다(업무용).
* 모달 남발 금지(필요 시 Drawer 우선).
* 저장 버튼을 숨기거나 자동저장처럼 애매하게 만들지 않는다(명확한 저장/취소).
* i18n 입력을 한 화면에 너무 빽빽하게 몰아넣지 않는다(탭/스텝으로 분리).

---

## 1) Fixed Decisions (변경 금지 전제)

* Admin Tone: **Light/Neutral 업무용 대시보드**
* Ingredient 등록 Flow: **3-step wizard**

  1. 기본정보
  2. i18n + alias
  3. 관계 조작
* 관계 추가 기본 방식: **Ingredient 상세에서 from 고정 + to 선택**
* Ingredient 상세 페이지:

  * 기본은 **조회(View) 모드**
  * 수정 클릭 시 **같은 레이아웃에서 input 활성화(Edit 모드로 전환)**
* 근거 메모는 **길 수 있음(장문)**

---

## 2) Layout Rules (Global)

* Desktop-first, 기준 폭: 1280~1440px에서 안정적으로 보이게 설계
* 기본 레이아웃

  * 좌측: 사이드바(네비)
  * 상단: 페이지 타이틀 + 컨트롤(검색/CTA)
  * 본문: 리스트(테이블) / 상세(섹션형)
* 공통 컴포넌트

  * Table, Search Input, Primary Button, Secondary Button, Tabs, Stepper, Drawer(우선), Modal(최후), Toast, Confirm Dialog
* 상태(필수)

  * Loading / Empty / Error / Validation Error / Dirty State(수정됨)

---

## 3) Navigation / IA

### Pages

1. Ingredient List
2. Ingredient Detail (View)
3. Ingredient Detail (Edit mode in-place)
4. Ingredient Create Wizard (Step 1~3)
5. Relation Management Page (별도 페이지: 관계만 조작)

Side Nav 항목(최소)

* Ingredients
* Relations

---

## 4) Screen Spec — Ingredient List

### Must Have

* 상단 좌측: 페이지 타이틀 “Ingredients”
* 상단 우측: Primary CTA “재료 등록”
* 상단: 검색창(재료명 기준)
* 리스트: 클릭 가능한 행(row)

### Table Columns (MVP)

* Name (기준 언어 표기, 예: ko)
* Updated At(선택 가능하지만 권장)
* Relations Count(선택)

### States

* Empty State: “등록된 재료가 없습니다” + “재료 등록” CTA
* No Results State: “검색 결과가 없습니다”
* Loading Skeleton

### Interactions

* Row 클릭 → Ingredient Detail로 이동
* “재료 등록” 클릭 → Create Wizard Step 1로 이동

---

## 5) Screen Spec — Ingredient Detail (View)

### Purpose

* 공부한 내용을 “정돈된 문서”처럼 읽을 수 있게 한다.
* 편집/삭제는 명확하게 제공한다.

### Header Actions

* Primary: “수정”
* Danger: “삭제” (확인 다이얼로그 필수)
* (옵션) Breadcrumb: Ingredients / {ingredientName}

### Sections (View mode)

A. 기본정보

* 기본명(기준 언어)
* 태그(옵션)
* 생성일/수정일(옵션)

B. i18n

* 언어 탭(ko/en/it …)
* 선택한 언어의:

  * name
  * description(장문 표시, 기본 접기 + 펼치기)
  * alias 목록(칩 형태)

C. 관계(Relations)

* 탭: 궁합 / 비궁합 / 중립(또는 참고)
* 각 탭에 관계 리스트:

  * 상대 재료명(to)
  * (옵션) 강도
  * 수정일
* 관계 항목 클릭 → Drawer로 상세(근거 메모 포함) 보기

### Don’t

* View 모드에서 input 보이지 않게(텍스트 표시만)

---

## 6) Screen Spec — Ingredient Detail (Edit Mode, in-place)

### Trigger

* View 모드에서 “수정” 클릭

### Behavior

* 동일 레이아웃 유지
* 텍스트 → input/textarea/selector로 전환
* 상단 우측에 다음 버튼 노출

  * Primary: “저장”
  * Secondary: “취소”
* Dirty State

  * 변경 후 저장 안 하면 “저장되지 않은 변경사항” 경고(페이지 이탈 시 confirm)

### Validation (MVP)

* 필수값 누락 시 섹션 상단/필드 하단에 에러 표시
* 장문 필드는 글자수 제한이 있다면 현재 길이 카운터 표시

---

## 7) Screen Spec — Ingredient Create Wizard (3-step)

### Global Wizard Rules

* 상단에 Stepper: 1/3 → 2/3 → 3/3
* 각 step 하단 버튼

  * Secondary: 이전(가능한 경우)
  * Primary: 다음 / 완료
* Step 전환은 저장 성공 후에만 진행
* Cancel 버튼 제공(중단 시 confirm)

---

### Step 1) 기본정보 입력

* 필수: 기준 언어 name(또는 display name)
* 옵션: 태그, 상태값(draft/published)
* CTA:

  * Primary: “다음(저장)”
* 저장 성공 후 Step 2 이동

---

### Step 2) i18n + alias 입력

* 언어 탭 제공(ko/en/it)
* 각 언어별 입력

  * name (필수 여부 정책에 따라)
  * description (장문 textarea, 확장 편집 버튼 제공)
  * alias (0..n)

    * 입력 후 Enter로 추가되는 칩 UI 권장
* CTA:

  * Primary: “다음(저장)”
* 저장 성공 후 Step 3 이동

---

### Step 3) 관계 조작 View

* 탭: 궁합 / 비궁합 / 중립
* 관계 추가 UI (from 고정)

  * to 재료 검색(autocomplete)
  * 근거 메모(장문 textarea + 확장 편집)
  * (옵션) 강도
  * 저장 버튼: “관계 추가”
* 관계 리스트

  * 항목 클릭 → Drawer로 편집/삭제
* Wizard 완료 CTA

  * Primary: “완료”

---

## 8) Screen Spec — Relation Management Page (관계 전용)

### Purpose

* 관계만 “검색/정리/수정”할 수 있어야 한다.

### Must Have

* 검색: from/to 재료명 포함 검색
* 필터: 타입(궁합/비궁합/중립)
* 테이블 컬럼(권장):

  * From / Type / To / Updated At
* 행 클릭 → Drawer 편집(근거 메모 장문 포함)

### Don’t

* 관계 등록을 여기서만 가능하게 만들지 말 것(상세에서도 가능해야 함)

---

## 9) Drawer/Modal Rules

* 장문 메모 편집/보기는 **Drawer 우선**
* Drawer 안에:

  * 상대 재료 표시(from/to)
  * 타입/강도
  * 근거 메모(장문)
  * 저장/삭제 버튼
* 삭제는 반드시 Confirm Dialog

---

## 10) Output Requirements (Cursor deliverables)

* 위 스펙을 기반으로 다음을 생성:

  1. Ingredient List UI
  2. Ingredient Detail UI (View/Edit 토글 포함)
  3. Ingredient Create Wizard (3-step)
  4. Relation Management Page
* 공통 컴포넌트 스타일 가이드(간단히):

  * Button, Input, Textarea, Table, Tabs, Stepper, Drawer, Toast, Empty state

---

## 11) Quality Checklist

* 검색/빈 화면/로딩/에러 상태가 모두 정의되어 있는가?
* View/Edit 토글이 같은 레이아웃에서 자연스럽게 동작하는가?
* 장문 메모가 읽기/쓰기 편한가(접기/펼치기, 확장 편집)?
* 삭제는 항상 확인을 거치는가?
* Step wizard는 저장 성공 이후에만 다음 단계로 이동하는가?
