---
name: 오늘얼마 (TodayHowMuch)
description: "React Native 기반 개인용 가계부. Brutalist 모노크롬 디자인으로, 흑백 대비와 굵은 타이포그래피에 집중한 데이터 위주 UI."

colors:
  light:
    ink: "#0A0A0A"
    paper: "#FAFAFA"
    card: "#FFFFFF"
    mute1: "#737373"
    mute2: "#A3A3A3"
    mute3: "#525252"
    rule: "#E5E5E5"
    hair: "#262626"
    income: "#737373"
    expense: "#0A0A0A"
    primary: "#0A0A0A"
    primaryLight: "#E5E5E5"
    tabBar: "#FFFFFF"
    tabBarBorder: "#0A0A0A"
    fab: "#0A0A0A"
    fabText: "#FFFFFF"
  dark:
    ink: "#F5F5F5"
    paper: "#0A0A0A"
    card: "#1A1A1A"
    mute1: "#A3A3A3"
    mute2: "#737373"
    mute3: "#D4D4D4"
    rule: "#333333"
    hair: "#D4D4D4"
    income: "#A3A3A3"
    expense: "#F5F5F5"
    primary: "#F5F5F5"
    primaryLight: "#333333"
    tabBar: "#1A1A1A"
    tabBarBorder: "#F5F5F5"
    fab: "#F5F5F5"
    fabText: "#0A0A0A"
  semantic:
    delete-action: "#D32F2F"
    delete-text: "#FFFFFF"
    modal-scrim: "rgba(0, 0, 0, 0.4)"
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

typography:
  family: "System (platform default; SF Pro on iOS, Roboto on Android)"
  month-label:
    fontSize: 34px
    fontWeight: "900"
    letterSpacing: -1.7
    fontVariant: tabular-nums
  form-title:
    fontSize: 20px
    fontWeight: "700"
  total-value:
    fontSize: 17px
    fontWeight: "800"
    letterSpacing: -0.34
    fontVariant: tabular-nums
  total-label:
    fontSize: 10px
    fontWeight: "700"
    letterSpacing: 1.8
    textTransform: uppercase
  body:
    fontSize: 15px
    fontWeight: "500"
  body-emphasis:
    fontSize: 15px
    fontWeight: "700"
  amount-large:
    fontSize: 28px
    fontWeight: "700"
  amount-row:
    fontSize: 16px
    fontWeight: "800"
    fontVariant: tabular-nums
  label:
    fontSize: 13px
    fontWeight: "500"
  chip:
    fontSize: 13px
    fontWeight: "500"
  input:
    fontSize: 16px
    fontWeight: "400"
  tab-label:
    fontSize: 10px
    fontWeight: "800"
    letterSpacing: 1
    textTransform: uppercase
  tab-icon:
    fontSize: 16px
    fontWeight: "800"
  calendar-day:
    fontSize: 12px
    fontWeight: "800"
    letterSpacing: -0.24
    fontVariant: tabular-nums
  calendar-income:
    fontSize: 9px
    fontWeight: "600"
    fontVariant: tabular-nums
  calendar-expense:
    fontSize: 11px
    fontWeight: "800"
    fontVariant: tabular-nums
  now-badge:
    fontSize: 7px
    fontWeight: "800"
    letterSpacing: 1.05
  nav-arrow:
    fontSize: 14px
    fontWeight: "600"
  ledger-badge:
    fontSize: 11px
    fontWeight: "700"
    letterSpacing: 1.1
  hide-income-badge:
    fontSize: 10px
    fontWeight: "800"
    letterSpacing: 1
  chart-axis:
    fontSize: 10px
  chart-center-amount:
    fontSize: 15px
    fontWeight: "700"
  chart-center-unit:
    fontSize: 11px
  legend:
    fontSize: 13px
  fab-plus:
    fontSize: 28px
    fontWeight: "300"
    lineHeight: 32px
  method-label:
    fontSize: 13px
    fontWeight: "500"
  memo:
    fontSize: 13px
  payment-method:
    fontSize: 11px
    fontWeight: "600"
    letterSpacing: 0.5

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
  form-horizontal: 20px
  form-bottom: 32px
  chip-gap: 8px
  section-gap: 20px
  button-gap: 12px

radii:
  none: 0
  sm: 5px
  md: 10px
  lg: 12px
  chip: 16px
  fab: 0

