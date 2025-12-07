<script lang="ts" setup>
import type { ButtonVariants } from '@/components/ui/button/variants';

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
    variant: (isLocationSet ? 'primary' : 'outline') as ButtonVariants['variant'],
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
        <LogoRaven class="h-10 w-10" />
      </template>
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
      <UiDialogHeader class="px-8 py-4">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.setup.add-location')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.setup.location-desc') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="mx-2 mt-2 mb-auto p-4" data-cy="profile-setup-location-dialog">
        <uiInput
          v-model="location"
          type="text"
          placeholder="location"
          class="w-full max-w-md"
          maxlength="30"
          data-cy="profile-setup-location-input"
        />
      </div>
      <UiDialogFooter>
        <UiButton
          :variant="actionButton.variant"
          class="w-100"
          size="xl"
          data-cy="profile-setup-next-button"
          @click="handleSubmit"
        >
          {{ actionButton.text }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
