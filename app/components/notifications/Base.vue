<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';

const props = defineProps<{
  message: string;
  timestamp: string;
  icon?: { name: string; color?: string };
  actor: ActorSummary;
  linkTo: string;
  isSeen?: boolean;
}>();
</script>

<template>
  <NuxtLink :to="props.linkTo">
    <div
      class="border-muted-foreground/20 hover:bg-muted-foreground/10 border-[0.5px] p-4 transition-colors hover:cursor-pointer"
      :class="{ 'bg-primary/10': !props.isSeen }"
    >
      <div class="flex items-start gap-3">
        <div v-if="icon" class="mt-1 flex-shrink-0">
          <Icon :name="icon.name" size="1.7rem" :class="icon.color" />
        </div>

        <div class="flex w-full flex-col gap-2">
          <div class="flex items-start justify-between">
            <div class="flex-shrink-0">
              <img
                :src="actor.avatarUrl"
                :alt="actor.username"
                class="h-10 w-10 rounded-full object-cover"
              />
            </div>
            <span class="text-muted-foreground flex-shrink-0 text-sm">{{ timestamp }}</span>
          </div>

          <!-- username + message + tweet content -->
          <div>
            <p class="text-foreground leading-tight">
              <span class="text-foreground font-semibold">{{ actor.username }}</span>
              <span class="text-foreground ms-2">{{ message }}</span>
            </p>
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
