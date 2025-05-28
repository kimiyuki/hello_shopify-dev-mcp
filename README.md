# Shopify注文連動クーポン自動発行サーバー

## 概要
Shopifyストアで注文が発生した際、注文金額（顧客の総支払代金：税込・送料込み）が3,000円以上の場合に、その注文者（ユーザー）に500円分のクーポン（ディスカウントコード）をAPI経由で自動発行し、メールで通知するNode.js + TypeScriptサーバーです。

## 主な仕様
- Webhook（orders/create）を `/webhook/orders/create` で受信
- 注文金額（total_price）が3,000円以上の場合のみ処理
- クーポンは500円分、発行日から30日間有効、1回限り利用可能
- クーポンコードは「COUPON-」+ランダム英数字8桁
- クーポンは注文者（customer.id）限定
- クーポン発行後、注文者のメールアドレスにクーポンコードを送信（nodemailerでモック送信）
- ゲスト購入（customer.idやemailがnull）はスキップ
- エラー時は詳細なメッセージを出力
- WebhookのHMAC認証は未実装

## セットアップ

### 必要な環境変数（.env）
```
SHOPIFY_API_KEY=xxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_SECRET=xxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_SCOPES=read_orders,write_discounts
SHOPIFY_SHOP=xxxxxx.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx
MAIL_FROM=example@example.com
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=example@example.com
MAIL_PASS=yourpassword
```

### インストール
```sh
npm install
```

### 起動
```sh
npm run dev
```

## 使い方
1. Shopify管理画面でWebhook（orders/create）を `https://{your-server}/webhook/orders/create` に設定
2. サーバーを起動
3. 3,000円以上の注文が入ると、注文者に500円クーポンが自動発行され、メールで通知されます

## ディレクトリ構成例
```
├── src/
│   ├── index.ts         # エントリーポイント
│   ├── webhook.ts       # Webhook受信・処理
│   ├── shopify.ts       # Shopify APIラッパー
│   ├── coupon.ts        # クーポン生成・API呼び出し
│   └── mailer.ts        # メール送信（モック）
├── .env                 # 環境変数
├── README.md            # このファイル
├── package.json
```

## 注意事項
- 本番運用時はWebhookのHMAC認証を必ず実装してください
- メール送信はnodemailerのモック実装です。実運用時は適切なSMTP設定を行ってください
- Shopify APIのアクセストークンやメールサーバー情報は漏洩しないよう厳重に管理してください 