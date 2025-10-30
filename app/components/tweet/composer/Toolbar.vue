<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

interface Emits {
  (e: 'post'): void;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});

defineEmits<Emits>();
</script>

<template>
  <div class="border-border ms-[60px] flex items-center justify-between border-t pt-1.5">
    <div class="flex gap-2">
      <UiButton
        variant="tweet-icon-blue"
        :title="$t('tweet.composer.media')"
        class="text-brand-blue"
        size="icon-md"
      >
        <Icon name="heroicons:photo" size="20" />
      </UiButton>
      <UiButton
        variant="tweet-icon-blue"
        :title="$t('tweet.composer.gif')"
        class="text-brand-blue"
        size="icon-md"
      >
        <Icon name="heroicons:gif-solid" size="20" />
      </UiButton>
      <UiButton
        variant="tweet-icon-blue"
        :title="$t('tweet.composer.emoji')"
        class="text-brand-blue"
        size="icon-md"
      >
        <Icon name="heroicons:face-smile" size="20" />
      </UiButton>
    </div>
    <UiButton size="md" :disabled="disabled" @click="$emit('post')">
      {{ $t('ui.post') }}
    </UiButton>
  </div>
</template>
