import { i18n } from "@lingui/core";
import { getApiError, getFieldErrors } from "@repo/infrastructure/api/ErrorList";
import { accountManagementApi } from "@/shared/lib/api/client";
import type { FetchResponse } from "openapi-fetch";

interface CurrentRegistration {
  accountRegistrationId: string;
  email: string;
  expireAt: Date;
}

interface Registration {
  current: CurrentRegistration | undefined;
}

export const registration: Registration = { current: undefined };

export interface State {
  error: boolean;
  success?: boolean;
  message?: string | null;
  errors?: { [key: string]: string | string[] };
}

export async function startAccountRegistration(_: State, formData: FormData): Promise<State> {
  const subdomain = formData.get("subdomain") as string;
  const email = formData.get("email") as string;

  const result = await accountManagementApi.POST("/api/account-management/account-registrations/start", {
    body: { subdomain, email }
  });

  if (!result.response.ok) {
    return convertResponseErrorToErrorState(result);
  }

  if (!result.data) {
    throw new Error("Start registration failed.");
  }

  registration.current = {
    accountRegistrationId: result.data.accountRegistrationId as string,
    email,
    expireAt: new Date(Date.now() + (result.data.validForSeconds as number) * 1000)
  };

  return { error: false, success: true };
}

export async function completeAccountRegistration(_: State, formData: FormData): Promise<State> {
  const oneTimePassword = formData.get("oneTimePassword") as string;
  const accountRegistrationId = registration.current?.accountRegistrationId;

  if (!accountRegistrationId) {
    return { error: true, success: false, message: i18n.t("Account registration is not started.") };
  }

  try {
    const result = await accountManagementApi.POST("/api/account-management/account-registrations/{id}/complete", {
      params: { path: { id: accountRegistrationId } },
      body: { oneTimePassword }
    });

    if (!result.response.ok) {
      return convertResponseErrorToErrorState(result);
    }

    return { error: false, success: true };
  } catch (e) {
    return {
      error: true,
      success: false,
      message: i18n.t("An error occured when trying to complete Account registration.")
    };
  }
}

type MediaType = `${string}/${string}`;

function convertResponseErrorToErrorState<T, O, M extends MediaType>(result: FetchResponse<T, O, M>): State {
  const apiError = getApiError(result);
  return { error: true, success: false, message: apiError.title, errors: getFieldErrors(apiError.Errors) };
}
