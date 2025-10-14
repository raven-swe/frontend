<script setup lang="ts">
import Input from '~/components/ui/Input.vue';
</script>

<template>
  <div class="p-8">
    <!-- eslint-disable-next-line vue/no-bare-strings-in-template -->
    <h1 class="p-4 text-2xl">Input Playground</h1>
    <Input class="mb-4 w-64" placeholder="Name" />
    <Input class="w-64" placeholder="Email or Username" />
  </div>
</template>
