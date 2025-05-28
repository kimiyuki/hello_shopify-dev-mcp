/**
 * @fileoverview
 * クーポンコードをメールで送信する（nodemailerモック）。
 *
 * - メール本文テンプレート
 * - 実際の送信はconsole.logで代用
 *
 * 制限事項:
 * - 本番運用時はSMTP設定必須
 */

/**
 * クーポンコードをメールで送信（モック）
 * @param {string} to - 送信先メールアドレス
 * @param {string} code - クーポンコード
 * @param {string} expiry - 有効期限（ISO8601）
 * @returns {Promise<void>}
 */
export async function sendCouponMail(to: string, code: string, expiry: string): Promise<void> {
  // メール本文テンプレート
  const text = `\nご注文ありがとうございます。\n次回使える500円クーポンをお送りします。\n\nクーポンコード: ${code}\n有効期限: ${expiry}\n\nぜひご利用ください。`;
  // 本来はnodemailerで送信するが、ここではconsole.logで代用
  // eslint-disable-next-line no-console
  console.log(`[MOCK MAIL] to: ${to}\n${text}`);
} 