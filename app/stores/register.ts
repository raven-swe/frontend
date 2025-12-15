import { registerationService, type RegisterationInfo } from '@/services/auth/registerationService';
import { isApiError, withApiValidationErrorHandling } from '@/utils/errorUtils';

export const useRegisterStore = defineStore('register', () => {
  const step = ref(0);
  const open = ref(false);
  const creationToken = ref<string | null>(null);
  const registerationInfo = ref<RegisterationInfo | null>({
    name: '',
    email: '',
    birthDate: '',
    recaptchaToken: '',
  });

  const openDialog = () => {
    open.value = true;
  };

  const resetInitialData = () => {
    step.value = 0;
    creationToken.value = null;
    registerationInfo.value = {
      name: '',
      email: '',
      birthDate: '',
      recaptchaToken: '',
    };
  };

  const submitRegisterationInfo = async (data: RegisterationInfo) => {
    return await withApiValidationErrorHandling(async () => {
      registerationInfo.value = data;
      const response = await registerationService.start(data);
      creationToken.value = response.data.creationToken;
      step.value = 1;
    }, 'Failed to start registration process');
  };

  const submitOtp = async (otp: string) => {
    return await withApiValidationErrorHandling(async () => {
      await registerationService.verify(otp, creationToken.value);
      step.value = 2;
    }, 'Failed to verify OTP');
  };

  const resendOtp = async () => {
    try {
      await registerationService.resendOtp(creationToken.value);
      showToaster('success', 'OTP resent successfully');
    } catch (error) {
      // handle rate limiting
      if (isApiError(error)) {
        const apiError = error.data?.data;
        showToaster('error', apiError?.message || 'Failed to resend OTP');
        if (error.status === 429) {
          const { retryAfter } = apiError?.error as unknown as { retryAfter: number };
          if (retryAfter) {
            return retryAfter;
          }
        }
        return;
      }
      showToaster('error', 'Failed to resend OTP');
    }
  };

  const submitPassword = async (password: string) => {
    return await withApiValidationErrorHandling(async () => {
      await registerationService.complete(password, creationToken.value);
      resetInitialData();
      open.value = false;
      sessionStorage.setItem('showAccountSetup', 'true');
      navigateTo('/home');
    }, 'Failed to complete registration');
  };

  const previousStep = () => {
    if (step.value > 0) {
      step.value -= 1;
    }
  };
  return {
    step,
    open,
    registerationInfo,
    openDialog,
    submitRegisterationInfo,
    submitOtp,
    submitPassword,
    previousStep,
    resendOtp,
    resetInitialData,
  };
});
