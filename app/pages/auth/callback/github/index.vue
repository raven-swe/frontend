<script lang="ts" setup>
import OAuthCompleteForm from '~/components/ui/OAuthCompleteForm.vue';

definePageMeta({
  layout: false, // Disable layout for this page
});

const route = useRoute();
const router = useRouter();
const code = route.query.code as string;
const creationToken = ref<string | null>(null);
const showForm = ref(false);

onMounted(async () => {
  if (code) {
    if (window.opener) {
      // Post code to parent window and close popup
      window.opener.postMessage({ type: 'github-auth', code }, window.location.origin);
      window.close();
    } else {
      try {
        const result = await $fetch<ApiSuccessResponse<OAuthCallbackResponse>>(
          '/api/oauth/github/callback',
          {
            method: 'POST',
            body: {
              providerToken: code,
            },
            headers: {
              'X-Client-Type': 'web',
            },
          },
        );

        if (result.success && 'creationToken' in result.data) {
          creationToken.value = result.data.creationToken;
          showForm.value = true;
        } else {
          // Handle accessToken/refreshToken as usual
          await router.push('/home');
        }
      } catch (error) {
        console.error('GitHub authentication failed:', error);
      }
    }
  }
});
</script>

<template>
  <div>
    <OAuthCompleteForm v-if="showForm && creationToken" :creation-token="creationToken" />
  </div>
</template>
