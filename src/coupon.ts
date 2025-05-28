/**
 * @fileoverview
 * Shopify Admin APIを使ったクーポン（ディスカウントコード）発行処理。
 *
 * - クーポンコード生成（COUPON-xxxxxxxx）
 * - discountCodeBasicCreateミューテーション呼び出し
 * - エラー時は詳細なメッセージをthrow
 *
 * 制限事項:
 * - APIキー等は.envから取得
 */

import { shopifyApi, AdminApiSession } from '@shopify/shopify-api';
import crypto from 'crypto';

/**
 * クーポン情報型
 * @typedef {Object} CouponInfo
 * @property {string} code - クーポンコード
 * @property {string} expiryDate - 有効期限（ISO8601）
 */
export interface CouponInfo {
  code: string;
  expiryDate: string;
}

/**
 * 指定顧客向けにクーポンを発行
 * @param {string} customerId - Shopifyのcustomer.id（例: gid://shopify/Customer/1234567890）
 * @param {number} amount - クーポン金額（円）
 * @param {number} validDays - 有効日数
 * @returns {Promise<CouponInfo>} クーポン情報
 */
export async function createCouponForCustomer(
  customerId: string,
  amount: number,
  validDays: number
): Promise<CouponInfo> {
  // クーポンコード生成
  const code = 'COUPON-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  // 有効期限
  const now = new Date();
  const expiry = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
  const expiryDate = expiry.toISOString();

  // Shopify Admin API初期化
  const shop = process.env.SHOPIFY_SHOP;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!shop || !accessToken) {
    throw new Error('Shopify認証情報が不足しています');
  }

  const client = new shopifyApi({
    adminApiAccessToken: accessToken,
    shop,
    apiVersion: '2024-04',
    isCustomStoreApp: true,
  }).admin;

  // GraphQLミューテーション
  const mutation = `
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    basicCodeDiscount: {
      title: 'ご注文感謝クーポン',
      code,
      startsAt: now.toISOString(),
      endsAt: expiryDate,
      customerSelection: {
        customers: { add: [customerId] }
      },
      customerGets: {
        value: {
          discountAmount: {
            amount,
            appliesOnEachItem: false
          }
        },
        items: { all: true }
      },
      usageLimit: 1,
      appliesOncePerCustomer: true
    }
  };

  // APIリクエスト
  const response = await client.graphql({
    data: { query: mutation, variables }
  });

  // エラーハンドリング
  const errors = response.body?.data?.discountCodeBasicCreate?.userErrors;
  if (errors && errors.length > 0) {
    throw new Error('Shopifyクーポン発行エラー: ' + JSON.stringify(errors));
  }

  return { code, expiryDate };
} 