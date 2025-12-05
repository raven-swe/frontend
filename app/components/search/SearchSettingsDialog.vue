<script setup lang="ts">
import { VisuallyHidden } from 'reka-ui';
import { storeToRefs } from 'pinia';
import { useSearchStore } from '~/stores/search';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

const searchStore = useSearchStore();
const { removeBlocked } = storeToRefs(searchStore);

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
};

const handleCheckboxChange = (value: boolean | 'indeterminate') => {
  if (typeof value === 'boolean') {
    searchStore.setRemoveBlocked(value);
  }
};
</script>

<template>
  <UiDialog :open="props.open" @update:open="handleOpenChange">
    <UiDialogContent class="h-auto">
      <!-- Close Button -->
      <template #dialog-close>
        <Button
          variant="ghost-default"
          size="icon-xs"
          class="absolute inset-2"
          @click="handleOpenChange(false)"
        >
          <Icon name="lucide:x" class="size-5" />
          <span class="sr-only">{{ $t('ui.close') }}</span>
        </Button>
      </template>

      <template #header>
        <h1 class="ms-8">{{ $t('search.settings.title') }}</h1>
      </template>

      <UiDialogTitle>
        <VisuallyHidden />
      </UiDialogTitle>

      <div class="mt-3 flex items-center justify-between">
        <Label class="cursor-pointer" for="remove-blocked">
          {{ $t('search.settings.remove-block') }}
        </Label>

        <UiCheckbox
          id="remove-blocked"
          :checked="removeBlocked"
          @update:checked="handleCheckboxChange"
        />
      </div>

      <p class="text-muted-foreground mt-1 text-xs">
        {{ $t('search.settings.remove-block-desc') }}
      </p>
    </UiDialogContent>
  </UiDialog>
</template>
