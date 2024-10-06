import type { Schemas } from "@/shared/lib/api/client";
import { t } from "@lingui/macro";

interface LoginState {
  loginId: Schemas["LoginId"];
  email: string;
  expireAt: Date;
}

let currentLoginState: LoginState | undefined;

export function setLoginState(newLogin: LoginState): void {
  currentLoginState = newLogin;
}

export function getLoginState() {
  if (currentLoginState == null) throw new Error(t`No active login`);
  return currentLoginState;
}
