<script lang="ts" setup>
defineEmits<{
  (e: 'mute' | 'unmute' | 'block' | 'unblock'): void;
}>();

defineProps<{
  isMuted: boolean;
  isBlocked: boolean;
}>();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <slot />
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="bg-background">
      <UiDropdownMenuItem data-test="mute-button" @click="$emit(isMuted ? 'unmute' : 'mute')">
        <Icon :name="isMuted ? 'lucide:volume' : 'lucide:volume-off'" size="18" />
        {{ isMuted ? $t('ui.unmute') : $t('ui.mute') }}
      </UiDropdownMenuItem>
      <UiDropdownMenuItem data-test="block-button" @click="$emit(isBlocked ? 'unblock' : 'block')">
        <Icon name="lucide:ban" size="18" class="text-foreground" />
        {{ isBlocked ? $t('ui.unblock') : $t('ui.block') }}
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
