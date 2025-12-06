<script lang="ts" setup>
const props = defineProps<{
  interest: Interest;
  isActive: boolean;
}>();
defineEmits<{
  (e: 'toggle-interest'): void;
}>();

const translatedInterest = (interest: Interest) => {
  return $t(
    $te(`profile.account-setup.interests.${interest.code}`)
      ? `profile.account-setup.interests.${interest.code}`
      : interest.name,
  );
};
</script>

<template>
  <div class="p-4">
    <label class="group flex cursor-pointer flex-row items-center justify-between">
      <p class="text-md select-none">
        {{ translatedInterest(props.interest) }}
      </p>
      <div
        class="flex items-center justify-center rounded-full p-2 transition-colors duration-200"
        :class="{
          'group-hover:bg-primary/10': props.isActive,
          'group-hover:bg-foreground/5': !props.isActive,
        }"
      >
        <UiCheckbox
          :model-value="props.isActive"
          :label="$t(`profile.account-setup.interests.${props.interest.code}`)"
          @update:model-value="$emit('toggle-interest')"
        />
      </div>
    </label>
  </div>
</template>
