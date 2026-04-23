---
name: 가계부 (Household Ledger)
description: "React Native 기반 개인·가정용 가계부. 달력·거래·통계·설정 흐름을 탭으로 묶고, 수입·지출 의미 색과 인디고·바이올렛 액센트로 읽기 쉬운 데이터 위주 UI."

colors:
  light:
    background: "#FFFFFF"
    surface: "#F5F5F5"
    card: "#FFFFFF"
    text: "#1A1A1A"
    text-secondary: "#888888"
    border: "#E0E0E0"
    primary: "#5C6BC0"
    primary-light: "#E8EAF6"
    income: "#2E7D32"
    expense: "#D32F2F"
    tab-bar: "#FFFFFF"
    tab-bar-border: "#E0E0E0"
    fab: "#5C6BC0"
    on-fab: "#FFFFFF"
    on-primary-text: "#FFFFFF"
    chart-pie:
      - "#5C6BC0"
      - "#E91E63"
      - "#FF9800"
      - "#4CAF50"
      - "#00BCD4"
      - "#9C27B0"
      - "#F44336"
      - "#FFEB3B"
      - "#8BC34A"
      - "#3F51B5"
  dark:
    background: "#1A1A2E"
    surface: "#252545"
    card: "#2A2A4A"
    text: "#E0E0E0"
    text-secondary: "#888888"
    border: "#3A3A5A"
    primary: "#7C6EF0"
    primary-light: "#3A3A6A"
    income: "#51CF66"
    expense: "#FF6B6B"
    tab-bar: "#1E1E3A"
    tab-bar-border: "#2A2A4A"
    fab: "#7C6EF0"
    on-fab: "#FFFFFF"
    on-primary-text: "#FFFFFF"
    chart-pie:
      - "#5C6BC0"
      - "#E91E63"
      - "#FF9800"
      - "#4CAF50"
      - "#00BCD4"
      - "#9C27B0"
      - "#F44336"
      - "#FFEB3B"
      - "#8BC34A"
      - "#3F51B5"
  semantic:
    on-selected-chip: "#FFFFFF"
    sheet-backdrop: "rgba(0, 0, 0, 0.5)"
    modal-scrim: "rgba(0, 0, 0, 0.4)"

typography:
  family: "System (platform default; e.g. SF Pro on iOS, Roboto on Android)"
  screen-title-lg:
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 28px
  screen-title-md:
    fontSize: 18px
    fontWeight: "700"
    lineHeight: 24px
  section-heading:
    fontSize: 16px
    fontWeight: "700"
    lineHeight: 22px
  form-title:
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 26px
  body:
    fontSize: 15px
    fontWeight: "500"
    lineHeight: 22px
  body-emphasis:
    fontSize: 16px
    fontWeight: "700"
    lineHeight: 22px
  input:
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  amount-hero:
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 34px
  label:
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 18px
  chip:
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 18px
  tab-label:
    fontSize: 11px
    fontWeight: "400"
    lineHeight: 14px
  calendar-weekday:
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
  calendar-day:
    fontSize: 13px
    fontWeight: "600"
    lineHeight: 18px
  calendar-amount:
    fontSize: 9px
    fontWeight: "500"
    lineHeight: 12px
  chart-axis:
    fontSize: 10px
    fontWeight: "400"
    lineHeight: 14px
  chevron:
    fontSize: 10px
    fontWeight: "400"
  tab-emoji:
    fontSize: 20px
    lineHeight: 24px
  fab-plus:
    fontSize: 28px
    fontWeight: "400"
    lineHeight: 32px

spacing:
  unit: 8px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  section: 32px
  screen-horizontal: 16px
  content-bottom: 32px
  fab-margin-from-tab: 28px
  list-row-vertical: 12px
  chip-gap: 8px

radii:
  xs: 6px
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  full: 9999px
  fab: 28px

elevation:
  android-fab: 6
  ios-fab:
    shadowColor: "#000000"
    shadowOffset: "0 4"
    shadowOpacity: 0.3
    shadowRadius: 4
  border-hairline: 0.5
  border-default: 1

shadows:
  fab-ios: "0px 4px 4px rgba(0, 0, 0, 0.3)"

layout:
  tab-bar-height: 49px
  bottom-sheet-snap: "85%"
  search-field-height: 40px
  day-cell-min-height: 64px
  pie-chart-outer-radius: 90px
  pie-chart-inner-radius: 55px
  bar-chart-bar-width: 18px
  bar-chart-pair-spacing: 16px
  bar-chart-inner-spacing: 2px
  payment-bar-height: 10px
  payment-label-width: 60px
  payment-amount-width: 80px
  list-estimated-row-height: 72px
  end-reached-threshold: 0.3

