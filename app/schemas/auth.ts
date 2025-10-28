import * as yup from 'yup';

export const createPasswordSchema = (t: (key: string) => string) =>
  yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      t('errors.PASSWORD_INVALID'),
    );

export const createOtpSchema = (t: (key: string) => string) =>
  yup.object({
    otp: yup.string().matches(/^\d{6}$/, t('errors.OTP_MUST_6')),
  });
