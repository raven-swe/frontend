<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import Button from '@/components/ui/Button.vue';
import { ref } from 'vue';
const counter = useCounterStore();
const isHovered = ref(false);
</script>

<template>
  <div>
    <div class="p-4">
      <!-- eslint-disable-next-line vue/no-bare-strings-in-template -->
      <h1 class="mb-4 text-2xl font-bold">Buttons Playground Page</h1>
    </div>
    <div class="p-8">
      <h1 class="p-4 text-2xl">
        {{ $t('testing.welcome') + ` ${counter.count}` }}
      </h1>
      <div class="flex flex-col gap-2">
        <Button class="w-75" variant="default" @click="counter.increment">{{
          $t('testing.test-button')
        }}</Button>
        <Button class="w-75" variant="outline" @click="counter.increment">{{
          $t('testing.test-button')
        }}</Button>
        <Button variant="ghost-primary" size="icon-sm">
          <Icon name="tabler:heart" />
        </Button>
        <Button variant="default" size="md" class="w-fit">
          {{ $t('testing.post') }}
        </Button>
        <Button variant="default" size="xs" class="w-fit">
          {{ $t('testing.follow') }}
        </Button>
        <Button
          variant="outline-destructive"
          size="xs"
          class="w-25"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          {{ isHovered ? $t('testing.unfollow') : $t('testing.following') }}
        </Button>
        <Button variant="primary" size="xl" class="w-58">
          {{ $t('testing.post') }}
        </Button>
        <Button variant="primary" size="md" class="w-fit">
          {{ $t('testing.subscribe') }}
        </Button>
        <Button variant="ghost-default" size="2xl" class="w-58">
          <div class="flex w-full items-center gap-3">
            <img src="https://placehold.co/20x20" class="size-10 rounded-full" alt="" />
            <div class="flex flex-col">
              <div class="text-start text-sm font-medium">{{ $t('testing.user.name') }}</div>
              <div class="text-muted-foreground text-start text-xs">
                {{ '@' + $t('testing.user.username') }}
              </div>
            </div>
            <Icon name="tabler:dots" class="ms-auto size-4" />
          </div>
        </Button>
      </div>
    </div>
  </div>
</template>
