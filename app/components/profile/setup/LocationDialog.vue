<script lang="ts" setup>
import type { buttonVariants } from '~~/shared/types/ui';

const props = defineProps<{
  open: boolean;
}>();

interface Emits {
  (e: 'submit', location: string | null): void;
  (e: 'update:open', value: boolean): void;
}
const emit = defineEmits<Emits>();
const userStore = useUserStore();

const location = ref(userStore.user?.location || '');
const actionButton = computed(() => {
  const isLocationSet = location.value.trim().length > 0;
  return {
    text: isLocationSet ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (isLocationSet ? 'primary' : 'outline') as buttonVariants,
  };
});

const handleSubmit = () => {
  emit('submit', location.value);
};

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
  if (!value) {
    // Reset on close
    location.value = '';
  }
};

watch(
  () => userStore.user.location,
  (newVal) => {
    if (!location.value.trim()) {
      location.value = newVal || '';
    }
  },
  { immediate: true },
);
</script>

<template>
  <UiDialog :open="props.open" @update:open="handleOpenChange">
    <UiDialogContent header-class="flex items-center justify-center p-0" class="h-auto">
      <template #header>
        <img src="https://placehold.co/32x32" class="size-8" />
      </template>
      <UiDialogHeader class="px-8 py-4">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.setup.add-location')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.setup.location-desc') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="mx-2 mt-2 mb-auto p-4">
        <uiInput
          v-model="location"
          type="text"
          placeholder="location"
          class="w-full max-w-md"
          maxlength="30"
        />
      </div>
      <UiDialogFooter>
        <UiButton :variant="actionButton.variant" class="w-100" size="xl" @click="handleSubmit">
          {{ actionButton.text }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
