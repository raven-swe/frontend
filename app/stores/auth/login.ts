import { defineStore } from 'pinia';

type LoginSchema = {
  identifier: string;
  password: string;
};

export const useLoginStore = defineStore('login', () => {
  const router = useRouter();

  const step = ref(0);
  const open = ref(false);
  const identifier = ref('');
  const identifierExists = ref<boolean | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
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
    identifierExists.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    errorMessage.value = null;
  };

  /**
   * Step 1️⃣: Check if identifier exists
   * Endpoint: GET /auth/check-identifier?identifier=<user_identifier>
   */
  const checkIdentifierExists = async (_identifier: string) => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const response = await $fetch<ApiSuccessResponse<{ exists: boolean }>>(
        '/api/auth/check-identifier',
        {
          method: 'GET',
          query: { identifier: _identifier },
        },
      );
      identifierExists.value = response.data.exists;
      identifier.value = _identifier;
      console.log('identifier', identifier.value);
      console.log('exists', response.data.exists);
      step.value = response.data.exists ? 1 : 0;

      return response.data.exists;
    } catch (error) {
      const msg =
        error?.data?.message ||
        error?.data?.error?.message ||
        'Unknown error occurred while checking identifier';
      errorMessage.value = msg;
      console.error('❌ Failed to check identifier:', msg);
      throw new Error(msg);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Step 2️⃣: Perform login
   * Endpoint: POST /auth/login
   */
  const submitLogin = async (data: LoginSchema) => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const response = await $fetch<
        ApiSuccessResponse<{ accessToken: string; refreshToken: string }>
      >('/api/auth/login', {
        method: 'POST',
        body: data,
      });
      accessToken.value = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      console.log('✅ Login successful', response.data);
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
      // identifier.value = data.identifier;
      step.value = 0;
      open.value = false;
      router.push('/playground/buttons');
    } catch (error) {
      const msg =
        error?.data?.message ||
        error?.data?.error?.message ||
        'Unknown error occurred during login';
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
    // state
    step,
    open,
    identifier,
    identifierExists,
    accessToken,
    refreshToken,
    errorMessage,
    loading,

    // actions
    openDialog,
    closeDialog,
    resetForm,
    checkIdentifierExists,
    submitLogin,
    previousStep,
  };
});
