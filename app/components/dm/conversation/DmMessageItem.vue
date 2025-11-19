<script lang="ts" setup>
import type { DmMessage } from '#shared/types/dm';
import { renderSegments, formatTime } from '../../../utils/dm';

const props = defineProps<{ message: DmMessage }>();
const textColor = props.message.isMine ? 'text-white' : 'text-foreground';
</script>
<template>
  <div :class="message.isMine ? 'flex justify-end' : 'flex justify-start'">
    <div class="flex max-w-[68%] flex-col gap-1">
      <div
        class="w-fit rounded-3xl px-4 py-2 text-sm leading-relaxed break-words"
        :class="message.isMine ? 'bg-primary text-white' : 'bg-accent text-foreground'"
      >
        <template v-if="message.content">
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
        </template>
        <template v-if="message.mediaUrl">
          <div class="mt-2 overflow-hidden rounded-xl">
            <img
              :src="message.mediaUrl"
              :alt="$t('dm.attachedImage')"
              class="max-h-64 object-cover"
            />
          </div>
        </template>
      </div>
      <span
        class="text-muted-foreground ms-2 text-[11px]"
        :class="message.isMine ? 'text-muted-foreground' : ''"
        >{{ formatTime(message.createdAt) }}</span
      >
    </div>
  </div>
</template>
