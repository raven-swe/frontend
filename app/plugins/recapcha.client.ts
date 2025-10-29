export default defineNuxtPlugin(() => {
  if (!window.grecaptcha) {
    window.onRecaptchaLoad = () => {
      window.dispatchEvent(new Event('recaptcha-script-loaded'));
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => console.error('Failed to load reCAPTCHA script');
    document.head.appendChild(script);
  }
});
