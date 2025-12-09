<script lang="ts" setup>
defineProps<{
  username: string | null;
  avatarUrl: string;
}>();
</script>
<template>
  <div class="bg-background sticky top-0 flex items-center justify-between p-4 backdrop:blur-md">
    <div class="flex items-center gap-6">
      <NuxtLink to="/messages" class="lg:hidden">
        <UiButton variant="ghost-default" size="icon-sm">
          <Icon name="ic:round-arrow-back" size="24" />
        </UiButton>
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
  </div>
</template>
