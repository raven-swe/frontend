<script setup lang="ts">
import OAuthCompleteForm from '~/components/ui/OAuthCompleteForm.vue';
definePageMeta({
  layout: false, // Disable layout for this page
});
const route = useRoute();
const router = useRouter();
const code = route.query.code as string;
const creationToken = ref<string | null>(null);
const showForm = ref(false);

if (code) {
  try {
    const result = await $fetch<ApiSuccessResponse<OAuthCallbackResponse>>(
      '/api/oauth/google/callback',
      {
        method: 'POST',
        body: { code },
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
    console.error('Google authentication failed:', error);
  }
}
</script>

<template>
  <div>
    <OAuthCompleteForm v-if="showForm && creationToken" :creation-token="creationToken" />
  </div>
</template>
