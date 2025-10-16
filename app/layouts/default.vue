<script lang="ts" setup></script>

<template>
  <div>
    <div class="dark:bg-dim-900 bg-white">
      <div class="flex min-h-screen justify-center">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-20 md:w-24 xl:w-64">
            <div class="sticky top-0">
              <SideBarLeft />
            </div>
          </div>

          <!-- Main content -->
          <main
            class="flex-1 border-x border-gray-200 sm:w-[590px] sm:flex-none md:w-[600px] dark:border-gray-700"
          >
            <slot />
          </main>

          <!-- Right sidebar -->
          <div class="hidden w-[300px] flex-shrink-0 lg:block xl:w-[350px]">
            <SideBarRight />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
