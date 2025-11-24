<script lang="ts" setup>
import { profileInteractionService } from '~/services/profile/profileInteractionService';
import { useProfileMutation } from '~/composables/useProfileMutation';

const props = defineProps<{
  username: string;
  following: boolean;
  follower: boolean;
}>();

async function mutationFn(action: 'follow' | 'unfollow') {
  if (action == 'follow') await profileInteractionService.followUser(props.username);
  else await profileInteractionService.unfollowUser(props.username);
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
    class="group grid-stack"
    @click.stop="followUser('unfollow')"
  >
    <span class="invisible group-hover:visible">
      {{ $t('ui.unfollow') }}
    </span>
    <span class="visible group-hover:invisible">
      {{ $t('ui.following') }}
    </span>
  </UiButton>
</template>

<style scoped>
.grid-stack {
  display: grid;
}

.grid-stack > span {
  grid-area: 1 / 1;
}
</style>
