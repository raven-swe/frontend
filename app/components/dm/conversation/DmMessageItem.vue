<script lang="ts" setup>
import type { DmMessage } from '#shared/types/dm';
import { renderSegments, formatTime } from '../../../utils/dm';

const props = defineProps<{
  message: DmMessage;
  isSeen?: boolean;
}>();

const textColor = props.message.isMine ? 'text-white' : 'text-foreground';
</script>
<template>
  <div :class="message.isMine ? 'flex justify-end' : 'flex justify-start'">
    <div
      class="flex max-w-[68%] flex-col gap-1"
      :class="message.isMine ? 'items-end' : 'items-start'"
    >
      <template v-if="message.mediaUrl">
        <div class="overflow-hidden rounded-xl">
          <NuxtImg
            :src="message.mediaUrl"
            :alt="$t('dm.attachedImage')"
            class="max-h-64 object-cover"
            loading="eager"
          />
        </div>
      </template>
      <template v-if="message.content">
        <div
          class="rounded-3xl px-4 py-2 text-sm leading-relaxed break-all whitespace-pre-wrap"
          :class="message.isMine ? 'bg-primary text-white' : 'bg-accent text-foreground'"
        >
          <template v-for="(segment, idx) in renderSegments(message)" :key="idx">
            <span
              v-if="segment.type === 'mention'"
              :class="['cursor-pointer font-medium hover:underline', textColor]"
              :data-user="segment.value"
              >{{ segment.value }}</span
            >
            <span
              v-else-if="segment.type === 'hashtag'"
              :class="['cursor-pointer font-medium hover:underline', textColor]"
              >#{{ segment.value }}</span
            >
            <span v-else>{{ segment.value }}</span>
          </template>
        </div>
      </template>
      <span class="text-muted-foreground text-[11px]" :class="message.isMine ? 'self-end' : ''">
        {{ formatTime(message.createdAt) }}
        <span v-if="isSeen && message.isMine" class="text-primary ms-1">· {{ $t('dm.seen') }}</span>
      </span>
    </div>
  </div>
</template>
