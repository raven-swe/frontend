<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Popover from '@/components/ui/Popover.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
</script>

<!-- eslint-disable vue/no-bare-strings-in-template -->
<template>
  <div class="space-y-12 p-8">
    <div class="space-y-4">
      <h1 class="text-3xl font-bold">Popover Component Playground</h1>
      <p class="text-muted-foreground">
        Interactive examples of the Popover component with different configurations.
      </p>
    </div>

    <!-- Basic Popover -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Basic Popover</h2>
      <p class="text-muted-foreground text-sm">
        A simple popover that opens on click and closes when clicking outside.
      </p>

      <Popover client:only>
        <PopoverTrigger>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div class="space-y-2">
            <h4 class="leading-none font-medium">Basic Popover</h4>
            <p class="text-muted-foreground text-sm">
              This is a basic popover example. Click outside to close.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </section>
  </div>
</template>
