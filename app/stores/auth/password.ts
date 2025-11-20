import { defineStore } from 'pinia';
import { showToaster } from '@/utils/showToaster';
import {
  passwordService,
  type CheckUserSchema,
  type ResetPasswordSchema,
  type VerifyUserSchema,
} from '@/services/auth/passwordService';
import { isApiError, isApiValidationError } from '@/utils/errorUtils';

export const usePasswordStore = defineStore('password', () => {
  const router = useRouter();

  const open = ref(true);
  const step = ref(0);
  const identifier = ref('');
  const confirmationToken = ref('');
  const loading = ref(false);

  function openDialog() {
    step.value = 0;
    identifier.value = getIdentifierFromQuery();
    open.value = true;
  }

  const closeDialog = () => {
    open.value = false;
    resetData();
    router.push('/');
  };

  const resetData = () => {
    step.value = 0;
    identifier.value = '';
    confirmationToken.value = '';
    loading.value = false;
  };

  const getIdentifierFromQuery = (): string => {
    const query = router.currentRoute.value.query;
    identifier.value = (query.identifier as string) ? (query.identifier as string) : '';
    return identifier.value;
  };

  const checkUserExists = async (data: CheckUserSchema) => {
    loading.value = true;
    try {
      const response = await passwordService.checkUser(data);
      identifier.value = data.identifier;
      step.value = 1;
      confirmationToken.value = response.data.confirmationToken;
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else if (isApiError(error)) {
        if (error.data?.statusCode === 404 || error.data?.statusCode === 400) {
          const errorCode = error.data?.data?.error?.code;
          return [{ field: 'identifier', code: errorCode }];
        } else if (error.data?.statusCode === 429) {
          showToaster('error', 'toaster.checkUser.rateLimit');
        }
      } else {
        showToaster('error', 'toaster.checkUser.error');
      }
    } finally {
      loading.value = false;
    }
  };

  const verifyUser = async (otp: string) => {
    loading.value = true;
    const data: VerifyUserSchema = {
      confirmationToken: confirmationToken.value,
      otp: otp,
    };
    try {
      await passwordService.verifyUser(data);
      step.value = 2;
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else {
        showToaster('error', 'toaster.verifyUser.error');
      }
    } finally {
      loading.value = false;
    }
  };

  const resendOtp = async () => {
    try {
      await passwordService.resendOtp(confirmationToken.value);
      step.value = 1;
      showToaster('success', 'toaster.resendOtp.success');
    } catch (error) {
      if (isApiError(error) && error.status === 429) {
        const apiError = error.data?.data;
        showToaster('error', apiError?.message || 'toaster.resendOtp.rateLimit');
        const { retryAfter } = apiError?.error as unknown as { retryAfter: number };
        if (retryAfter) {
          return retryAfter;
        }
      } else {
        showToaster('error', 'toaster.resendOtp.error');
      }
    }
  };

  const resetPassword = async (newPassword: string) => {
    loading.value = true;
    const data: ResetPasswordSchema = {
      confirmationToken: confirmationToken.value,
      newPassword: newPassword,
    };
    try {
      await passwordService.resetPassword(data);
      resetData();
      open.value = false;
      showToaster('success', 'toaster.resetPassword.success');
      router.push('/home');
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else {
        showToaster('error', 'toaster.resetPassword.error');
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    step,
    open,
    identifier,
    loading,

    openDialog,
    closeDialog,
    checkUserExists,
    verifyUser,
    resendOtp,
    resetPassword,
  };
});
