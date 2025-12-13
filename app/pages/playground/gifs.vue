<script setup lang="ts">
import { ref } from 'vue';

const config = useRuntimeConfig();
const API_KEY = config.public.tenorApiKey;

const searchQuery = ref('');
const isFocused = ref(false);

interface Category {
  name: string;
  query: string;
  cover: string;
}

interface GifMediaFormat {
  url: string;
  dims: number[];
  size: number;
}

interface GifResult {
  id: string;
  title: string;
  media_formats: {
    gif: GifMediaFormat;
    tinygif: GifMediaFormat;
    nanogif: GifMediaFormat;
  };
}

interface TenorResponse {
  results: GifResult[];
  next: string;
}

// Fixed categories + fixed GIF cover images
const categories: Category[] = [
  {
    name: 'Eww',
    query: 'eww reaction',
    cover: 'https://media.tenor.com/oj4p9mRXeoIAAAAC/dol-huh.gif',
  },
  {
    name: 'Aww',
    query: 'cute aww',
    cover: 'https://media1.tenor.com/m/bT7aD_J__OoAAAAC/damiosanrus.gif',
  },
  {
    name: 'Annoyed',
    query: 'annoyed',
    cover: 'https://media1.tenor.com/m/02Hyp5H8rREAAAAd/kid-en-sacrement.gif',
  },
  {
    name: 'Happy',
    query: 'happy',
    cover: 'https://media.tenor.com/gotOLnyvy4YAAAAM/bubu-dancing-dance.gif',
  },
  {
    name: 'Angry',
    query: 'angry',
    cover: 'https://media.tenor.com/jexT0EwvhtAAAAAM/scoobert-mad-cat.gif',
  },
  {
    name: 'Applause',
    query: 'applause',
    cover: 'https://media.tenor.com/nnS2iivMglgAAAAM/very-good.gif',
  },
];

const selectedCategory = ref<string | null>(null);
const gifs = ref<GifResult[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchCategoryGifs(query: string) {
  loading.value = true;
  error.value = null;

  try {
    const res = await $fetch<TenorResponse>('https://tenor.googleapis.com/v2/search', {
      method: 'GET',
      params: {
        key: API_KEY,
        q: query,
        limit: 21,
        media_filter: 'gif',
      },
    });

    gifs.value = res.results || [];
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
  }

  loading.value = false;
}

function openCategory(cat: Category) {
  selectedCategory.value = cat.name;
  fetchCategoryGifs(cat.query);
}
</script>

<template>
  <div>
    <UiDialog :open="true">
      <UiDialogContent
        class="m-0 h-auto max-w-lg p-0"
        content-height="h-[600px]"
        content-padding="px-0"
        :hide-close-button="true"
      >
        <UiDialogHeader class="max-w-2xl ps-6 pe-6">
          <div class="flex items-center gap-3">
            <button
              class="hover:bg-muted-foreground/50 flex items-center justify-center rounded p-1 transition"
              @click="selectedCategory ? (selectedCategory = null) : $emit('close')"
            >
              <Icon v-if="!selectedCategory" name="lucide:x" size="1.1rem"></Icon>
              <Icon v-else name="lucide:arrow-left" size="1.1rem"></Icon>
            </button>
            <UiSearchBar v-model="searchQuery" v-model:is-focused="isFocused" class="flex-1" />
          </div>
        </UiDialogHeader>

        <div class="w-full p-0">
          <div v-if="!selectedCategory" class="grid grid-cols-2 gap-0">
            <div
              v-for="cat in categories"
              :key="cat.name"
              class="group cursor-pointer overflow-hidden border p-0 transition hover:bg-gray-100"
              @click="openCategory(cat)"
            >
              <div class="relative h-30 overflow-hidden bg-gray-100 sm:h-36 md:h-40">
                <img :src="cat.cover" class="block h-full w-full object-cover" />

                <!-- Category title overlaid on image -->
                <div class="absolute start-2 bottom-2 ps-2">
                  <h3
                    class="text-center text-xl font-bold text-white"
                    style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8)"
                  >
                    {{ cat.name }}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <!-- category result -->
          <div v-else>
            <UiSpinner v-if="loading" class="mx-auto my-10 h-10 w-10" />
            <div v-if="error" class="text-destructive">{{ error }}</div>

            <div
              v-if="!loading"
              class="grid max-h-[480px] grid-cols-2 gap-0 overflow-y-auto sm:grid-cols-3"
            >
              <div
                v-for="gif in gifs"
                :key="gif.id"
                class="overflow-hidden rounded border bg-black/10 hover:cursor-pointer"
              >
                <img :src="gif.media_formats.gif.url" class="block h-[100px] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
