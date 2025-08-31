import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  EmailVerificationRequiredFeature,
  getFeatureRestriction,
} from "@/config/email-verification";

export function useEmailVerificationGuard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 检查用户邮箱是否已验证
  const isEmailVerified = user?.is_email_confirmed === 1;

  // 检查用户是否已登录
  const isAuthenticated = !!user;

  /**
   * 要求邮箱验证的守卫函数
   * @param callback 验证通过后执行的回调函数
   * @param feature 功能类型，用于显示相应的提示信息
   * @returns 是否验证通过
   */
  const requireEmailVerification = (
    callback: () => void,
    feature?: EmailVerificationRequiredFeature
  ): boolean => {
    // 如果用户未登录，提示登录
    if (!isAuthenticated) {
      toast({
        variant: "default",
        title: "请先登录",
        description: "您需要登录后才能使用此功能",
      });
      return false;
    }

    // 如果邮箱未验证，显示提示并可选择跳转
    if (!isEmailVerified) {
      const restriction = feature ? getFeatureRestriction(feature) : null;
      const message = restriction?.message || "此功能需要验证邮箱";

      toast({
        variant: "default",
        title: "此功能需要验证邮箱",
      });
      return false;
    }

    // 验证通过，执行回调
    callback();
    return true;
  };

  /**
   * 检查特定功能是否需要邮箱验证
   * @param feature 功能类型
   * @returns 是否需要验证
   */
  const isFeatureRestricted = (
    feature: EmailVerificationRequiredFeature
  ): boolean => {
    return isAuthenticated && !isEmailVerified;
  };

  /**
   * 获取功能限制信息
   * @param feature 功能类型
   * @returns 限制信息或null
   */
  const getFeatureRestrictionInfo = (
    feature: EmailVerificationRequiredFeature
  ) => {
    if (!isFeatureRestricted(feature)) {
      return null;
    }
    return getFeatureRestriction(feature);
  };

  /**
   * 显示邮箱验证提示
   * @param feature 功能类型
   */
  const showEmailVerificationToast = (
    feature?: EmailVerificationRequiredFeature
  ) => {
    const restriction = feature ? getFeatureRestriction(feature) : null;
    const message = restriction?.message || "此功能需要验证邮箱";

    toast({
      variant: "default",
      title: "此功能需要验证邮箱",
      //   description: message,
    });
  };

  return {
    isEmailVerified,
    isAuthenticated,
    requireEmailVerification,
    isFeatureRestricted,
    getFeatureRestrictionInfo,
    showEmailVerificationToast,
  };
}
