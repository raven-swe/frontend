<script setup lang="ts">
import { VisuallyHidden, Label } from 'reka-ui';
import { ref, watch } from 'vue';
import { useSearchStore } from '~/stores/search';
import { useQueryClient } from '@tanstack/vue-query';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

const searchStore = useSearchStore();
const localExcludeMutedAndBlocked = ref(searchStore.excludeMutedAndBlocked);
const queryClient = useQueryClient();

// Sync local value with store when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      localExcludeMutedAndBlocked.value = searchStore.excludeMutedAndBlocked;
    }
  },
);

const handleOpenChange = (value: boolean) => {
  if (!value) {
    // Only update store and invalidate when closing if value changed
    if (localExcludeMutedAndBlocked.value !== searchStore.excludeMutedAndBlocked) {
      searchStore.excludeMutedAndBlocked = localExcludeMutedAndBlocked.value;
      queryClient.invalidateQueries({ queryKey: ['search'] });
    }
  }
  emit('update:open', value);
};
</script>

<template>
  <UiDialog :open="props.open" @update:open="handleOpenChange">
    <UiDialogContent class="h-auto">
      <!-- Close Button -->
      <template #dialog-close>
        <UiButton
          variant="ghost-default"
          size="icon-xs"
          class="absolute inset-2"
          @click="handleOpenChange(false)"
        >
          <Icon name="lucide:x" class="size-5" />
          <span class="sr-only">{{ $t('ui.close') }}</span>
        </UiButton>
      </template>

      <template #header>
        <h1 class="ms-8">{{ $t('search.settings.title') }}</h1>
      </template>

      <UiDialogTitle>
        <VisuallyHidden />
      </UiDialogTitle>

      <UiDialogDescription>
        <VisuallyHidden />
      </UiDialogDescription>

      <div class="mt-3 flex items-center justify-between">
        <Label class="cursor-pointer" for="remove-blocked">
          {{ $t('search.settings.remove-block') }}
        </Label>

        <UiCheckbox id="remove-blocked" v-model="localExcludeMutedAndBlocked" />
      </div>

      <p class="text-muted-foreground mt-1 text-xs">
        {{ $t('search.settings.remove-block-desc') }}
      </p>
    </UiDialogContent>
  </UiDialog>
</template>
