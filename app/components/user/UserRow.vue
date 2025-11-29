<script lang="ts" setup>
import type { CompactUser } from '~~/shared/types/user';
import FollowToggleButton from '@/components/ui/FollowToggleButton.vue';
import MuteToggleButton from '@/components/ui/MuteToggleButton.vue';
import BlockToggleButton from '@/components/ui/BlockToggleButton.vue';

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

defineEmits<{
  (e: 'follow' | 'unfollow' | 'unblock' | 'block' | 'mute' | 'unmute', username: string): void;
}>();
const router = useRouter();

const isMuted = computed(() => props.user.relationship.muted || false);
const isBlocked = computed(() => props.user.relationship.blocking || false);
const relationship = computed(() => props.user.relationship);
</script>

<template>
  <div
    class="border-border hover:bg-foreground/5 flex cursor-pointer gap-2 py-3 ps-4 pe-2 transition-colors duration-100"
    :class="{ 'pe-3': !props.showDropdown }"
    @click="router.push(`/profile/${user.username}`)"
  >
    <UserHoverCard
      :username="user.username"
      @follow="$emit('follow', user.username)"
      @unfollow="$emit('unfollow', user.username)"
      @unblock="$emit('unblock', user.username)"
    >
      <UiAvatar :img="user.avatarUrl" size="sm" />
    </UserHoverCard>

    <div class="flex flex-1 flex-col gap-1">
      <div class="flex flex-1 items-center justify-between">
        <div>
          <UserHoverCard
            :username="user.username"
            @follow="$emit('follow', user.username)"
            @unfollow="$emit('unfollow', user.username)"
            @unblock="$emit('unblock', user.username)"
          >
            <p class="text-md font-semibold">{{ user.displayName }}</p>
          </UserHoverCard>

          <p class="text-muted-foreground text-sm">
            <UserHoverCard
              :username="user.username"
              @follow="$emit('follow', user.username)"
              @unfollow="$emit('unfollow', user.username)"
              @unblock="$emit('unblock', user.username)"
            >
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
        <div class="flex items-center gap-1">
          <BlockToggleButton
            v-if="primaryAction === 'block' || isBlocked"
            :relationship="relationship"
            @block="$emit('block', user.username)"
            @unblock="$emit('unblock', user.username)"
          />
          <FollowToggleButton
            v-else-if="primaryAction === 'follow'"
            :relationship="relationship"
            @follow="$emit('follow', user.username)"
            @unfollow="$emit('unfollow', user.username)"
          />
          <MuteToggleButton
            v-else-if="primaryAction === 'mute'"
            :relationship="relationship"
            @mute="$emit('mute', user.username)"
            @unmute="$emit('unmute', user.username)"
          />

          <UserActionDropdown
            v-if="props.showDropdown"
            :is-muted="isMuted"
            :is-blocked="isBlocked"
            @mute="$emit('mute', user.username)"
            @unmute="$emit('unmute', user.username)"
            @block="$emit('block', user.username)"
            @unblock="$emit('unblock', user.username)"
          >
            <UiButton variant="ghost-default" class="bg-transparent" size="icon-sm" @click.stop>
              <Icon class="text-muted-foreground" name="lucide:more-horizontal" />
            </UiButton>
          </UserActionDropdown>
        </div>
      </div>
      <p class="text-md line-clamp-3 break-all">
        <UiContentEntitiesRenderer
          :content="user.bio ?? ''"
          :entities="user.bioEntities ?? { mentions: [], hashtags: [] }"
        />
      </p>
    </div>
  </div>
</template>
