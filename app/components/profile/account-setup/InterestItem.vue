<script lang="ts" setup>
const props = defineProps<{
  interest: string;
  isActive?: boolean;
}>();
const emit = defineEmits<{
  (e: 'toggleInterest'): void;
}>();
const handleClick = () => {
  emit('toggleInterest');
};
</script>

<template>
  <button
    type="button"
    :data-active="props.isActive ? 'true' : 'false'"
    class="border-border focus-visible:bg-foreground/10 focus-visible:ring-ring hover:bg-accent relative flex aspect-[4/3] cursor-pointer items-end justify-between rounded-2xl border-2 p-3 text-center text-lg font-bold transition-[box-shadow] outline-none select-none focus-visible:ring-[2px]"
    :class="{
      'border-primary bg-primary hover:bg-primary focus-visible:ring-primary focus-visible:bg-primary':
        props.isActive,
    }"
    data-cy="interest-item"
    @click="handleClick"
  >
    <p class="items-end justify-start" data-cy="intereset-item-name">
      {{ props.interest }}
    </p>
    <Icon
      v-if="props.isActive"
      size="24"
      name="lets-icons:check-fill"
      class="text-foreground absolute end-3 top-3"
      data-cy="interest-item-active-icon"
    />
  </button>
</template>
