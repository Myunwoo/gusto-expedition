# 쿠키 디버깅 가이드

## 문제: httpOnly 쿠키가 브라우저에 생성되지 않음

### 1. 서버 로그 확인

프론트엔드 컨테이너 로그에서 다음을 확인:

```bash
docker logs gusto-frontend --tail 100 | grep -E "Login|Set-Cookie"
```

다음과 같은 로그가 출력되어야 합니다:
```
[Login] 쿠키 설정 시도: { protocol: 'http', isSecure: false, ... }
[Login] Set-Cookie 헤더: [ 'GEAT=...; Path=/; HttpOnly; SameSite=Lax', ... ]
```

### 2. 브라우저 개발자 도구 확인

**Network 탭:**
1. 로그인 요청 (`/api/auth/login`) 선택
2. **Response Headers**에서 `Set-Cookie` 헤더 확인
3. `Set-Cookie` 헤더가 없으면 서버에서 쿠키가 설정되지 않은 것

**Application 탭:**
1. Cookies → 도메인 선택
2. 쿠키 목록 확인
3. `GEAT`, `GERT` 쿠키가 있는지 확인

### 3. Nginx 설정 확인

Nginx가 쿠키를 제대로 전달하는지 확인:

```bash
# Nginx 로그 확인
sudo tail -f /var/log/nginx/access.log

# 응답 헤더 확인
curl -I http://192.168.1.100/api/auth/login
```

### 4. 가능한 원인

#### 원인 1: Next.js cookies() API 문제
- Next.js 13+ App Router에서 `cookies().set()`은 자동으로 Response에 추가되어야 함
- 하지만 때때로 명시적으로 헤더를 설정해야 할 수 있음

#### 원인 2: 도메인 불일치
- 브라우저가 접근한 도메인과 쿠키 도메인이 다를 수 있음
- 예: `192.168.1.100`으로 접근했는데 쿠키 도메인이 다름

#### 원인 3: 브라우저 보안 정책
- 일부 브라우저는 localhost/IP 주소에서 쿠키를 차단할 수 있음
- Chrome의 경우 `chrome://flags/#cookies-without-same-site-must-be-secure` 확인

### 5. 해결 방법

#### 방법 1: 명시적으로 Set-Cookie 헤더 설정

Next.js의 `cookies().set()`이 작동하지 않는 경우, 직접 헤더를 설정:

```typescript
const response = NextResponse.json({ success: true, userNum: data.userNum });

// 명시적으로 Set-Cookie 헤더 추가
response.cookies.set('GEAT', data.accessToken, {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax',
  maxAge: 60 * 10,
  path: '/',
});

response.cookies.set('GERT', data.refreshToken, {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
});

return response;
```

#### 방법 2: 도메인 명시 (필요한 경우)

쿠키에 도메인을 명시적으로 설정:

```typescript
cookieStore.set('GEAT', data.accessToken, {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax',
  maxAge: 60 * 10,
  path: '/',
  domain: undefined, // 현재 도메인 사용
});
```

#### 방법 3: 브라우저 확인

- 다른 브라우저에서 테스트
- 시크릿 모드에서 테스트
- 브라우저 쿠키 설정 확인

### 6. 확인 체크리스트

- [ ] 서버 로그에 "Set-Cookie 헤더" 로그가 출력되는가?
- [ ] 브라우저 Network 탭에서 Response Headers에 `Set-Cookie`가 있는가?
- [ ] `Set-Cookie` 헤더의 값이 올바른가? (httpOnly, path 등)
- [ ] 브라우저 Console에 쿠키 관련 에러가 있는가?
- [ ] 다른 브라우저에서도 동일한 문제가 발생하는가?

