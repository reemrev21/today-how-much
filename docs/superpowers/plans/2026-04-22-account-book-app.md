# 가계부 앱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React Native CLI 기반 달력형 개인 가계부 앱. 로컬 DB(op-sqlite) + CSV 양방향 지원.

**Architecture:** 4탭 + FAB 네비게이션. op-sqlite로 거래 데이터 관리, MMKV로 설정 저장. jotai로 상태관리. 달력 메인 화면에서 날짜별 수입/지출 금액 표시, BottomSheet로 상세/입력.

**Tech Stack:** React Native CLI 0.77+, TypeScript, op-sqlite, react-native-mmkv, jotai, @react-navigation v7, @gorhom/bottom-sheet, react-native-reanimated, dayjs, @shopify/flash-list, react-native-gifted-charts, papaparse, react-native-fs, react-native-share

---

## File Structure

```
src/
├── App.tsx                              # 앱 루트. DB 초기화 + 테마 프로바이더 + 네비게이션
├── types/
│   └── index.ts                         # Ledger, Transaction, RecurringRule, ThemeMode 등 타입
├── db/
│   ├── connection.ts                    # op-sqlite DB 연결 싱글턴
│   ├── migrations.ts                    # 스키마 생성/마이그레이션
│   ├── ledgerQueries.ts                 # ledgers CRUD
│   ├── transactionQueries.ts            # transactions CRUD + 집계 쿼리
│   └── recurringQueries.ts             # recurring_rules CRUD + 자동생성 로직
├── store/
│   ├── settings.ts                      # MMKV 기반 설정 atoms (theme, currentLedger 등)
│   └── atoms.ts                         # jotai atoms (선택된 날짜, 필터 상태 등)
├── styles/
│   └── theme.ts                         # 라이트/다크 테마 색상 정의 + useTheme 훅
├── navigation/
│   └── RootNavigator.tsx                # BottomTab + NativeStack + FAB
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx             # 월간 달력 그리드 (날짜 셀 렌더링)
│   │   ├── DayCell.tsx                  # 개별 날짜 셀 (날짜 + 수입/지출 금액)
│   │   └── MonthHeader.tsx              # ◀ 2026년 4월 ▶ 헤더
│   ├── transaction/
│   │   ├── TransactionForm.tsx          # 거래 입력/수정 폼 (BottomSheet 내부)
│   │   ├── TransactionItem.tsx          # 거래 리스트 아이템 (스와이프 삭제)
│   │   └── TransactionList.tsx          # 날짜별 거래 리스트 (BottomSheet)
│   ├── chart/
│   │   ├── CategoryPieChart.tsx         # 카테고리별 파이차트
│   │   ├── MonthlyTrendChart.tsx        # 월별 추이 바차트
│   │   └── PaymentMethodChart.tsx       # 결제수단별 비율 차트
│   ├── common/
│   │   ├── FAB.tsx                      # 플로팅 액션 버튼
│   │   └── LedgerSelector.tsx           # 장부 선택 드롭다운
│   └── settings/
│       ├── CategoryManager.tsx          # 카테고리 추가/삭제/순서변경
│       ├── PaymentMethodManager.tsx     # 결제수단 관리
│       └── RecurringRuleManager.tsx     # 반복 거래 규칙 관리
├── screens/
│   ├── CalendarScreen.tsx               # 달력 탭 메인
│   ├── HistoryScreen.tsx                # 내역 탭
│   ├── StatsScreen.tsx                  # 통계 탭
│   └── SettingsScreen.tsx               # 설정 탭
├── hooks/
│   ├── useTransactions.ts               # 거래 CRUD 훅 (쿼리 + 캐시 무효화)
│   └── useRecurring.ts                  # 반복거래 자동생성 훅
└── utils/
    ├── csv.ts                           # CSV export/import (papaparse 래퍼)
    ├── date.ts                          # dayjs 헬퍼 (월 시작/끝, 달력 그리드 생성)
    └── format.ts                        # 금액 포맷 (1000 → "1,000")
```

---

## Task 1: 프로젝트 초기화 & 의존성 설치

**Files:**
- Create: RN CLI 프로젝트 루트 전체
- Modify: `package.json`, `babel.config.js`, `tsconfig.json`

- [ ] **Step 1: React Native CLI 프로젝트 생성**

```bash
cd /Users/lee/git/account-book-app
npx @react-native-community/cli init AccountBook --directory . --skip-git
```

프로젝트가 이미 git init 되어 있으므로 `--skip-git` 사용.

- [ ] **Step 2: 핵심 의존성 설치**

```bash
cd /Users/lee/git/account-book-app
yarn add @op-engineering/op-sqlite \
  react-native-mmkv \
  jotai \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/native-stack \
  react-native-screens \
  react-native-safe-area-context \
  @gorhom/bottom-sheet \
  react-native-reanimated \
  react-native-gesture-handler \
  dayjs \
  @shopify/flash-list \
  react-native-gifted-charts \
  react-native-svg \
  papaparse \
  react-native-fs \
  react-native-share \
  react-native-uuid
```

```bash
yarn add -D @types/papaparse @types/react-native-uuid
```

- [ ] **Step 3: babel.config.js에 reanimated 플러그인 추가**

```js
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

- [ ] **Step 4: iOS pod 설치**

```bash
cd /Users/lee/git/account-book-app/ios && pod install && cd ..
```

- [ ] **Step 5: 빌드 확인**

```bash
yarn ios
```

시뮬레이터에서 기본 RN 화면 뜨는지 확인.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: init RN project with all dependencies"
```

---

## Task 2: 타입 정의

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 전체 타입 정의 작성**

```ts
// src/types/index.ts

export type TransactionType = 'income' | 'expense';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface Ledger {
  id: string;
  name: string;
  created_at: number;
}

export interface Transaction {
  id: string;
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  date: string; // "YYYY-MM-DD"
  created_at: number;
}

export interface RecurringRule {
  id: string;
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  day_of_month: number;
  is_active: boolean;
}

export interface DaySummary {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  category: string;
  total: number;
}

export interface PaymentMethodSummary {
  payment_method: string;
  total: number;
}

export interface MonthlyTrend {
  month: string; // "YYYY-MM"
  income: number;
  expense: number;
}

export interface TransactionFilter {
  category?: string;
  payment_method?: string;
  type?: TransactionType;
  search?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: 데이터베이스 레이어

**Files:**
- Create: `src/db/connection.ts`, `src/db/migrations.ts`, `src/db/ledgerQueries.ts`, `src/db/transactionQueries.ts`, `src/db/recurringQueries.ts`
- Test: `__tests__/db/ledgerQueries.test.ts`, `__tests__/db/transactionQueries.test.ts`, `__tests__/db/recurringQueries.test.ts`

- [ ] **Step 1: DB 연결 싱글턴 작성**

```ts
// src/db/connection.ts
import {open, type DB} from '@op-engineering/op-sqlite';

let db: DB | null = null;

export function getDB(): DB {
  if (!db) {
    db = open({name: 'accountbook.db'});
  }
  return db;
}

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}
```

- [ ] **Step 2: 마이그레이션 작성**

```ts
// src/db/migrations.ts
import {getDB} from './connection';

export function runMigrations(): void {
  const db = getDB();

  db.execute(`
    CREATE TABLE IF NOT EXISTS ledgers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      ledger_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      memo TEXT,
      date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE
    );
  `);

  db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date
    ON transactions(ledger_id, date);
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS recurring_rules (
      id TEXT PRIMARY KEY,
      ledger_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      memo TEXT,
      day_of_month INTEGER NOT NULL CHECK(day_of_month BETWEEN 1 AND 31),
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE
    );
  `);
}
```

- [ ] **Step 3: ledger 쿼리 작성**

```ts
// src/db/ledgerQueries.ts
import uuid from 'react-native-uuid';
import {getDB} from './connection';
import type {Ledger} from '../types';

export function createLedger(name: string): Ledger {
  const db = getDB();
  const id = uuid.v4() as string;
  const created_at = Date.now();
  db.execute('INSERT INTO ledgers (id, name, created_at) VALUES (?, ?, ?)', [
    id,
    name,
    created_at,
  ]);
  return {id, name, created_at};
}

export function getAllLedgers(): Ledger[] {
  const db = getDB();
  const result = db.execute('SELECT * FROM ledgers ORDER BY created_at ASC');
  return (result.rows?._array ?? []) as Ledger[];
}

export function renameLedger(id: string, name: string): void {
  const db = getDB();
  db.execute('UPDATE ledgers SET name = ? WHERE id = ?', [name, id]);
}

export function deleteLedger(id: string): void {
  const db = getDB();
  db.execute('DELETE FROM ledgers WHERE id = ?', [id]);
}
```

- [ ] **Step 4: transaction 쿼리 작성**

```ts
// src/db/transactionQueries.ts
import uuid from 'react-native-uuid';
import {getDB} from './connection';
import type {
  Transaction,
  TransactionType,
  DaySummary,
  CategorySummary,
  PaymentMethodSummary,
  MonthlyTrend,
  TransactionFilter,
} from '../types';

export function createTransaction(params: {
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  date: string;
}): Transaction {
  const db = getDB();
  const id = uuid.v4() as string;
  const created_at = Date.now();
  db.execute(
    `INSERT INTO transactions (id, ledger_id, type, amount, category, payment_method, memo, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      params.ledger_id,
      params.type,
      params.amount,
      params.category,
      params.payment_method,
      params.memo,
      params.date,
      created_at,
    ],
  );
  return {id, ...params, created_at};
}

export function updateTransaction(
  id: string,
  params: {
    type: TransactionType;
    amount: number;
    category: string;
    payment_method: string;
    memo: string | null;
    date: string;
  },
): void {
  const db = getDB();
  db.execute(
    `UPDATE transactions SET type=?, amount=?, category=?, payment_method=?, memo=?, date=? WHERE id=?`,
    [
      params.type,
      params.amount,
      params.category,
      params.payment_method,
      params.memo,
      params.date,
      id,
    ],
  );
}

