/**
 * @fileoverview
 * Shopify注文連動クーポン自動発行サーバーのエントリーポイント。
 * - Expressサーバーの起動
 * - .envの読込
 * - Webhookルーティングの設定
 *
 * 主な仕様:
 * - /webhook/orders/create で注文Webhookを受信
 * - エラー時は詳細なメッセージを出力
 *
 * 制限事項:
 * - HMAC認証は未実装
 * - 本番運用時はセキュリティ対策必須
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { json } from 'express';
import { handleOrderCreateWebhook } from './webhook';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// JSONボディをパース
app.use(json());

// Webhookエンドポイント
app.post('/webhook/orders/create', handleOrderCreateWebhook);

// ヘルスチェック
app.get('/', (_req: Request, res: Response) => {
  res.send('Shopify Coupon Webhook Server 起動中');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`サーバー起動: http://localhost:${PORT}`);
}); 