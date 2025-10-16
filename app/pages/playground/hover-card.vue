<script setup lang="ts">
import { HoverCard, HoverCardTrigger, HoverCardContent } from '~/components/ui/hover-card';
import Avatar from '@/components/ui/Avatar.vue';
import { ref } from 'vue';
import Button from '@/components/ui/Button.vue';
const isHovered = ref(false);
const isFollowing = ref(false);
</script>

<template>
  <div class="mx-auto flex h-screen items-center justify-center">
    <HoverCard>
      <HoverCardTrigger>
        <NuxtLink to="users/john-doe">
          <Avatar
            img="https://pbs.twimg.com/profile_images/1833445381986045952/jwoHkIIq_400x400.jpg"
            size="sm"
          />
        </NuxtLink>
      </HoverCardTrigger>
      <HoverCardContent>
        <div class="flex flex-col gap-[7px] p-1">
          <div class="flex justify-between">
            <NuxtLink to="users/john-doe">
              <Avatar
                img="https://pbs.twimg.com/profile_images/1833445381986045952/jwoHkIIq_400x400.jpg"
                size="md"
              />
            </NuxtLink>
            <div class="ms-auto">
              <Button
                v-if="isFollowing"
                variant="outline-destructive"
                size="xs"
                class="w-25"
                @mouseenter="isHovered = true"
                @mouseleave="isHovered = false"
                @click="isFollowing = !isFollowing"
              >
                {{ isHovered ? $t('testing.unfollow') : $t('testing.following') }}
              </Button>
              <Button
                v-if="!isFollowing"
                variant="default"
                size="xs"
                class="w-25"
                @mouseenter="isHovered = true"
                @mouseleave="isHovered = false"
                @click="isFollowing = !isFollowing"
              >
                {{ $t('testing.follow') }}
              </Button>
            </div>
          </div>
          <div class="flex flex-col gap-[15px]">
            <div>
              <div class="text-mauve12 m-0 text-sm leading-[1.5] font-medium">
                {{ $t('testing.user.name') }}
              </div>
              <div class="text-mauve10 m-0 text-sm leading-[1.5]">
                {{ '@' + $t('testing.user.username') }}
              </div>
            </div>
            <div class="text-mauve12 m-0 text-sm leading-[1.5]">
              {{ $t('testing.user.bio') }}
            </div>
            <div class="flex gap-[15px]">
              <div class="flex gap-[5px]">
                <div class="text-mauve12 m-0 text-sm leading-[1.5] font-medium">
                  {{ $t('testing.user.num-following') }}
                </div>
                <div class="text-mauve10 m-0 text-sm leading-[1.5]">
                  {{ 'Following' }}
                </div>
              </div>
              <div class="flex gap-[5px]">
                <div class="text-mauve12 m-0 text-sm leading-[1.5] font-medium">
                  {{ $t('testing.user.num-followers') }}
                </div>
                <div class="text-mauve10 m-0 text-sm leading-[1.5]">
                  {{ 'Followers' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
</template>

<style scoped></style>
