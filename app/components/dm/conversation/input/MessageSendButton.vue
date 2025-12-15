<script lang="ts" setup>
const { disabled } = defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ (e: 'send'): void }>();
</script>
<template>
  <button
    type="button"
    class="text-primary grid size-8 place-items-center rounded-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="disabled"
    data-cy="dm-message-send-button"
    @click="emit('send')"
  >
    <Icon name="ic:outline-send" size="20" />
  </button>
</template>
