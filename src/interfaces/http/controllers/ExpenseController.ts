import { Response, NextFunction } from 'express';
import { createExpense } from '../../../application/use-cases/expense/CreateExpense';
import { expenseRepository } from '../../../config/di';
import { AuthenticatedRequest } from '../../../interfaces/http/types/AuthenticatedRequest';
import { BaseResponse } from '../../../interfaces/http/utils/BaseResponse';
import { CreateExpenseDTO } from '../../../interfaces/validators/expense';
import { validateDTO } from '../utils/validateDTO';

export class ExpenseController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(CreateExpenseDTO, req.body);

      console.log({ dto });

      const input = {
        ...dto,
      };

      const result = await createExpense(expenseRepository, input);
      return BaseResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
