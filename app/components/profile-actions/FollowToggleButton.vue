<script lang="ts" setup>
import { profileInteractionService } from '~/services/profile/profileInteractionService';
import { useProfileMutation } from '~/composables/useProfileMutation';

const props = defineProps<{
  username: string;
  following: boolean;
  follower: boolean;
}>();

function mutationFn(action: 'follow' | 'unfollow') {
  return action === 'follow'
    ? profileInteractionService.followUser(props.username)
    : profileInteractionService.unfollowUser(props.username);
}
function optimisticUpdateFn(data: User, action: 'follow' | 'unfollow') {
  if (action === 'follow') {
    data.relationship.following = true;
    data.followersCount += 1;
  } else {
    data.relationship.following = false;
    data.followersCount -= 1;
  }
}

const { mutate: followUser } = useProfileMutation<'follow' | 'unfollow'>({
  mutationFn,
  username: props.username,
  optimisticUpdateFn,
});
const isHovered = ref(false);
</script>

<template>
  <UiButton v-if="!props.following" data-test="follow-button" @click="followUser('follow')">
    {{ props.follower ? $t('ui.follow-back') : $t('ui.follow') }}
  </UiButton>

  <UiButton
    v-else-if="props.following"
    variant="outline-destructive"
    size="md"
    data-test="unfollow-button"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click.stop="followUser('unfollow')"
    >{{ isHovered ? $t('ui.unfollow') : $t('ui.following') }}</UiButton
  >
</template>
