<script setup lang="ts"></script>

<template>
  <div class="tabs border-border flex w-full border-b">
    <slot />
  </div>
</template>

<style scoped>
.tabs > * {
  flex: 1;
  min-width: 0;
}
</style>
