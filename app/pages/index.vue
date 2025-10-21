<script setup lang="ts">
import Button from '~/components/ui/Button.vue';
const registerStore = useRegisterStore();
definePageMeta({
  layout: false, // Disable layout for this page
});
</script>

<template>
  <div class="bg-background flex h-screen w-screen flex-col">
    <div class="flex flex-1 flex-row items-center justify-center">
      <section class="hidden basis-[55%] justify-center lg:flex">
        <img src="https://placehold.co/400x400" alt="" class="size-110 p-8" />
      </section>
      <section class="h-full min-w-fit p-8 lg:h-fit lg:basis-[45%]">
        <header>
          <img src="https://placehold.co/400x400" alt="" class="size-18 lg:hidden" />
          <h1 class="my-12 text-4xl font-bold sm:text-[4rem]">{{ $t('root.hero.title') }}</h1>
          <h2 class="mb-8 text-2xl font-semibold sm:text-[2rem]">{{ $t('root.hero.subtitle') }}</h2>
        </header>
        <main>
          <AuthRegisterDialog />
          <section>
            <div class="flex flex-col gap-4">
              <Button id="github-signin" variant="outline" class="w-75">{{
                $t('root.auth.github-signin')
              }}</Button>
              <Button id="google-signin" variant="outline" class="w-75">{{
                $t('root.auth.google-signin')
              }}</Button>
            </div>
            <div class="flex max-w-75 items-center justify-center gap-2 py-2">
              <div class="w-full border-b-1" />
              <span class="uppercase">{{ $t('root.auth.separator') }}</span>
              <div class="w-full border-b-1" />
            </div>
            <Button id="signup" variant="default" class="w-75" @click="registerStore.openDialog">{{
              $t('root.auth.signup')
            }}</Button>
            <p class="text-muted-foreground mt-4 max-w-75 text-xs">
              {{ $t('root.auth.signup-info') }}
            </p>
          </section>
          <section class="mt-12">
            <p class="font-semibold">
              {{ $t('root.auth.already-have-account') }}
            </p>
            <Button id="signin" variant="outline" class="my-4 w-75" type="button">
              {{ $t('root.auth.signin') }}
            </Button>
          </section>
        </main>
      </section>
    </div>
    <footer class="text-muted-foreground p-4 text-center text-sm">
      {{ $t('root.footer.about') }} | {{ $t('root.footer.developers') }} |
      {{ $t('root.footer.copyright') }}
    </footer>
  </div>
</template>
