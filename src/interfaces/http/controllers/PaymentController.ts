import { Response, NextFunction } from 'express';
import { createPayment } from '../../../application/use-cases/payment/CreatePayment';
import { deletePayment } from '../../../application/use-cases/payment/DeletePayment';
import { updatePayment } from '../../../application/use-cases/payment/UpdatePayment';
import { paymentRepository, userGroupRepository } from '../../../config/di';
import { AuthenticatedRequest } from '../../../interfaces/http/types/AuthenticatedRequest';
import { BaseResponse } from '../../../interfaces/http/utils/BaseResponse';
import { CreatePaymentDTO, DeletePaymentDTO, UpdatePaymentDTO } from '../../../interfaces/validators/payment';
import { validateDTO } from '../utils/validateDTO';

export class PaymentController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(CreatePaymentDTO, req.body);

      const input = {
        ...dto,
        userId: Number(req.user.id),
      };

      const result = await createPayment(input, { paymentRepository, userGroupRepository });
      return BaseResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(UpdatePaymentDTO, {
        ...req.body,
        paymentId: Number(req.params.id),
      });

      const input = {
        ...dto,
        userId: Number(req.user.id),
      };

      const result = await updatePayment(input, { paymentRepository, userGroupRepository });
      return BaseResponse.success(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDTO(DeletePaymentDTO, { paymentId: Number(req.params.id) });

      const input = {
        paymentId: dto.paymentId,
        userId: Number(req.user.id),
      };

      await deletePayment(input, { paymentRepository, userGroupRepository });
      return BaseResponse.success(res, { message: 'Payment deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