export function deleteTransaction(id: string): void {
  const db = getDB();
  db.execute('DELETE FROM transactions WHERE id = ?', [id]);
}

export function getTransactionsByDate(
  ledgerId: string,
  date: string,
): Transaction[] {
  const db = getDB();
  const result = db.execute(
    'SELECT * FROM transactions WHERE ledger_id = ? AND date = ? ORDER BY created_at DESC',
    [ledgerId, date],
  );
  return (result.rows?._array ?? []) as Transaction[];
}

export function getMonthDaySummaries(
  ledgerId: string,
  yearMonth: string,
): DaySummary[] {
  const db = getDB();
  const result = db.execute(
    `SELECT date,
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE ledger_id = ? AND date LIKE ?
     GROUP BY date
     ORDER BY date`,
    [ledgerId, `${yearMonth}%`],
  );
  return (result.rows?._array ?? []) as DaySummary[];
}

export function getMonthTotals(
  ledgerId: string,
  yearMonth: string,
): {income: number; expense: number} {
  const db = getDB();
  const result = db.execute(
    `SELECT
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE ledger_id = ? AND date LIKE ?`,
    [ledgerId, `${yearMonth}%`],
  );
  const row = result.rows?._array?.[0];
  return {income: row?.income ?? 0, expense: row?.expense ?? 0};
}

export function getCategorySummary(
  ledgerId: string,
  yearMonth: string,
): CategorySummary[] {
  const db = getDB();
  const result = db.execute(
    `SELECT category, SUM(amount) as total
     FROM transactions
     WHERE ledger_id = ? AND date LIKE ? AND type = 'expense'
     GROUP BY category
     ORDER BY total DESC`,
    [ledgerId, `${yearMonth}%`],
  );
  return (result.rows?._array ?? []) as CategorySummary[];
}

export function getPaymentMethodSummary(
  ledgerId: string,
  yearMonth: string,
): PaymentMethodSummary[] {
  const db = getDB();
  const result = db.execute(
    `SELECT payment_method, SUM(amount) as total
     FROM transactions
     WHERE ledger_id = ? AND date LIKE ?
     GROUP BY payment_method
     ORDER BY total DESC`,
    [ledgerId, `${yearMonth}%`],
  );
  return (result.rows?._array ?? []) as PaymentMethodSummary[];
}

export function getMonthlyTrend(
  ledgerId: string,
  year: string,
): MonthlyTrend[] {
  const db = getDB();
  const result = db.execute(
    `SELECT substr(date, 1, 7) as month,
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE ledger_id = ? AND date LIKE ?
     GROUP BY month
     ORDER BY month`,
    [ledgerId, `${year}%`],
  );
  return (result.rows?._array ?? []) as MonthlyTrend[];
}

export function getFilteredTransactions(
  ledgerId: string,
  filter: TransactionFilter,
  limit: number,
  offset: number,
): Transaction[] {
  const db = getDB();
  const conditions = ['ledger_id = ?'];
  const params: (string | number)[] = [ledgerId];

  if (filter.category) {
    conditions.push('category = ?');
    params.push(filter.category);
  }
  if (filter.payment_method) {
    conditions.push('payment_method = ?');
    params.push(filter.payment_method);
  }
  if (filter.type) {
    conditions.push('type = ?');
    params.push(filter.type);
  }
  if (filter.search) {
    conditions.push('memo LIKE ?');
    params.push(`%${filter.search}%`);
  }

  params.push(limit, offset);

  const result = db.execute(
    `SELECT * FROM transactions
     WHERE ${conditions.join(' AND ')}
     ORDER BY date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    params,
  );
  return (result.rows?._array ?? []) as Transaction[];
}

export function getTransactionsForExport(
  ledgerId: string,
  startDate?: string,
  endDate?: string,
): Transaction[] {
  const db = getDB();
  let query = 'SELECT * FROM transactions WHERE ledger_id = ?';
  const params: string[] = [ledgerId];

  if (startDate && endDate) {
    query += ' AND date >= ? AND date <= ?';
    params.push(startDate, endDate);
  }

  query += ' ORDER BY date ASC, created_at ASC';
  const result = db.execute(query, params);
  return (result.rows?._array ?? []) as Transaction[];
}
```

- [ ] **Step 5: recurring 쿼리 작성**

```ts
// src/db/recurringQueries.ts
import uuid from 'react-native-uuid';
import dayjs from 'dayjs';
import {getDB} from './connection';
import type {RecurringRule, TransactionType} from '../types';

export function createRecurringRule(params: {
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  day_of_month: number;
}): RecurringRule {
  const db = getDB();
  const id = uuid.v4() as string;
  db.execute(
    `INSERT INTO recurring_rules (id, ledger_id, type, amount, category, payment_method, memo, day_of_month, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      id,
      params.ledger_id,
      params.type,
      params.amount,
      params.category,
      params.payment_method,
      params.memo,
      params.day_of_month,
    ],
  );
  return {id, ...params, is_active: true};
}

export function updateRecurringRule(
  id: string,
  params: {
    type: TransactionType;
    amount: number;
    category: string;
    payment_method: string;
    memo: string | null;
    day_of_month: number;
    is_active: boolean;
  },
): void {
  const db = getDB();
  db.execute(
    `UPDATE recurring_rules SET type=?, amount=?, category=?, payment_method=?, memo=?, day_of_month=?, is_active=? WHERE id=?`,
    [
      params.type,
      params.amount,
      params.category,
      params.payment_method,
      params.memo,
      params.day_of_month,
      params.is_active ? 1 : 0,
      id,
    ],
  );
}

export function deleteRecurringRule(id: string): void {
  const db = getDB();
  db.execute('DELETE FROM recurring_rules WHERE id = ?', [id]);
}

export function getRecurringRules(ledgerId: string): RecurringRule[] {
  const db = getDB();
  const result = db.execute(
    'SELECT * FROM recurring_rules WHERE ledger_id = ? ORDER BY day_of_month ASC',
    [ledgerId],
  );
  return ((result.rows?._array ?? []) as Array<Omit<RecurringRule, 'is_active'> & {is_active: number}>).map(
    row => ({...row, is_active: row.is_active === 1}),
  );
}

