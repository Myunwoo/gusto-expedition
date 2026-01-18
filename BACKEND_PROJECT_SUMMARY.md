# Gusto Backend 프로젝트 요약

## 프로젝트 개요
레시피 추천 시스템 백엔드 (Spring Boot + PostgreSQL)

## 기술 스택
- **Framework**: Spring Boot 4.0.1
- **Database**: PostgreSQL
- **ORM**: JPA/Hibernate
- **Migration**: Flyway
- **Security**: Spring Security + JWT (jjwt 0.12.3)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Connection Pool**: HikariCP

## 프로젝트 구조

```
com.gustoexpedition
├── common/              # 공통 모듈
│   ├── annotation/      # @RequireAdmin, @XssSafe
│   ├── aspect/          # AOP (AdminAuth, XssSafe, ControllerLogging)
│   ├── entity/          # UpdatedAtListener
│   ├── exception/       # GustoException, ErrorResponse, ControllerAdvice
│   ├── filter/          # AccessTokenFilter (JWT 검증)
│   └── util/            # MessageUtil
├── ingredient/          # 재료 도메인
│   ├── adapter/
│   │   ├── in/          # IngredientController (사용자), IngredientAdminController (어드민)
│   │   └── out/         # JPA Repositories
│   ├── application/
│   │   ├── port/in/     # UseCase 인터페이스들
│   │   └── service/     # Service 구현체들
│   └── entity/          # IngredientEntity, IngredientI18nEntity, etc.
├── recipe/              # 레시피 도메인
│   ├── adapter/
│   │   ├── in/          # RecipeController (사용자), RecipeAdminController (어드민)
│   │   └── out/         # JPA Repositories
│   ├── application/
│   │   ├── port/in/     # UseCase 인터페이스들
│   │   └── service/     # Service 구현체들
│   └── entity/          # RecipeEntity, RecipeIngredientEntity
└── user/                # 사용자 도메인
    ├── adapter/
    │   ├── in/          # UserController (사용자), UserAdminController (어드민), AuthController
    │   └── out/         # JPA Repositories
    ├── application/
    │   ├── port/in/     # UseCase 인터페이스들
    │   └── service/     # Service 구현체들 (JwtService, AuthService)
    └── entity/          # UserEntity, UserRole
```

## 데이터베이스 스키마

### 주요 테이블
- `ingredient` - 재료 기본정보
- `ingredient_i18n` - 재료 다국어 정보
- `ingredient_alias` - 재료 별칭
- `ingredient_edge` - 재료 간 관계
- `ingredient_edge_evidence` - 관계 증거
- `ingredient_collection` - 사용자 재료 컬렉션
- `ingredient_collection_item` - 컬렉션 아이템
- `recipe` - 레시피 (required_ingredient_ids, optional_ingredient_ids 배열 포함)
- `recipe_ingredient` - 레시피-재료 매핑
- `user` - 사용자 (refresh_token 컬럼 포함)

### Migration 파일
- V1: 초기 스키마
- V2: 재료 도메인 확장
- V3: ingredient.name 컬럼 추가
- V4: recipe 도메인 추가
- V5: 트리거 제거 (JPA Entity Listener로 대체)
- V6: user 테이블 추가

## API 엔드포인트

### 인증 (`/api/auth`)
- `POST /api/auth/login` - 로그인 (Access Token + Refresh Token 발급) **[인증 불필요]**
- `POST /api/auth/refresh` - 토큰 갱신 **[인증 불필요]**
- `POST /api/auth/logout` - 로그아웃 (Refresh Token 무효화) **[인증 필요]**

### 사용자 관리 (`/api/user`)
- `POST /api/user/signup` - 회원가입 **[인증 불필요]**
- `GET /api/user/me` - 본인 정보 조회 **[인증 필요]**
- `POST /api/user/me` - 본인 정보 수정 (닉네임, 비밀번호만) **[인증 필요]**
- `POST /api/user/me/delete` - 회원탈퇴 (소프트 삭제) **[인증 필요]**

### 어드민 - 사용자 관리 (`/api/admin/user`) **[어드민 권한 필요]**
- `POST /api/admin/user/createUser` - 회원 생성
- `GET /api/admin/user/selectUserByUserNum` - 회원 조회 (userNum으로)
- `POST /api/admin/user/updateUser` - 회원 수정 (역할, 활성화 여부 포함)
- `POST /api/admin/user/deleteUser` - 회원 탈퇴 처리

### 어드민 - 재료 관리 (`/api/admin/ingredient`) **[어드민 권한 필요]**

#### 재료 기본정보
- `POST /api/admin/ingredient/createIngredient` - 재료 기본정보 생성
- `GET /api/admin/ingredient/selectById` - 재료 상세 조회 (id, locale, includeRelationYn 파라미터)
- `POST /api/admin/ingredient/updateIngredient` - 재료 기본정보 수정
- `POST /api/admin/ingredient/deleteIngredient` - 재료 삭제

#### 재료 다국어 정보
- `POST /api/admin/ingredient/createIngredientI18n` - 재료 다국어 정보 생성
- `POST /api/admin/ingredient/updateIngredientI18n` - 재료 다국어 정보 수정
- `POST /api/admin/ingredient/deleteIngredientI18n` - 재료 다국어 정보 삭제

#### 재료 별칭
- `POST /api/admin/ingredient/createAlias` - 재료 별칭 생성
- `POST /api/admin/ingredient/updateAliasAll` - 재료의 모든 별칭 일괄 수정
- `POST /api/admin/ingredient/updateAlias` - 재료 별칭 수정
- `POST /api/admin/ingredient/deleteAliasAll` - 재료의 모든 별칭 일괄 삭제
- `POST /api/admin/ingredient/deleteAlias` - 재료 별칭 삭제

