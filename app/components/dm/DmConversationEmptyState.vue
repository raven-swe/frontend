<script lang="ts" setup>
import Button from '../ui/Button.vue';
import DmNewMessageDialog from './DmNewMessageDialog.vue';

const showNewMessage = ref(false);
function openNewMessage() {
  showNewMessage.value = true;
}
</script>
<template>
  <div class="flex h-full items-center justify-center">
    <div class="flex max-w-sm flex-col items-start gap-4 p-8 text-center">
      <h2 class="text-3xl font-bold">{{ $t('dm.empty.select') }}</h2>
      <p class="text-muted-foreground text-sm">{{ $t('dm.empty.description') }}</p>
      <Button size="xl" variant="primary" @click="openNewMessage">{{ $t('dm.empty.new') }}</Button>
      <DmNewMessageDialog v-model:open="showNewMessage" />
    </div>
  </div>
</template>
