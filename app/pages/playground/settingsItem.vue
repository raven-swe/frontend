<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps<{
  title: string;
  subtitle?: string;
  to: string;
}>();
</script>
<template>
  <div
    class="hover:bg-foreground/10 flex cursor-pointer items-center justify-between px-4 py-[10px] transition-colors"
    @click="router.push(props.to)"
  >
    <div class="flex flex-col">
      <span class="text-lg leading-tight font-medium">{{ props.title }}</span>
      <span v-if="props.subtitle" class="text-md text-muted-foreground mt-[2px] leading-tight">
        {{ props.subtitle }}
      </span>
    </div>
    <Icon :name="$t('setting.item-icon')" size="1.2rem" class="text-muted-foreground" />
  </div>
</template>
