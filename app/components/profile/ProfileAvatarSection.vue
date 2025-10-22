<script lang="ts" setup>
defineProps<{
  profileImg: string;
}>();
</script>
<template>
  <div class="mx-4 flex flex-wrap items-center justify-between gap-4">
    <div>
      <NuxtImg
        :src="profileImg"
        alt="Profile picture"
        class="-mt-16 size-34 rounded-full border-4 object-contain"
        loading="eager"
      />
    </div>
    <UiButton variant="outline">{{ $t('profile-info.edit-profile') }}</UiButton>
  </div>
</template>
