<script setup lang="ts">
import { VisuallyHidden } from 'reka-ui';

const props = defineProps<{
  open: boolean;
}>();

interface Emits {
  (e: 'submit'): void;
}
const emit = defineEmits<Emits>();

const handleSubmit = () => {
  emit('submit');
};
</script>

<template>
  <div>
    <UiDialog :open="props.open">
      <UiDialogContent class="h-auto">
        <UiDialogTitle>
          <VisuallyHidden>{{ $t('profile.setup.confirmation-dialog') }}</VisuallyHidden>
        </UiDialogTitle>
        <UiDialogDescription aria-describedby="undefined" />
        <div class="m-auto flex flex-col items-center justify-center gap-6">
          <LogoRaven class="h-40 w-40" />
          <p class="text-2xl font-bold">{{ $t('profile.setup.click-to-save') }}</p>
          <UiButton class="w-65" size="xl" @click="handleSubmit">
            {{ $t('ui.save') }}
          </UiButton>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
