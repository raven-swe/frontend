<script setup lang="ts">
import { useOAuthComplete } from '~/composables/useOAuthComplete';

const props = defineProps<{ creationToken: string }>();
const birthDate = ref<string>('');
const { loading, error, result, submit } = useOAuthComplete();

function handleSubmit() {
  submit(props.creationToken, birthDate.value);
}
</script>

<template>
  <div>
    <label>
      {{ $t('testing.complete-form.birthdate-label') }}
      <input v-model="birthDate" type="date" />
    </label>
    <button :disabled="loading" @click="handleSubmit">
      {{ $t('testing.complete-form.confirm') }}
    </button>
    <div v-if="error" style="color: red">{{ error }}</div>
    <div v-if="result">
      <pre>{{ result.message }}</pre>
    </div>
  </div>
</template>
