<script setup lang="ts">
import { VisuallyHidden } from 'reka-ui';

const props = defineProps<{
  open: boolean;
}>();

interface Emits {
  (e: 'submit'): void;
  (e: 'update:open', value: boolean): void;
}
const emit = defineEmits<Emits>();

const handleSubmit = () => {
  emit('submit');
};

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
};
</script>

<template>
  <div>
    <UiDialog :open="props.open" @update:open="handleOpenChange">
      <UiDialogContent class="h-auto">
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
        <UiDialogTitle>
          <VisuallyHidden>{{ $t('profile.setup.confirmation-dialog') }}</VisuallyHidden>
        </UiDialogTitle>
        <UiDialogDescription aria-describedby="undefined" />
        <div
          class="m-auto flex flex-col items-center justify-center gap-6"
          data-cy="profile-setup-confirm-dialog"
        >
          <LogoRaven class="h-40 w-40" />
          <p class="text-2xl font-bold">{{ $t('profile.setup.click-to-save') }}</p>
          <UiButton
            class="w-65"
            size="xl"
            data-cy="profile-setup-save-button"
            @click="handleSubmit"
          >
            {{ $t('ui.save') }}
          </UiButton>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
