<script setup lang="ts">
const props = defineProps<{
  avatarImg?: string;
}>();

defineEmits<{
  close: [];
}>();
</script>
<template>
  <div
    class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-dialog-backdrop fixed inset-0 z-999 flex items-center justify-center"
    @click.prevent.stop="$emit('close')"
  >
    <UiButton
      variant="ghost-default"
      size="icon-lg"
      class="bg-dialog-backdrop/10 fixed start-10 top-10"
      @click.prevent.stop="$emit('close')"
    >
      <Icon name="lucide:x" size="1.3rem" />
    </UiButton>
    <UiAvatar
      :img="props.avatarImg || 'https://cdn.raven.cmp27.space/default_avatar.png'"
      alt="Profile picture"
      size="2xl"
      variant="secondary"
      @click.prevent.stop
    />
  </div>
</template>
