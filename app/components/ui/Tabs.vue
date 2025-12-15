<template>
  <div
    class="tabs scrollbar-hide border-border flex w-full gap-2 overflow-x-auto border-b"
    aria-role="tablist"
  >
    <slot />
  </div>
</template>

<style scoped>
.tabs > * {
  flex: 1 1 0;
  min-width: max-content;
}
/* Hide scrollbar (cross-browser) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
