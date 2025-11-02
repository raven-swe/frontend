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
  <div
    :data-active="props.isActive ? 'true' : 'false'"
    class="border-border hover:bg-accent data-[active=true]:border-primary data-[active=true]:bg-primary relative flex aspect-[4/3] cursor-pointer items-end justify-between rounded-2xl border-2 p-3 text-center text-lg font-bold select-none"
    @click="handleClick"
  >
    <p class="items-end justify-start">
      {{ props.interest }}
    </p>
    <Icon
      v-if="props.isActive"
      size="24"
      name="lets-icons:check-fill"
      class="text-foreground absolute end-3 top-3"
    />
  </div>
</template>
