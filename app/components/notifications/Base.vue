<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';
import { relativeTime } from '@/utils/time';

const props = defineProps<{
  messageKey: string;
  messagePluralIndex?: number;
  messageParams?: { named?: Record<string, string | number | boolean | undefined> };
  displayActors: ActorSummary[];
  timestamp: string;
  icon?: { name: string; color?: string };
  actors: ActorSummary[];
  linkTo: string;
  isSeen?: boolean;
}>();

type MessagePart =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'user';
      content: string;
      actor: ActorSummary;
    };

const relativeTimestamp = computed(() => relativeTime(props.timestamp));

// Get up to 3 actors for avatar display
const displayActorsForAvatars = computed(() => props.actors.slice(0, 3));

// Create message with clickable user links
const message = computed(() => {
  const params = {
    ...props.messageParams,
    named: {
      ...props.messageParams?.named,
    },
  };

  // Add clickable user links to named parameters
  props.displayActors.forEach((actor, index) => {
    const userKey = `user${index + 1}`;
    if (params.named && params.named[userKey]) {
      params.named[userKey] = actor.username;
    }
  });

  return $t(props.messageKey, props.messagePluralIndex || 0, params);
});

// Parse message to identify user placeholders
const messageParts = computed((): MessagePart[] => {
  const text = message.value;
  const parts: MessagePart[] = [];
  let currentIndex = 0;

  // Find all user mentions in the message
  props.displayActors.forEach((actor, _index) => {
    const userPlaceholder = actor.username;
    const userIndex = text.indexOf(userPlaceholder, currentIndex);

    if (userIndex !== -1) {
      // Add text before user
      if (userIndex > currentIndex) {
        parts.push({
          type: 'text',
          content: text.substring(currentIndex, userIndex),
        });
      }

      // Add user link
      parts.push({
        type: 'user',
        content: userPlaceholder,
        actor: actor,
      });

      currentIndex = userIndex + userPlaceholder.length;
    }
  });

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(currentIndex),
    });
  }

  return parts;
});

defineEmits<{
  (e: 'follow' | 'unfollow' | 'unblock'): void;
}>();
</script>

<template>
  <NuxtLink :to="props.linkTo">
    <div
      class="border-muted-foreground/20 hover:bg-muted-foreground/10 border-[0.5px] p-4 transition-colors hover:cursor-pointer"
      :class="{ 'bg-primary/10': !props.isSeen }"
    >
      <div class="flex items-start gap-4">
        <div v-if="icon" class="mt-1 flex-shrink-0">
          <Icon :name="icon.name" size="1.7rem" :class="icon.color" />
        </div>

        <div class="flex w-full flex-col gap-2">
          <div class="flex items-start justify-between">
            <!-- Avatar(s) -->
            <div class="flex-shrink-0">
              <div
                v-if="actors.length > 0"
                class="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-1"
              >
                <UserHoverCard
                  v-for="(actor, i) in displayActorsForAvatars"
                  :key="actor.username"
                  :username="actor.username"
                  @follow="$emit('follow')"
                  @unfollow="$emit('unfollow')"
                  @unblock="$emit('unblock')"
                >
                  <UiAvatar
                    :img="actor.avatarUrl"
                    :alt="actor.username"
                    size="sm"
                    :style="{
                      zIndex: displayActorsForAvatars.length - i,
                    }"
                  />
                </UserHoverCard>
              </div>
            </div>
            <span class="text-muted-foreground flex-shrink-0 text-sm">{{ relativeTimestamp }}</span>
          </div>

          <!-- Message -->
          <div>
            <p class="text-foreground line-clamp-5 leading-tight wrap-break-word">
              <template v-for="(part, index) in messageParts" :key="index">
                <span v-if="part.type === 'text'" v-html="part.content"></span>
                <UserHoverCard
                  v-else-if="part.type === 'user'"
                  :username="part.actor.username"
                  @follow="$emit('follow')"
                  @unfollow="$emit('unfollow')"
                  @unblock="$emit('unblock')"
                >
                  <NuxtLink
                    :to="`/profile/${part.actor.username}`"
                    class="font-semibold hover:underline"
                    @click.stop
                  >
                    {{ part.content }}
                  </NuxtLink>
                </UserHoverCard>
              </template>
            </p>
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
