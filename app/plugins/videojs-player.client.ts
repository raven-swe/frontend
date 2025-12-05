import VueVideoPlayer from '@videojs-player/vue';
import 'video.js/dist/video-js.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueVideoPlayer);
});
