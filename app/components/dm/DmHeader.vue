<script lang="ts" setup>
import DmNewMessageDialog from './DmNewMessageDialog.vue';

const showNewMessage = ref(false);
function openNewMessage() {
  showNewMessage.value = true;
}
</script>
<template>
  <div class="bg-background flex items-center justify-between p-4">
    <h1 class="text-xl font-bold">{{ $t('dm.header-title') }}</h1>
    <UiButton
      variant="outline"
      class="flex space-x-4"
      data-cy="new-dm-button"
      @click="openNewMessage"
    >
      <Icon name="ic:twotone-attach-email" size="20" />
    </UiButton>
    <DmNewMessageDialog v-model:open="showNewMessage" />
  </div>
</template>
