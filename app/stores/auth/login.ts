import { defineStore } from 'pinia';
import { showToaster } from '@/utils/showToaster';
import { loginService, type LoginSchema } from '@/services/auth/loginService';

export const useLoginStore = defineStore('login', () => {
  const step = ref(0);
  const open = ref(false);
  const identifier = ref('');
  const type = ref('');
  const loading = ref(false);
  const registerStore = useRegisterStore();

  const openDialog = () => {
    open.value = true;
  };

  const closeDialog = () => {
    resetData();
    open.value = false;
  };

  const openForgotPasswordDialog = () => {
    navigateTo(`/password-reset${step.value === 1 ? `?identifier=${identifier.value}` : ''}`);
    closeDialog();
  };

  const openSignupDialog = () => {
    closeDialog();
    registerStore.openDialog();
  };

  const resetData = () => {
    step.value = 0;
    identifier.value = '';
    loading.value = false;
    type.value = '';
  };

  const checkUserExists = async (_identifier: string) => {
    type.value = '';
    loading.value = true;
    try {
      const response = await loginService.checkUser(_identifier);
      identifier.value = _identifier;
      if (response.data.exists) {
        step.value = 1;
        type.value = response.data.type;
      } else {
        step.value = 0;
        type.value = '';
      }
      return response.data.exists;
    } catch (error) {
      const msg = error?.data?.message || 'Unexpected error occurred';
      throw new Error(msg);
    } finally {
      loading.value = false;
    }
  };

  const submitLogin = async (data: LoginSchema) => {
    loading.value = true;
    try {
      await loginService.login(data);
      open.value = false;
      resetData();
      showToaster('success', 'Login successful');
      navigateTo('/home');
    } catch (error) {
      console.error('Login failed');
      const msg = error?.data?.message || error?.data?.error?.message || 'Invalid credentials';
      throw new Error(msg);
    } finally {
      loading.value = false;
    }
  };

  return {
    step,
    open,
    identifier,
    type,
    loading,

    openDialog,
    closeDialog,
    openForgotPasswordDialog,
    openSignupDialog,
    checkUserExists,
    submitLogin,
  };
});
