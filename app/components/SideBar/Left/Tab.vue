<script lang="ts" setup>
const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
const textStyle = computed(() => (props.active ? 'font-bold' : 'font-normal'));
</script>
<template>
  <NuxtLink
    to="#"
    class="dark:hover:bg-dim-200 flex w-min items-center justify-start rounded-full p-3 text-black hover:bg-gray-200 dark:text-white"
  >
    <div class="text-dark">
      <slot name="icon" />
    </div>

    <div class="ms-3 hidden text-xl xl:block" :class="textStyle">
      <slot name="lable" />
    </div>
  </NuxtLink>
</template>