elevation:
  border-hairline: "StyleSheet.hairlineWidth"
  border-default: 1px
  border-bold: 2px
  border-badge: 1.5px

layout:
  tab-bar-height: 52px
  bottom-sheet-snap: "85%"
  fab-size: 56px
  day-cell-min-height: 70px
  pie-chart-outer-radius: 90px
  pie-chart-inner-radius: 55px
  bar-chart-bar-width: 18px
  bar-chart-pair-spacing: 16px
  bar-chart-inner-spacing: 2px
  payment-bar-height: 10px
  payment-label-width: 60px
  payment-amount-width: 80px
  legend-dot-size: 10px
  delete-swipe-width: 72px
  ledger-modal-max-height: 300px

motion:
  touch-opacity-primary: 0.8
  touch-opacity-secondary: 0.7
  bar-chart-animated: true
  modal-animation: fade
  swipe-friction: 2

components:
  tab-bar:
    height: "{layout.tab-bar-height} + safeAreaBottom"
    background: "{colors.card}"
    border-top-width: 2px
    border-top-color: "{colors.ink}"
    item-divider: "1px {colors.rule}"
    active-bg: "{colors.ink}"
    active-text: "{colors.card}"
    inactive-text: "{colors.mute1}"
    icons: "▪ ≡ ◆ ▲ ◎ (Unicode, not emoji)"
  fab:
    size: 56px
    shape: square
    border-radius: 0
    border-width: 2px
    background: "{colors.ink}"
    icon: "+"
    icon-color: "{colors.card}"
    icon-weight: "300"
  ledger-badge:
    shape: square
    border-radius: 0
    border-width: 1.5px
    border-color: "{colors.ink}"
    text-transform: uppercase
  hide-income-badge:
    shape: square
    border-width: 1.5px
    active-bg: "{colors.mute2}"
    active-text: "{colors.card}"
    active-text-decoration: line-through
    inactive-border: "{colors.ink}"
    inactive-text: "{colors.ink}"
  month-header:
    border-top: "2px {colors.ink}"
    border-bottom: "2px {colors.ink}"
    nav-row-border-bottom: "1px {colors.ink}"
    totals-divider: "1px vertical {colors.ink}"
  day-cell:
    min-height: 70px
    padding: "4px 4px 3px"
    non-current-month-bg: "{colors.rule}"
    non-current-month-text-opacity: 0.4
    today-and-selected: "inverted (ink bg, card text)"
    now-badge: "inverted rectangle, no radius"
    inset-border: "2px {colors.card} (today+selected)"
  transaction-item:
    padding: "12px 16px"
    border-bottom: "1px {colors.rule}"
    category-size: 15px bold
    memo-color: "{colors.mute1}"
    method-color: "{colors.mute2}"
    income-amount-color: "{colors.mute1}"
    expense-amount-color: "{colors.ink}"
    delete-action-bg: "#D32F2F"
    delete-action-width: 72px
  transaction-form:
    surface: "{colors.surface}"
    content-padding: "0 20px 32px"
    toggle-radius: 10px
    toggle-active-bg: "{colors.primary}"
    toggle-active-text: "{colors.fabText}"
    input-radius: 10px
    input-border: "1px {colors.border}"
    chip-radius: 16px
    chip-selected-bg: "{colors.primary}"
    chip-selected-text: "{colors.card}"
    save-btn-radius: 10px
    save-btn-bg: "{colors.primary}"
    cancel-btn-radius: 10px
    cancel-btn-border: "1px {colors.border}"
    delete-text-color: "#D32F2F"
  ledger-modal:
    overlay: "rgba(0,0,0,0.4)"
    sheet-bg: "{colors.ink}"
    sheet-title-color: "{colors.card}"
    item-bg: "{colors.card}"
    item-text: "{colors.ink}"
    selected-item-bg: "{colors.ink}"
    selected-item-text: "{colors.card}"
  stats-card:
    radius: "{radii.lg}"
    padding: "{spacing.xl}"
    background: "{colors.card}"
    border: "hairline {colors.border}"
  pie-chart:
    palette: "{colors.semantic.chart-pie}"
    center-amount: "{typography.chart-center-amount}"
    legend-dot: "10x10px rounded"
  bar-chart:
    income-bar: "{colors.income}"
    expense-bar: "{colors.expense}"
    axis-color: "{colors.border}"
  payment-bar:
    track: "{colors.border}"
    fill: "{colors.primary}"
    height: 10px
    radius: 5px
