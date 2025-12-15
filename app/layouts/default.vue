<script lang="ts" setup>
import useMyProfileQuery from '~/composables/useMyProfileQuery';

useMyProfileQuery();
</script>

<template>
  <div class="bg-background flex min-h-screen justify-center">
    <div class="bg-background flex min-h-screen w-full max-w-7xl justify-center">
      <!-- Left sidebar -->
      <div class="w-16.5 flex-shrink-0 duration-100 xl:w-70" data-cy="left-sidebar">
        <div class="top-0 sm:sticky">
          <SideBarLeft />
        </div>
      </div>

      <!-- Main content -->
      <main class="border-border max-w-150 flex-1 border-x" data-cy="main-content">
        <slot />
      </main>

      <!-- Right sidebar -->
      <div class="midd:w-96 hidden w-80 lg:block" data-cy="right-sidebar">
        <SideBarRight />
      </div>
    </div>
  </div>
</template>

<style>
html {
  overflow-y: scroll;
}
</style>