motion:
  touch-press-primary: 0.8
  touch-press-secondary: 0.7
  bottom-sheet-backdrop-opacity: 0.5
  bar-chart-animated: true
  modal-animation: fade
  list-pagination-size: 50

components:
  app-header:
    background-light: "{colors.light.background}"
    background-dark: "{colors.dark.background}"
    title-typography: "{typography.screen-title-md}"
    border-color-light: "{colors.light.border}"
    border-color-dark: "{colors.dark.border}"
  ledger-pill:
    background-light: "{colors.light.primary-light}"
    background-dark: "{colors.dark.primary-light}"
    border-width-px: 1
    border-color-light: "{colors.light.primary}"
    border-color-dark: "{colors.dark.primary}"
    radius: "{radii.xl}"
    label-typography: "{typography.body}"
  bottom-sheet:
    surface-light: "{colors.light.surface}"
    surface-dark: "{colors.dark.surface}"
    handle-light: "{colors.light.text-secondary}"
    handle-dark: "{colors.dark.text-secondary}"
  primary-fab:
    size: 56px
    background-light: "{colors.light.fab}"
    background-dark: "{colors.dark.fab}"
    icon-light: "{colors.light.on-fab}"
    icon-dark: "{colors.dark.on-fab}"
    shadow-ios: "{shadows.fab-ios}"
    elevation-android: 6
  segmented-type-toggle:
    track-radius: "{radii.md}"
    active-expense-light: "{colors.light.expense}"
    active-expense-dark: "{colors.dark.expense}"
    active-income-light: "{colors.light.income}"
    active-income-dark: "{colors.dark.income}"
  input-field:
    radius: "{radii.md}"
    border-width-px: 1
    border-light: "{colors.light.border}"
    border-dark: "{colors.dark.border}"
  filter-chip:
    radius: "{radii.xl}"
  stats-period-toggle:
    active-light: "{colors.light.primary}"
    active-dark: "{colors.dark.primary}"
  data-card:
    radius: "{radii.lg}"
    padding: "{spacing.xl}"
---

## 브랜드·톤

이 앱은 “숫자가 한눈에”를 최우선으로 한다. 꾸밈보다 **읽기·탐색·수정**에 에너지를 쓰는 실용적 가계부다. 톤은 **차분하고 사무적**이며, 감정을 자극하는 그래데이션이나 과한 장식은 쓰지 않는다.  
시각적 정체성은 **낮은 채도의 보라·인디고 계열 액센트**와 **수입(녹) / 지출(적) 고정 의미**의 대비로 잡힌다. 라이트는 흰·연회 배경에 짙은 글자, 다크는 남은 별빛 느낌의 **딥 네이비 베이스**에 밝은 회조 글자로, 장시간 봐도 눈이 덜 피로한 조합을 지향한다.

## 색 (Colors)

- **캔버스**: 본문 배경(`background`)이 가장 밝고(또는 다크에선 가장 어둡고), 섹션·시트·검색줄은 `surface`·`card`로 한 단계 띄워 층을 구분한다. `border`는 1px 또는 hairline로만 쓰여 구분은 있지만 무겁지 않다.  
- **액센트**: `primary`는 인디고(라이트)·전기보라(다크)로, 버튼·탭 선택·필·선택 행·진행률 막대 등 **한 가지 “브랜드” 축**을 만든다. `primary-light`는 필·리스트 하이라이트에만 쓰여 채도를 올리지 않는다.  
- **수입·지출**: 금액·토글·달력 액센트에만 녹/적을 쓰고, **주말 머리글**에 일=적, 토=primary 같은 약한 시각 힌트를 줄 수 있으나 텍스트 본문의 기본 글자색은 바꾸지 않는다.  
- **차트**: 막대·도넛 센터는 테마에 맞추고, **도넛 조각**은 10색 고정 팔레트로 범주를 구분해 한 화면에 여러 카테고리가 있어도 식별 가능하게 한다.  
- **오버레이**: 시트·모달 뒤는 **반투명 검정(시트 50%·리스트 팝업 40%)**으로 포커스를 앞에 둔다.  
- **고정 흰색**: 선택된 칩·강한 CTA에만 `#FFFFFF`를 써, 배경·경계가 바뀌어도 대비가 흔들리지 않게 한다.

## 타이포그래피 (Typography)

- **패밀리**: 임의 웹폰트가 아닌 **플랫폼 기본 UI 서체**를 써, 입력·리스트·차트가 네이티브와 맞닿는 느낌을 낸다.  
- **위계**: 화면명(22/18), 폼 제목(20), 카드/섹션 제목(16)으로 큰 틀을 잡고, **금액 히어로(28, 굵게)**가 폼의 시각적 중심이 된다.  
- **데이터 밀도**: 달력 셀 안의 수입·지출액은 **9px**로 촘촘히 넣어, 한 칸이 “작은 대시보드”처럼 보이게 한다.  
- **탭**: 하단 탭 글자는 **11px**로 작고 보조적이어서, 콘텐츠 영역이 주인공이 된다.