---

## 브랜드·톤

이 앱은 **Brutalist 모노크롬**을 기조로 한다. 색상 없이 **흑과 백, 그리고 회색의 농도**로 정보의 위계를 만든다. 톤은 **무장식·사무적·직관적**이며, 장식적 그래데이션이나 유채색 액센트는 쓰지 않는다.

시각적 정체성은 **거친 직각·굵은 경계선·무채색 대비**로 잡힌다. 라이트 모드는 밝은 배경(`#FAFAFA`)에 짙은 잉크(`#0A0A0A`), 다크 모드는 순수 검정 배경에 밝은 잉크로, 모드 전환 시 ink↔paper가 반전되는 구조다.

## 색 (Colors)

- **모노크롬**: 전체 UI가 `ink`(전경)와 `paper`(배경) 두 극으로 구성된다. `card`는 paper보다 한 톤 밝아(또는 어두워) 면 분리를 만들고, `rule`은 hairline 경계에만 쓰인다.
- **회색 위계**: `mute1`(수입 금액, 보조 텍스트), `mute2`(3차 텍스트, 비활성), `mute3`(날짜 숫자 등) 세 단계의 회색으로 정보 중요도를 구분한다.
- **수입·지출 구분**: 유채색 없이 **농도**로 구분한다. 지출은 `ink`(가장 진함)으로 강조, 수입은 `mute1`(회색)으로 억제. 부호(`+`/`−`)가 의미를 보완한다.
- **차트만 유채색**: 파이차트 조각에만 10색 고정 팔레트를 써서 카테고리를 식별한다. 막대차트는 모노크롬(`income`/`expense` 톤)을 그대로 쓴다.
- **삭제만 적색**: 스와이프 삭제 액션(`#D32F2F`)과 삭제 버튼 텍스트에만 유일하게 빨간색을 쓴다. 파괴적 행위의 경고 목적.
- **오버레이**: 모달 뒤는 반투명 검정 40%(`rgba(0,0,0,0.4)`)로 포커스를 앞에 둔다.

## 타이포그래피 (Typography)

- **패밀리**: 플랫폼 기본 UI 서체(SF Pro / Roboto). 커스텀 폰트 없음.
- **무게로 위계**: 극단적 굵기 차이가 brutalist 느낌을 만든다. 월 라벨 `900`, 탭·배지·NOW `800`, 금액 `700~800`, 본문 `500~600`, FAB의 + 기호만 `300`으로 가볍게.
- **데이터 밀도**: 달력 셀 안의 수입은 **9px**, 지출은 **11px**로 촘촘히 넣어 한 칸이 미니 대시보드처럼 보인다. `tabular-nums`로 숫자 정렬.
- **대문자**: 탭 라벨, 장부 배지, NOW 배지, 모달 제목에 `uppercase` + 넓은 `letterSpacing`으로 기계적 느낌.
- **월 라벨**: `34px / 900 / letterSpacing -1.7`로 화면의 시각적 앵커 역할.

## 레이아웃·간격 (Layout & Spacing)

- **격자**: **8px** 기본 단위. 4·6·8·12·16·20·32px가 반복된다. 수평 패딩 16px, 폼 내부 20px, 하단 여백 32px.
- **수직 구획**: 굵은 2px 경계선(MonthHeader 상하, TabBar 상단)이 큰 구획을, 1px 또는 hairline이 리스트 행을 구분한다.
- **탭바 구분**: 각 탭 사이에 1px 세로 구분선(`rule`), 선택 탭은 ink 배경으로 반전.

## 모양 (Radii & Shape)

- **직각 우선**: FAB, 장부 배지, 수입 가리기 배지, NOW 배지, 장부 선택 모달이 모두 **borderRadius: 0**. Brutalist의 핵심 조형 언어.
- **입력·버튼**: **10px** 둥근 모서리. 토글, 텍스트 입력, 저장/취소 버튼이 한 세트로 읽힌다.
- **칩**: **16px**로 캡슐/알약 형태. 카테고리·결제수단 선택.
- **카드**: **12px**로 약한 카드 느낌. 통계 섹션.
- **바 차트 트랙**: **5px** borderRadius로 둥근 프로그레스 바.

## 깊이·그림자 (Elevation)