export function processRecurringRules(
  ledgerId: string,
  lastCheck: string,
  today: string,
): number {
  const db = getDB();
  const rules = getRecurringRules(ledgerId).filter(r => r.is_active);
  let created = 0;

  const startDate = dayjs(lastCheck).add(1, 'day');
  const endDate = dayjs(today);

  for (const rule of rules) {
    let current = startDate.startOf('month');
    while (current.isBefore(endDate) || current.isSame(endDate, 'month')) {
      const daysInMonth = current.daysInMonth();
      const day = Math.min(rule.day_of_month, daysInMonth);
      const targetDate = current.date(day).format('YYYY-MM-DD');

      if (targetDate > lastCheck && targetDate <= today) {
        const existing = db.execute(
          `SELECT id FROM transactions
           WHERE ledger_id = ? AND date = ? AND category = ? AND amount = ? AND type = ?
           LIMIT 1`,
          [ledgerId, targetDate, rule.category, rule.amount, rule.type],
        );

        if ((existing.rows?._array?.length ?? 0) === 0) {
          const id = uuid.v4() as string;
          db.execute(
            `INSERT INTO transactions (id, ledger_id, type, amount, category, payment_method, memo, date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              ledgerId,
              rule.type,
              rule.amount,
              rule.category,
              rule.payment_method,
              rule.memo,
              targetDate,
              Date.now(),
            ],
          );
          created++;
        }
      }

      current = current.add(1, 'month');
    }
  }

  return created;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/db/
git commit -m "feat: add database layer (connection, migrations, queries)"
```

---

## Task 4: 설정 스토어 (MMKV + Jotai)

**Files:**
- Create: `src/store/settings.ts`, `src/store/atoms.ts`

- [ ] **Step 1: MMKV 기반 설정 스토어 작성**

```ts
// src/store/settings.ts
import {MMKV} from 'react-native-mmkv';
import type {ThemeMode} from '../types';

export const storage = new MMKV();

const KEYS = {
  CURRENT_LEDGER_ID: 'current_ledger_id',
  THEME_MODE: 'theme_mode',
  CATEGORIES: 'categories',
  PAYMENT_METHODS: 'payment_methods',
  LAST_RECURRING_CHECK: 'last_recurring_check',
} as const;

const DEFAULT_CATEGORIES = [
  '식비',
  '교통비',
  '주거비',
  '통신비',
  '의료비',
  '문화생활',
  '쇼핑',
  '교육',
  '경조사',
  '기타지출',
  '월급',
  '부수입',
  '용돈',
  '기타수입',
];

const DEFAULT_PAYMENT_METHODS = ['현금', '카드', '계좌이체'];

export function getCurrentLedgerId(): string | undefined {
  return storage.getString(KEYS.CURRENT_LEDGER_ID);
}

export function setCurrentLedgerId(id: string): void {
  storage.set(KEYS.CURRENT_LEDGER_ID, id);
}

export function getThemeMode(): ThemeMode {
  return (storage.getString(KEYS.THEME_MODE) as ThemeMode) ?? 'system';
}

export function setThemeMode(mode: ThemeMode): void {
  storage.set(KEYS.THEME_MODE, mode);
}

export function getCategories(): string[] {
  const raw = storage.getString(KEYS.CATEGORIES);
  if (!raw) {
    storage.set(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(raw);
}

export function setCategories(categories: string[]): void {
  storage.set(KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getPaymentMethods(): string[] {
  const raw = storage.getString(KEYS.PAYMENT_METHODS);
  if (!raw) {
    storage.set(KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
    return DEFAULT_PAYMENT_METHODS;
  }
  return JSON.parse(raw);
}

export function setPaymentMethods(methods: string[]): void {
  storage.set(KEYS.PAYMENT_METHODS, JSON.stringify(methods));
}

export function getLastRecurringCheck(): string | undefined {
  return storage.getString(KEYS.LAST_RECURRING_CHECK);
}

export function setLastRecurringCheck(date: string): void {
  storage.set(KEYS.LAST_RECURRING_CHECK, date);
}
```

- [ ] **Step 2: Jotai atoms 작성**

```ts
// src/store/atoms.ts
import {atom} from 'jotai';
import dayjs from 'dayjs';
import type {TransactionFilter} from '../types';

// 현재 선택된 월 ("YYYY-MM")
export const selectedMonthAtom = atom(dayjs().format('YYYY-MM'));

// 달력에서 선택된 날짜 ("YYYY-MM-DD" | null)
export const selectedDateAtom = atom<string | null>(null);

// 내역 탭 필터
export const historyFilterAtom = atom<TransactionFilter>({});

// 통계 탭 기간 모드
export const statsPeriodAtom = atom<'monthly' | 'yearly'>('monthly');

// DB 변경 시 리렌더 트리거용 카운터
export const dbVersionAtom = atom(0);
```

- [ ] **Step 3: Commit**

```bash
git add src/store/
git commit -m "feat: add MMKV settings store and jotai atoms"
```

---

## Task 5: 테마 시스템

**Files:**
- Create: `src/styles/theme.ts`

- [ ] **Step 1: 테마 색상 + useTheme 훅 작성**

```ts
// src/styles/theme.ts
import {useColorScheme} from 'react-native';
import {useMemo} from 'react';
import {getThemeMode} from '../store/settings';

const light = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#888888',
  border: '#E0E0E0',
  income: '#2E7D32',
  expense: '#D32F2F',
  primary: '#5C6BC0',
  primaryLight: '#E8EAF6',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  fab: '#5C6BC0',
  fabText: '#FFFFFF',
};

const dark = {
  background: '#1A1A2E',
  surface: '#252545',
  card: '#2A2A4A',
  text: '#E0E0E0',
  textSecondary: '#888888',
  border: '#3A3A5A',
  income: '#51CF66',
  expense: '#FF6B6B',
  primary: '#7C6EF0',
  primaryLight: '#3A3A6A',
  tabBar: '#1E1E3A',
  tabBarBorder: '#2A2A4A',
  fab: '#7C6EF0',
  fabText: '#FFFFFF',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const themeMode = getThemeMode();

  return useMemo(() => {
    if (themeMode === 'light') return light;
    if (themeMode === 'dark') return dark;
    return systemScheme === 'dark' ? dark : light;
  }, [themeMode, systemScheme]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/
git commit -m "feat: add theme system with light/dark/system modes"
```

---

## Task 6: 유틸리티 함수

**Files:**
- Create: `src/utils/date.ts`, `src/utils/format.ts`, `src/utils/csv.ts`
- Test: `__tests__/utils/date.test.ts`, `__tests__/utils/format.test.ts`, `__tests__/utils/csv.test.ts`

- [ ] **Step 1: date 유틸 테스트 작성**

```ts
// __tests__/utils/date.test.ts
import {getCalendarDays, getMonthRange} from '../../src/utils/date';

describe('getCalendarDays', () => {
  it('returns 42 days for a month grid (6 weeks)', () => {
    const days = getCalendarDays('2026-04');
    expect(days).toHaveLength(42);
  });

  it('starts from the correct Sunday', () => {
    // 2026-04-01 is Wednesday, so grid starts from Sunday 2026-03-29
    const days = getCalendarDays('2026-04');
    expect(days[0]).toBe('2026-03-29');
    expect(days[3]).toBe('2026-04-01');
  });
});

describe('getMonthRange', () => {
  it('returns first and last day of month', () => {
    expect(getMonthRange('2026-04')).toEqual({
      start: '2026-04-01',
      end: '2026-04-30',
    });
  });

  it('handles February', () => {
    expect(getMonthRange('2026-02')).toEqual({
      start: '2026-02-01',
      end: '2026-02-28',
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
yarn test __tests__/utils/date.test.ts
```

Expected: FAIL — 모듈 없음

- [ ] **Step 3: date 유틸 구현**

```ts
// src/utils/date.ts
import dayjs from 'dayjs';

export function getCalendarDays(yearMonth: string): string[] {
  const firstDay = dayjs(`${yearMonth}-01`);
  const startOfGrid = firstDay.subtract(firstDay.day(), 'day'); // 이전 일요일

  const days: string[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(startOfGrid.add(i, 'day').format('YYYY-MM-DD'));
  }
  return days;
}

export function getMonthRange(yearMonth: string): {
  start: string;
  end: string;
} {
  const d = dayjs(`${yearMonth}-01`);
  return {
    start: d.format('YYYY-MM-DD'),
    end: d.endOf('month').format('YYYY-MM-DD'),
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
yarn test __tests__/utils/date.test.ts
```

Expected: PASS

- [ ] **Step 5: format 유틸 테스트 작성**

```ts
// __tests__/utils/format.test.ts
import {formatAmount, formatAmountSigned} from '../../src/utils/format';

describe('formatAmount', () => {
  it('formats with comma separator', () => {
    expect(formatAmount(1234567)).toBe('1,234,567');
  });

  it('handles zero', () => {
    expect(formatAmount(0)).toBe('0');
  });
});

describe('formatAmountSigned', () => {
  it('adds + for income', () => {
    expect(formatAmountSigned(50000, 'income')).toBe('+50,000');
  });

  it('adds - for expense', () => {
    expect(formatAmountSigned(50000, 'expense')).toBe('-50,000');
  });
});
```

- [ ] **Step 6: format 유틸 구현**

```ts
// src/utils/format.ts
import type {TransactionType} from '../types';

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

export function formatAmountSigned(
  amount: number,
  type: TransactionType,
): string {
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix}${formatAmount(amount)}`;
}
```

- [ ] **Step 7: 테스트 통과 확인**

```bash
yarn test __tests__/utils/format.test.ts
```

Expected: PASS

- [ ] **Step 8: CSV 유틸 테스트 작성**

```ts
// __tests__/utils/csv.test.ts
import {transactionsToCsv, csvToTransactions} from '../../src/utils/csv';
import type {Transaction} from '../../src/types';

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    ledger_id: 'L1',
    type: 'expense',
    amount: 45000,
    category: '식비',
    payment_method: '카드',
    memo: '점심 회식',
    date: '2026-04-22',
    created_at: 0,
  },
  {
    id: '2',
    ledger_id: 'L1',
    type: 'income',
    amount: 3200000,
    category: '월급',
    payment_method: '계좌이체',
    memo: '4월 급여',
    date: '2026-04-09',
    created_at: 0,
  },
];

describe('transactionsToCsv', () => {
  it('generates CSV with correct headers', () => {
    const csv = transactionsToCsv(sampleTransactions);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('날짜,유형,금액,카테고리,결제수단,메모');
    expect(lines[1]).toBe('2026-04-22,지출,45000,식비,카드,점심 회식');
    expect(lines[2]).toBe('2026-04-09,수입,3200000,월급,계좌이체,4월 급여');
  });
});

describe('csvToTransactions', () => {
  it('parses CSV back to transaction data', () => {
    const csv =
      '날짜,유형,금액,카테고리,결제수단,메모\n2026-04-22,지출,45000,식비,카드,점심 회식';
    const result = csvToTransactions(csv);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-04-22');
    expect(result[0].type).toBe('expense');
    expect(result[0].amount).toBe(45000);
    expect(result[0].category).toBe('식비');
    expect(result[0].payment_method).toBe('카드');
    expect(result[0].memo).toBe('점심 회식');
  });
});
```

- [ ] **Step 9: CSV 유틸 구현**

```ts
// src/utils/csv.ts
import Papa from 'papaparse';
import type {Transaction, TransactionType} from '../types';

const TYPE_MAP: Record<string, TransactionType> = {
  수입: 'income',
  지출: 'expense',
};

const TYPE_MAP_REVERSE: Record<TransactionType, string> = {
  income: '수입',
  expense: '지출',
};

interface CsvRow {
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const rows = transactions.map(t => ({
    날짜: t.date,
    유형: TYPE_MAP_REVERSE[t.type],
    금액: t.amount,
    카테고리: t.category,
    결제수단: t.payment_method,
    메모: t.memo ?? '',
  }));
  return Papa.unparse(rows);
}

export function csvToTransactions(csvString: string): CsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map(row => ({
    date: row['날짜'],
    type: TYPE_MAP[row['유형']] ?? 'expense',
    amount: parseInt(row['금액'], 10),
    category: row['카테고리'],
    payment_method: row['결제수단'],
    memo: row['메모'] || null,
  }));
}
```

- [ ] **Step 10: 테스트 통과 확인**

```bash
yarn test __tests__/utils/csv.test.ts
```

Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add src/utils/ __tests__/utils/
git commit -m "feat: add date, format, and CSV utility functions with tests"
```

---

## Task 7: 네비게이션 + 앱 루트

**Files:**
- Create: `src/navigation/RootNavigator.tsx`, `src/components/common/FAB.tsx`
- Modify: `src/App.tsx`
- Create: `src/screens/CalendarScreen.tsx`, `src/screens/HistoryScreen.tsx`, `src/screens/StatsScreen.tsx`, `src/screens/SettingsScreen.tsx` (placeholder)

- [ ] **Step 1: 각 스크린 placeholder 작성**

```ts
// src/screens/CalendarScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../styles/theme';

export default function CalendarScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={{color: theme.text}}>달력</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
```

```ts
// src/screens/HistoryScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../styles/theme';

export default function HistoryScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={{color: theme.text}}>내역</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
```

```ts
// src/screens/StatsScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../styles/theme';

export default function StatsScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={{color: theme.text}}>통계</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
```

```ts
// src/screens/SettingsScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../styles/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={{color: theme.text}}>설정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
```

- [ ] **Step 2: FAB 컴포넌트 작성**

```tsx
// src/components/common/FAB.tsx
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';

interface FABProps {
  onPress: () => void;
}

export default function FAB({onPress}: FABProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor: theme.fab}]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={[styles.text, {color: theme.fabText}]}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  text: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
```

- [ ] **Step 3: RootNavigator 작성**

```tsx
// src/navigation/RootNavigator.tsx
import React, {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FAB from '../components/common/FAB';
import {useTheme} from '../styles/theme';

const Tab = createBottomTabNavigator();

function EmptyScreen() {
  return <View />;
}

export default function RootNavigator() {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);

  const handleFABPress = useCallback(() => {
    setShowForm(true);
  }, []);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.tabBar,
              borderTopColor: theme.tabBarBorder,
            },
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
          }}>
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{tabBarLabel: '달력'}}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{tabBarLabel: '내역'}}
          />
          <Tab.Screen
            name="AddPlaceholder"
            component={EmptyScreen}
            options={{
              tabBarLabel: '',
              tabBarButton: () => <View style={{width: 56}} />,
            }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{tabBarLabel: '통계'}}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{tabBarLabel: '설정'}}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <FAB onPress={handleFABPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
```

- [ ] **Step 4: App.tsx 작성**

```tsx
// src/App.tsx
import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet, ActivityIndicator, View} from 'react-native';
import {runMigrations} from './db/migrations';
import {getAllLedgers, createLedger} from './db/ledgerQueries';
import {
  getCurrentLedgerId,
  setCurrentLedgerId,
} from './store/settings';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    runMigrations();

    // 장부 없으면 기본 장부 생성
    const ledgers = getAllLedgers();
    if (ledgers.length === 0) {
      const defaultLedger = createLedger('개인');
      setCurrentLedgerId(defaultLedger.id);
    } else if (!getCurrentLedgerId()) {
      setCurrentLedgerId(ledgers[0].id);
    }

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
```

- [ ] **Step 5: index.js에서 App import 경로 수정**

```js
// index.js
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

- [ ] **Step 6: 빌드 및 실행 확인**

```bash
yarn ios
```

4개 탭 + 중앙 FAB 버튼 보이는지 확인.

- [ ] **Step 7: Commit**

```bash
git add src/ index.js
git commit -m "feat: add navigation with 4 tabs, FAB, and app root with DB init"
```

---

## Task 8: 달력 화면

**Files:**
- Create: `src/components/calendar/MonthHeader.tsx`, `src/components/calendar/DayCell.tsx`, `src/components/calendar/CalendarGrid.tsx`, `src/components/common/LedgerSelector.tsx`
- Modify: `src/screens/CalendarScreen.tsx`

- [ ] **Step 1: LedgerSelector 작성**

```tsx
// src/components/common/LedgerSelector.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import {getAllLedgers} from '../../db/ledgerQueries';
import {getCurrentLedgerId, setCurrentLedgerId} from '../../store/settings';
import {useTheme} from '../../styles/theme';
import type {Ledger} from '../../types';

interface Props {
  onLedgerChange: () => void;
}

export default function LedgerSelector({onLedgerChange}: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const ledgers = getAllLedgers();
  const currentId = getCurrentLedgerId();
  const currentLedger = ledgers.find(l => l.id === currentId);

  const handleSelect = (ledger: Ledger) => {
    setCurrentLedgerId(ledger.id);
    setVisible(false);
    onLedgerChange();
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, {backgroundColor: theme.surface}]}
        onPress={() => setVisible(true)}>
        <Text style={[styles.selectorText, {color: theme.text}]}>
          {currentLedger?.name ?? '장부 선택'} ▼
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={[styles.modal, {backgroundColor: theme.card}]}>
            <FlatList
              data={ledgers}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item.id === currentId && {
                      backgroundColor: theme.primaryLight,
                    },
                  ]}
                  onPress={() => handleSelect(item)}>
                  <Text style={{color: theme.text}}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8},
  selectorText: {fontSize: 14, fontWeight: '600'},
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '70%',
    maxHeight: 300,
    borderRadius: 12,
    padding: 8,
  },
  item: {padding: 14, borderRadius: 8},
});
```

- [ ] **Step 2: MonthHeader 작성**

```tsx
// src/components/calendar/MonthHeader.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import dayjs from 'dayjs';
import {useTheme} from '../../styles/theme';

