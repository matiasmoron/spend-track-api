import { httpResponse } from './../../src/data/enums/response';

declare global {
  namespace Express {
    interface Response {
      response: (data?: T, msg?: string) => Response;
      errorResponse: (msg?: string, status?: httpResponse) => Response;
    }
  }
}
