<script lang="ts" setup>
defineProps<{
  username: string | null;
  avatarUrl: string;
}>();
</script>
<template>
  <div class="bg-background sticky top-0 flex items-center justify-between p-4 backdrop:blur-md">
    <div class="flex items-center gap-3">
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
