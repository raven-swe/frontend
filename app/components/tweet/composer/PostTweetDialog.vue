<script setup lang="ts">
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';

const props = defineProps<{
  open?: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const onPostSuccess = () => {
  emit('update:open', false);
};

const localOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit('update:open', value),
});
</script>

<template>
  <UiDialog v-model:open="localOpen">
    <UiDialogContent class="h-auto max-w-lg p-0" content-height="h-auto max-h-[95vh]">
      <TweetComposer @post-success="onPostSuccess" />
    </UiDialogContent>
  </UiDialog>
</template>
