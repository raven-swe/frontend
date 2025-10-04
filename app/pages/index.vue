<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
</script>

<template>
  <div>
    <h1 class="text-2xl p-4">
      {{ $t('welcome') }}
    </h1>
    <Button>{{ $t('testButton') }}</Button>
  </div>
</template>
