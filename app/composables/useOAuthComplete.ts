import { useRouter } from 'vue-router';
import type { OAuthCallbackResponse } from '../../shared/types/oauth';
export function useOAuthComplete() {
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const result = ref<ApiSuccessResponse<OAuthCallbackResponse>>();
  const router = useRouter();

  async function submit(creationToken: string, birthDate: string) {
    loading.value = true;
    error.value = null;

    try {
      result.value = await $fetch<ApiSuccessResponse<OAuthCallbackResponse>>(
        '/api/oauth/complete',
        {
          method: 'POST',
          body: { creationToken, birthDate },
        },
      );
      if (result.value?.success) {
        await router.push('/home');
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, result, submit };
}
