<script setup lang="ts">
interface Props {
  open: boolean;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'discard' | 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleDiscard = () => {
  emit('discard');
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
      <UiDialogHeader class="p-2">
        <UiDialogTitle>
          <h2 class="text-xl font-bold">{{ $t('profile.edit.discard-changes') }}</h2>
        </UiDialogTitle>
        <UiDialogDescription class="text-muted-foreground text-start text-sm">
          {{ $t('profile.edit.discard-changes-desc') }}
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="flex flex-col gap-2">
        <UiButton variant="destructive" class="w-full" size="lg" @click="handleDiscard">
          {{ $t('ui.discard') }}
        </UiButton>
        <UiButton variant="outline" class="w-full" size="lg" @click="handleCancel">
          {{ $t('ui.cancel') }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
