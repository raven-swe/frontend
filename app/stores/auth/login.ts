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
      if (response.exists) {
        step.value = 1;
        type.value = response.type;
      }
      return response.exists;
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else {
        showToaster('error', 'toaster.checkUser.error', true);
      }
    } finally {
      loading.value = false;
    }
  };

  const login = async (data: LoginSchema) => {
    loading.value = true;
    try {
      await loginService.login(data);
      resetData();
      open.value = false;
      showToaster('success', 'toaster.login.success', true);
      navigateTo('/home');
    } catch (error) {
      if (isApiValidationError(error)) {
        if (error.data?.data?.error?.errors) {
          return error.data.data.error.errors;
        }
      } else {
        if (error.data?.statusCode === 401) {
          return [{ field: 'password', code: error.data.data.error.code }];
        }
        showToaster('error', 'toaster.login.error', true);
      }
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
    login,
  };
});
