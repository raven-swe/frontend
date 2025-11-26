<script lang="ts" setup>
import FollowToggleButton from './FollowToggleButton.vue';

const props = defineProps<{
  user: User;
}>();

defineEmits<{
  (e: 'follow' | 'unfollow' | 'unblock'): void;
}>();

const parsedBioTokens = computed(() =>
  parseContentEntities(props.user.bio, props.user.bioEntities),
);

const isMuted = computed(() => props.user.relationship.muted || false);
const isBlocked = computed(() => props.user.relationship.blocking || false);
</script>

<template>
  <div class="border-border flex gap-2 border-b py-3 ps-4 pe-2">
    <UiAvatar :img="user.avatarUrl" size="sm" />
    <div class="flex flex-1 flex-col gap-1">
      <div class="flex flex-1 items-center justify-between">
        <div>
          <p class="text-md font-semibold">{{ user.displayName }}</p>
          <p class="text-muted-foreground text-sm">
            {{ '@' + user.username }}
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
            :relationship="user.relationship"
            @follow="$emit('follow')"
            @unfollow="$emit('unfollow')"
            @unblock="$emit('unblock')"
          />
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton variant="ghost-default" size="icon-sm">
                <Icon class="text-muted-foreground" name="lucide:more-horizontal" />
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end" class="bg-background">
              <UiDropdownMenuItem data-test="mute-button">
                <Icon :name="isMuted ? 'lucide:volume' : 'lucide:volume-off'" size="18" />
                {{ isMuted ? $t('ui.unmute') : $t('ui.mute') }}
              </UiDropdownMenuItem>
              <UiDropdownMenuItem data-test="block-button">
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
