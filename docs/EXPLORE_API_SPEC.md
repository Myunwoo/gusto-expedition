# Explore(재료 마인드맵) API 요구사항

하드코딩 데이터를 API로 대체할 때 필요한 API·데이터 저장 정리.  
**DB 구조 및 다국어(locale) 지원에 맞춰 설계.**

---

## 1. “가장 마인드맵을 넓게 펼칠 수 있는 재료” 저장

### 1-1. 의미

- Explore 페이지 **최초 진입 시** 중앙에 둘 재료 = “마인드맵을 가장 넓게 펼칠 수 있는 재료”.
- 예: 연관 엣지가 많거나, depth를 많이 확장할 수 있는 재료.

### 1-2. 저장 시점

- **재료 등록/수정/삭제** 시점에 위 기준으로 후보를 계산해 두고, 그중 하나의 `ingredientId`를 “기본 중앙 재료”로 저장.
- **재료 간 관계(엣지) 생성/수정/삭제** 시에도 동일하게 재계산·갱신하는 것을 권장.

### 1-3. 저장 위치 (구현됨)

- **테이블**: `explore_recommended_ingredient`  
  - `id`, `ingredient_id`, `use_yn` ('Y'/'N'), `created_at`  
  - **use_yn = 'Y'인 행은 전역에 1개만** (partial unique index로 보장).
- **갱신 정책**: 재료 등록/수정/삭제(·엣지 변경) 시 “가장 마인드맵을 넓게 펼칠 수 있는 재료”를 재계산한 뒤,  
  - **결과가 기존과 같으면** 별도 동작 없이 종료(기존 use_yn=Y 행 유지).  
  - **결과가 바뀌면** 신규 행 INSERT (use_yn='Y') + 기존 use_yn='Y'였던 행은 use_yn='N'으로 UPDATE.

---

## 2. Explore 페이지 진입 시 getTree 호출

### 2-1. 흐름

1. 사용자가 **Explore 페이지에 접속**.
2. 백엔드에 저장된 **기본 중앙 재료 ID**를 사용해 **getTree** 호출.
   - 요청: `GET /api/ingredients/:ingredientId/mindmap-tree?locale=ko` (또는 현재 사용자 locale).
   - 여기서 `:ingredientId`는 1번에서 저장해 둔 “가장 마인드맵을 넓게 펼칠 수 있는 재료”의 ID.

### 2-2. 기본 중앙 재료 ID 조회 (구현됨)

- **엔드포인트**: `GET /api/explore/recommendedIngredientId`  
  - input 없음. 비로그인 가능(application.yml whitelist 등록).
  - Response 200: `{ "ingredientId": number }` (use_yn='Y'인 행의 ingredient_id, 여러 개면 id 순 첫 건).
  - Response 400: 추천 재료 없음 (EXPLORE001, GustoException).
- 클라이언트는 이 ID로 `GET /api/explore/mindmap-tree/:ingredientId?locale=...` (getTree) 호출.

---

## 3. getTree API (마인드맵 트리) — DB·다국어 반영

### 3-1. 엔드포인트 (구현됨)

```
GET /api/explore/mindmap-tree/:ingredientId?locale=ko
```

- `:ingredientId`: 중앙 재료 ID (1번에서 저장한 값 또는 사용자가 선택한 재료 ID).
- `locale`: 다국어용. 해당 locale의 `localeInfo`/별칭 기준으로 **표시 이름** 반환.

### 3-2. DB 구조에 맞는 매핑

- **재료**: `ingredient` + `ingredient_i18n` (locale별 name, description).
- **관계**: `fromIngredientId`, `toIngredientId`, `relationType`, `score` (1~10) 등.
- **relationType**  
  - `PAIR_WELL` → 마인드맵 `type: "good"`  
  - `AVOID` → 마인드맵 `type: "warn"`  
  - `NEUTRAL` → 필요 시 제외 또는 good/warn 중 정책에 따라 매핑.
- **score** → 0~1 구간으로 정규화해 `weight`로 사용 (깊이/반경 계산용).

### 3-3. Response (다국어 지원)

노드에는 **ingredientId + 해당 locale의 표시 이름**을 넣어 주면, 현재 DB 구조와 맞고 클라이언트도 그대로 쓸 수 있음.

```json
{
  "depth1": [
    { "ingredientId": 2, "name": "바질", "weight": 0.92, "type": "good", "depth": 1 }
  ],
  "depth2": [
    { "ingredientId": 5, "name": "레몬", "weight": 0.78, "type": "good", "depth": 2, "parentIngredientId": 2 }
  ],
  "depth3": [
    { "ingredientId": 8, "name": "딜", "weight": 0.72, "type": "good", "depth": 3, "parentIngredientId": 5 }
  ]
}
```

- `name`: 요청한 `locale`에 해당하는 `ingredient_i18n.name` (또는 별칭/fallback 정책에 따라 결정).
- `ingredientId`: 클라이언트가 “해당 재료로 중앙 이동” 시 다시 getTree(ingredientId) 호출할 때 사용.
- `parentIngredientId`: 부모 노드의 `ingredientId` (depth 2·3만). 클라이언트에서 구조 유지할 때 사용.

---

## 4. 검색 API (후순위)

- **역할**: 검색창 입력 후 Enter(또는 제안 클릭) 시, 해당 재료로 점프.
- **요구**: locale 반영한 이름/별칭 검색, `ingredientId` 반환.
- **예시**:  
  `GET /api/ingredients/search?q=토마&locale=ko`  
  → `{ items: { ingredientId, name }[] }`
- 구현은 **재료·getTree·기본 중앙 저장** 이후로 미뤄도 됨.

---

## 5. 요약

| 항목 | 내용 |
|------|------|
| **1. 기본 중앙 재료 저장** | 재료 등록/수정/삭제(·엣지 변경) 시 “마인드맵을 가장 넓게 펼칠 수 있는 재료”의 `ingredientId`를 DB/설정에 저장. |
| **2. Explore 진입** | 저장된 `ingredientId`로 getTree 호출 (또는 initial API로 ID+트리 한 번에 조회). |
| **3. getTree** | `GET /api/ingredients/:ingredientId/mindmap-tree?locale=...` — DB 구조에 맞게 `ingredientId`, locale별 `name`, `weight`, `type`, `parentIngredientId` 제공. |
| **4. 검색** | 후순위. locale 반영 검색, `ingredientId` 반환 형태로 설계. |

이렇게 하면 “기본 중앙 저장 → Explore에서 해당 ID로 getTree → 다국어 지원”까지 한 번에 맞출 수 있음.
