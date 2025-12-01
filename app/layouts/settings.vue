<script lang="ts" setup>
import useMyProfileQuery from '~/composables/useMyProfileQuery';

useMyProfileQuery();
</script>

<template>
  <div>
    <div class="bg-background">
      <div class="flex min-h-screen justify-center">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-16 md:w-24 xl:w-[306px]">
            <div class="sticky top-0">
              <SideBarLeft />
            </div>
          </div>

          <!-- settings Section -->
          <div
            class="hidden h-full w-[320px] flex-shrink-0 border lg:block xl:w-[390px] 2xl:w-[450px]"
          >
            <slot name="middle" />
          </div>

          <!-- Right sidebar -->
          <div class="h-full flex-1 border sm:w-[560px] sm:flex-none md:w-[600px]">
            <slot name="right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
