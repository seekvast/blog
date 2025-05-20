import { useAuth } from "@/components/providers/auth-provider";
import { useLoginModal } from "@/components/providers/login-modal-provider";

export function useRequireAuth() {
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();

  const requireAuth = (callback: () => void) => {
    if (!user) {
      openLoginModal();
      return false;
    }
    callback();
    return true;
  };

  return { requireAuth, user };
}
