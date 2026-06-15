import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddPaymentCommand, RemovePaymentCommand } from '../../domain/model/commands/payment-commands';
import { PaymentResource } from '../responses/billing-responses';
import { PaymentAssembler } from '../assemblers/billing-assemblers';

export class PaymentsApiEndpoint {
  private readonly basePath = `${environment.apiBaseUrl}/vouchers`;

  constructor(private http: HttpClient) {}

  addPayment(command: AddPaymentCommand): Observable<PaymentResource> {
    const request = PaymentAssembler.toAddPaymentRequestFromCommand(command);
    return this.http.post<PaymentResource>(`${this.basePath}/${command.voucherId}/payments`, request);
  }

  removePayment(command: RemovePaymentCommand): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${command.voucherId}/payments/${command.paymentId}`);
  }
}
