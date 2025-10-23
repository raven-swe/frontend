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
    const result = await $fetch('/api/oauth/google/callback', {
      method: 'POST',
      body: { code },
    });
    if (result?.data?.creationToken) {
      creationToken.value = result.data.creationToken;
      showForm.value = true;
    } else {
      // Handle accessToken/refreshToken as usual
      // e.g. store tokens, redirect
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
    <div v-else>
      <!-- Success or redirect handled in script -->
    </div>
  </div>
</template>
