<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import Avatar from '~/components/ui/Avatar.vue';

const props = defineProps<{
  type: string;
  content: string | User;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const deleteFromHistory = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  emit('delete');
};
</script>

<template>
  <NuxtLink
    v-if="props.type === 'user'"
    :to="`/profile/${(props.content as User).username}`"
    class="hover:bg-accent flex items-center px-5 py-3 transition-colors"
  >
    <div class="flex w-full items-center justify-between ps-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <Avatar :img="(props.content as User).profileImage" alt="Profile Image" size="sm" />
        <div>
          <p class="font-bold">{{ (props.content as User).name }}</p>
          <p class="text-muted-foreground text-sm">
            {{ $t(`@${(props.content as User).username}`) }}
          </p>
        </div>
      </div>

      <UiButton
        variant="ghost-primary"
        class="text-primary mb-2 px-4 text-sm"
        @click.prevent.stop="deleteFromHistory"
      >
        <Icon name="lucide:x" size="20" />
      </UiButton>
    </div>
  </NuxtLink>

  <NuxtLink
    v-else
    :to="`/search/top?q=${encodeURIComponent(props.content as string)}`"
    class="hover:bg-accent flex items-center px-5 py-3 transition-colors"
  >
    <div class="flex w-full items-center justify-between gap-2 ps-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <Icon size="30" name="ic:outline-search" class="text-foreground flex-shrink-0" />
        <p class="text-foreground text-md overflow-hidden break-words">
          {{ props.type === 'hashtag' ? $t('#') + props.content : props.content }}
        </p>
      </div>
      <UiButton
        variant="ghost-primary"
        class="text-primary mb-2 flex-shrink-0 px-4 text-sm"
        @click.prevent.stop="deleteFromHistory"
      >
        <Icon name="lucide:x" size="20" />
      </UiButton>
    </div>
  </NuxtLink>
</template>
