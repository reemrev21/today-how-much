# 오늘얼마 (TodayHowMuch)

상단에 오늘 얼마를 썼는지 한눈에 확인하기 위해 만든 개인용 가계부 앱입니다.

기존 가계부 앱(예: 오픈뱅킹)은 모든 거래 내역을 상세하게 보여주는 방식이라
빠르게 소비 금액만 확인하고 싶은 사용 방식에는 다소 불편했습니다.
불필요한 정보는 숨기거나 정리하는 것도 번거로워,
필요한 기능만 담아 직접 만들었습니다.

- 오늘 소비 금액에 집중한 심플한 구조
- 빠른 입력과 직관적인 확인
- Brutalist UI 기반 디자인

## 기술 스택

- React Native (CLI)
- TypeScript
- op-sqlite (로컬 DB)
- react-native-mmkv (설정 저장)
- jotai (상태 관리)
- @gorhom/bottom-sheet
- react-native-gifted-charts (차트)
- react-native-gesture-handler (스와이프)

## 주요 기능

### 달력 (Calendar)
- 월별 캘린더 뷰, 일자별 수입/지출 요약 표시
- 좌우 스와이프로 월 이동
- 오늘 날짜 하이라이트 + NOW 배지
- 히어로 영역: 오늘 지출, 이번 달 합계 실시간 표시
- 날짜 터치 → 바텀시트로 해당일 거래 목록 조회
- 거래 추가/수정/삭제 (바텀시트 폼)

### 내역 (History)
- 전체 거래 내역 무한 스크롤 (FlashList)
- 메모/카테고리 검색
- 수입/지출 필터 칩
- 스와이프로 거래 삭제

### 반복거래 (Recurring)
- 고정 수입/지출 등록 (매월 N일)
- 활성/비활성 토글
- 드래그로 순서 변경 (▲/▼)
- 스와이프로 삭제
- 월 고정 합계 표시

### 통계 (Stats)
- 월별/연별 전환
- 카테고리별 지출 파이차트
- 월별 수입/지출 추이 막대차트
- 결제수단별 비율 바차트

### 설정 (Settings)
- 다중 장부 관리 (생성/삭제/전환)
- 테마 전환 (라이트/다크/시스템)
- 카테고리 관리 (추가/삭제)
- 결제수단 관리 (추가/삭제)
- CSV 내보내기/가져오기 (거래, 반복거래, 카테고리, 결제수단 포함)
- 가져오기 템플릿 다운로드

### 수입 가리기
- 헤더의 `[수입]` 배지 터치로 on/off
- 모든 화면에서 수입 금액 마스킹 (`+•••`)
- 캘린더 셀, 히어로, 월 합계, 거래 목록, 반복거래, 통계 차트 전체 적용
- 설정 영속 저장 (앱 재시작 후에도 유지)

### 다크모드
- 시스템 설정 연동 또는 수동 전환
- 전체 화면 실시간 반영 (jotai atom 기반)
- Brutalist 모노크롬 테마 토큰

## CSV 포맷

```
날짜,유형,금액,카테고리,결제수단,메모
2025-01-15,지출,12000,식비,카드,점심식사

[반복거래]
유형,금액,카테고리,결제수단,메모,반복일,활성
지출,50000,통신비,계좌이체,휴대폰요금,25,Y

[설정]
항목,값
카테고리,식비|교통비|주거비|통신비
결제수단,현금|카드|계좌이체
```

## 프로젝트 구조

```
src/
├── components/
│   ├── calendar/       # MonthHeader, CalendarGrid, DayCell
│   ├── chart/          # CategoryPieChart, MonthlyTrendChart, PaymentMethodChart
│   ├── common/         # LedgerSelector, HideIncomeBadge, FAB
│   ├── settings/       # CategoryManager, PaymentMethodManager
│   └── transaction/    # TransactionItem, TransactionForm, TransactionList
├── db/                 # SQLite 쿼리 (ledger, transaction, recurring)
├── hooks/              # useTransactions
├── navigation/         # RootNavigator (탭 네비게이션)
├── screens/            # Calendar, History, Recurring, Stats, Settings
├── store/              # jotai atoms, MMKV settings
├── styles/             # 테마 토큰 (light/dark)
├── types/              # TypeScript 타입 정의
└── utils/              # CSV, 날짜, 포맷 유틸
```

## 실행

```sh
# 의존성 설치
npm install

# iOS
cd ios && bundle exec pod install && cd ..
npm run ios

# Android
npm run android
```

## Built with

- 디자인: [rawblock](https://designmd.ai/chef/rawblock)에서 영감을 받은 Brutalist 모노크롬 UI
- 개발: [Claude Code](https://claude.ai/claude-code)의 도움을 받아 개발했습니다.
