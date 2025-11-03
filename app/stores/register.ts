import { registerationService, type RegisterationInfo } from '@/services/auth/registerationService';
import { isApiError, isApiValidationError } from '@/utils/errorUtils';

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
    try {
      registerationInfo.value = data;
      const response = await registerationService.start(data);
      creationToken.value = response.data.creationToken;
      step.value = 1;
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else {
        console.error('Failed to verify OTP');
      }
    }
  };

  const submitOtp = async (otp: string) => {
    try {
      await registerationService.verify(otp, creationToken.value);
      step.value = 2;
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else {
        console.error('Failed to verify OTP');
      }
    }
  };

  const resendOtp = async () => {
    try {
      await registerationService.resendOtp(creationToken.value);
      showToaster('success', 'OTP resent successfully');
    } catch (error) {
      if (isApiError(error) && error.status === 429) {
        const apiError = error.data?.data;
        showToaster('error', apiError?.message || 'Failed to resend OTP');
        // Extract retryAfter from the error response (will be updated to match ApiResponse)
        const { retryAfter } = apiError?.error as unknown as { retryAfter: number };
        if (retryAfter) {
          return retryAfter;
        }
      } else {
        console.error('Failed to resend OTP');
      }
    }
  };

  const auth = useAuth();
  const submitPassword = async (password: string) => {
    try {
      await auth.signup(password, creationToken.value);
      resetInitialData();
      open.value = false;
      navigateTo('/home');
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else {
        console.error('Failed to verify OTP');
      }
    }
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
