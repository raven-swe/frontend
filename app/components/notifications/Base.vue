<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';
import { relativeTime } from '@/utils/time';

const props = defineProps<{
  message: string;
  timestamp: string;
  icon?: { name: string; color?: string };
  actor: ActorSummary;
  linkTo: string;
  isSeen?: boolean;
}>();

const relativeTimestamp = computed(() => relativeTime(props.timestamp));

// Don't forget to listen to these events somewhere
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
            <div class="flex-shrink-0">
              <UserHoverCard
                :username="actor.username"
                @follow="$emit('follow')"
                @unfollow="$emit('unfollow')"
                @unblock="$emit('unblock')"
              >
                <img
                  :src="actor.avatarUrl"
                  :alt="actor.username"
                  class="h-10 w-10 rounded-full object-cover"
                />
              </UserHoverCard>
            </div>
            <span class="text-muted-foreground flex-shrink-0 text-sm">{{ relativeTimestamp }}</span>
          </div>

          <!-- username + message + tweet content -->
          <div>
            <p class="text-foreground leading-tight">
              <UserHoverCard
                :username="actor.username"
                @follow="$emit('follow')"
                @unfollow="$emit('unfollow')"
              >
                <span class="text-foreground font-semibold">{{ actor.username }}</span>
              </UserHoverCard>
              <span class="text-foreground ms-1">{{ message }}</span>
            </p>
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
