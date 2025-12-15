<script lang="ts" setup>
import useMyProfileQuery from '~/composables/useMyProfileQuery';

useMyProfileQuery();
</script>

<template>
  <!-- Main content -->
  <div>
    <slot />
  </div>
</template>
