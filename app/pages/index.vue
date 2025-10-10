<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import Button from '@/components/ui/Button.vue';
const counter = useCounterStore();
</script>

<template>
  <div class="p-8">
    <h1 class="p-4 text-2xl">
      {{ $t('welcome') + ` ${counter.count}` }}
    </h1>
    <div class="flex flex-col gap-2">
      <Button class="w-75" variant="default" @click="counter.increment">{{
        $t('testButton')
      }}</Button>
      <Button class="w-75" variant="outline" @click="counter.increment">{{
        $t('testButton')
      }}</Button>
      <Button variant="ghost-default" class="w-75">
        {{ $t('testButton') }}
      </Button>
      <Button variant="ghost-primary" size="icon">
        <Icon name="majesticons:image-line" />
      </Button>
    </div>
  </div>
</template>
