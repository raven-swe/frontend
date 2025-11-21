<script lang="ts" setup>
import { profileInteractionService } from '~/services/profile/profileInteractionService';

const props = defineProps<{
  username: string;
  following: boolean;
  follower: boolean;
}>();

const { mutate: followUser } = useProfileMutation<'follow' | 'unfollow'>({
  mutationFn: async (action) => {
    return action === 'follow'
      ? profileInteractionService.followUser(props.username)
      : profileInteractionService.unfollowUser(props.username);
  },
  username: props.username,
  optimisticUpdateFn: (data, action) => {
    if (action === 'follow') {
      data.relationship.following = true;
      data.followersCount += 1;
    } else {
      data.relationship.following = false;
      data.followersCount -= 1;
    }
  },
});
const isHovered = ref(false);
</script>

<template>
  <UiButton v-if="!props.following" @click="followUser('follow')">
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
    >{{ isHovered ? $t('testing.unfollow') : $t('testing.following') }}</UiButton
  >
</template>
