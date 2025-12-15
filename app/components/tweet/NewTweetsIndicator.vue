<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { tweetKeys } from '~/constants/query-keys';

interface Props {
  avatars: string[]; // Array of avatar URLs
}

defineProps<Props>();

const emit = defineEmits<{
  click: [];
}>();

const queryClient = useQueryClient();

const handleClick = () => {
  queryClient.invalidateQueries({ queryKey: tweetKeys.timeline('following') });
  emit('click');
};

// Show max 3 avatars
const displayAvatars = computed(() => {
  return (avatars: string[]) => avatars.slice(0, 3);
});
</script>

<template>
  <button
    v-if="avatars.length > 0"
    class="bg-primary text-background dark:text-foreground hover:bg-primary/90 mx-auto flex w-fit cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-colors"
    data-testid="new-tweets-indicator"
    @click="handleClick"
  >
    <div class="flex -space-x-2">
      <UiAvatar
        v-for="(avatarUrl, index) in displayAvatars(avatars)"
        :key="index"
        :img="avatarUrl || '/default_profile.png'"
        size="xs"
        variant="secondary"
        class="ring-background ring-2"
      />
    </div>
    <span class="text-sm font-medium">{{ $t('home.new_tweets') }}</span>
  </button>
</template>
