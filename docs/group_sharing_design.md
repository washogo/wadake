# グループ共有機能 設計書（既存設計との整合性版）

## 1. 概要
複数ユーザーが同じグループ（ファミリー/チーム）に所属し、家計簿データやメモなどを共有・共同編集できる機能の設計。

---

## 2. 既存DB設計との整合性

- **User**: 個人ユーザー（認証・基本情報、Supabase認証と連携）
- **Category**: 収入・支出カテゴリ（typeで区別）
- **Income/Expense**: それぞれ`userId`でUserに紐付け
- **Savings/Budget**: 共有データ（ユーザーと紐付かない）

### 拡張方針
- 既存のUserモデルはそのまま活用
- **Group**モデルを新設
- **UserGroup**中間テーブルで多対多（ユーザーは複数グループに所属可能）
- Income/Expense/Savings/Budgetに`groupId`カラムを追加し、グループ単位でデータを管理
- 既存の個人家計簿用途も維持したい場合、`groupId`はnullableにし、`userId`のみのデータも許容

---

## 3. Prismaスキーマ拡張案

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  incomes   Income[]
  expenses  Expense[]
  groups    UserGroup[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Group {
  id        String   @id @default(cuid())
  name      String
  users     UserGroup[]
  incomes   Income[]
  expenses  Expense[]
  savings   Savings[]
  budgets   Budget[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model UserGroup {
  userId  String
  groupId String
  role    String  // 'admin' or 'member'
  user    User   @relation(fields: [userId], references: [id])
  group   Group  @relation(fields: [groupId], references: [id])
  @@id([userId, groupId])
}

model Income {
  id         String   @id @default(cuid())
  userId     String
  groupId    String?
  categoryId String
  amount     Int
  memo       String?
  date       DateTime
  user       User     @relation(fields: [userId], references: [id])
  group      Group?   @relation(fields: [groupId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Expense {
  id          String   @id @default(cuid())
  userId      String
  groupId     String?
  categoryId  String
  amount      Int
  description String?
  date        DateTime
  user        User     @relation(fields: [userId], references: [id])
  group       Group?   @relation(fields: [groupId], references: [id])
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Savings {
  id        String   @id @default(cuid())
  groupId   String?
  group     Group?   @relation(fields: [groupId], references: [id])
  amount    Int
  date      DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Budget {
  id        String   @id @default(cuid())
  groupId   String?
  group     Group?   @relation(fields: [groupId], references: [id])
  amount    Int
  purpose   String
  date      DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String
  type      String   // "expense" or "income"
  incomes   Income[]
  expenses  Expense[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([name, type])
}
```

---

## 4. API設計（拡張案）

- 既存: `/api/incomes`, `/api/expenses` など（userIdベース）
- 拡張: `/api/groups/:groupId/incomes` などグループ単位のCRUD
- 既存APIも`groupId`クエリでグループ単位取得に拡張
- グループ管理API: `/api/groups`, `/api/groups/:groupId/invite`, `/api/groups/:groupId/members` など

---

## 5. フロントエンド設計（拡張案）

- グループ切り替えUI（ドロップダウン等）
- グループごとのデータ表示・編集
- グループ作成・招待・退出フロー
- 既存のSWR/React Hook Form/Zod/Next.js App Router設計と統合

---

## 6. 権限管理

- UserGroup.roleで管理者/メンバー区別
- 管理者のみ招待・削除・グループ名変更等が可能

---

## 7. 既存機能との互換性・移行

- 既存の個人家計簿用途も維持（groupIdがnullの場合は個人データ）
- 既存の分析・レポート・UIもグループ単位で集計・表示できるよう拡張
- 既存のAPI/DB/フロントエンド設計と矛盾しないように設計

---

## 8. 共有の流れ（例）

1. ユーザーAがグループを作成
2. ユーザーBを招待（メールやIDで）
3. 両者が同じグループに所属し、同じ家計簿データを閲覧・編集できる

---

## 9. その他・注意点
- 退会時のデータ保持/削除ポリシー
- グループ削除時のデータ一括削除
- 招待リンクの有効期限やセキュリティ

---

（この設計書は既存のソースコード・DB設計・API設計との整合性を重視して作成されています） 

---

## 10. 具体的な実装案

### 10.1 DBマイグレーション
- Group, UserGroupテーブルを新規追加
- Income, Expense, Savings, BudgetにgroupIdカラムを追加（nullable）
- 既存データはgroupId=nullで個人用として維持
- Prismaマイグレーション例:
  ```prisma
  model Group { ... }
  model UserGroup { ... }
  // Income, Expense, Savings, BudgetにgroupId追加
  ```

### 10.2 API実装
- `/api/groups` : グループ作成・一覧取得
- `/api/groups/:groupId/invite` : メンバー招待
- `/api/groups/:groupId/incomes` : グループ単位の収入CRUD
- 既存の`/api/incomes`等も`groupId`クエリでグループ単位取得に拡張
- 認証ミドルウェアで「そのグループのメンバーか」チェック
- UserGroup.roleで管理者権限チェック

### 10.3 フロントエンドUI/UX
- グループ切り替えドロップダウン（ヘッダーやサイドバーに追加）
- グループ作成・招待・退出用のモーダル/ページ
- グループごとのデータ表示（SWRのkeyにgroupIdを含める）
- グループ管理画面（メンバー一覧、招待、退出、削除）
- 既存の家計簿画面は「選択中のグループ」のデータのみ表示

### 10.4 移行手順
- 既存ユーザー・データはgroupId=nullで個人用として維持
- 新規グループ作成時はgroupIdを付与
- 既存の分析・レポート・UIもgroupId対応で拡張

### 10.5 段階的リリース案
1. DBマイグレーション（groupId追加、Group/UserGroup新設）
2. APIのグループ対応（CRUD、認可チェック）
3. フロントエンドのグループ切り替えUI追加
4. グループ作成・招待・管理機能追加
5. 既存機能のグループ単位対応・テスト
6. 段階的に既存ユーザーをグループに移行

---

この実装案に沿って、段階的にグループ共有機能を追加できます。