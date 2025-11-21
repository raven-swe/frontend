<script lang="ts" setup>
const searchQuery = ref('');
</script>

<template>
  <div>
    <div
      class="border-muted-foreground relative m-4 flex items-center gap-1 rounded-full border px-4 py-3"
    >
      <Icon name="ic:outline-search" class="text-muted-foreground" />
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('dm.placeholder-search')"
        class="flex-1 border-none bg-transparent text-[15px] outline-none"
      />
    </div>
    <span> </span>
  </div>
</template>
