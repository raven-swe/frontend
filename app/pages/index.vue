<script setup lang="ts">
import Button from '~/components/ui/Button.vue';
const counter = useCounterStore();

const { data, error } = useFetch('/api/user/ravenbot');
</script>

<template>
  <div>
    <h1 class="p-4 text-2xl">
      {{ $t('welcome') + ` ${counter.count}` }}
    </h1>
    <Button @click="counter.increment">{{ $t('testButton') }}</Button>
    <p v-if="data">
      {{ data }}
    </p>
    <p v-if="error">
      {{ error.data.message }}
    </p>
  </div>
</template>