interface Props {
  yearMonth: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthHeader({yearMonth, onPrev, onNext}: Props) {
  const theme = useTheme();
  const label = dayjs(`${yearMonth}-01`).format('YYYY년 M월');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrow}>
        <Text style={[styles.arrowText, {color: theme.text}]}>◀</Text>
      </TouchableOpacity>
      <Text style={[styles.label, {color: theme.text}]}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={styles.arrow}>
        <Text style={[styles.arrowText, {color: theme.text}]}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  arrow: {paddingHorizontal: 20, paddingVertical: 8},
  arrowText: {fontSize: 16},
  label: {fontSize: 18, fontWeight: '700', minWidth: 120, textAlign: 'center'},
});
```

- [ ] **Step 3: DayCell 작성**

```tsx
// src/components/calendar/DayCell.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {DaySummary} from '../../types';

interface Props {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  summary?: DaySummary;
  onPress: (date: string) => void;
}

export default function DayCell({
  date,
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelected,
  summary,
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isSelected && {backgroundColor: theme.primaryLight},
        isToday && styles.today,
        isToday && {borderColor: theme.primary},
      ]}
      onPress={() => onPress(date)}
      activeOpacity={0.6}>
      <Text
        style={[
          styles.dayNumber,
          {color: isCurrentMonth ? theme.text : theme.textSecondary},
        ]}>
        {dayNumber}
      </Text>
      {summary && summary.income > 0 && (
        <Text style={[styles.amount, {color: theme.income}]} numberOfLines={1}>
          +{formatAmount(summary.income)}
        </Text>
      )}
      {summary && summary.expense > 0 && (
        <Text style={[styles.amount, {color: theme.expense}]} numberOfLines={1}>
          -{formatAmount(summary.expense)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minHeight: 60,
    padding: 2,
    alignItems: 'center',
    borderRadius: 6,
  },
  today: {borderWidth: 1},
  dayNumber: {fontSize: 13, fontWeight: '500', marginBottom: 1},
  amount: {fontSize: 9, fontWeight: '600'},
});
```

- [ ] **Step 4: CalendarGrid 작성**

```tsx
// src/components/calendar/CalendarGrid.tsx
import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import dayjs from 'dayjs';
import DayCell from './DayCell';
import {getCalendarDays} from '../../utils/date';
import {useTheme} from '../../styles/theme';
import type {DaySummary} from '../../types';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface Props {
  yearMonth: string;
  selectedDate: string | null;
  summaries: DaySummary[];
  onDayPress: (date: string) => void;
}

