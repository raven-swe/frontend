<script lang="ts" setup>
import { useField } from 'vee-validate';
import { ref } from 'vue';
// const props = defineProps<{ placeholder?: string }>();
const { value, errorMessage } = useField<string>(() => 'password');

const showPassword = ref(false);
const togglePassword = () => (showPassword.value = !showPassword.value);
</script>

<template>
  <div class="relative w-full">
    <UiFormFieldInput
      v-model="value"
      placeholder="Password"
      name="password"
      :type="showPassword ? 'text' : 'password'"
      :aria-invalid="!!errorMessage"
    />
    <UiButton
      type="button"
      class="text-muted-foreground absolute end-3 top-1/2 flex -translate-y-1/2"
      variant="ghost-default"
      size="icon-sm"
      @mousedown.prevent="togglePassword"
    >
      <Icon :name="showPassword ? 'line-md:watch-off' : 'line-md:watch'" size="20" />
    </UiButton>
  </div>
</template>
