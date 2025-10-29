import { registerationService, type RegisterationInfo } from '@/services/auth/registerationService';

export const useRegisterStore = defineStore('register', () => {
  const step = ref(0);
  const open = ref(false);
  const creationToken = ref<string | null>(null);
  const registerationInfo = ref<RegisterationInfo | null>({
    name: '',
    email: '',
    birthDate: '',
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
    };
  };

  const submitRegisterationInfo = async (data: RegisterationInfo) => {
    try {
      registerationInfo.value = data;
      const response = await registerationService.start(data);
      creationToken.value = response.data.creationToken;
      step.value = 1;
    } catch {
      console.error('failed to start registration');
    }
  };

  const submitOtp = async (otp: string): Promise<boolean> => {
    try {
      await registerationService.verify(otp, creationToken.value);
      step.value = 2;
      return true;
    } catch {
      return false;
    }
  };

  const resendOtp = async () => {
    try {
      await registerationService.resendOtp(creationToken.value);
    } catch {
      console.error('Failed to resend otp');
    }
  };

  const submitPassword = async (password: string) => {
    try {
      await registerationService.complete(password, creationToken.value);
      resetInitialData();
      open.value = false;
      navigateTo('/home');
    } catch {
      console.error('Failed to complete registeration');
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
