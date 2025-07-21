import { Response, NextFunction } from 'express';
import { createExpense } from '../../../application/use-cases/expense/CreateExpense';
import { deleteExpense } from '../../../application/use-cases/expense/DeleteExpense';
import { expenseRepository, userGroupRepository } from '../../../config/di';
import { AuthenticatedRequest } from '../../../interfaces/http/types/AuthenticatedRequest';
import { BaseResponse } from '../../../interfaces/http/utils/BaseResponse';
import { CreateExpenseDTO, DeleteExpenseDTO } from '../../../interfaces/validators/expense';
import { validateDTO } from '../utils/validateDTO';

export class ExpenseController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(CreateExpenseDTO, req.body);

      const input = {
        ...dto,
        userId: Number(req.user.id),
      };

      const result = await createExpense(input, { expenseRepository, userGroupRepository });
      return BaseResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(DeleteExpenseDTO, { expenseId: Number(req.params.id) });

      const input = {
        expenseId: dto.expenseId,
        userId: Number(req.user.id),
      };

      await deleteExpense(input, { expenseRepository, userGroupRepository });
      return BaseResponse.success(res, { message: 'Expense deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