- **그림자 없음**: 전체 앱에서 box-shadow / elevation을 쓰지 않는다. FAB 포함.
- **면 분리 + 경계선만**: 배경(`paper`) vs 카드(`card`) 색 차이와 1~2px 경계선으로 깊이를 표현한다.
- **경계선 위계**: 2px(MonthHeader·TabBar, 구조적 분할) > 1.5px(배지 테두리) > 1px(리스트 행, 입력 필드) > hairline(카드 외곽).

## 반전 패턴 (Inversion)

Brutalist 디자인의 핵심 인터랙션 패턴. 선택/활성 상태를 **ink↔card 색 반전**으로 표현한다:

- **탭바**: 선택 탭 = ink 배경 + card 텍스트
- **달력 셀**: 오늘/선택 = ink 배경 + card 텍스트·금액
- **칩**: 선택 = primary(=ink) 배경 + card 텍스트
- **토글**: 활성 = primary 배경 + fabText
- **장부 모달**: 선택 항목 = ink 배경 + card 텍스트
- **NOW 배지**: 반전 배경 위 반전 텍스트

## 모션 (Motion)

- **터치**: `activeOpacity` 0.7~0.8로 가벼운 눌림. 진동·스케일 애니메이션 없음.
- **모달**: `animationType="fade"` + 반투명 배경으로 등장.
- **차트**: 막대차트 `isAnimated: true`로 값 변화 부드럽게.
- **스와이프**: `react-native-gesture-handler` Swipeable로 삭제. `friction: 2`, `overshootRight: false`.

## 컴포넌트·패턴 (Component Patterns)

- **하단 탐색**: 5탭(달력·내역·반복·통계·설정). Unicode 기호(▪ ≡ ◆ ▲ ◎)를 아이콘으로 사용. 이모지 아닌 기하학적 심볼. 선택 탭은 ink 배경 반전.
- **FAB**: 56×56 **정사각형**(borderRadius: 0). ink 배경, 2px 테두리. 중앙 `+` 기호는 fontWeight 300으로 가볍게. 탭바 위 중앙에 위치.
- **장부 배지**: 직각 사각형, 1.5px 테두리, 대문자, 넓은 letterSpacing. 헤더 좌측.
- **수입 가리기 배지**: 직각 사각형, 1.5px 테두리. 활성 시 mute2 배경 + 취소선. 헤더 우측.
- **MonthHeader**: 상하 2px 굵은 테두리. 내비게이션(◀ 월.라벨 ▶) + 수입/지출 합계 행. 중앙 세로 구분선.
- **달력 셀**: 날짜(좌상단) + NOW 배지 + 금액(우하단). 오늘/선택 시 전체 반전. 비당월 셀은 rule 배경 + 0.4 opacity.
- **거래 입력**: 바텀시트. 지출/수입 세그먼트 토글 → 금액(28px hero) → 날짜 → 카테고리 칩 → 결제수단 칩 → 메모 → 저장(2:1)/취소(1:2) 버튼.
- **거래 한 줄**: 카테고리(굵게) + 메모(mute1) + 결제수단(mute2, letterSpacing) | 금액(수입=mute1, 지출=ink). 우측 스와이프 삭제.
- **통계 카드**: hairline 테두리 + 12px radius + 16px 패딩. 도넛(중앙 합계)·월별 막대·결제수단 바.
- **장부 선택 모달**: ink 배경 시트, card 배경 항목. 선택 항목만 반전.

## 접근·사용성 의도

- **색맹 안전**: 유채색에 의존하지 않는다. 수입/지출은 **농도(진/연) + 부호(+/−) + 문맥(토글, 라벨)**로 삼중 전달.
- **고대비**: ink/paper 간 명도 차이가 극대화되어 가독성 높음.
- **한 손**: 하단 탭 + FAB로 주 상호작용이 모인다. 바텀시트 85%까지 올라 폼이 손끝 영역에 머무름.
- **Unicode 아이콘**: 벡터 아이콘 세트나 이모지 대신 기하학적 Unicode 심볼(▪ ≡ ◆ ▲ ◎ ◀ ▶ ▾ ✕ ✓)로 일관된 brutalist 톤.

이 문서의 frontmatter 토큰은 위 서술한 시각 규칙을 한 번에 복사·이식할 수 있게 묶은 것이며, 구현 세부(라이브러리 이름, 파일 구조)는 의도적으로 생략해 디자인 언어만 전달한다.
