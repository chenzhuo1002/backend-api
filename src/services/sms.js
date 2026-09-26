/**
 * 短信服务封装
 * 支持多种发送方式，通过环境变量 SMS_PROVIDER 切换：
 * - console：只在控制台打印验证码（本地开发默认）
 * - aliyun：阿里云短信服务
 */

const provider = process.env.SMS_PROVIDER || 'console';

/**
 * 控制台模式：直接打印验证码，方便本地调试
 */
async function sendByConsole(phone, code) {
  console.log(`[SMS] 手机号 ${phone} 的验证码是：${code}`);
  return { ok: true, message: '控制台模拟发送成功' };
}

/**
 * 阿里云短信服务
 * 需要环境变量：
 *   ALIYUN_ACCESS_KEY_ID
 *   ALIYUN_ACCESS_KEY_SECRET
 *   ALIYUN_SMS_SIGN_NAME        短信签名
 *   ALIYUN_SMS_TEMPLATE_CODE    短信模板 CODE
 */
async function sendByAliyun(phone, code) {
  const { Client, SendSmsRequest } = require('@alicloud/dysmsapi20170525');

  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const signName = process.env.ALIYUN_SMS_SIGN_NAME;
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;

  if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
    throw new Error('阿里云短信环境变量未配置完整');
  }

  const client = new Client({
    accessKeyId,
    accessKeySecret,
    regionId: process.env.ALIYUN_REGION_ID || 'cn-hangzhou',
  });

  const request = new SendSmsRequest({
    phoneNumbers: phone,
    signName,
    templateCode,
    templateParam: JSON.stringify({ code }),
  });

  const response = await client.sendSms(request);
  const body = response.body || response;

  // 阿里云 SendSms 成功时 Code 为 OK
  if (body.Code !== 'OK') {
    throw new Error(body.Message || `阿里云短信发送失败：${body.Code}`);
  }

  return { ok: true, message: '发送成功', bizId: body.BizId };
}

const senders = {
  console: sendByConsole,
  aliyun: sendByAliyun,
};

/**
 * 发送验证码短信
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function sendVerificationCode(phone, code) {
  const sender = senders[provider];
  if (!sender) {
    throw new Error(`不支持的短信服务商：${provider}`);
  }
  return sender(phone, code);
}

module.exports = {
  provider,
  sendVerificationCode,
};
