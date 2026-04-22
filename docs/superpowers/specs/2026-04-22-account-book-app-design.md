# 오늘얼마 — 설계 문서

**앱 이름:** 오늘얼마
**패키지명:** todayhowmuch

## 개요

React Native CLI 기반 개인 가계부 앱. 달력 중심 UI, 로컬 전용(서버 없음), CSV 양방향 지원.

## 핵심 요구사항

- 본인 전용, 다중 장부 지원 (개인용, 사업용 등 분리)
- 달력형 메인 화면 (날짜별 수입/지출 금액 표시)
- 로컬 저장소만 사용 (op-sqlite + MMKV)
- CSV export → Excel/Numbers에서 편집 → CSV import 양방향
- 시스템 테마 연동 (다크/라이트) + 설정에서 수동 전환

## 데이터 모델

### SQLite 테이블

#### `ledgers` (장부)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT (UUID) | PK |
| name | TEXT | "개인", "사업용" 등 |
| created_at | INTEGER | timestamp |

#### `transactions` (거래)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT (UUID) | PK |
| ledger_id | TEXT | FK → ledgers |
| type | TEXT | "income" / "expense" |
| amount | INTEGER | 원 단위 정수 |
| category | TEXT | "식비", "교통비" 등 |
| payment_method | TEXT | "현금", "카드", "계좌이체" 등 |
| memo | TEXT | nullable |
| date | TEXT | "2026-04-22" (ISO 8601) |
| created_at | INTEGER | timestamp |

#### `recurring_rules` (반복 거래 규칙)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT (UUID) | PK |
| ledger_id | TEXT | FK → ledgers |
| type | TEXT | "income" / "expense" |
| amount | INTEGER | |
| category | TEXT | |
| payment_method | TEXT | |
| memo | TEXT | nullable |
| day_of_month | INTEGER | 매월 N일 |
| is_active | INTEGER | 0/1 |

### MMKV (설정)

- `current_ledger_id` — 현재 선택된 장부
- `theme_mode` — "system" / "light" / "dark"
- `categories` — JSON 배열 (사용자 커스텀 카테고리 목록)
- `payment_methods` — JSON 배열
- `last_recurring_check` — 마지막 반복거래 체크 날짜

## 화면 구조

### 네비게이션: Bottom Tabs (4탭) + 중앙 FAB

#### 1. 📅 달력 탭 (메인)

- 상단: 장부 선택 드롭다운 + `◀ 2026년 4월 ▶` 월 이동
- 중앙: 월간 달력 그리드 (날짜별 수입 초록 / 지출 빨강 금액 표시)
- 하단 요약바: 이번 달 수입 합계 | 지출 합계
- 날짜 탭 → BottomSheet로 해당 날짜 거래 리스트
  - 각 항목: 카테고리 + 금액 + 메모
  - 항목 탭 → 수정 화면
  - 항목 스와이프 → 삭제

#### 2. 📋 내역 탭

- 월별 그룹핑된 전체 거래 리스트
- 상단 필터: 카테고리 / 결제수단 / 수입·지출
- 검색바: 메모 텍스트 검색
- 무한 스크롤 (FlashList)

#### 3. 📊 통계 탭

- 기간 선택: 월별 / 연별
- 카테고리별 파이차트 (지출)
- 월별 수입/지출 추이 바차트
- 결제수단별 비율

#### 4. ⚙️ 설정 탭

- 장부 관리 (추가/삭제/이름변경)
- 카테고리 관리 (추가/삭제/순서변경)
- 결제수단 관리
- 반복 거래 관리
- 테마 설정 (시스템/라이트/다크)
- 데이터 내보내기 (CSV)
- 데이터 가져오기 (CSV)

#### ➕ FAB (중앙 플로팅 버튼)

- 탭 → 거래 입력 모달 (BottomSheet fullscreen)
- 필드: 수입/지출 토글, 금액 (숫자패드), 날짜 (기본 오늘), 카테고리 선택, 결제수단, 메모
- 저장 → 자동으로 달력 반영

## CSV 처리

### Export

- 설정 > 데이터 내보내기
- 장부 선택 + 기간 선택 (전체 / 월 지정)
- CSV 스키마:
  ```
  날짜,유형,금액,카테고리,결제수단,메모
  2026-04-22,지출,45000,식비,카드,점심 회식
  2026-04-09,수입,3200000,월급,계좌이체,4월 급여
  ```
- 생성 후 react-native-share 공유시트 → 파일앱 저장, AirDrop, 메일 등

### Import

- 설정 > 데이터 가져오기
- 파일 피커로 CSV 선택
- 파싱 → 미리보기 화면 (몇 건, 기간, 샘플 3줄 표시)
- 중복 처리: 날짜+금액+카테고리+메모 조합이 동일하면 중복 경고
- 모드 선택:
  - "추가" — 기존 데이터 유지, 새 건만 추가
  - "대체" — 해당 기간 데이터 삭제 후 CSV로 교체
- SQLite 트랜잭션으로 원자적 처리 (실패 시 롤백)

## 반복 거래

- 설정 > 반복 거래 관리에서 규칙 생성/수정/삭제
- 앱 실행 시: 마지막 체크 이후 ~ 오늘까지 빠진 날짜 확인 → 자동 생성
  - 예: 매월 25일 월급 규칙, 4/25 거래 아직 없으면 자동 INSERT
- 자동 생성된 거래는 일반 거래와 동일 (수정/삭제 가능)
- `day_of_month`가 해당 월 일수보다 크면 마지막 날에 생성 (예: 31일 규칙 → 2월 28일)
- MMKV에 `last_recurring_check` 날짜 저장

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| 프레임워크 | React Native CLI 0.77+ |
| 언어 | TypeScript |
| 네비게이션 | @react-navigation/bottom-tabs + native-stack v7 |
| 상태관리 | jotai |
| 로컬 DB | op-sqlite |
| KV 저장소 | react-native-mmkv |
| 날짜 | dayjs |
| 리스트 | @shopify/flash-list |
| 차트 | react-native-gifted-charts |
| 바텀시트 | @gorhom/bottom-sheet |
| 애니메이션 | react-native-reanimated |
| CSV 처리 | papaparse |
| 파일 I/O | react-native-fs |
| 파일 공유 | react-native-share |

## 프로젝트 구조

```
src/
├── App.tsx
├── navigation/        # 탭, 스택 네비게이터
├── screens/           # Calendar, History, Stats, Settings
├── components/        # 공용 컴포넌트
│   ├── calendar/      # 달력 관련
│   ├── transaction/   # 거래 입력/수정 폼
│   └── chart/         # 차트 래퍼
├── db/                # op-sqlite 초기화, 마이그레이션, 쿼리
├── store/             # jotai atoms
├── hooks/             # 커스텀 훅
├── utils/             # CSV 변환, 날짜 헬퍼
├── styles/            # 테마, 공용 스타일
└── types/             # TypeScript 타입 정의
```

## 향후 확장 가능 (V2)

- 예산 설정 & 초과 알림
- 카테고리별 월간 트렌드
- 전월 대비 분석
