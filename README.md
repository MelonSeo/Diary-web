
# ✒️ AI 감성 일기 (AI Emotional Diary)

**"오늘 당신의 마음은 어떤 색깔인가요? AI와 함께 당신의 감정을 탐색하고 이해하는 특별한 여정을 시작하세요."**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4-3296E4?style=for-the-badge&logo=next-auth&logoColor=white)](https://next-auth.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 프로젝트 소개 (Introduction)

**AI 감성 일기**는 사용자가 작성한 일기 내용을 AI가 분석하여 핵심 감정을 시각적으로 보여주는 웹 서비스입니다. 단순히 텍스트를 기록하는 것을 넘어, AI 기술을 통해 자신의 감정 패턴을 발견하고 스스로를 더 깊이 이해할 수 있도록 돕습니다. 바쁜 일상 속에서 자신의 마음을 돌볼 시간이 부족했던 분들에게, 이 서비스는 따뜻한 위로와 성찰의 기회를 제공할 것입니다.

이 프로젝트는 **Next.js** 기반의 프론트엔드 애플리케이션으로, 백엔드 (API) 서버와 통신하여 감정 분석 결과를 사용자에게 효과적으로 전달하는 데 중점을 두고 있습니다.

> ⚠️ **참고:** 이 저장소는 AI 감성 일기 서비스의 **프론트엔드** 코드만을 포함하고 있습니다. 실제 감정 분석을 처리하는 백엔드 AI 모델 및 API는 별도의 프로젝트로 관리됩니다.
> [➡️백엔드 바로가기](backendapi.com)

---

## 🌐 웹사이트


**[➡️ 바로가기](https://diary-web-qyme.vercel.app)**

---

## ✨ 주요 기능 (Key Features)

- **🤖 AI 기반 감정 분석**: 일기를 작성하고 저장하면, AI가 문맥을 파악하여 슬픔, 기쁨, 분노, 놀람 등 다양한 감정 상태를 분석하고 핵심 감정을 알려줍니다.
- **🔐 안전한 소셜 로그인**: Google, Kakao 계정을 이용한 OAuth 2.0 기반의 간편하고 안전한 로그인을 지원하여 사용자의 정보를 보호합니다.
- **✍️ 직관적인 일기 작성 및 관리 (CRUD)**: 깔끔하고 미니멀한 UI를 통해 사용자는 손쉽게 일기를 작성, 조회, 수정, 삭제할 수 있습니다.
- **📅 캘린더 뷰**: 캘린더에 그날그날의 감정이 아이콘으로 표시되어, 월별 감정의 흐름을 한눈에 파악할 수 있습니다.
- **📱 반응형 웹 디자인**: 데스크톱, 태블릿, 모바일 등 모든 디바이스에서 최적화된 사용자 경험을 제공합니다.

---

## 🖼️ 스크린샷 (Screenshots)

*이곳에 서비스의 주요 화면 스크린샷이나 GIF를 추가하여 프로젝트를 시각적으로 어필해보세요.*

| 로그인 | 메인 화면 | 일기 작성 |
| :---: | :---: | :---: |
| *(login.png)* | *(main.png)* | *(new-diary.png)* |

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Core**: `Next.js 15`, `React 19`
- **Language**: `TypeScript`
- **Styling**: `Tailwind CSS`, `clsx`, `tailwind-merge`
- **Authentication**: `NextAuth.js`
- **UI Components**: `shadcn/ui` (Radix UI 기반)
- **HTTP Client**: `fetch` API (BFF 패턴 활용)

### Backend (Implied)
- **API Server**: `Node.js` with `Express` or `Python` with `FastAPI`
- **AI/ML**: `TensorFlow`, `PyTorch`, or `Hugging Face Transformers`
- **Database**: `MySQL` or `PostgreSQL`

---

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하려면 아래 단계를 따르세요.

### 1. 사전 요구사항 (Prerequisites)

- `Node.js` 
- `npm` or `yarn` or `pnpm`

### 2. 프로젝트 클론 및 의존성 설치

```bash
# 1. 이 저장소를 클론합니다.
git clone https://github.com/MelonSeo/Diary-web.git

# 2. 프로젝트 디렉토리로 이동합니다.
cd Diary-web

# 3. 의존성 패키지를 설치합니다.
npm install
```

### 3. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고, 아래 내용을 자신의 환경에 맞게 수정하여 추가합니다.

```env
# NextAuth.js 설정
# 터미널에서 `openssl rand -base64 32` 명령어로 시크릿 키를 생성할 수 있습니다.
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000

# Google OAuth 설정
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Kakao OAuth 설정
KAKAO_CLIENT_ID=YOUR_KAKAO_CLIENT_ID
KAKAO_CLIENT_SECRET=YOUR_KAKAO_CLIENT_SECRET # 카카오 로그인은 시크릿을 사용하지 않을 수 있음

# 백엔드 API 서버 주소
NEXT_PUBLIC_API_URL=http://your-backend-api-server.com
```

### 4. 개발 서버 실행

```bash
npm run dev
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

---

## 📁 프로젝트 구조 (Project Structure)

```
.
├── app/                  # Next.js App Router: 페이지 및 레이아웃
│   ├── api/              # API Routes (BFF, NextAuth)
│   ├── (main)/           # 메인 기능 페이지 그룹
│   └── layout.tsx        # 전역 레이아웃
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── (feature)/        # 특정 기능별 컴포넌트
├── lib/                  # API 클라이언트, 유틸리티 함수 등
├── public/               # 정적 에셋 (이미지, 폰트)
├── styles/               # 전역 스타일 및 CSS 모듈
└── types/                # 전역 타입 정의
```

## 👥 기여도


- MelonSeo: 프론트엔드 100%

---

## 📜 라이선스 (License)

이 프로젝트는 [MIT 라이선스](./LICENSE)를 따릅니다.
