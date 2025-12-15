<script lang="ts" setup>
definePageMeta({ layout: 'settings' });

type ThemeColor = {
  name: string;
  value: string;
};

const COLORS: ThemeColor[] = [
  { name: 'Blue', value: '#1d9bf0' },
  { name: 'Yellow', value: '#f3ca3a' },
  { name: 'Pink', value: '#f91880' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#2ec593' },
];

const { mode, toggleTheme, primary, setPrimary } = useTheme();

function applyPrimaryColor(color: string) {
  setPrimary(color);
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="flex bg-transparent lg:hidden"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">
          {{ $t('setting.display.title') }}
        </h1>
      </header>

      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.display.description') }}
      </p>
    </div>

    <!-- Content -->
    <div class="mt-3 flex flex-col gap-6">
      <!-- Color section -->
      <section class="border-b-2 px-4">
        <h2 class="text-foreground mb-3 text-xl font-semibold">
          {{ $t('setting.display.color') }}
        </h2>

        <div class="flex justify-between gap-4 rounded-xl p-4">
          <button
            v-for="color in COLORS"
            :key="color.value"
            class="relative h-12 w-12 rounded-full"
            :style="{ backgroundColor: color.value }"
            @click="applyPrimaryColor(color.value)"
          >
            <!-- Selected check -->
            <span
              v-if="primary === color.value"
              class="absolute inset-0 flex items-center justify-center"
            >
              <Icon name="lucide:check" size="1.9rem" class="text-foreground font-extrabold" />
            </span>
          </button>
        </div>
      </section>

      <!-- Background -->
      <section class="border-b-2 px-4">
        <h2 class="text-foreground mb-3 text-xl font-semibold">
          {{ $t('setting.display.background') }}
        </h2>

        <div class="grid grid-cols-2 gap-3 p-4">
          <!-- Default -->
          <button
            class="relative flex items-center justify-center gap-3 rounded-xl border bg-white p-4 font-medium text-black transition"
            :class="mode === 'light' ? 'border-primary ring-primary ring-1' : 'border-border'"
            @click="toggleTheme()"
          >
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full border-2 text-black"
              :class="mode === 'light' ? 'border-primary bg-primary' : 'border-muted-foreground'"
            >
              <Icon v-if="mode === 'light'" name="lucide:check" size="0.9rem" class="text-black" />
            </span>
            {{ $t('setting.display.default') }}
          </button>

          <!-- Lights out -->
          <button
            class="relative flex items-center justify-center gap-3 rounded-xl border bg-black p-4 font-medium text-white transition"
            :class="mode === 'dark' ? 'border-primary ring-primary ring-1' : 'border-border'"
            @click="toggleTheme()"
          >
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full border-2"
              :class="mode === 'dark' ? 'border-primary bg-primary' : 'border-muted-foreground'"
            >
              <Icon
                v-if="mode === 'dark'"
                name="lucide:check"
                size="2.9rem"
                class="font-extrabold text-white"
              />
            </span>
            {{ $t('setting.display.lights-out') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
