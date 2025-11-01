<script lang="ts" setup>
import { useIsCurrentUser } from '@/composables/useIsCurrentUser';

defineProps<{
  profileImg: string;
}>();
const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();
</script>
<template>
  <div class="mx-4 flex flex-wrap items-center justify-between gap-4">
    <div>
      <NuxtImg
        :src="profileImg"
        alt="Profile picture"
        class="z-20 -mt-16 size-34 rounded-full border-4 object-cover"
        loading="eager"
      />
    </div>
    <UiButton v-if="!userStore.isProfileSetup && isCurrentUser" variant="outline">
      <NuxtLink to="/profile/setup">
        {{ $t('profile.setup.setup-profile') }}
      </NuxtLink>
    </UiButton>
    <UiButton v-else-if="isCurrentUser" variant="outline">
      <NuxtLink to="/settings/profile">
        {{ $t('profile-info.edit-profile') }}
      </NuxtLink>
    </UiButton>
  </div>
</template>
