<script setup lang="ts">
import Button from '~/components/ui/Button.vue';
import { useLoginStore } from '~/stores/auth/login';
import { ref } from 'vue';
import { useI18n } from '#imports';

const { locale, setLocale } = useI18n();

const loginStore = useLoginStore();
const registerStore = useRegisterStore();
definePageMeta({
  layout: false, // Disable layout for this page
});

const { handleGithubSignIn, handleGoogleSignIn, setupOAuthMessageListener } = useOAuthHandlers();

onMounted(() => {
  setupOAuthMessageListener();
});

const lang = ref(locale.value);

const switchLanguage = () => {
  setLocale(lang.value);

  if (lang.value === 'en') {
    lang.value = 'ar';
  } else {
    lang.value = 'en';
  }
};
</script>

<template>
  <div class="bg-background flex h-screen w-screen flex-col">
    <UiButton class="fixed start-5 top-5" size="icon-lg" @click="switchLanguage()">
      <Icon size="1.2rem" name="material-symbols:language" />
    </UiButton>
    <div class="flex flex-1 flex-row items-center justify-center">
      <section class="hidden basis-[55%] justify-center lg:flex">
        <img
          src="https://cdn.raven.cmp27.space/light-raven.jpg"
          alt=""
          class="size-110 p-8 dark:hidden"
        />
        <img
          src="https://cdn.raven.cmp27.space/dark-raven.png"
          alt=""
          class="hidden size-110 p-8 dark:block"
        />
      </section>
      <section class="h-full min-w-fit p-8 lg:h-fit lg:basis-[45%]">
        <header>
          <div class="lg:hidden">
            <img
              src="https://cdn.raven.cmp27.space/light-raven.jpg"
              alt=""
              class="size-18 dark:hidden"
            />
            <img
              src="https://cdn.raven.cmp27.space/dark-raven.png"
              alt=""
              class="hidden size-18 dark:block"
            />
          </div>
          <h1 class="my-12 text-4xl font-bold sm:text-[4rem]">{{ $t('root.hero.title') }}</h1>
          <h2 class="mb-8 text-2xl font-semibold sm:text-[2rem]">{{ $t('root.hero.subtitle') }}</h2>
        </header>
        <main>
          <AuthRegisterDialog />
          <AuthLoginDialog />
          <section>
            <div class="flex flex-col gap-4">
              <Button id="github-signin" variant="outline" class="w-75" @click="handleGithubSignIn">
                <Icon name="grommet-icons:github" />
                {{ $t('root.auth.github-signin') }}</Button
              >

              <Button
                id="google-signin-btn"
                variant="outline"
                class="w-75"
                @click="handleGoogleSignIn"
              >
                <Icon name="material-icon-theme:google" />
                {{ $t('root.auth.google-signin') }}</Button
              >
            </div>
            <div class="flex max-w-75 items-center justify-center gap-2 py-2">
              <div class="w-full border-b-1" />
              <span class="uppercase">{{ $t('root.auth.separator') }}</span>
              <div class="w-full border-b-1" />
            </div>
            <Button
              id="signup"
              data-cy="signup-start-button"
              variant="default"
              class="w-75"
              @click="registerStore.openDialog"
              >{{ $t('root.auth.signup') }}</Button
            >
            <p class="text-muted-foreground mt-4 max-w-75 text-xs">
              {{ $t('root.auth.signup-info') }}
            </p>
          </section>
          <section class="mt-12">
            <p class="font-semibold">
              {{ $t('root.auth.already-have-account') }}
            </p>
            <Button
              id="signin"
              variant="outline"
              class="my-4 w-75"
              data-cy="signin-start-button"
              @click="loginStore.openDialog"
            >
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