export default function CalendarGrid({
  yearMonth,
  selectedDate,
  summaries,
  onDayPress,
}: Props) {
  const theme = useTheme();
  const today = dayjs().format('YYYY-MM-DD');

  const days = useMemo(() => getCalendarDays(yearMonth), [yearMonth]);

  const summaryMap = useMemo(() => {
    const map: Record<string, DaySummary> = {};
    for (const s of summaries) {
      map[s.date] = s;
    }
    return map;
  }, [summaries]);

  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View>
      <View style={styles.weekDaysRow}>
        {WEEK_DAYS.map((d, i) => (
          <View key={d} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                {color: i === 0 ? theme.expense : theme.textSecondary},
              ]}>
              {d}
            </Text>
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map(date => {
            const d = dayjs(date);
            return (
              <DayCell
                key={date}
                date={date}
                dayNumber={d.date()}
                isCurrentMonth={d.format('YYYY-MM') === yearMonth}
                isToday={date === today}
                isSelected={date === selectedDate}
                summary={summaryMap[date]}
                onPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  weekDaysRow: {flexDirection: 'row', marginBottom: 4},
  weekDayCell: {flex: 1, alignItems: 'center', paddingVertical: 6},
  weekDayText: {fontSize: 12, fontWeight: '600'},
  weekRow: {flexDirection: 'row'},
});
```

- [ ] **Step 5: CalendarScreen 완성**

```tsx
// src/screens/CalendarScreen.tsx
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAtom} from 'jotai';
import dayjs from 'dayjs';
import BottomSheet from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CalendarGrid from '../components/calendar/CalendarGrid';
import MonthHeader from '../components/calendar/MonthHeader';
import LedgerSelector from '../components/common/LedgerSelector';
import TransactionList from '../components/transaction/TransactionList';
import {getMonthDaySummaries, getMonthTotals} from '../db/transactionQueries';
import {getCurrentLedgerId} from '../store/settings';
import {selectedMonthAtom, selectedDateAtom, dbVersionAtom} from '../store/atoms';
import {useTheme} from '../styles/theme';
import {formatAmount} from '../utils/format';

export default function CalendarScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [yearMonth, setYearMonth] = useAtom(selectedMonthAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [dbVersion] = useAtom(dbVersionAtom);
  const [, forceUpdate] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const ledgerId = getCurrentLedgerId() ?? '';

  const summaries = useMemo(
    () => getMonthDaySummaries(ledgerId, yearMonth),
    [ledgerId, yearMonth, dbVersion],
  );

  const totals = useMemo(
    () => getMonthTotals(ledgerId, yearMonth),
    [ledgerId, yearMonth, dbVersion],
  );

  const handlePrev = useCallback(() => {
    setYearMonth(prev => dayjs(`${prev}-01`).subtract(1, 'month').format('YYYY-MM'));
    setSelectedDate(null);
  }, [setYearMonth, setSelectedDate]);

  const handleNext = useCallback(() => {
    setYearMonth(prev => dayjs(`${prev}-01`).add(1, 'month').format('YYYY-MM'));
    setSelectedDate(null);
  }, [setYearMonth, setSelectedDate]);

  const handleDayPress = useCallback(
    (date: string) => {
      setSelectedDate(date);
      bottomSheetRef.current?.expand();
    },
    [setSelectedDate],
  );

  const handleLedgerChange = useCallback(() => {
    forceUpdate(n => n + 1);
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: theme.background, paddingTop: insets.top}]}>
      <View style={styles.header}>
        <LedgerSelector onLedgerChange={handleLedgerChange} />
        <MonthHeader
          yearMonth={yearMonth}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </View>

      <CalendarGrid
        yearMonth={yearMonth}
        selectedDate={selectedDate}
        summaries={summaries}
        onDayPress={handleDayPress}
      />

      <View style={[styles.summaryBar, {backgroundColor: theme.surface}]}>
        <Text style={{color: theme.income, fontWeight: '700'}}>
          수입 {formatAmount(totals.income)}
        </Text>
        <Text style={{color: theme.textSecondary}}> | </Text>
        <Text style={{color: theme.expense, fontWeight: '700'}}>
          지출 {formatAmount(totals.expense)}
        </Text>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['40%', '70%']}
        enablePanDownToClose
        backgroundStyle={{backgroundColor: theme.card}}
        handleIndicatorStyle={{backgroundColor: theme.textSecondary}}>
        {selectedDate && (
          <TransactionList ledgerId={ledgerId} date={selectedDate} />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {paddingHorizontal: 16},
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add src/components/calendar/ src/components/common/ src/screens/CalendarScreen.tsx
git commit -m "feat: add calendar screen with month grid, day summaries, and ledger selector"
```

---

## Task 9: 거래 입력/수정 폼 & 리스트

**Files:**
- Create: `src/components/transaction/TransactionForm.tsx`, `src/components/transaction/TransactionItem.tsx`, `src/components/transaction/TransactionList.tsx`
- Create: `src/hooks/useTransactions.ts`
- Modify: `src/navigation/RootNavigator.tsx`

- [ ] **Step 1: useTransactions 훅 작성**

```ts
// src/hooks/useTransactions.ts
import {useCallback} from 'react';
import {useAtom} from 'jotai';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../db/transactionQueries';
import {dbVersionAtom} from '../store/atoms';
import type {TransactionType} from '../types';

export function useTransactions() {
  const [, setDbVersion] = useAtom(dbVersionAtom);

  const invalidate = useCallback(() => {
    setDbVersion(v => v + 1);
  }, [setDbVersion]);

  const add = useCallback(
    (params: {
      ledger_id: string;
      type: TransactionType;
      amount: number;
      category: string;
      payment_method: string;
      memo: string | null;
      date: string;
    }) => {
      createTransaction(params);
      invalidate();
    },
    [invalidate],
  );

  const update = useCallback(
    (
      id: string,
      params: {
        type: TransactionType;
        amount: number;
        category: string;
        payment_method: string;
        memo: string | null;
        date: string;
      },
    ) => {
      updateTransaction(id, params);
      invalidate();
    },
    [invalidate],
  );

  const remove = useCallback(
    (id: string) => {
      deleteTransaction(id);
      invalidate();
    },
    [invalidate],
  );

  return {add, update, remove};
}
```

- [ ] **Step 2: TransactionItem 작성**

```tsx
// src/components/transaction/TransactionItem.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';
import {formatAmountSigned} from '../../utils/format';
import type {Transaction} from '../../types';

interface Props {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionItem({
  transaction,
  onPress,
  onDelete,
}: Props) {
  const theme = useTheme();
  const amountColor =
    transaction.type === 'income' ? theme.income : theme.expense;

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: theme.surface}]}
      onPress={() => onPress(transaction)}
      onLongPress={() => onDelete(transaction.id)}>
      <View style={styles.left}>
        <Text style={[styles.category, {color: theme.text}]}>
          {transaction.category}
        </Text>
        {transaction.memo && (
          <Text
            style={[styles.memo, {color: theme.textSecondary}]}
            numberOfLines={1}>
            {transaction.memo}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, {color: amountColor}]}>
          {formatAmountSigned(transaction.amount, transaction.type)}
        </Text>
        <Text style={[styles.paymentMethod, {color: theme.textSecondary}]}>
          {transaction.payment_method}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
  },
  left: {flex: 1},
  right: {alignItems: 'flex-end'},
  category: {fontSize: 15, fontWeight: '600'},
  memo: {fontSize: 12, marginTop: 2},
  amount: {fontSize: 16, fontWeight: '700'},
  paymentMethod: {fontSize: 11, marginTop: 2},
});
```

- [ ] **Step 3: TransactionList 작성**

```tsx
// src/components/transaction/TransactionList.tsx
import React, {useMemo} from 'react';
import {View, Text, FlatList, Alert, StyleSheet} from 'react-native';
import {useAtom} from 'jotai';
import TransactionItem from './TransactionItem';
import {getTransactionsByDate} from '../../db/transactionQueries';
import {useTransactions} from '../../hooks/useTransactions';
import {dbVersionAtom} from '../../store/atoms';
import {useTheme} from '../../styles/theme';
import type {Transaction} from '../../types';

interface Props {
  ledgerId: string;
  date: string;
  onEdit?: (transaction: Transaction) => void;
}

export default function TransactionList({ledgerId, date, onEdit}: Props) {
  const theme = useTheme();
  const [dbVersion] = useAtom(dbVersionAtom);
  const {remove} = useTransactions();

  const transactions = useMemo(
    () => getTransactionsByDate(ledgerId, date),
    [ledgerId, date, dbVersion],
  );

  const handleDelete = (id: string) => {
    Alert.alert('삭제', '이 거래를 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => remove(id),
      },
    ]);
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{color: theme.textSecondary}}>거래 없음</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <TransactionItem
          transaction={item}
          onPress={onEdit ?? (() => {})}
          onDelete={handleDelete}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  empty: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40},
  list: {paddingTop: 8},
});
```

- [ ] **Step 4: TransactionForm 작성**

```tsx
// src/components/transaction/TransactionForm.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import dayjs from 'dayjs';
import {getCategories, getPaymentMethods} from '../../store/settings';
import {useTheme} from '../../styles/theme';
import type {Transaction, TransactionType} from '../../types';

interface Props {
  ledgerId: string;
  initialDate?: string;
  editTransaction?: Transaction;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    payment_method: string;
    memo: string | null;
    date: string;
  }) => void;
  onCancel: () => void;
}

export default function TransactionForm({
  ledgerId,
  initialDate,
  editTransaction,
  onSave,
  onCancel,
}: Props) {
  const theme = useTheme();
  const categories = getCategories();
  const paymentMethods = getPaymentMethods();

  const [type, setType] = useState<TransactionType>(
    editTransaction?.type ?? 'expense',
  );
  const [amountText, setAmountText] = useState(
    editTransaction ? String(editTransaction.amount) : '',
  );
  const [category, setCategory] = useState(
    editTransaction?.category ?? categories[0] ?? '',
  );
  const [paymentMethod, setPaymentMethod] = useState(
    editTransaction?.payment_method ?? paymentMethods[0] ?? '',
  );
  const [memo, setMemo] = useState(editTransaction?.memo ?? '');
  const [date, setDate] = useState(
    editTransaction?.date ?? initialDate ?? dayjs().format('YYYY-MM-DD'),
  );

  const handleSave = () => {
    const amount = parseInt(amountText, 10);
    if (!amount || amount <= 0) return;
    if (!category) return;

    onSave({
      type,
      amount,
      category,
      payment_method: paymentMethod,
      memo: memo.trim() || null,
      date,
    });
  };

  const incomeCategories = categories.filter(c =>
    ['월급', '부수입', '용돈', '기타수입'].includes(c),
  );
  const expenseCategories = categories.filter(
    c => !['월급', '부수입', '용돈', '기타수입'].includes(c),
  );
  const displayCategories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.card}]}
      contentContainerStyle={styles.content}>
      {/* 수입/지출 토글 */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'expense' && {backgroundColor: theme.expense},
          ]}
          onPress={() => setType('expense')}>
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
            지출
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'income' && {backgroundColor: theme.income},
          ]}
          onPress={() => setType('income')}>
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
            수입
          </Text>
        </TouchableOpacity>
      </View>

      {/* 금액 */}
      <Text style={[styles.label, {color: theme.textSecondary}]}>금액</Text>
      <TextInput
        style={[styles.amountInput, {color: theme.text, borderColor: theme.border}]}
        value={amountText}
        onChangeText={setAmountText}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
      />

      {/* 날짜 */}
      <Text style={[styles.label, {color: theme.textSecondary}]}>날짜</Text>
      <TextInput
        style={[styles.input, {color: theme.text, borderColor: theme.border}]}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.textSecondary}
      />

      {/* 카테고리 */}
      <Text style={[styles.label, {color: theme.textSecondary}]}>카테고리</Text>
      <View style={styles.chipContainer}>
        {displayCategories.map(c => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              {borderColor: theme.border},
              c === category && {backgroundColor: theme.primary, borderColor: theme.primary},
            ]}
            onPress={() => setCategory(c)}>
            <Text
              style={[
                styles.chipText,
                {color: c === category ? '#fff' : theme.text},
              ]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 결제수단 */}
      <Text style={[styles.label, {color: theme.textSecondary}]}>결제수단</Text>
      <View style={styles.chipContainer}>
        {paymentMethods.map(m => (
          <TouchableOpacity
            key={m}
            style={[
              styles.chip,
              {borderColor: theme.border},
              m === paymentMethod && {backgroundColor: theme.primary, borderColor: theme.primary},
            ]}
            onPress={() => setPaymentMethod(m)}>
            <Text
              style={[
                styles.chipText,
                {color: m === paymentMethod ? '#fff' : theme.text},
              ]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 메모 */}
      <Text style={[styles.label, {color: theme.textSecondary}]}>메모</Text>
      <TextInput
        style={[styles.input, {color: theme.text, borderColor: theme.border}]}
        value={memo}
        onChangeText={setMemo}
        placeholder="선택사항"
        placeholderTextColor={theme.textSecondary}
      />

      {/* 버튼 */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.cancelButton, {borderColor: theme.border}]}
          onPress={onCancel}>
          <Text style={{color: theme.text}}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, {backgroundColor: theme.primary}]}
          onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {padding: 20},
  typeToggle: {flexDirection: 'row', gap: 8, marginBottom: 20},
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  typeText: {color: '#999', fontWeight: '600', fontSize: 15},
  typeTextActive: {color: '#fff'},
  label: {fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12},
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: 8,
  },
  input: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  chipContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {fontSize: 13, fontWeight: '500'},
  buttons: {flexDirection: 'row', gap: 12, marginTop: 24},
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {color: '#fff', fontWeight: '700', fontSize: 15},
});
```

- [ ] **Step 5: RootNavigator에 TransactionForm BottomSheet 연결**

`src/navigation/RootNavigator.tsx`를 수정하여 FAB 누르면 TransactionForm을 BottomSheet로 표시. `showForm` 상태 사용, `BottomSheet` 추가, `useTransactions` 훅으로 저장 처리.

```tsx
// src/navigation/RootNavigator.tsx — 기존 코드에 추가
import {useRef, useState, useCallback} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import TransactionForm from '../components/transaction/TransactionForm';
import {useTransactions} from '../hooks/useTransactions';
import {getCurrentLedgerId} from '../store/settings';

