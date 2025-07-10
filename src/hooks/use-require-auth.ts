import { useAuth } from "@/components/providers/auth-provider";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { useEmailVerificationGuard } from "./use-email-verification-guard";
import { EmailVerificationRequiredFeature } from "@/config/email-verification";

export function useRequireAuth() {
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { requireEmailVerification } = useEmailVerificationGuard();

  const requireAuth = (callback: () => void) => {
    if (!user) {
      openLoginModal();
      return false;
    }
    callback();
    return true;
  };

  /**
   * 要求登录和邮箱验证的组合函数
   * @param callback 验证通过后执行的回调函数
   * @param feature 功能类型，用于邮箱验证提示，默认为通用操作
   * @returns 是否验证通过
   */
  const requireAuthAndEmailVerification = (
    callback: () => void,
    feature: EmailVerificationRequiredFeature = EmailVerificationRequiredFeature.DEFAULT
  ): boolean => {
    return requireAuth(() => {
      requireEmailVerification(callback, feature);
    });
  };

  return {
    requireAuth,
    requireAuthAndEmailVerification,
  };
}
