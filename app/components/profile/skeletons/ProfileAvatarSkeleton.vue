<script setup lang="ts">
const { isCurrentUser } = useIsCurrentUser();
</script>

<template>
  <div class="mx-4 flex flex-wrap items-center justify-between gap-4">
    <div>
      <div
        class="border-background bg-muted-foreground/50 z-20 -mt-16 size-34 animate-pulse rounded-full border-4"
      />
    </div>
    <div v-if="isCurrentUser" class="bg-muted-foreground/50 h-9 w-28 animate-pulse rounded-md" />
  </div>
</template>
