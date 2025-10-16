<script setup lang="ts">
import Avatar from '@/components/ui/Avatar.vue';
</script>

<template>
  <div>
    <div class="p-4">
      <Avatar img="https://placehold.co/40x40" size="sm" />
    </div>
    <div class="p-4">
      <Avatar img="https://placehold.co/64x64" size="md" />
    </div>
    <div class="p-4">
      <Avatar img="https://placehold.co/96x96" size="lg" />
    </div>
    <div class="p-4">
      <Avatar img="https://placehold.co/368x368" size="xl" variant="secondary" />
    </div>
  </div>
</template>

<style scoped></style>
