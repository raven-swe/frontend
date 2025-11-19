<script lang="ts" setup>
const emit = defineEmits<{ 'add-image': []; 'add-gif': []; 'add-emoji': [] }>();
</script>
<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      class="text-primary transition-opacity hover:opacity-80"
      @click="emit('add-image')"
    >
      <Icon name="ic:outline-add-photo-alternate" size="20" />
    </button>
    <button
      type="button"
      class="text-primary transition-opacity hover:opacity-80"
      @click="emit('add-gif')"
    >
      <Icon name="ic:outline-gif-box" size="20" />
    </button>
    <button
      type="button"
      class="text-primary transition-opacity hover:opacity-80"
      @click="emit('add-emoji')"
    >
      <Icon name="ic:baseline-insert-emoticon" size="20" />
    </button>
  </div>
</template>
