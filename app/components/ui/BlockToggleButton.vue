<script lang="ts" setup>
defineProps<{
  relationship: User['relationship'];
}>();

defineEmits<{
  (e: 'block' | 'unblock'): void;
}>();
</script>

<template>
  <UiButton
    v-if="relationship.blocking"
    variant="destructive"
    size="xs"
    data-test="unblock-button"
    class="group grid-stack"
    @click.prevent.stop="$emit('unblock')"
  >
    <span class="invisible group-hover:visible">
      {{ $t('ui.unblock') }}
    </span>
    <span class="visible group-hover:invisible">
      {{ $t('ui.blocking') }}
    </span>
  </UiButton>

  <UiButton
    v-else-if="!relationship.blocking"
    variant="outline-destructive"
    size="xs"
    data-test="block-button"
    @click.prevent.stop="$emit('block')"
  >
    {{ $t('ui.block') }}
  </UiButton>
</template>

<style scoped>
.grid-stack {
  display: grid;
}

.grid-stack > span {
  grid-area: 1 / 1;
}
</style>
