<script lang="ts" setup>
import Button from '../ui/Button.vue';
</script>
<template>
  <div class="flex h-full items-center justify-center">
    <div class="flex max-w-sm flex-col items-start gap-4 p-8 text-center">
      <h2 class="text-3xl font-bold">{{ $t('dm.empty.select') }}</h2>
      <p class="text-muted-foreground text-sm">{{ $t('dm.empty.description') }}</p>
      <Button size="xl" variant="primary">{{ $t('dm.empty.new') }}</Button>
    </div>
  </div>
</template>
