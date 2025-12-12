<script lang="ts" setup>
defineProps<{
  relationship: User['relationship'];
}>();

defineEmits<{
  (e: 'follow' | 'unfollow'): void;
}>();
</script>

<template>
  <UiButton
    v-if="!relationship.following"
    size="xs"
    data-test="follow-button"
    data-cy="follow-button"
    @click.prevent.stop="$emit('follow')"
  >
    {{ relationship.follower ? $t('ui.follow-back') : $t('ui.follow') }}
  </UiButton>

  <UiButton
    v-else-if="relationship.following"
    variant="outline-destructive-hover"
    size="xs"
    data-test="unfollow-button"
    class="group grid-stack"
    data-cy="unfollow-button"
    @click.prevent.stop="$emit('unfollow')"
  >
    <span class="invisible group-hover:visible">
      {{ $t('ui.unfollow') }}
    </span>
    <span class="visible group-hover:invisible">
      {{ $t('ui.following') }}
    </span>
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
