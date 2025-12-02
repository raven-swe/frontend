<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
const isFocused = ref(false);
</script>

<template>
  <div class="mx-auto w-full px-4 pt-4">
    <UiSearchBar v-model="searchQuery" v-model:is-focused="isFocused" />
    <UiSearchList v-if="isFocused">
      <template v-if="searchQuery.length > 0" #default>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
        <div class="text-muted-foreground p-4 text-sm">
          {{ searchQuery }}
        </div>
      </template>
    </UiSearchList>
  </div>
</template>
