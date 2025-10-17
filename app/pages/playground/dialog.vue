<script lang="ts" setup></script>
<template>
  <div>
    <div class="p-4">
      <!-- eslint-disable-next-line vue/no-bare-strings-in-template -->
      <h1 class="mb-4 text-2xl font-bold">Buttons Playground Page</h1>
    </div>
    <div class="flex flex-col items-start gap-4 p-8">
      <UiDialog>
        <UiDialogTrigger as-child>
          <UiButton>
            {{ $t('playground.dialog.open') }}
          </UiButton>
        </UiDialogTrigger>
        <UiDialogContent header-class="flex items-center justify-center p-0">
          <template #header>
            <img src="https://placehold.co/32x32" class="size-8" />
          </template>
          <UiDialogHeader class="px-8 py-4">
            <UiDialogTitle class="text-4xl font-bold">{{
              $t('playground.dialog.title')
            }}</UiDialogTitle>
            <UiDialogDescription>
              {{ $t('playground.dialog.description') }}
            </UiDialogDescription>
          </UiDialogHeader>
          <div class="mx-8 flex-grow">{{ $t('playground.dialog.content') }}</div>
          <UiDialogFooter>
            <UiButton class="w-100" size="xl"> {{ $t('ui.next') }} </UiButton>
            <UiButton variant="outline" class="w-100" size="xl">
              {{ $t('ui.close') }}
            </UiButton>
          </UiDialogFooter>
        </UiDialogContent>
      </UiDialog>
    </div>
  </div>
</template>

<style></style>
