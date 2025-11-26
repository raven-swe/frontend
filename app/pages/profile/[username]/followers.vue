<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
import UserRow from '~/components/ui/UserRow.vue';

definePageMeta({
  layout: 'follower-following',
});

const router = useRouter();
const username = computed(() => router.currentRoute.value.params.username?.toString());
const queryKey = computed(() => ['followers', username.value]);
const { data: users } = useQuery({
  queryKey,
  queryFn: async () => {
    const response = await apiFetch(`/api/users/${username.value}/followers`);
    return response.data;
  },
});
</script>

<template>
  <div>
    <UserRow v-for="user in users" :key="user.username" :user="user" />
  </div>
</template>
