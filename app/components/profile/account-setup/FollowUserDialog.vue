<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
import useAccountSetup from '~/composables/useAccountSetup';
import { profileInteractionService } from '~/services/profile/profileInteractionService';
import { accountSettingsService } from '~/services/settings/accountSettingsService';

const props = defineProps<{
  open: boolean;
}>();

const accountSetup = useAccountSetup();

const { data: response, isLoading } = useQuery({
  queryKey: ['follow-user-suggestions'],
  queryFn: () => accountSettingsService.getFollowSuggestions(),
});
const suggestions = computed(() => response.value?.data.suggestions || []);

const hasFollowedAtLeastOne = computed(() => {
  return suggestions.value?.some((user) => user.relationship?.following) ?? false;
});

const queryClient = useQueryClient();
const followUserMutation = useMutation({
  mutationFn: ({ username, action }: { username: string; action: string }) => {
    if (action === 'follow') {
      return profileInteractionService.followUser(username);
    } else {
      return profileInteractionService.unfollowUser(username);
    }
  },
  onMutate: async ({ username, action }: { username: string; action: string }) => {
    const queryKey = ['follow-user-suggestions'];
    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData<typeof response.value>(queryKey);
    if (previousData?.data) {
      const newData = { ...previousData };
      const suggestions = newData.data.suggestions.map((user) => {
        if (user.username === username) {
          const updatedUser = { ...user };
          if (action === 'follow') {
            updatedUser.relationship = { ...updatedUser.relationship, following: true };
            updatedUser.followersCount += 1;
          } else {
            updatedUser.relationship = { ...updatedUser.relationship, following: false };
            updatedUser.followersCount -= 1;
          }
          return updatedUser;
        }
        return user;
      });
      queryClient.setQueryData(queryKey, {
        ...newData,
        data: {
          ...newData.data,
          suggestions,
        },
      });
    }

    return { previousData };
  },
  onError: (_err, _variables, context) => {
    queryClient.setQueryData(['follow-user-suggestions'], context?.previousData);
  },

  onSuccess: async (_data, { username }) => {
    const updatedUserResponse = await apiFetch(`/api/users/${username}/profile`);
    const updatedUser = updatedUserResponse.data;
    const queryKey = ['follow-user-suggestions'];
    const previousData = queryClient.getQueryData<typeof response.value>(queryKey);
    if (previousData?.data) {
      const suggestions = previousData.data.suggestions.map((user) =>
        user.username === username ? updatedUser : user,
      );

      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: {
          ...previousData.data,
          suggestions,
        },
      });
    }
    // Update the profile cache as well
    // assuming most likely the user profile page will be visited after following
    queryClient.setQueryData(['profile', username], updatedUser);
  },
});
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
          @follow="followUserMutation.mutate({ username: user.username, action: 'follow' })"
          @unfollow="followUserMutation.mutate({ username: user.username, action: 'unfollow' })"
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
