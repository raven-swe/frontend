<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Input from '~/components/ui/Input.vue';
import Button from '~/components/ui/Button.vue';

const router = useRouter();
const username = ref('Abdallahfarag45');

const suggestions = ref(['Abdallahfahewr', 'Abdallahfawe', 'Abdallahfaklh']);
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <div class="mb-4 flex items-center gap-4 p-4">
      <Icon
        :name="$t('setting.back-button-icon')"
        size="1.5rem"
        class="cursor-pointer"
        to="/playground/settings"
        @click="router.push('/playground/settings')"
      />
      <h1 class="text-2xl font-bold">{{ $t('setting.change-username') }}</h1>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col">
      <!-- Input Section -->
      <div class="border-border border-b px-4 pb-8">
        <Input v-model="username" :placeholder="$t('setting.username')" />
      </div>

      <!-- Suggestions Section -->
      <div class="border-border border-b px-4 py-8">
        <h2 class="mb-4 text-2xl font-bold">{{ $t('setting.suggestions') }}</h2>
        <div class="flex flex-col gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="text-primary cursor-pointer text-start hover:underline"
            @click="username = suggestion"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Save Button Section -->
      <div class="flex justify-end px-4 py-8">
        <Button class="bg-primary hover:bg-primary/90 rounded-full px-6 py-2 font-bold text-white">
          {{ $t('setting.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>
