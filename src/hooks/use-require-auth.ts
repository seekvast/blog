import { useSession } from "next-auth/react";
import { useLoginModal } from "@/components/providers/login-modal-provider";

export function useRequireAuth() {
  const { data: session } = useSession();
  const { openLoginModal } = useLoginModal();

  const requireAuth = (callback: () => void) => {
    if (!session?.user) {
      openLoginModal();
      return false;
    }
    callback();
    return true;
  };

  return { requireAuth, user: session?.user };
}
