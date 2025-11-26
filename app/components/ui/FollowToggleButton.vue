<script lang="ts" setup>
defineProps<{
  relationship: User['relationship'];
}>();

defineEmits<{
  (e: 'follow' | 'unfollow' | 'unblock'): void;
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
    v-else-if="!relationship.following"
    size="xs"
    data-test="follow-button"
    @click.prevent.stop="$emit('follow')"
  >
    {{ relationship.follower ? $t('ui.follow-back') : $t('ui.follow') }}
  </UiButton>

  <UiButton
    v-else-if="relationship.following"
    variant="outline-destructive"
    size="xs"
    data-test="unfollow-button"
    class="group grid-stack"
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
