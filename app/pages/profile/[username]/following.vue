<script lang="ts" setup>
import UserRow from '~/components/ui/UserRow.vue';
import rawUsers from '~~/mocks/data/mock-users.json';
const users = rawUsers as User[];

definePageMeta({
  layout: 'follower-following',
});
</script>

<template>
  <div>
    <UserRow v-for="user in users" :key="user.username" :user="user" />
  </div>
</template>
