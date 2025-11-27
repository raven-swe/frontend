<script lang="ts" setup>
defineProps<{
  username: string | null;
  avatarUrl: string;
}>();
</script>
<template>
  <div class="bg-background sticky top-0 flex items-center justify-between p-4 backdrop:blur-md">
    <div class="flex items-center gap-6">
      <NuxtLink
        to="/messages"
        class="hover:bg-foreground/10 flex cursor-pointer items-center rounded-full lg:hidden"
      >
        <Icon name="ic:round-arrow-back" size="24" />
      </NuxtLink>
      <NuxtImg
        :src="avatarUrl"
        alt="Profile picture"
        class="z-20 size-12 rounded-full border-1 object-cover"
        loading="eager"
      />
      <span class="text-lg font-bold">
        {{ username }}
      </span>
    </div>
    <Icon name="ic:round-report-gmailerrorred" size="24" />
  </div>
</template>
