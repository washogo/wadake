# シンプル家計簿アプリ

## コンセプト
家計簿を簡単につけて共有できるアプリケーション

## ターゲット
- 夫婦
- 同棲しているカップル

## 解決したい課題とその解決策
- 課題：既存の家計簿アプリは有料だったり機能が多すぎる
- 解決策：必要な機能に絞った無料のアプリケーションを提供

## 利用シーン
1. 収入管理
   - 月に1度それぞれのタイミングで収入（手取り）を入力して登録
2. 共同支出管理
   - 2人が利用するサービスの料金は支払いを済ませたら登録
3. 日々の支出管理
   - レシートの画像からある程度読み込んでリストアップ
   - 間違っている箇所は訂正可能
4. 貯金管理
   - 毎月目標を立てて登録
   - 実際に貯めた金額を登録
5. 外出時の予算管理
   - 2人で出かける際は予算を決めておく
   - 残金から支出を算出して登録

## 最低限実装する機能
### 収入管理
- 収入の登録
- 収入の編集
- 収入の削除

### 支出管理
- 支出の登録
- 支出の編集
- 支出の削除

### 貯金管理
- 貯金の登録
- 貯金の編集
- 貯金の削除

### 分析機能
- 2人の合計した日毎、月毎、年毎の収入推移の閲覧
- 2人の合計した日毎、月毎、年毎の支出推移の閲覧
- 2人の合計した日毎、月毎、年毎の貯金推移の閲覧
- 互いの日毎、月毎、年毎の収入推移の閲覧
- 互いの日毎、月毎、年毎の支出推移の閲覧
- 互いの日毎、月毎、年毎の貯金推移の閲覧

## 追加実装予定の機能
- レシートなどの画像からテキストまたはマークダウン形式でリストアップする機能

## 実装しない機能
- 認証機能（後日検討）

## 参考アプリケーション
- マネーフォワード

## 開発の動機
彼女が家計簿アプリを無料で使いたいという要望から開発を開始

## 技術仕様

### 認証の仕様

#### 認証フロー概要

##### 初回アクセス時
1. アプリケーション初期化
2. 認証状態確認 → 未認証の場合はログインページへ

##### Google認証実行時
1. ログインページでGoogle認証ボタンクリック
2. Google認証ページにリダイレクト
3. 認証完了後、コールバックページにリダイレクト
4. セッション作成後、トップページにリダイレクト

##### 認証成功後の処理
1. 認証状態変更イベント検出
2. バックエンドにユーザー情報送信
3. JWTトークン生成・Cookie設定
4. フロントエンドでトークン保存
5. 認証状態更新・トップページ表示

##### 以降のAPI呼び出し
1. Cookieによる自動トークン送信
2. バックエンドでトークン取得・検証
3. 認証済みユーザーとして処理

##### ログアウト時
1. ログアウト処理実行
2. セッション・トークン削除
3. ログインページにリダイレクト

#### 仕様詳細

##### 認証方式
- **Google認証**: SupabaseのOAuth機能を利用し、フロントエンドのみで完結
- **バックエンド認証**: 独自JWTトークンを使用（有効期限24時間）
- **トークン管理**: Cookie（httpOnly）+ ローカルストレージの二重管理

##### セキュリティ
- サービスロールキーやSupabaseの管理者権限はバックエンドでは使用しない
- バックエンドはSupabaseのユーザー情報を信頼し、独自の認可・認証管理を行う
- JWTの有効期限やペイロードはバックエンドで自由に設計可能
- JWTのシークレットはバックエンドの環境変数（JWT_SECRET）で管理

##### トークン送信方式
- **Cookie**: 自動送信（ブラウザが自動的に送信）
- **Authorizationヘッダー**: Bearer形式でも対応
- **優先順位**: Authorizationヘッダー > Cookie

##### エンドポイント
- `/api/auth/token`: JWTトークン発行
- `/api/auth/logout`: ログアウト処理
- `/api/auth/me`: 認証状態確認
- `/api/auth/ping`: API疎通確認

#### メリット
- **責任分離**: フロントエンド・バックエンドの責任分離が明確
- **セキュリティ**: サービスロールキー漏洩リスクなし
- **標準性**: 標準的なOAuth+JWT構成で拡張性・保守性が高い
- **自動化**: Cookieによる自動トークン送信で開発者体験が向上
- **二重管理**: Cookie + ローカルストレージで冗長性を確保

#### 注意点
- **Cookie設定**: 本番環境では `secure: true` が必須
- **CORS設定**: `credentials: 'include'` を使用するため適切なCORS設定が必要
- **トークン有効期限**: 24時間で自動失効するため、長期利用時は更新処理が必要

### 技術スタック
- **フロントエンド**: Next.js
- **バックエンド**: Node.js（Express.js + Prisma）
- **データベース**: PostgreSQL（Supabase）
- **デプロイ**: Vercel（アプリケーション）, Supabase（データベース）

### データベース設計
#### ユーザーテーブル
- id（主キー）
- name（ユーザー名）
- created_at
- updated_at

#### 収入テーブル
- id（主キー）
- user_id（外部キー）
- category_id（外部キー）
- amount（金額）
- date（日付）
- created_at
- updated_at

#### カテゴリマスターテーブル
- id（主キー）
- name（カテゴリ名）
- type（種別：expense/income）
- created_at
- updated_at

#### 支出テーブル
- id（主キー）
- user_id（外部キー）
- amount（金額）
- category_id（外部キー）
- description（説明）
- date（日付）
- created_at
- updated_at

