<script lang="ts" setup>
const emit = defineEmits<{ 'add-image': [] }>();
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
  </div>
</template>
