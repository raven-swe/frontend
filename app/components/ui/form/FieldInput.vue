<script lang="ts" setup>
import { useField } from 'vee-validate';
const props = defineProps<{ name: string; placeholder: string }>();
const { value, errorMessage } = useField<string | number>(() => props.name);
</script>

<template>
  <div :class="$attrs.class">
    <UiInput
      v-model="value"
      :placeholder="placeholder"
      :aria-invalid="!!errorMessage"
      v-bind="$attrs"
    />
    <p v-if="errorMessage" class="text-destructive ps-1 text-xs">{{ errorMessage }}</p>
  </div>
</template>
