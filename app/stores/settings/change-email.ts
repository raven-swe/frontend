import { apiFetch } from '~/api';

export const useChangeEmailStore = defineStore('changeEmail', () => {
  const step = ref<'email' | 'otp'>('email');
  const open = ref(false);
  const email = ref('');
  const confirmationToken = ref('');
  const userStore = useUserStore();

  const isOpen = computed(() => open.value);

  const handleDialogChange = (val: boolean) => {
    if (!val) step.value = 'email';
    open.value = val;
  };

  const handleEmailSubmit = async (newEmail: string) => {
    try {
      const response = await apiFetch<
        ApiSuccessResponse<{
          confirmationToken: 'string';
        }>
      >('/api/settings/email', {
        method: 'PUT',
        body: {
          newEmail: newEmail,
        },
      });
      confirmationToken.value = response.data.confirmationToken;
      step.value = 'otp';
      email.value = newEmail;
    } catch {
      showToaster('error', 'Failed to submit new email.');
    }
  };

  const handleOtpSubmit = async (otp: string): Promise<boolean> => {
    try {
      await apiFetch<ApiResponseBase>('/api/settings/email/verify', {
        method: 'POST',
        body: {
          otp: otp,
          confirmationToken: confirmationToken.value,
        },
      });
      showToaster('success', 'Email changed successfully.');
      userStore.updateUser({ email: email.value });
      email.value = '';
      confirmationToken.value = '';
      step.value = 'email';
      open.value = false;
      return true;
    } catch {
      return false;
    }
  };

  const handleResendOtp = async (): Promise<boolean> => {
    try {
      await apiFetch<ApiResponseBase>('/api/settings/email/resend-otp', {
        method: 'POST',
        body: {
          confirmationToken: confirmationToken.value,
        },
      });
      showToaster('success', 'OTP resent successfully.');
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleEmailSubmit,
    handleOtpSubmit,
    handleDialogChange,
    handleResendOtp,
    isOpen,
    email,
    step,
  };
});
