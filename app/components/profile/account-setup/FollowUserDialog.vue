<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';
import { accountSettingsService } from '~/services/settings/accountSettingsService';

const props = defineProps<{
  open: boolean;
}>();

const accountSetup = useAccountSetup();

const { data: response, isLoading } = useQuery({
  queryKey: ['follow-user-suggestions'],
  queryFn: () => accountSettingsService.getFollowSuggestions(),
});
const suggestions = ref<User[]>([]);

watch(response, (newResponse) => {
  suggestions.value = newResponse?.data.suggestions ?? [];
});

const hasFollowedAtLeastOne = computed(() => {
  return suggestions.value?.some((user) => user.relationship?.following) ?? false;
});

const followUser = async (username: string) => {
  suggestions.value = suggestions.value.map((user) =>
    user.username === username
      ? { ...user, relationship: { ...user.relationship, following: true } }
      : user,
  );
};

const unfollowUser = async (username: string) => {
  suggestions.value = suggestions.value.map((user) =>
    user.username === username
      ? { ...user, relationship: { ...user.relationship, following: false } }
      : user,
  );
};
</script>

<template>
  <UiDialog :open="props.open">
    <UiDialogContent
      hide-close-button
      header-class="flex items-center justify-center p-0 overflow-hidden"
      class="h-auto"
    >
      <template #header>
        <LogoRaven class="size-8" />
      </template>
      <UiDialogHeader class="mx-auto w-full max-w-100">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.account-setup.follow-user.title')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.account-setup.follow-user.description') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="mx-auto flex max-w-110 flex-1 flex-col overflow-y-auto">
        <UiSpinner v-if="isLoading" class="mx-20" />
        <UiUserPreview
          v-for="user in suggestions"
          :key="user.username"
          :user="user"
          is-onboarding
          @follow="followUser"
          @unfollow="unfollowUser"
        />
      </div>
      <div class="flex flex-col items-center justify-center">
        <UiButton
          class="w-full max-w-100"
          size="xl"
          :disabled="!hasFollowedAtLeastOne"
          @click="accountSetup.goToNextStep()"
        >
          {{ $t('ui.next') }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
