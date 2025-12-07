<script lang="ts" setup>
import type { DmMessage } from '#shared/types/dm';
import DmMessageItem from './DmMessageItem.vue';
const { messages } = defineProps<{ messages: DmMessage[] }>();
</script>
<template>
  <div class="flex flex-col-reverse gap-2 p-3">
    <DmMessageItem v-for="message in messages" :key="message.id" :message="message" />
  </div>
</template>
