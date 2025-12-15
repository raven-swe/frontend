<script lang="ts" setup>
import useMyProfileQuery from '~/composables/useMyProfileQuery';
useMyProfileQuery();

defineProps<{
  hideMiddleOnMobile?: boolean;
  hideRightOnMobile?: boolean;
}>();
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
      <div
        class="midd:!w-96 h-screen w-150 border-x lg:block lg:w-80"
        :class="{
          hidden: hideMiddleOnMobile,
        }"
      >
        <slot name="middle" />
      </div>

      <div
        class="h-screen w-150 border-x lg:block"
        :class="{
          hidden: hideRightOnMobile,
        }"
      >
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style>
html {
  overflow-y: scroll;
}
</style>
