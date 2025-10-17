import type { RegisterationInfoSchema } from '~/schemas/auth/register';

export const useRegisterStore = defineStore('register', () => {
  const step = ref(0);
  const open = ref(false);
  const creationToken = ref<string | null>(null);
  const registerationInfo = ref<RegisterationInfoSchema | null>({
    name: 'ahmne',
    email: 'ahmne@example.com',
    birthDate: '2005-01-01',
  });

  const openDialog = () => {
    open.value = true;
  };

  const submitRegisterationInfo = async (data: RegisterationInfoSchema) => {
    try {
      registerationInfo.value = data;
      const response = await $fetch<ApiSuccessResponse<{ creationToken: string }>>(
        '/api/auth/register/start',
        {
          method: 'POST',
          body: data,
        },
      );
      creationToken.value = response.data.creationToken;
      step.value = 1;
    } catch {
      console.error('failed to start registration');
    }
  };

  const submitOtp = async (otp: string): Promise<boolean> => {
    try {
      await $fetch<ApiResponseBase>('/api/auth/register/verify', {
        method: 'POST',
        body: { otp, creationToken: creationToken.value },
      });
      step.value = 2;
      return true;
    } catch {
      return false;
    }
  };

  const submitPassword = async (password: string) => {
    try {
      await $fetch<ApiResponseBase>('/api/auth/register/complete', {
        method: 'POST',
        body: { password, creationToken: creationToken.value },
      });
      step.value = 3;
    } catch {
      throw new Error('failed to complete registration');
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
  };
});