// RootNavigator 함수 내부에 추가:
const formSheetRef = useRef<BottomSheet>(null);
const {add} = useTransactions();
const ledgerId = getCurrentLedgerId() ?? '';

const handleFABPress = useCallback(() => {
  formSheetRef.current?.expand();
}, []);

const handleSave = useCallback(
  (data: Parameters<typeof add>[0] extends infer T ? Omit<T, 'ledger_id'> : never) => {
    add({...data, ledger_id: ledgerId});
    formSheetRef.current?.close();
  },
  [add, ledgerId],
);

// JSX에 BottomSheet 추가 (FAB 아래):
<BottomSheet
  ref={formSheetRef}
  index={-1}
  snapPoints={['90%']}
  enablePanDownToClose
  backgroundStyle={{backgroundColor: theme.card}}
  handleIndicatorStyle={{backgroundColor: theme.textSecondary}}>
  <TransactionForm
    ledgerId={ledgerId}
    onSave={handleSave}
    onCancel={() => formSheetRef.current?.close()}
  />
</BottomSheet>
```

- [ ] **Step 6: 실행 확인**

```bash
yarn ios
```

FAB 버튼 탭 → 거래 입력 폼 표시 확인. 입력 후 저장 → 달력에 금액 반영 확인.

- [ ] **Step 7: Commit**

```bash
git add src/components/transaction/ src/hooks/ src/navigation/
git commit -m "feat: add transaction form, list, and FAB integration"
```

---

## Task 10: 내역 화면

**Files:**
- Modify: `src/screens/HistoryScreen.tsx`

- [ ] **Step 1: HistoryScreen 구현**

```tsx
// src/screens/HistoryScreen.tsx
import React, {useCallback, useMemo, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useAtom} from 'jotai';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TransactionItem from '../components/transaction/TransactionItem';
import {getFilteredTransactions} from '../db/transactionQueries';
import {getCurrentLedgerId, getCategories, getPaymentMethods} from '../store/settings';
import {useTransactions} from '../hooks/useTransactions';
import {historyFilterAtom, dbVersionAtom} from '../store/atoms';
import {useTheme} from '../styles/theme';
import type {Transaction, TransactionType} from '../types';

const PAGE_SIZE = 50;

export default function HistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useAtom(historyFilterAtom);
  const [dbVersion] = useAtom(dbVersionAtom);
  const {remove} = useTransactions();
  const ledgerId = getCurrentLedgerId() ?? '';
  const categories = getCategories();
  const paymentMethods = getPaymentMethods();
  const [page, setPage] = useState(0);

  const transactions = useMemo(
    () => getFilteredTransactions(ledgerId, filter, PAGE_SIZE * (page + 1), 0),
    [ledgerId, filter, page, dbVersion],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setFilter(prev => ({...prev, search: text || undefined}));
      setPage(0);
    },
    [setFilter],
  );

  const toggleTypeFilter = useCallback(
    (type: TransactionType) => {
      setFilter(prev => ({
        ...prev,
        type: prev.type === type ? undefined : type,
      }));
      setPage(0);
    },
    [setFilter],
  );

  const handleDelete = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove],
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background, paddingTop: insets.top}]}>
      <Text style={[styles.title, {color: theme.text}]}>내역</Text>

      <TextInput
        style={[styles.searchBar, {backgroundColor: theme.surface, color: theme.text}]}
        placeholder="메모 검색..."
        placeholderTextColor={theme.textSecondary}
        value={filter.search ?? ''}
        onChangeText={handleSearch}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {borderColor: theme.border},
            filter.type === 'income' && {backgroundColor: theme.income},
          ]}
          onPress={() => toggleTypeFilter('income')}>
          <Text
            style={{
              color: filter.type === 'income' ? '#fff' : theme.text,
              fontSize: 12,
            }}>
            수입
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {borderColor: theme.border},
            filter.type === 'expense' && {backgroundColor: theme.expense},
          ]}
          onPress={() => toggleTypeFilter('expense')}>
          <Text
            style={{
              color: filter.type === 'expense' ? '#fff' : theme.text,
              fontSize: 12,
            }}>
            지출
          </Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={transactions}
        keyExtractor={(item: Transaction) => item.id}
        renderItem={({item}: {item: Transaction}) => (
          <TransactionItem
            transaction={item}
            onPress={() => {}}
            onDelete={handleDelete}
          />
        )}
        estimatedItemSize={70}
        onEndReached={() => setPage(p => p + 1)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  title: {fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8},
  searchBar: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
});
```

- [ ] **Step 2: 실행 확인**

```bash
yarn ios
```

내역 탭 → 검색, 수입/지출 필터, 스크롤 동작 확인.

- [ ] **Step 3: Commit**

```bash
git add src/screens/HistoryScreen.tsx
git commit -m "feat: add history screen with search and filters"
```

---

## Task 11: 통계 화면

**Files:**
- Create: `src/components/chart/CategoryPieChart.tsx`, `src/components/chart/MonthlyTrendChart.tsx`, `src/components/chart/PaymentMethodChart.tsx`
- Modify: `src/screens/StatsScreen.tsx`

- [ ] **Step 1: CategoryPieChart 작성**

```tsx
// src/components/chart/CategoryPieChart.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {CategorySummary} from '../../types';

const COLORS = [
  '#5C6BC0',
  '#EF5350',
  '#66BB6A',
  '#FFA726',
  '#AB47BC',
  '#26C6DA',
  '#EC407A',
  '#8D6E63',
  '#78909C',
  '#D4E157',
];

interface Props {
  data: CategorySummary[];
}

export default function CategoryPieChart({data}: Props) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{color: theme.textSecondary}}>데이터 없음</Text>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  const pieData = data.map((d, i) => ({
    value: d.total,
    color: COLORS[i % COLORS.length],
    text: `${Math.round((d.total / total) * 100)}%`,
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={pieData}
        donut
        radius={80}
        innerRadius={50}
        centerLabelComponent={() => (
          <Text style={[styles.centerLabel, {color: theme.text}]}>
            {formatAmount(total)}
          </Text>
        )}
      />
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={d.category} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {backgroundColor: COLORS[i % COLORS.length]},
              ]}
            />
            <Text style={[styles.legendText, {color: theme.text}]}>
              {d.category}
            </Text>
            <Text style={[styles.legendAmount, {color: theme.textSecondary}]}>
              {formatAmount(d.total)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', padding: 16},
  empty: {padding: 40, alignItems: 'center'},
  centerLabel: {fontSize: 14, fontWeight: '700'},
  legend: {marginTop: 16, width: '100%'},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 8},
  legendText: {flex: 1, fontSize: 13},
  legendAmount: {fontSize: 13},
});
```

- [ ] **Step 2: MonthlyTrendChart 작성**

```tsx
// src/components/chart/MonthlyTrendChart.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {useTheme} from '../../styles/theme';
import type {MonthlyTrend} from '../../types';

interface Props {
  data: MonthlyTrend[];
}

export default function MonthlyTrendChart({data}: Props) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{color: theme.textSecondary}}>데이터 없음</Text>
      </View>
    );
  }

  const barData = data.flatMap(d => [
    {
      value: d.income,
      frontColor: theme.income,
      label: d.month.slice(5),
      spacing: 2,
    },
    {
      value: d.expense,
      frontColor: theme.expense,
    },
  ]);

  return (
    <View style={styles.container}>
      <BarChart
        data={barData}
        barWidth={16}
        spacing={20}
        noOfSections={4}
        yAxisTextStyle={{color: theme.textSecondary, fontSize: 10}}
        xAxisLabelTextStyle={{color: theme.textSecondary, fontSize: 10}}
        hideRules
        backgroundColor={theme.background}
      />
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, {backgroundColor: theme.income}]} />
        <Text style={[styles.legendText, {color: theme.textSecondary}]}>수입</Text>
        <View style={[styles.legendDot, {backgroundColor: theme.expense}]} />
        <Text style={[styles.legendText, {color: theme.textSecondary}]}>지출</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16},
  empty: {padding: 40, alignItems: 'center'},
  legendRow: {flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12},
  legendDot: {width: 10, height: 10, borderRadius: 5},
  legendText: {fontSize: 12},
});
```

- [ ] **Step 3: PaymentMethodChart 작성**

```tsx
// src/components/chart/PaymentMethodChart.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {PaymentMethodSummary} from '../../types';

interface Props {
  data: PaymentMethodSummary[];
}

