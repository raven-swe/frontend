<script lang="ts" setup>
const userData = {
  name: 'Hussein Mohamed',
  userName: '@hussein',
  bio: 'football lover, software engineer, coffee addict.',
  joinAt: 'july 2020',
  following: 150,
  followers: 50,
};
</script>
<template>
  <div class="mt-2 flex flex-col">
    <div class="px-4">
      <h2 class="text-foreground text-2xl font-bold">{{ userData.name }}</h2>
      <p class="text-muted-foreground">{{ userData.userName }}</p>
      <p class="mt-2">{{ userData.bio }}</p>
      <p class="text-muted-foreground mt-2">
        <Icon name="ic:sharp-calendar-month" />
        {{ $t('profile-info.joined') }} {{ userData.joinAt }}
      </p>
      <div class="mt-4 flex space-x-4">
        <span
          ><strong>{{ userData.following }}</strong>
          <span class="text-muted-foreground ms-1"> {{ $t('profile-info.following') }} </span>
        </span>
        <span
          ><strong>{{ userData.followers }}</strong>
          <span class="text-muted-foreground ms-1"> {{ $t('profile-info.followers') }} </span>
        </span>
      </div>
    </div>
  </div>
</template>
