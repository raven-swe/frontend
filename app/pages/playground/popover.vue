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

    <!-- Popover that opens above, below, left, right click-->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Popover Positioning</h2>
      <p class="text-muted-foreground text-sm">
        Popovers can be positioned relative to their trigger element.
      </p>

      <div class="flex flex-wrap items-center gap-12">
        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">Top</Button>
          </PopoverTrigger>
          <PopoverContent side="top">
            <p class="text-sm">Popover positioned above</p>
          </PopoverContent>
        </Popover>

        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">Bottom</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom">
            <p class="text-sm">Popover positioned below</p>
          </PopoverContent>
        </Popover>

        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">Right</Button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <p class="text-sm">Popover positioned right</p>
          </PopoverContent>
        </Popover>

        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">Left</Button>
          </PopoverTrigger>
          <PopoverContent side="left">
            <p class="text-sm">Popover positioned left</p>
          </PopoverContent>
        </Popover>
      </div>
    </section>

    <!-- Popover aligned start center end -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Popover Alignment</h2>
      <p class="text-muted-foreground text-sm">
        Popovers can be aligned to the start, center, or end of the trigger element.
      </p>

      <div class="flex flex-wrap items-center gap-30">
        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">Start</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <p class="text-sm">Aligned to start</p>
          </PopoverContent>
        </Popover>

        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">Center</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center">
            <p class="text-sm">Aligned to center</p>
          </PopoverContent>
        </Popover>

        <Popover client:only>
          <PopoverTrigger>
            <Button variant="outline">End</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <p class="text-sm">Aligned to end</p>
          </PopoverContent>
        </Popover>
      </div>
    </section>

    <!-- Hover Popover -->
    <section class="space-y-4">
      <!-- Try to make the popover triggered by hover events too -->
    </section>
  </div>
</template>