export default function PaymentMethodChart({data}: Props) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{color: theme.textSecondary}}>데이터 없음</Text>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <View style={styles.container}>
      {data.map(d => {
        const pct = total > 0 ? (d.total / total) * 100 : 0;
        return (
          <View key={d.payment_method} style={styles.row}>
            <Text style={[styles.label, {color: theme.text}]}>
              {d.payment_method}
            </Text>
            <View style={[styles.barBg, {backgroundColor: theme.surface}]}>
              <View
                style={[
                  styles.barFill,
                  {backgroundColor: theme.primary, width: `${pct}%`},
                ]}
              />
            </View>
            <Text style={[styles.amount, {color: theme.textSecondary}]}>
              {formatAmount(d.total)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16},
  empty: {padding: 40, alignItems: 'center'},
  row: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: '600', marginBottom: 4},
  barBg: {height: 8, borderRadius: 4, overflow: 'hidden'},
  barFill: {height: '100%', borderRadius: 4},
  amount: {fontSize: 12, marginTop: 2},
});
```

- [ ] **Step 4: StatsScreen 구현**

```tsx
// src/screens/StatsScreen.tsx
import React, {useMemo} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {useAtom} from 'jotai';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import CategoryPieChart from '../components/chart/CategoryPieChart';
import MonthlyTrendChart from '../components/chart/MonthlyTrendChart';
import PaymentMethodChart from '../components/chart/PaymentMethodChart';
import {
  getCategorySummary,
  getPaymentMethodSummary,
  getMonthlyTrend,
} from '../db/transactionQueries';
import {getCurrentLedgerId} from '../store/settings';
import {selectedMonthAtom, statsPeriodAtom, dbVersionAtom} from '../store/atoms';
import {useTheme} from '../styles/theme';

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [yearMonth] = useAtom(selectedMonthAtom);
  const [period, setPeriod] = useAtom(statsPeriodAtom);
  const [dbVersion] = useAtom(dbVersionAtom);
  const ledgerId = getCurrentLedgerId() ?? '';
  const year = yearMonth.slice(0, 4);

  const categorySummary = useMemo(
    () => getCategorySummary(ledgerId, yearMonth),
    [ledgerId, yearMonth, dbVersion],
  );

  const paymentSummary = useMemo(
    () => getPaymentMethodSummary(ledgerId, yearMonth),
    [ledgerId, yearMonth, dbVersion],
  );

  const monthlyTrend = useMemo(
    () => getMonthlyTrend(ledgerId, year),
    [ledgerId, year, dbVersion],
  );

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.background}]}
      contentContainerStyle={{paddingTop: insets.top, paddingBottom: 100}}>
      <Text style={[styles.title, {color: theme.text}]}>통계</Text>

      <View style={styles.periodToggle}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'monthly' && {backgroundColor: theme.primary},
          ]}
          onPress={() => setPeriod('monthly')}>
          <Text style={{color: period === 'monthly' ? '#fff' : theme.text, fontSize: 13}}>
            월별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'yearly' && {backgroundColor: theme.primary},
          ]}
          onPress={() => setPeriod('yearly')}>
          <Text style={{color: period === 'yearly' ? '#fff' : theme.text, fontSize: 13}}>
            연별
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.section, {color: theme.text}]}>카테고리별 지출</Text>
      <CategoryPieChart data={categorySummary} />

      <Text style={[styles.section, {color: theme.text}]}>월별 추이</Text>
      <MonthlyTrendChart data={monthlyTrend} />

      <Text style={[styles.section, {color: theme.text}]}>결제수단별</Text>
      <PaymentMethodChart data={paymentSummary} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  title: {fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8},
  periodToggle: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  section: {fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 16},
});
```

- [ ] **Step 5: 실행 확인**

```bash
yarn ios
```

통계 탭 → 파이차트, 바차트, 결제수단 바 표시 확인 (데이터 없으면 "데이터 없음" 표시).

- [ ] **Step 6: Commit**

```bash
git add src/components/chart/ src/screens/StatsScreen.tsx
git commit -m "feat: add stats screen with pie chart, trend chart, and payment method breakdown"
```

---

## Task 12: 설정 화면

**Files:**
- Create: `src/components/settings/CategoryManager.tsx`, `src/components/settings/PaymentMethodManager.tsx`, `src/components/settings/RecurringRuleManager.tsx`
- Modify: `src/screens/SettingsScreen.tsx`
- Create: `src/hooks/useRecurring.ts`

- [ ] **Step 1: useRecurring 훅 작성**

```ts
// src/hooks/useRecurring.ts
import {useEffect} from 'react';
import dayjs from 'dayjs';
import {processRecurringRules} from '../db/recurringQueries';
import {
  getCurrentLedgerId,
  getLastRecurringCheck,
  setLastRecurringCheck,
} from '../store/settings';

export function useRecurringCheck() {
  useEffect(() => {
    const ledgerId = getCurrentLedgerId();
    if (!ledgerId) return;

    const today = dayjs().format('YYYY-MM-DD');
    const lastCheck = getLastRecurringCheck();

    if (lastCheck === today) return;

    const checkDate = lastCheck ?? dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    processRecurringRules(ledgerId, checkDate, today);
    setLastRecurringCheck(today);
  }, []);
}
```

- [ ] **Step 2: CategoryManager 작성**

```tsx
// src/components/settings/CategoryManager.tsx
import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet} from 'react-native';
import {getCategories, setCategories} from '../../store/settings';
import {useTheme} from '../../styles/theme';

interface Props {
  onUpdate: () => void;
}

