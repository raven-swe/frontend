<script lang="ts" setup>
import { useField } from 'vee-validate';
import Input from '../Input.vue';
const props = defineProps<{ name: string; placeholder: string }>();
const { value, errorMessage } = useField<string | number>(() => props.name);
</script>

<template>
  <div :class="$attrs.class">
    <Input
      v-model="value"
      :placeholder="placeholder"
      :aria-invalid="!!errorMessage"
      v-bind="$attrs"
    />
    <p v-if="errorMessage" class="text-destructive ps-1 text-xs">{{ errorMessage }}</p>
  </div>
</template>
