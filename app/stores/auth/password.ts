import { defineStore } from 'pinia';
import { showToaster } from '@/utils/showToaster';
import {
  passwordService,
  type CheckUserSchema,
  type ResetPasswordSchema,
  type VerifyUserSchema,
} from '@/services/auth/passwordService';

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
    router.push('/');
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
      const msg = error?.data?.message || 'Unexpected error occurred';
      throw new Error(msg);
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
      const msg = error?.data?.message || 'Unexpected error occurred';
      console.error(msg);
      throw new Error(msg);
    } finally {
      loading.value = false;
    }
  };

  const resendOtp = async () => {
    loading.value = true;
    try {
      await passwordService.resendOtp(confirmationToken.value);
      step.value = 1;
      showToaster('success', 'OTP resent successfully');
    } catch (error) {
      const msg = error?.data?.message || 'Unexpected error occurred';
      console.error(msg);
      throw new Error(msg);
    } finally {
      loading.value = false;
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
      step.value = 0;
      open.value = false;
      showToaster('success', 'Password reset successful');
      router.push('/home');
    } catch (error) {
      const msg = error?.data?.message || 'Unexpected error occurred';
      console.error(msg);
      throw new Error(msg);
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
