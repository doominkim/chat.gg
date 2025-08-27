# Chat.GG

채팅 데이터와 사용자 상호작용을 분석하기 위한 웹 대시보드입니다. React, TypeScript, Vite로 구축되었습니다.

## 주요 기능

- 채널 선택 및 관리
- 사용자 분석 및 세부 정보
- 채팅 기록 및 분석
- 성격 분석
- 분석 대시보드
- AWS 통합

## 데모

[YouTube 데모 영상](https://studio.youtube.com/video/ojEMXfVIgbY/edit)

## 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite
- **UI 컴포넌트**: AWS Cloudscape Design System
- **라우팅**: React Router v7
- **시각화**: React D3 Cloud
- **애니메이션**: Framer Motion
- **AWS 통합**: AWS SDK for JavaScript v3

## 시작하기

### 필수 조건

- Node.js (권장 버전: 18+)
- npm 또는 yarn

### 설치

```bash
# 저장소 복제
git clone [저장소-URL]
cd fyc-web

# 의존성 설치
npm install
```

### 개발

```bash
# 개발 서버 시작
npm run dev
```

애플리케이션은 `http://localhost:5173`에서 접근할 수 있습니다.

### 빌드

```bash
# 프로덕션용 빌드
npm run build
```

### 미리보기

```bash
# 프로덕션 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
fyc-web/
├── src/
│   ├── api/            # API 클라이언트 및 서비스
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── config/         # 설정 파일
│   ├── pages/          # 애플리케이션 페이지
│   └── types/          # TypeScript 타입 정의
├── public/             # 정적 자산
└── ...설정 파일
```

## 사용 가능한 스크립트

- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션용 빌드
- `npm run lint` - ESLint 실행
- `npm run preview` - 프로덕션 빌드 미리보기

## 라이센스

[라이센스 정보]
