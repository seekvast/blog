/**
 * Cloudflare Turnstile 验证工具
 */

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  action?: string;
  cdata?: string;
}

/**
 * 验证 Cloudflare Turnstile token
 * @param token 客户端获取的 Turnstile token
 * @param ip 可选，用户 IP 地址
 * @returns 验证结果，包含 success 字段表示验证是否成功
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<TurnstileVerifyResponse> {
  try {
    // 确保有密钥
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('缺少 Cloudflare Turnstile 密钥配置');
      return { success: false, error_codes: ['missing-secret-key'] };
    }

    // 构建表单数据
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    // 如果提供了 IP，添加到请求中
    if (ip) {
      formData.append('remoteip', ip);
    }

    // 发送验证请求到 Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // 解析响应
    const data = await response.json() as TurnstileVerifyResponse;
    
    // 如果验证失败，记录错误
    if (!data.success && data.error_codes) {
      console.error('Turnstile 验证失败:', data.error_codes);
    }

    return data;
  } catch (error) {
    console.error('Turnstile 验证过程中发生错误:', error);
    return { success: false, error_codes: ['verification-error'] };
  }
}
