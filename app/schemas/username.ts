import * as yup from 'yup';

const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;

const getUsernameSchema = (t: (key: string) => string) =>
  yup
    .string()
    .trim()
    .required(t('setting.username.username-required'))
    .min(3, t('setting.username.username-invalid'))
    .max(15, t('setting.username.username-invalid'))
    .matches(usernameRegex, t('setting.username.username-invalid'));

export default getUsernameSchema;
