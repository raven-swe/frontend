<script lang="ts" setup>
import { useField } from 'vee-validate';
import { ref } from 'vue';

const props = defineProps<{ name: string; placeholder: string }>();

const { value, errorMessage } = useField<string>(() => props.name);

const showPassword = ref(false);
const togglePassword = () => (showPassword.value = !showPassword.value);
</script>

<template>
  <div class="w-full">
    <div class="relative">
      <UiFormFieldInput
        v-model="value"
        :name="props.name"
        :placeholder="props.placeholder ?? $t('root.auth.password')"
        :type="showPassword ? 'text' : 'password'"
        :aria-invalid="!!errorMessage"
      />

      <UiButton
        type="button"
        class="text-muted-foreground absolute end-3 top-3 flex"
        variant="ghost-default"
        size="icon-sm"
        @mousedown.prevent="togglePassword"
      >
        <Icon :name="showPassword ? 'line-md:watch-off' : 'line-md:watch'" size="20" />
      </UiButton>
    </div>

    <p v-if="errorMessage" class="text-destructive mt-1 ps-1 text-xs">
      {{ errorMessage }}
    </p>
  </div>
</template>
