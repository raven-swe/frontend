<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import Button from '@/components/ui/Button.vue';
const counter = useCounterStore();
</script>

<template>
  <div>
    <h1 class="p-4 text-2xl">
      {{ $t('welcome') + ` ${counter.count}` }}
    </h1>
    <Button @click="counter.increment">{{ $t('testButton') }}</Button>
  </div>
</template>