#### 貯金テーブル
- id（主キー）
- amount（金額）
- date（日付）
- created_at
- updated_at

#### 予算テーブル
- id（主キー）
- amount（金額）
- purpose（用途）
- date（日付）
- created_at
- updated_at

### カテゴリマスターデータ
#### 支出カテゴリ
- 食費
- 光熱費
- 交通費
- 娯楽費
- 日用品
- 衣類
- 医療費
- その他

#### 収入カテゴリ
- 給与
- ボーナス
- 副業
- その他

## 実装計画

### Phase 1: MVP機能（最優先）
1. **認証機能**
   - ユーザー登録・ログイン
   - セッション管理

2. **収入管理**
   - 収入の登録・編集・削除
   - シンプルな金額と日付のみ

3. **支出管理**
   - 支出の登録・編集・削除
   - カテゴリ分類対応
   - 説明文の入力

4. **貯金管理**
   - 貯金の登録・編集・削除
   - シンプルな金額と日付のみ

5. **予算管理**
   - 予算の設定・編集・削除
   - 金額と用途の入力

### Phase 2: 分析機能
1. **集計機能**
   - 日毎・月毎・年毎の合計表示
   - ユーザー別の集計

2. **グラフ表示**
   - 棒グラフ（推移表示）
   - 円グラフ（ユーザー別比較）

3. **ダッシュボード**
   - 月間サマリー
   - 最近の収支状況

### Phase 3: 追加機能
1. **レシート画像解析**
   - OCR機能によるテキスト抽出
   - マークダウン形式でのリストアップ

2. **データエクスポート**
   - CSV形式でのデータ出力

3. **バックアップ機能**
   - データの自動バックアップ

## UI/UX設計方針
- MoneyForwardを参考にした直感的なUI
- レスポンシブデザイン対応
- モバイルファーストの設計
- シンプルで使いやすい操作性

## 開発環境セットアップ
1. Next.jsプロジェクトの初期化
2. Supabaseプロジェクトの作成
3. Prismaの初期化とスキーマ定義
4. Prismaマイグレーションの実行
5. 認証機能の実装
6. 基本的なCRUD機能の実装
7. UI/UXの実装
8. 分析機能の実装
9. テスト・デプロイ

## Prismaスキーマ例
```prisma
// ユーザーテーブル
// 家計簿を使用するユーザー情報を管理
model User {
  id        String   @id @default(cuid()) // ユーザーID（自動生成）
  name      String                        // ユーザー名
  incomes   Income[]                      // 収入との1対多リレーション
  expenses  Expense[]                     // 支出との1対多リレーション
  createdAt DateTime @default(now())      // 作成日時
  updatedAt DateTime @updatedAt           // 更新日時
}

// カテゴリマスターテーブル
// 収入・支出のカテゴリを統一管理
model Category {
  id        String   @id @default(cuid()) // カテゴリID（自動生成）
  name      String                        // カテゴリ名（例：食費、給与）
  type      String                        // 種別："expense"（支出）または"income"（収入）
  incomes   Income[]                      // 収入との1対多リレーション
  expenses  Expense[]                     // 支出との1対多リレーション
  createdAt DateTime @default(now())      // 作成日時
  updatedAt DateTime @updatedAt           // 更新日時
}

// 収入テーブル
// ユーザーの収入情報を管理
model Income {
  id         String   @id @default(cuid()) // 収入ID（自動生成）
  userId     String                        // ユーザーID（外部キー）
  categoryId String                        // カテゴリID（外部キー）
  amount     Int                           // 収入金額（円）
  date       DateTime                      // 収入日
  user       User     @relation(fields: [userId], references: [id])     // ユーザーとのリレーション
  category   Category @relation(fields: [categoryId], references: [id]) // カテゴリとのリレーション
  createdAt  DateTime @default(now())      // 作成日時
  updatedAt  DateTime @updatedAt           // 更新日時
}

// 支出テーブル
// ユーザーの支出情報を管理
model Expense {
  id          String   @id @default(cuid()) // 支出ID（自動生成）
  userId      String                        // ユーザーID（外部キー）
  categoryId  String                        // カテゴリID（外部キー）
  amount      Int                           // 支出金額（円）
  description String?                       // 支出の説明（オプション）
  date        DateTime                      // 支出日
  user        User     @relation(fields: [userId], references: [id])     // ユーザーとのリレーション
  category    Category @relation(fields: [categoryId], references: [id]) // カテゴリとのリレーション
  createdAt   DateTime @default(now())      // 作成日時
  updatedAt   DateTime @updatedAt           // 更新日時
}

// 貯金テーブル
// 2人で共有する貯金情報を管理（ユーザーと紐付かない）
model Savings {
  id        String   @id @default(cuid()) // 貯金ID（自動生成）
  amount    Int                           // 貯金金額（円）
  date      DateTime                      // 貯金日
  createdAt DateTime @default(now())      // 作成日時
  updatedAt DateTime @updatedAt           // 更新日時
}

// 予算テーブル
// 2人で共有する予算情報を管理（ユーザーと紐付かない）
model Budget {
  id        String   @id @default(cuid()) // 予算ID（自動生成）
  amount    Int                           // 予算金額（円）
  purpose   String                        // 予算の用途
  date      DateTime                      // 予算設定日
  createdAt DateTime @default(now())      // 作成日時
  updatedAt DateTime @updatedAt           // 更新日時
}
```