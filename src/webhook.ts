/**
 * @fileoverview
 * Shopify注文Webhook受信・クーポン自動発行のメイン処理。
 *
 * - 注文金額（total_price）が3,000円以上か判定
 * - 顧客情報（customer.id, email）取得
 * - クーポン発行API呼び出し
 * - メール送信（モック）
 * - エラー時は詳細なメッセージを出力
 *
 * 制限事項:
 * - HMAC認証は未実装
 */

import { Request, Response } from 'express';
import { createCouponForCustomer } from './coupon';
import { sendCouponMail } from './mailer';

/**
 * Shopify注文Webhook受信ハンドラ
 * @param {Request} req - Expressリクエスト
 * @param {Response} res - Expressレスポンス
 */
export async function handleOrderCreateWebhook(req: Request, res: Response) {
  try {
    const order = req.body;
    // 注文金額（total_price）は文字列で来る
    const totalPrice = parseFloat(order.total_price);
    const customer = order.customer;
    const customerId = customer?.id;
    const customerEmail = customer?.email;

    // ゲスト購入やメールなしはスキップ
    if (!customerId || !customerEmail) {
      res.status(200).json({ message: '顧客情報なし。クーポン発行スキップ' });
      return;
    }

    if (isNaN(totalPrice) || totalPrice < 3000) {
      res.status(200).json({ message: '注文金額が条件未満。クーポン発行スキップ' });
      return;
    }

    // クーポン発行
    const coupon = await createCouponForCustomer(customerId, 500, 30);

    // メール送信（モック）
    await sendCouponMail(customerEmail, coupon.code, coupon.expiryDate);

    res.status(200).json({ message: 'クーポン発行・メール送信完了', coupon });
  } catch (err: any) {
    // エラー詳細出力
    // eslint-disable-next-line no-console
    console.error('handleOrderCreateWebhook error:', err);
    res.status(500).json({
      error: 'Webhook処理中にエラーが発生しました',
      details: err?.message || err
    });
  }
} 