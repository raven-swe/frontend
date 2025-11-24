import * as yup from 'yup';

const usernameParamsSchema = yup.object({ username: yup.string().required().min(3) });

export default usernameParamsSchema;
