import { check } from 'express-validator';
import fieldsValidation from '../middleware/fields-validation';

export const validateName = () =>
  check('name', 'is required')
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage('Max length is 50 characters');

export const validateExample = () => [validateName(), fieldsValidation];
