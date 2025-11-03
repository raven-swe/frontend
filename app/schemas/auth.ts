import * as yup from 'yup';

export const createPasswordSchema = (t: (key: string) => string) =>
  yup
    .string()
    .min(10, t('errors.PASSWORD_TOO_SHORT'))
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{10,}$/,
      t('errors.PASSWORD_INVALID'),
    );

export const createOtpSchema = (t: (key: string) => string) =>
  yup.object({
    otp: yup.string().matches(/^\d{6}$/, t('errors.OTP_MUST_6')),
  });
