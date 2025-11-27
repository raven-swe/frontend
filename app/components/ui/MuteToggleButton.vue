<template>
  <UiButton
    v-if="relationship?.muted"
    variant="outline-destructive"
    class="bg-transparent"
    size="icon-sm"
    @click.prevent.stop="$emit('unmute')"
  >
    <Icon name="lucide:volume-off" />
  </UiButton>
  <UiButton
    v-else
    variant="outline-primary"
    class="bg-transparent"
    size="icon-sm"
    @click.prevent.stop="$emit('mute')"
  >
    <Icon name="lucide:volume" />
  </UiButton>
</template>

<script lang="ts" setup>
defineProps<{
  relationship: User['relationship'];
}>();

defineEmits<{
  (e: 'mute' | 'unmute'): void;
}>();
</script>