export default function CategoryManager({onUpdate}: Props) {
  const theme = useTheme();
  const [categories, setCategoriesState] = useState(getCategories());
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    setCategoriesState(updated);
    setNewCategory('');
    onUpdate();
  };

  const handleDelete = (category: string) => {
    Alert.alert('삭제', `"${category}" 카테고리를 삭제할까요?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updated = categories.filter(c => c !== category);
          setCategories(updated);
          setCategoriesState(updated);
          onUpdate();
        },
      },
    ]);
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, {backgroundColor: theme.surface, color: theme.text}]}
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="새 카테고리"
          placeholderTextColor={theme.textSecondary}
        />
        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: theme.primary}]}
          onPress={handleAdd}>
          <Text style={styles.addText}>추가</Text>
        </TouchableOpacity>
      </View>
      {categories.map(c => (
        <View
          key={c}
          style={[styles.item, {backgroundColor: theme.surface}]}>
          <Text style={{color: theme.text, flex: 1}}>{c}</Text>
          <TouchableOpacity onPress={() => handleDelete(c)}>
            <Text style={{color: theme.expense}}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {flexDirection: 'row', gap: 8, marginBottom: 12},
  input: {flex: 1, padding: 10, borderRadius: 8, fontSize: 14},
  addButton: {paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8},
  addText: {color: '#fff', fontWeight: '600'},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
});
```

- [ ] **Step 3: PaymentMethodManager 작성**

```tsx
// src/components/settings/PaymentMethodManager.tsx
import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {getPaymentMethods, setPaymentMethods} from '../../store/settings';
import {useTheme} from '../../styles/theme';

interface Props {
  onUpdate: () => void;
}

export default function PaymentMethodManager({onUpdate}: Props) {
  const theme = useTheme();
  const [methods, setMethodsState] = useState(getPaymentMethods());
  const [newMethod, setNewMethod] = useState('');

  const handleAdd = () => {
    const trimmed = newMethod.trim();
    if (!trimmed || methods.includes(trimmed)) return;
    const updated = [...methods, trimmed];
    setPaymentMethods(updated);
    setMethodsState(updated);
    setNewMethod('');
    onUpdate();
  };

  const handleDelete = (method: string) => {
    Alert.alert('삭제', `"${method}" 결제수단을 삭제할까요?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updated = methods.filter(m => m !== method);
          setPaymentMethods(updated);
          setMethodsState(updated);
          onUpdate();
        },
      },
    ]);
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, {backgroundColor: theme.surface, color: theme.text}]}
          value={newMethod}
          onChangeText={setNewMethod}
          placeholder="새 결제수단"
          placeholderTextColor={theme.textSecondary}
        />
        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: theme.primary}]}
          onPress={handleAdd}>
          <Text style={styles.addText}>추가</Text>
        </TouchableOpacity>
      </View>
      {methods.map(m => (
        <View
          key={m}
          style={[styles.item, {backgroundColor: theme.surface}]}>
          <Text style={{color: theme.text, flex: 1}}>{m}</Text>
          <TouchableOpacity onPress={() => handleDelete(m)}>
            <Text style={{color: theme.expense}}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {flexDirection: 'row', gap: 8, marginBottom: 12},
  input: {flex: 1, padding: 10, borderRadius: 8, fontSize: 14},
  addButton: {paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8},
  addText: {color: '#fff', fontWeight: '600'},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
});
```

- [ ] **Step 4: RecurringRuleManager 작성**

```tsx
// src/components/settings/RecurringRuleManager.tsx
import React, {useState, useCallback} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {
  getRecurringRules,
  createRecurringRule,
  deleteRecurringRule,
} from '../../db/recurringQueries';
import {getCurrentLedgerId, getCategories, getPaymentMethods} from '../../store/settings';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {TransactionType} from '../../types';

export default function RecurringRuleManager() {
  const theme = useTheme();
  const ledgerId = getCurrentLedgerId() ?? '';
  const [rules, setRules] = useState(() => getRecurringRules(ledgerId));
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [memo, setMemo] = useState('');

  const categories = getCategories();
  const paymentMethods = getPaymentMethods();

  const refresh = useCallback(() => {
    setRules(getRecurringRules(ledgerId));
  }, [ledgerId]);

  const handleAdd = () => {
    const amt = parseInt(amount, 10);
    const day = parseInt(dayOfMonth, 10);
    if (!amt || !day || day < 1 || day > 31 || !category) return;

    createRecurringRule({
      ledger_id: ledgerId,
      type,
      amount: amt,
      category: category || categories[0],
      payment_method: paymentMethod || paymentMethods[0],
      memo: memo.trim() || null,
      day_of_month: day,
    });
    setShowForm(false);
    setAmount('');
    setCategory('');
    setDayOfMonth('');
    setMemo('');
    refresh();
  };

  const handleDelete = (id: string) => {
    Alert.alert('삭제', '이 반복 규칙을 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteRecurringRule(id);
          refresh();
        },
      },
    ]);
  };

  return (
    <View>
      {rules.map(rule => (
        <View
          key={rule.id}
          style={[styles.item, {backgroundColor: theme.surface}]}>
          <View style={{flex: 1}}>
            <Text style={{color: theme.text, fontWeight: '600'}}>
              매월 {rule.day_of_month}일 · {rule.category}
            </Text>
            <Text
              style={{
                color: rule.type === 'income' ? theme.income : theme.expense,
                fontSize: 13,
              }}>
              {rule.type === 'income' ? '+' : '-'}
              {formatAmount(rule.amount)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(rule.id)}>
            <Text style={{color: theme.expense}}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}

      {showForm ? (
        <View style={[styles.form, {backgroundColor: theme.surface}]}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && {backgroundColor: theme.expense}]}
              onPress={() => setType('expense')}>
              <Text style={{color: type === 'expense' ? '#fff' : theme.text, fontSize: 12}}>지출</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && {backgroundColor: theme.income}]}
              onPress={() => setType('income')}>
              <Text style={{color: type === 'income' ? '#fff' : theme.text, fontSize: 12}}>수입</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, {color: theme.text, borderColor: theme.border}]}
            value={dayOfMonth}
            onChangeText={setDayOfMonth}
            placeholder="매월 N일 (1-31)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, {color: theme.text, borderColor: theme.border}]}
            value={amount}
            onChangeText={setAmount}
            placeholder="금액"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, {color: theme.text, borderColor: theme.border}]}
            value={category}
            onChangeText={setCategory}
            placeholder="카테고리"
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={[styles.input, {color: theme.text, borderColor: theme.border}]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모 (선택)"
            placeholderTextColor={theme.textSecondary}
          />
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.cancelBtn, {borderColor: theme.border}]}
              onPress={() => setShowForm(false)}>
              <Text style={{color: theme.text}}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, {backgroundColor: theme.primary}]}
              onPress={handleAdd}>
              <Text style={{color: '#fff', fontWeight: '600'}}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addRuleBtn, {borderColor: theme.border}]}
          onPress={() => setShowForm(true)}>
          <Text style={{color: theme.primary, fontWeight: '600'}}>+ 반복 규칙 추가</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
  },
  form: {padding: 14, borderRadius: 10, marginTop: 8},
  row: {flexDirection: 'row', gap: 8, marginBottom: 8},
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  input: {borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8},
  cancelBtn: {flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center'},
  saveBtn: {flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center'},
  addRuleBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
});
```

- [ ] **Step 5: SettingsScreen 구현**

```tsx
// src/screens/SettingsScreen.tsx
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {DocumentPickerResponse, pick} from 'react-native-document-picker';
import CategoryManager from '../components/settings/CategoryManager';
import PaymentMethodManager from '../components/settings/PaymentMethodManager';
import RecurringRuleManager from '../components/settings/RecurringRuleManager';
import {
  getAllLedgers,
  createLedger,
  renameLedger,
  deleteLedger,
} from '../db/ledgerQueries';
import {
  getTransactionsForExport,
  createTransaction,
} from '../db/transactionQueries';
import {
  getThemeMode,
  setThemeMode,
  getCurrentLedgerId,
  setCurrentLedgerId,
} from '../store/settings';
import {transactionsToCsv, csvToTransactions} from '../utils/csv';
import {useTheme} from '../styles/theme';
import type {ThemeMode} from '../types';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const ledgers = getAllLedgers();
  const currentTheme = getThemeMode();
  const currentLedgerId = getCurrentLedgerId();

  const handleCreateLedger = () => {
    Alert.prompt('새 장부', '장부 이름을 입력하세요', name => {
      if (name?.trim()) {
        const ledger = createLedger(name.trim());
        setCurrentLedgerId(ledger.id);
        refresh();
      }
    });
  };

  const handleDeleteLedger = (id: string, name: string) => {
    if (ledgers.length <= 1) {
      Alert.alert('삭제 불가', '최소 1개의 장부가 필요합니다.');
      return;
    }
    Alert.alert('장부 삭제', `"${name}" 장부와 모든 거래를 삭제할까요?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteLedger(id);
          if (currentLedgerId === id) {
            const remaining = getAllLedgers();
            if (remaining.length > 0) setCurrentLedgerId(remaining[0].id);
          }
          refresh();
        },
      },
    ]);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    refresh();
  };

  const handleExport = async () => {
    const ledgerId = getCurrentLedgerId();
    if (!ledgerId) return;
    const transactions = getTransactionsForExport(ledgerId);
    const csv = transactionsToCsv(transactions);
    const path = `${RNFS.DocumentDirectoryPath}/accountbook_export.csv`;
    await RNFS.writeFile(path, csv, 'utf8');
    await Share.open({url: `file://${path}`, type: 'text/csv'});
  };

  const handleImport = async () => {
    try {
      const [result] = await pick({type: ['public.comma-separated-values-text']});
      const csvContent = await RNFS.readFile(result.uri, 'utf8');
      const rows = csvToTransactions(csvContent);
      const ledgerId = getCurrentLedgerId();
      if (!ledgerId) return;

      Alert.alert(
        'CSV 가져오기',
        `${rows.length}건의 거래를 가져올까요?`,
        [
          {text: '취소', style: 'cancel'},
          {
            text: '추가',
            onPress: () => {
              for (const row of rows) {
                createTransaction({
                  ledger_id: ledgerId,
                  type: row.type,
                  amount: row.amount,
                  category: row.category,
                  payment_method: row.payment_method,
                  memo: row.memo,
                  date: row.date,
                });
              }
              Alert.alert('완료', `${rows.length}건 가져옴`);
              refresh();
            },
          },
        ],
      );
    } catch (e) {
      // 사용자가 취소한 경우 무시
    }
  };

  const themeModes: {label: string; value: ThemeMode}[] = [
    {label: '시스템', value: 'system'},
    {label: '라이트', value: 'light'},
    {label: '다크', value: 'dark'},
  ];

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.background}]}
      contentContainerStyle={{paddingTop: insets.top, paddingBottom: 100}}>
      <Text style={[styles.title, {color: theme.text}]}>설정</Text>

      {/* 장부 관리 */}
      <Text style={[styles.section, {color: theme.text}]}>장부 관리</Text>
      {ledgers.map(l => (
        <View
          key={l.id}
          style={[styles.ledgerItem, {backgroundColor: theme.surface}]}>
          <Text style={{color: theme.text, flex: 1, fontWeight: l.id === currentLedgerId ? '700' : '400'}}>
            {l.name} {l.id === currentLedgerId ? '(현재)' : ''}
          </Text>
          <TouchableOpacity onPress={() => handleDeleteLedger(l.id, l.name)}>
            <Text style={{color: theme.expense, fontSize: 12}}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addButton, {borderColor: theme.border}]}
        onPress={handleCreateLedger}>
        <Text style={{color: theme.primary}}>+ 장부 추가</Text>
      </TouchableOpacity>

      {/* 테마 */}
      <Text style={[styles.section, {color: theme.text}]}>테마</Text>
      <View style={styles.themeRow}>
        {themeModes.map(m => (
          <TouchableOpacity
            key={m.value}
            style={[
              styles.themeButton,
              {borderColor: theme.border},
              currentTheme === m.value && {backgroundColor: theme.primary, borderColor: theme.primary},
            ]}
            onPress={() => handleThemeChange(m.value)}>
            <Text style={{color: currentTheme === m.value ? '#fff' : theme.text, fontSize: 13}}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 카테고리 관리 */}
      <Text style={[styles.section, {color: theme.text}]}>카테고리 관리</Text>
      <CategoryManager onUpdate={refresh} />

      {/* 결제수단 관리 */}
      <Text style={[styles.section, {color: theme.text}]}>결제수단 관리</Text>
      <PaymentMethodManager onUpdate={refresh} />

      {/* 반복 거래 */}
      <Text style={[styles.section, {color: theme.text}]}>반복 거래</Text>
      <RecurringRuleManager />

      {/* 데이터 */}
      <Text style={[styles.section, {color: theme.text}]}>데이터</Text>
      <TouchableOpacity
        style={[styles.dataButton, {backgroundColor: theme.surface}]}
        onPress={handleExport}>
        <Text style={{color: theme.text}}>CSV 내보내기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.dataButton, {backgroundColor: theme.surface}]}
        onPress={handleImport}>
        <Text style={{color: theme.text}}>CSV 가져오기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  title: {fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8},
  section: {fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 24, marginBottom: 10},
  ledgerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  addButton: {
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  themeRow: {flexDirection: 'row', paddingHorizontal: 16, gap: 8},
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dataButton: {
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});
```

- [ ] **Step 6: App.tsx에 useRecurringCheck 추가**

`src/App.tsx`에서 `setReady(true)` 직전에 recurring 체크를 실행하도록 수정:

```ts
// App.tsx의 useEffect 안, setReady(true) 직전에 추가:
import {processRecurringRules} from './db/recurringQueries';
import {getLastRecurringCheck, setLastRecurringCheck} from './store/settings';
import dayjs from 'dayjs';

// useEffect 내부:
const today = dayjs().format('YYYY-MM-DD');
const lastCheck = getLastRecurringCheck();
if (lastCheck !== today) {
  const checkDate = lastCheck ?? dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const lid = getCurrentLedgerId();
  if (lid) {
    processRecurringRules(lid, checkDate, today);
  }
  setLastRecurringCheck(today);
}
```

- [ ] **Step 7: react-native-document-picker 설치**

```bash
yarn add react-native-document-picker
cd ios && pod install && cd ..
```

- [ ] **Step 8: 실행 확인**

```bash
yarn ios
```

설정 탭 → 장부 관리, 카테고리, 결제수단, 반복거래, 테마 전환, CSV 내보내기/가져오기 모두 동작 확인.

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "feat: add settings screen with ledger, category, payment, recurring, theme, and CSV management"
```

---

## Task 13: 최종 통합 & 정리

**Files:**
- Modify: various (위 태스크에서 누락된 연결 처리)

- [ ] **Step 1: .gitignore에 .superpowers 추가**

```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 2: 전체 빌드 확인**

```bash
yarn ios
```

전체 플로우 확인:
1. 앱 최초 실행 → "개인" 장부 자동 생성
2. FAB → 거래 입력 → 달력에 금액 표시
3. 날짜 탭 → BottomSheet에 거래 리스트
4. 내역 탭 → 검색, 필터
5. 통계 탭 → 차트 표시
6. 설정 → 테마 변경, CSV export/import

- [ ] **Step 3: 전체 테스트 실행**

```bash
yarn test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: final integration and cleanup"
```
