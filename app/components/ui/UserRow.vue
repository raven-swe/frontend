<script lang="ts" setup>
import type { CompactUser } from '~~/shared/types/user';
import FollowToggleButton from './FollowToggleButton.vue';
import MuteToggleButton from './MuteToggleButton.vue';
import BlockToggleButton from './BlockToggleButton.vue';

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
const parsedBioTokens = computed(() =>
  parseContentEntities(
    props.user.bio,
    props.user.bioEntities || {
      mentions: [],
      hashtags: [],
    },
  ),
);

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
    <UiHoverCard>
      <UiHoverCardTrigger as-child>
        <UiAvatar :img="user.avatarUrl" size="sm" />
      </UiHoverCardTrigger>
      <UiHoverCardContent>
        <UiUserMetadata
          :username="user.username"
          @follow="$emit('follow', user.username)"
          @unfollow="$emit('unfollow', user.username)"
          @unblock="$emit('unblock', user.username)"
        />
      </UiHoverCardContent>
    </UiHoverCard>
    <div class="flex flex-1 flex-col gap-1">
      <div class="flex flex-1 items-center justify-between">
        <div>
          <UiHoverCard>
            <UiHoverCardTrigger as-child>
              <p class="text-md font-semibold">{{ user.displayName }}</p>
            </UiHoverCardTrigger>
            <UiHoverCardContent>
              <UiUserMetadata
                :username="user.username"
                @follow="$emit('follow', user.username)"
                @unfollow="$emit('unfollow', user.username)"
                @unblock="$emit('unblock', user.username)"
              />
            </UiHoverCardContent>
          </UiHoverCard>
          <p class="text-muted-foreground text-sm">
            <UiHoverCard>
              <UiHoverCardTrigger>
                {{ '@' + user.username + ' ' }}
              </UiHoverCardTrigger>
              <UiHoverCardContent>
                <UiUserMetadata
                  :username="user.username"
                  @follow="$emit('follow', user.username)"
                  @unfollow="$emit('unfollow', user.username)"
                  @unblock="$emit('unblock', user.username)"
                />
              </UiHoverCardContent>
            </UiHoverCard>
            <span
              v-if="user.relationship.follower"
              class="bg-muted rounded-sm p-0.5 px-0.75 text-xs font-semibold"
            >
              {{ $t('ui.follows-you') }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-1">
          <FollowToggleButton
            v-if="primaryAction === 'follow'"
            :relationship="relationship"
            @follow="$emit('follow', user.username)"
            @unfollow="$emit('unfollow', user.username)"
            @unblock="$emit('unblock', user.username)"
          />
          <MuteToggleButton
            v-else-if="primaryAction === 'mute'"
            :relationship="relationship"
            @mute="$emit('mute', user.username)"
            @unmute="$emit('unmute', user.username)"
          />

          <BlockToggleButton
            v-else-if="primaryAction === 'block'"
            :relationship="relationship"
            @block="$emit('block', user.username)"
            @unblock="$emit('unblock', user.username)"
          />
          <UiDropdownMenu v-if="showDropdown">
            <UiDropdownMenuTrigger as-child>
              <UiButton variant="ghost-default" class="bg-transparent" size="icon-sm" @click.stop>
                <Icon class="text-muted-foreground" name="lucide:more-horizontal" />
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end" class="bg-background">
              <UiDropdownMenuItem
                data-test="mute-button"
                @click="$emit(isMuted ? 'unmute' : 'mute', user.username)"
              >
                <Icon :name="isMuted ? 'lucide:volume' : 'lucide:volume-off'" size="18" />
                {{ isMuted ? $t('ui.unmute') : $t('ui.mute') }}
              </UiDropdownMenuItem>
              <UiDropdownMenuItem
                data-test="block-button"
                @click="$emit(isBlocked ? 'unblock' : 'block', user.username)"
              >
                <Icon name="lucide:ban" size="18" class="text-foreground" />
                {{ isBlocked ? $t('ui.unblock') : $t('ui.block') }}
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </div>
      </div>
      <p class="text-md line-clamp-3 break-words">
        <template v-for="token in parsedBioTokens" :key="token.key">
          <span v-if="token.type === 'text'" :key="token.key">
            {{ token.display }}
          </span>
          <NuxtLink
            v-else-if="token.type === 'mention'"
            :to="`/profile/${token.value}`"
            class="text-primary hover:underline"
          >
            {{ token.display }}
          </NuxtLink>
          <NuxtLink
            v-else-if="token.type === 'hashtag'"
            :to="`/hashtag/${token.value}`"
            class="text-primary hover:underline"
          >
            {{ token.display }}
          </NuxtLink>
          <a
            v-else-if="token.type === 'link'"
            :href="token.value"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >
            {{ token.display }}
          </a>
        </template>
      </p>
    </div>
  </div>
</template>
