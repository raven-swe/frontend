<script lang="ts" setup>
const props = defineProps<{
  isMuted: boolean;
  isBlocked: boolean;
  username: string;
}>();

const { mutate: muteUser } = useMuteMutation();
const { mutate: blockUser } = useBlockMutation();

const onBlock = () => {
  blockUser({ username: props.username, action: props.isBlocked ? 'unblock' : 'block' });
};
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <slot />
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="bg-background">
      <UiDropdownMenuItem
        v-if="!isBlocked"
        data-test="mute-button"
        @click="muteUser({ username: username, action: isMuted ? 'unmute' : 'mute' })"
      >
        <Icon :name="isMuted ? 'lucide:volume' : 'lucide:volume-off'" size="18" />
        {{ isMuted ? $t('ui.unmute') : $t('ui.mute') }}
      </UiDropdownMenuItem>
      <UiDropdownMenuItem data-test="block-button" @click="onBlock">
        <Icon name="lucide:ban" size="18" class="text-foreground" />
        {{ isBlocked ? $t('ui.unblock') : $t('ui.block') }}
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