#### 재료 간 관계
- `POST /api/admin/ingredient/createEdge` - 재료 간 관계 생성
- `GET /api/admin/ingredient/selectEdgeById` - 관계 조회
- `POST /api/admin/ingredient/updateEdge` - 관계 수정
- `POST /api/admin/ingredient/deleteEdge` - 관계 삭제

#### 관계 증거
- `POST /api/admin/ingredient/createEvidence` - 관계 증거 생성
- `POST /api/admin/ingredient/updateEvidence` - 관계 증거 수정
- `POST /api/admin/ingredient/deleteEvidence` - 관계 증거 삭제

### 사용자 - 재료 컬렉션 (`/api/ingredient`) **[인증 필요]**
- `POST /api/ingredient/createCollection` - 컬렉션 생성
- `GET /api/ingredient/selectCollectionById` - 컬렉션 조회
- `POST /api/ingredient/updateCollection` - 컬렉션 수정
- `POST /api/ingredient/deleteCollection` - 컬렉션 삭제 (포함된 아이템도 함께 삭제)
- `POST /api/ingredient/addCollectionItem` - 컬렉션에 재료 추가
- `POST /api/ingredient/updateCollectionItemOrder` - 아이템 순서 수정
- `POST /api/ingredient/deleteCollectionItem` - 아이템 삭제

### 사용자 - 레시피 추천 (`/api/recipe`) **[인증 필요]**
- `POST /api/recipe/recommend` - 재료 목록으로 레시피 추천 (최대 10개)
  - 요청: `{ "ingredientIds": [1, 2, 3] }`
  - 응답: 우선순위 메타데이터 포함 (부족한 재료 ID+이름, 매칭률, 우선순위 점수)

### 어드민 - 레시피 관리 (`/api/admin/recipe`) **[어드민 권한 필요]**

#### 레시피
- `POST /api/admin/recipe/createRecipe` - 레시피 생성
- `GET /api/admin/recipe/selectRecipeById` - 레시피 조회
- `POST /api/admin/recipe/updateRecipe` - 레시피 수정
- `POST /api/admin/recipe/deleteRecipe` - 레시피 삭제 (관련 데이터도 함께 삭제)

#### 레시피 재료
- `POST /api/admin/recipe/createRecipeIngredient` - 레시피 재료 추가 (캐시 자동 업데이트)
- `GET /api/admin/recipe/selectRecipeIngredientById` - 레시피 재료 조회
- `POST /api/admin/recipe/updateRecipeIngredient` - 레시피 재료 수정 (캐시 자동 업데이트)
- `POST /api/admin/recipe/deleteRecipeIngredient` - 레시피 재료 삭제 (캐시 자동 업데이트)

## 인증/인가

### JWT 토큰
- **Access Token**: 10분 만료 (600000ms)
- **Refresh Token**: 7일 만료 (604800000ms), DB에 저장
- **Secret Key**: `gusto.security.jwt.secret` (환경변수 또는 기본값)

### 인증 흐름
1. 로그인 → Access Token + Refresh Token 발급
2. API 호출 시 `Authorization: Bearer {accessToken}` 헤더 필요
3. AccessTokenFilter에서 JWT 검증
4. 검증 실패 시 **401 Unauthorized** 반환 (AUTH001, AUTH002)
5. @RequireAdmin이 있으면 AdminAuthAspect에서 권한 검증

### HTTP 상태 코드
- **401**: 인증 실패 (AUTH001, AUTH002)
- **400**: 일반 에러 (유효성 검증 실패, 비즈니스 로직 오류 등)
- **500**: 서버 오류

## 주요 설정

### application.yml
```yaml
gusto:
  security:
    whitelist:          # 인증 불필요 경로
      - "/api/auth/login"
      - "/api/auth/refresh"
      - "/api/user/signup"
    jwt:
      secret: ${JWT_SECRET:...}
      access-token-expiration: 600000
      refresh-token-expiration: 604800000
```

### HikariCP 설정 (소규모 프로젝트)
- maximum-pool-size: 5
- minimum-idle: 2
- connection-timeout: 30000ms

## API 규칙

### HTTP 메서드
- **GET**: 조회만
- **POST**: 생성, 수정, 삭제 모두 (CUD)
- **Path Variable 사용 안 함**: 모든 ID는 @RequestParam 또는 @RequestBody로 전달

### 에러 응답 형식
```json
{
  "errorCode": "AUTH001",
  "message": "AccessToken이 필요합니다."
}
```

### 성공 응답
- 200 OK
- JSON 형식

## 특이사항

1. **updated_at 관리**: JPA Entity Listener 사용 (DB 트리거 제거)
2. **레시피 추천**: PostgreSQL GIN 인덱스 활용 (required_ingredient_ids 배열)
3. **레시피 재료 캐시**: recipe_ingredient 변경 시 자동으로 recipe 테이블의 배열 캐시 갱신
4. **중앙화된 로깅**: ControllerLoggingAspect에서 모든 API 요청/응답/에러 로깅
5. **XSS 방지**: @XssSafe 어노테이션으로 입력값 자동 sanitize

## 프론트엔드 연동 시 주의사항

1. **인증**: 모든 API는 Access Token 필요 (로그인, 토큰 갱신, 회원가입 제외)
2. **401 처리**: 401 응답 시 Refresh Token으로 갱신 시도 → 실패 시 로그인 페이지로
3. **에러 코드**: errorCode로 메시지 표시
4. **회원가입**: 인증 없이 가능
5. **본인 정보**: `/api/user/me`로 JWT에서 자동으로 본인 정보 조회/수정