## 레이아웃·간격 (Layout & Spacing)

- **격자**: **8px**를 기본 단위로 쓰고, 4·6·12·16·20·32px가 반복된다. 수평 패딩 16, 카드/폼 20, 하단 여백 32 정도의 리듬이 일관된다.  
- **수직 구획**: 머리막대·검색·필터·콘텐츠가 **가는 구분선(hairline)**으로 쌓이는 스택형 레이아웃이다.  
- **빈 상태**: 짧은 한 줄 설명(14px)과 넉넉한 세로 패딩으로 “없다”는 것을 감정 없이 전달한다.

## 모양 (Radii & Shape)

- **입력·강한 사각**: **10px** 둥근 모서리로 통일해 폼·토글·검색창이 한 세트로 읽힌다.  
- **필·칩·필터**: **16px**로 필과 칩을 “캡슐/알약” 느낌으로.  
- **카드·모달**: **12px**로 약한 카드 느낌.  
- **달력 날짜·오늘 링**: 작은 6~12px 반지름; 오늘은 **얇은 primary 링**만.  
- **플로팅 버튼**: **56×56**, 완전한 원(28px radius), 탭바 위에 떠 있는 **접시형 액션**으로 인지되게 한다.

## 깊이·그림자 (Elevation)

- **대부분의 화면**: 그림자 없이 **면 분리(배경 vs 카드) + 1px 경계**만.  
- **FAB만**: iOS는 검정 30% 부드러운 그림자, Android는 `elevation: 6`로 **“떠 있는” 단 하나**의 떠블 표시다.  
- **하단 시트**: 배경 딤 + 시트 `surface`로, 스크롤 콘텐츠는 시트 안에서만 끝난다.

## 모션 (Motion)

- **터치**: 0.7~0.8 `activeOpacity`로 가벼운 눌림.  
- **시트/모달**: 당김으로 닫기, 반투명 배경.  
- **차트**: 막대 **애니메이션** 켜서 값 변화를 부드럽게.  
- **리스트**: 끝 스크롤 30% 지점에서 다음 페이지·추가 로딩(내부 chunk 단위)을 전제로 한 **연속 스크롤** 패턴.

## 컴포넌트·패턴 (Component Patterns)

- **하단 탐색**: 5탭(달력, 내역, 가운데 FAB 자리, 통계, 설정); 가운데는 “빈” 자리이고, **둥근 primary FAB**이 탭 위 중앙에 겹쳐 **추가**의 유일한 주입력으로 보이게 한다.  
- **달력 셀**: 선택 시 `primary` 배경 + 흰 글자·흰 금액으로, 비선택은 녹/적 액센트만.  
- **거래 입력**: 수입/지출 세그먼트가 **반쪽씩** 채워지는 토글이 먼저, 금액·날짜·칩(카테고리·결제수단) 순. 저장은 **수입·지출에 대응하는 색으로 채운** 넓은 버튼, 취소는 외곽선만.  
- **거래 한 줄**: 카테고리 굵게, 메모·결제수단은 2·3단계 `text-secondary`, 금액은 수입/지출색 + 접두 + 원.  
- **통계**: 월/연 토글이 `primary`로, 카드 3장(도넛, 월별 막대, 결제수단 막대)이 같은 12px 카드·16px 내부 여백으로 맞춘다.  
- **설정**: 흰/연 카드 안에 장부·테마·가져오기, 강한 액션은 `primary` solid, 약한 대안은 outline primary.

## 접근·사용성 의도

- **색맹/대비**: 본문은 늘 `text` 대비를 유지하고, 수입/지출은 **색+부호(+/−)+문맥(토글, 라벨)**로 이중으로 전달한다.  
- **한 손**: 하단이 주 상호작용(탭, FAB)으로 모이고, 시트는 화면 대부분(85%)까지 올라 **폼이 손끝 영역**에 머무르도록 한다.  
- **이모지 아이콘**: 벡터 아이콘 세트 대신 이모지(달력, 클립보드, 차트, 톱니)로 *친근한 일상* 톤을 약하게 넣는다(픽셀 퍼펙트보다 “가계부 앱” 느낌 우선).

이 문서의 frontmatter 토큰은 위 서술한 시각 규칙을 **한 번에 복사·이식**할 수 있게 묶은 것이며, 구현 세부(라이브러리 이름, 파일 구조)는 **의도적으로 생략**해 어떤 스택에서도 동일한 겉모습·리듬을 목표로 할 수 있게 한다.
