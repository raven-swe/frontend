<script setup lang="ts">
const { data } = useFetch('/api/user/ravenbot');
</script>

<template>
  <div>
    <h1 class="p-4 text-2xl">
      {{ $t('testing.welcome') }}
    </h1>
    <div v-if="data" class="px-4">
      <h1 class="text-lg font-semibold">{{ data.name }}</h1>
      <p class="text-muted-foreground text-sm">{{ '@' + data.username }}</p>
    </div>
  </div>
</template>
