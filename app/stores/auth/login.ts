import { defineStore } from 'pinia';
import { showToaster } from '@/utils/showToaster';

type LoginSchema = {
  identifier: string;
  password: string;
};

export const useLoginStore = defineStore('login', () => {
  const router = useRouter();

  const step = ref(0);
  const open = ref(false);
  const identifier = ref('');
  const type = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const loading = ref(false);

  const openDialog = () => {
    open.value = true;
  };

  const closeDialog = () => {
    open.value = false;
    resetForm();
  };

  const resetForm = () => {
    step.value = 0;
    identifier.value = '';
    errorMessage.value = null;
  };

  const checkIdentifierExists = async (_identifier: string) => {
    errorMessage.value = null;
    type.value = null;
    loading.value = true;

    try {
      const response = await $fetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
        '/api/auth/check-identifier',
        {
          method: 'GET',
          query: { identifier: _identifier },
        },
      );

      identifier.value = _identifier;

      if (response.data.exists) {
        step.value = 1;
        type.value = response.data.type || 'email';
      } else {
        step.value = 0;
        type.value = null;
      }

      return response.data.exists;
    } catch (error) {
      const msg = error?.data?.message || 'Unexpected error occurred';
      errorMessage.value = msg;
      console.error('❌ Failed to check identifier:', msg);
      throw new Error(msg);
    } finally {
      loading.value = false;
    }
  };

  const submitLogin = async (data: LoginSchema) => {
    errorMessage.value = null;
    loading.value = true;

    try {
      await $fetch<ApiSuccessResponse<{ accessToken: string }>>('/api/auth/login', {
        method: 'POST',
        body: data,
      });

      step.value = 0;
      open.value = false;
      showToaster('success', 'Login successful');
      router.push('/home');
    } catch (error) {
      const msg = error?.data?.message || error?.data?.error?.message || 'Invalid credentials';
      errorMessage.value = msg;
      console.error('❌ Login failed', msg);
      throw new Error(msg);
    } finally {
      loading.value = false;
    }
  };

  const previousStep = () => {
    if (step.value > 0) step.value--;
  };

  return {
    step,
    open,
    identifier,
    type,
    errorMessage,
    loading,
    openDialog,
    closeDialog,
    resetForm,
    checkIdentifierExists,
    submitLogin,
    previousStep,
  };
});
