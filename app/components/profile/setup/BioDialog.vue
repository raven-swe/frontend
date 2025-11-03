<script lang="ts" setup>
import type { buttonVariants } from '~~/shared/types/ui';

const props = defineProps<{
  open: boolean;
}>();

interface Emits {
  (e: 'submit', bio: string | null): void;
  (e: 'update:open', value: boolean): void;
}
const emit = defineEmits<Emits>();
const userStore = useUserStore();

const bio = ref(userStore.user?.bio || '');
const actionButton = computed(() => {
  const isBioSet = bio.value.trim().length > 0;
  return {
    text: isBioSet ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (isBioSet ? 'primary' : 'outline') as buttonVariants,
  };
});

const handleSubmit = () => {
  emit('submit', bio.value);
};

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
  if (!value) {
    // Reset on close
    bio.value = '';
  }
};

watch(
  () => userStore.user.bio,
  (newVal) => {
    if (!bio.value.trim()) {
      bio.value = newVal || '';
    }
  },
  { immediate: true },
);
</script>

<template>
  <UiDialog :open="props.open" @update:open="handleOpenChange">
    <UiDialogContent header-class="flex items-center justify-center p-0" class="h-auto">
      <template #header>
        <LogoRaven class="h-32 w-32" />
      </template>
      <UiDialogHeader class="px-8 py-4">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.setup.enter-bio')
        }}</UiDialogTitle>
        <!--  -->
        <UiDialogDescription>
          {{ $t('profile.setup.bio-desc') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="mx-2 mt-2 mb-auto p-4">
        <uiInput
          v-model="bio"
          type="textarea"
          :rows="2"
          placeholder="Your bio"
          class="w-full max-w-md"
          maxlength="160"
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
