import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenerateVoucherCommand, CheckoutCommand } from '../../domain/model/commands/voucher-commands';
import { VoucherResource } from '../responses/billing-responses';
import { VoucherAssembler } from '../assemblers/billing-assemblers';

export class VouchersApiEndpoint {
  private readonly basePath = `${environment.apiBaseUrl}/vouchers`;

  constructor(private http: HttpClient) {}

  generateVoucher(command: GenerateVoucherCommand): Observable<VoucherResource> {
    const request = VoucherAssembler.toGenerateVoucherRequestFromCommand(command);
    return this.http.post<VoucherResource>(this.basePath, request);
  }

  getVoucherById(id: string): Observable<VoucherResource> {
    return this.http.get<VoucherResource>(`${this.basePath}/${id}`);
  }

  getVouchersByBranchId(branchId: string): Observable<VoucherResource[]> {
    return this.http.get<VoucherResource[]>(this.basePath, { params: { branchId } });
  }

  checkout(command: CheckoutCommand): Observable<VoucherResource> {
    const request = VoucherAssembler.toCheckoutRequestFromCommand(command);
    return this.http.post<VoucherResource>(`${environment.apiBaseUrl}/checkouts`, request);
  }
}
