<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Title',
  },
});
const twitterBorderColor = 'border-white-200 dark:border-gray-700';
</script>
<template>
  <div
    class="dark:bg-dim-700 m-2 overflow-hidden rounded-2xl border bg-gray-50"
    :class="twitterBorderColor"
  >
    <h1
      class="border-b p-3 text-xl font-extrabold text-gray-900 dark:text-white"
      :class="twitterBorderColor"
    >
      {{ props.title }}
    </h1>
    <slot />

    <div class="dark:hover:bg-dim-300 cursor-pointer p-3 text-sm text-blue-400 hover:bg-gray-100">
      {{ $t('rightsidebar.showMore') }}
    </div>
  </div>
</template>
