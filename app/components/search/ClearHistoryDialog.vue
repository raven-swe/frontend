<script setup lang="ts">
interface Props {
  open: boolean;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'clear' | 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClear = () => {
  emit('clear');
  emit('update:open', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:open', false);
};

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
};
</script>

<template>
  <UiDialog :open="open" class="z-50" @update:open="handleOpenChange">
    <UiDialogContent class="!h-auto !w-[320px] !max-w-[320px] !p-0" :hide-close-button="true">
      <UiDialogHeader>
        <UiDialogTitle>
          <h2 class="text-xl font-bold">{{ $t('ui.search.clear-dialog.title') }}</h2>
        </UiDialogTitle>
        <UiDialogDescription class="text-muted-foreground text-start text-sm">
          {{ $t('ui.search.clear-dialog.description') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="mb-2 flex flex-col gap-3">
        <UiButton variant="destructive" class="w-full" size="lg" @click="handleClear">
          {{ $t('ui.clear') }}
        </UiButton>
        <UiButton variant="outline" class="w-full" size="lg" @click="handleCancel">
          {{ $t('ui.cancel') }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
