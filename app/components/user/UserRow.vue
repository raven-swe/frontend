<script lang="ts" setup>
import type { CompactUser } from '~~/shared/types/user';
import FollowToggleButton from '@/components/ui/FollowToggleButton.vue';
import MuteToggleButton from '@/components/ui/MuteToggleButton.vue';
import BlockToggleButton from '@/components/ui/BlockToggleButton.vue';
import {
  useFollowMutation,
  useMuteMutation,
  useBlockMutation,
} from '~/composables/useProfileMutation';

const props = withDefaults(
  defineProps<{
    user: CompactUser;
    primaryAction?: 'mute' | 'follow' | 'block';
    showDropdown?: boolean;
  }>(),
  {
    primaryAction: 'follow',
    showDropdown: false,
  },
);

const router = useRouter();
const userStore = useUserStore();

const isMuted = computed(() => props.user.relationship.muted || false);
const isBlocked = computed(() => props.user.relationship.blocking || false);
const relationship = computed(() => props.user.relationship);
const isCurrentUser = computed(() => {
  return userStore.user?.username.toLowerCase() === props.user.username.toLowerCase();
});

const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();
const { mutate: muteUser } = useMuteMutation();
</script>

<template>
  <div
    class="border-border hover:bg-foreground/5 flex cursor-pointer gap-2 py-3 ps-4 pe-2 transition-colors duration-100"
    :class="{ 'pe-3': !props.showDropdown }"
    data-cy="user-row"
    @click="router.push(`/profile/${user.username}`)"
  >
    <div class="shrink-0">
      <UserHoverCard :username="user.username">
        <UiAvatar :img="user.avatarUrl" size="sm" />
      </UserHoverCard>
    </div>

    <div class="flex flex-1 flex-col gap-1 overflow-hidden">
      <div class="flex flex-1 items-center justify-between gap-2">
        <div class="flex flex-col overflow-hidden">
          <UserHoverCard :username="user.username">
            <p class="text-md line-clamp-1 truncate font-semibold">
              {{ user.displayName }}
            </p>
          </UserHoverCard>
          <p class="text-muted-foreground text-sm" data-cy="user-row-username">
            <UserHoverCard :username="user.username">
              {{ '@' + user.username + ' ' }}
            </UserHoverCard>
            <span
              v-if="user.relationship.follower"
              class="bg-muted rounded-sm p-0.5 px-0.75 text-xs font-semibold"
            >
              {{ $t('ui.follows-you') }}
            </span>
          </p>
        </div>
        <div v-if="!isCurrentUser" class="flex items-center gap-1">
          <BlockToggleButton
            v-if="primaryAction === 'block' || isBlocked"
            :relationship="relationship"
            @block="blockUser({ username: user.username, action: 'block' })"
            @unblock="blockUser({ username: user.username, action: 'unblock' })"
          />
          <FollowToggleButton
            v-else-if="primaryAction === 'follow'"
            :relationship="relationship"
            @follow="followUser({ username: user.username, action: 'follow' })"
            @unfollow="followUser({ username: user.username, action: 'unfollow' })"
          />
          <MuteToggleButton
            v-else-if="primaryAction === 'mute'"
            :relationship="relationship"
            @mute="muteUser({ username: user.username, action: 'mute' })"
            @unmute="muteUser({ username: user.username, action: 'unmute' })"
          />

          <UserActionDropdown
            v-if="props.showDropdown"
            :is-muted="isMuted"
            :is-blocked="isBlocked"
            :username="user.username"
          >
            <UiButton
              data-test="dropdown-trigger"
              variant="ghost-default"
              class="bg-transparent"
              size="icon-sm"
              @click.stop
            >
              <Icon class="text-muted-foreground" name="lucide:more-horizontal" />
            </UiButton>
          </UserActionDropdown>
        </div>
      </div>
      <p class="text-md line-clamp-3 break-all">
        <UiContentEntitiesRenderer :content="user.bio ?? ''" :entities="user.bioEntities" />
      </p>
    </div>
  </div>
</template>
