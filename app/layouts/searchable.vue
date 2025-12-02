<script lang="ts" setup></script>

<template>
  <NuxtLayout name="default">
    <div
      class="bg-background/60 fixed top-0 z-50 flex inline-flex h-30 w-full max-w-[598px] cursor-pointer flex-col items-center gap-2 rounded-b-md py-1 text-sm font-medium backdrop-blur-sm"
    >
      <UiSearchField />
      <slot name="tabs" />
    </div>
    <slot />
  </NuxtLayout>
</template>
