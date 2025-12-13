<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useDebounceFn } from '@vueuse/core';

const config = useRuntimeConfig();
const API_KEY = config.public.tenorApiKey;

const searchQuery = ref('');
const isFocused = ref(false);

defineEmits<{
  (e: 'close'): void;
}>();

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

const selectedCategory = ref<Category | null>(null);
const currentQuery = ref('');
const debouncedQuery = ref('');
const scrollContainerRef = ref<HTMLElement | null>(null);

const debouncedSearch = useDebounceFn((query: string) => {
  debouncedQuery.value = query;
}, 500);

async function fetchGifs(query: string, pos?: string | null): Promise<TenorResponse> {
  const params: Record<string, string | number> = {
    key: API_KEY,
    q: query,
    limit: 21,
    media_filter: 'gif',
  };

  if (pos) {
    params.pos = pos;
  }

  const res = await $fetch<TenorResponse>('https://tenor.googleapis.com/v2/search', {
    method: 'GET',
    params,
  });

  return res;
}

// Infinite query setup
const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey: computed(() => ['gifs', debouncedQuery.value]),
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) => {
    if (!debouncedQuery.value) {
      return { results: [], next: '' };
    }
    return await fetchGifs(debouncedQuery.value, pageParam);
  },
  getNextPageParam: (lastPage) => {
    return lastPage.next && lastPage.next !== '' ? lastPage.next : undefined;
  },
  enabled: computed(() => !!debouncedQuery.value),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

const allGifs = computed(() => {
  if (!response.value?.pages) return [];
  return response.value.pages.flatMap((page) => page.results || []);
});

function openCategory(cat: Category) {
  selectedCategory.value = cat;
  currentQuery.value = cat.query;
  debouncedQuery.value = cat.query; // Set immediately for categories
  searchQuery.value = '';
}

function closeCategory() {
  selectedCategory.value = null;
  currentQuery.value = '';
  debouncedQuery.value = '';
  searchQuery.value = '';
}

// Trigger search
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    selectedCategory.value = null; // Clear category when searching
    currentQuery.value = newQuery.trim();
    debouncedSearch(newQuery.trim());
  } else if (!selectedCategory.value) {
    currentQuery.value = '';
    debouncedQuery.value = '';
  }
});

// Infinite scrolling
let scrollHandler: ((e: Event) => void) | null = null;
let isFetching = false;

watch(scrollContainerRef, (container) => {
  if (!container) return;
  if (scrollHandler) {
    container.removeEventListener('scroll', scrollHandler);
  }

  scrollHandler = () => {
    if (isFetching || isFetchingNextPage.value || !hasNextPage.value) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Trigger when near bottom
    if (distanceFromBottom < 200) {
      isFetching = true;

      fetchNextPage().finally(() => {
        setTimeout(() => {
          isFetching = false;
        }, 1000);
      });
    }
  };

  container.addEventListener('scroll', scrollHandler);
});

onUnmounted(() => {
  if (scrollContainerRef.value && scrollHandler) {
    scrollContainerRef.value.removeEventListener('scroll', scrollHandler);
  }
});
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
              @click="selectedCategory ? closeCategory() : $emit('close')"
            >
              <Icon v-if="!selectedCategory" name="lucide:x" size="1.1rem"></Icon>
              <Icon v-else name="lucide:arrow-left" size="1.1rem"></Icon>
            </button>
            <UiSearchBar v-model="searchQuery" v-model:is-focused="isFocused" class="flex-1" />
          </div>
        </UiDialogHeader>

        <!-- Categories -->
        <div class="w-full p-0">
          <div v-if="!selectedCategory && !searchQuery.trim()" class="grid grid-cols-2 gap-0">
            <div
              v-for="cat in categories"
              :key="cat.name"
              class="group cursor-pointer overflow-hidden border p-0 transition hover:bg-gray-100"
              @click="openCategory(cat)"
            >
              <div class="relative h-30 overflow-hidden bg-gray-100 sm:h-36 md:h-40">
                <img :src="cat.cover" class="block h-full w-full object-cover" />

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

          <!-- Results -->
          <div v-else-if="selectedCategory || searchQuery.trim()">
            <div ref="scrollContainerRef" class="max-h-[480px] overflow-y-auto px-1">
              <div class="grid grid-cols-3 gap-0">
                <div
                  v-for="gif in allGifs"
                  :key="gif.id"
                  class="overflow-hidden border bg-black/10 hover:cursor-pointer"
                >
                  <img
                    :src="gif.media_formats.gif.url"
                    :alt="gif.title"
                    class="block h-[140px] w-full object-cover"
                  />
                </div>
              </div>

              <!-- Loading indicator -->
              <div v-if="isFetchingNextPage" class="flex items-center justify-center py-4">
                <UiSpinner class="h-6 w-6" />
              </div>
            </div>

            <!-- Initial loading state -->
            <div
              v-if="isLoading && allGifs.length === 0"
              class="flex items-center justify-center py-10"
            >
              <UiSpinner class="h-10 w-10" />
            </div>
          </div>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
