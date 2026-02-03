# Nginx 설정 가이드

## 개요

우분투 노트북에서 Nginx를 리버스 프록시로 사용하여 프론트엔드와 백엔드를 노출하는 설정입니다.

## 시나리오

1. **내부 LAN 테스트** (현재): 같은 네트워크 내에서만 접근
2. **포트포워딩 배포** (향후): 인터넷을 통해 접근

## 아키텍처

### 내부 LAN 테스트 (현재)
```
같은 네트워크의 다른 기기 → 우분투 노트북:80 → Nginx → Docker 컨테이너들
                                                      ├─ Frontend:3000
                                                      └─ Backend:8080
```

### 포트포워딩 배포 (향후)
```
인터넷 → 라우터 포트포워딩 → 우분투 노트북:80 → Nginx → Docker 컨테이너들
                                                      ├─ Frontend:3000
                                                      └─ Backend:8080
```

## 1. Nginx 설치

```bash
sudo apt update
sudo apt install nginx
```

## 2. Nginx 설정 파일 생성

`/etc/nginx/sites-available/gusto` 파일 생성:

```nginx
# 프론트엔드 (Next.js) - 모든 요청을 프론트엔드로 프록시
server {
    listen 80;
    # 내부 LAN 테스트: 로컬 IP 또는 도메인
    # 포트포워딩 배포: gustoexpedition.com 또는 공인 IP
    server_name gustoexpedition.com 192.168.1.100;  # 우분투 노트북의 로컬 IP 추가

    # 클라이언트 최대 요청 크기
    client_max_body_size 10M;

    # 모든 요청을 프론트엔드(Next.js)로 프록시
    # Next.js가 /api/* 요청을 받아서 백엔드로 프록시함
    # 이렇게 해야 쿠키 관리와 토큰 갱신이 정상 작동함
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # 프록시 헤더 설정 (중요!)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;  # HTTP/HTTPS 자동 감지
        proxy_set_header X-Forwarded-Host $host;
        
        # 쿠키 전달 (중요!)
        proxy_set_header Cookie $http_cookie;
        
        # WebSocket 지원 (필요한 경우)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 버퍼링 설정 (대용량 응답 처리)
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

## 3. 심볼릭 링크 생성 및 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/gusto /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# 자동 시작 설정
sudo systemctl enable nginx
```

## 4. 방화벽 설정

```bash
# UFW 방화벽 사용 시
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # HTTPS 사용 시
sudo ufw status
```

## 5. 내부 LAN에서 도메인 사용하기

Route53 도메인(`gustoexpedition.com`)을 내부 LAN에서 사용하려면:

### 방법 1: 각 클라이언트의 hosts 파일 수정 (간단)

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

**Mac/Linux:**
```
/etc/hosts
```

다음 줄 추가:
```
192.168.1.100  gustoexpedition.com  # 우분투 노트북의 로컬 IP
```

### 방법 2: IP로 직접 접근 (가장 간단)

브라우저에서 `http://192.168.1.100`로 접근

### 방법 3: 내부 DNS 서버 설정 (고급)

라우터에 내부 DNS 서버가 있다면:
- 도메인: `gustoexpedition.com`
- IP: 우분투 노트북의 로컬 IP

## 6. 라우터 포트포워딩 설정 (향후 배포 시)

라우터 관리 페이지에서:
- 외부 포트: 80 (또는 원하는 포트)
- 내부 IP: 우분투 노트북의 로컬 IP (예: 192.168.1.100)
- 내부 포트: 80
- 프로토콜: TCP

포트포워딩 후 Route53에서 A 레코드 설정:
- 이름: `@` (또는 `www`)
- 값: 공인 IP 주소

## 7. HTTPS 사용 시 (Let's Encrypt) - 포트포워딩 배포 후

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

HTTPS 사용 시 Nginx 설정이 자동으로 업데이트되어 `X-Forwarded-Proto: https`가 설정됩니다.

## 8. 확인 방법

### 내부 LAN 테스트
```bash
# 우분투 노트북의 로컬 IP 확인
ip addr show | grep "inet " | grep -v 127.0.0.1

# 같은 네트워크의 다른 기기에서 접근
# 브라우저: http://192.168.1.100
# 또는 hosts 파일 수정 후: http://gustoexpedition.com
```

### Nginx 상태 확인
```bash
sudo systemctl status nginx
```

### 로그 확인
```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 헤더 확인
브라우저 개발자 도구 → Network 탭 → 요청 헤더에서 `X-Forwarded-Proto` 확인

## 9. 문제 해결

### 502 Bad Gateway
- Docker 컨테이너가 실행 중인지 확인: `docker ps`
- 포트가 올바른지 확인: `netstat -tlnp | grep -E '3000|8080'`

### 쿠키가 설정되지 않음
- `X-Forwarded-Proto` 헤더가 전달되는지 확인
- 브라우저 개발자 도구 → Network → Response Headers에서 `Set-Cookie` 확인

### CORS 에러
- 백엔드의 CORS 설정에서 Nginx 도메인/IP 허용 확인

## 10. 보안 고려사항

### HTTP 사용 시 (포트포워딩만 사용)
- `X-Forwarded-Proto: http`로 설정됨
- 쿠키는 `secure: false`로 설정됨 (HTTP 환경이므로 정상)

### HTTPS 사용 시 (Let's Encrypt 등)
- `X-Forwarded-Proto: https`로 설정됨
- 쿠키는 `secure: true`로 설정됨

## 11. docker-compose.yml 확인

프론트엔드와 백엔드가 올바른 포트에서 실행 중인지 확인:

```yaml
frontend:
  ports:
    - "3000:3000"  # Nginx가 localhost:3000으로 접근

backend:
  ports:
    - "8080:8080"  # Nginx가 localhost:8080으로 접근
```

## 중요: 아키텍처 이해

### 요청 흐름
```
브라우저 → Nginx:80 → Next.js:3000 → Next.js API Route → 백엔드:8080
```

**왜 모든 요청을 Next.js로 보내야 하나?**
1. Next.js API Route (`/app/api/*`)가 쿠키를 관리함
2. 토큰 갱신 로직이 Next.js API Route에 있음
3. 백엔드로 직접 프록시하면 쿠키가 설정되지 않음

### 잘못된 설정 (백엔드 직접 프록시)
```
브라우저 → Nginx → 백엔드:8080  ❌ 쿠키 관리 불가
```

### 올바른 설정 (모든 요청을 Next.js로)
```
브라우저 → Nginx → Next.js:3000 → Next.js API Route → 백엔드:8080  ✅
```

## 참고

- Nginx는 호스트에서 실행되므로 `localhost`로 Docker 컨테이너에 접근합니다.
- Docker 네트워크를 사용하는 경우 `host.docker.internal` 대신 `localhost`를 사용합니다.
- 포트포워딩 환경에서는 보통 HTTP를 사용하므로 `secure: false`가 정상입니다.
- **모든 요청을 Next.js로 보내야 쿠키 관리와 인증이 정상 작동합니다.**

