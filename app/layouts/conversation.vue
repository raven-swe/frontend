<script lang="ts" setup>
import useMyProfileQuery from '~/composables/useMyProfileQuery';
useMyProfileQuery();

const props = defineProps<{
  hideMiddleOnMobile?: boolean;
  hideRightOnMobile?: boolean;
}>();

// Compute responsive classes based on props
const middleClasses = computed(() => {
  if (props.hideMiddleOnMobile) {
    return 'hidden h-full w-[320px] flex-shrink-0 border lg:block xl:w-[390px] 2xl:w-[450px]';
  }
  return 'h-full lg:w-[320px] flex-1 border sm:w-[560px]  sm:flex-none xl:w-[390px] 2xl:w-[450px]';
});

const rightClasses = computed(() => {
  if (props.hideRightOnMobile) {
    return 'hidden h-full flex-1 border sm:w-[560px] sm:flex-none  lg:block';
  }
  return 'h-full flex-1 border sm:w-[560px] sm:flex-none ';
});
</script>

<template>
  <div>
    <div class="bg-background">
      <div class="flex h-screen justify-center overflow-hidden">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-16 md:w-24 xl:w-[266px] 2xl:w-[206px]">
            <div class="sticky top-0">
              <SideBarLeft />
            </div>
          </div>

          <!-- settings Section -->
          <div :class="middleClasses">
            <slot name="middle" />
          </div>

          <!-- Right sidebar -->
          <div :class="rightClasses">
            <slot name="right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
