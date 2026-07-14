import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/lib/auth";
import { TransactionService, DomainError, ErrorCode } from "@/lib/transaction";
import { withIdempotency } from "@/lib/idempotency";
import { logger } from "@/lib/observability/logger";

const transactionService = new TransactionService(prisma);

async function payInvoiceHandler(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.invoiceId;
    const body = await req.json();
    const bankAccountId = body.bank_account_id;

    if (!bankAccountId) {
      return NextResponse.json({ error: "Bank account ID is required" }, { status: 400 });
    }

    const correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

    const result = await transactionService.runInTransaction(
      correlationId,
      async (tx) => {
        // 1. Fetch the invoice
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId, company_id: companyId }
        });

        if (!invoice) {
          throw new DomainError("Invoice not found", ErrorCode.NOT_FOUND);
        }

        if (invoice.payment_status === "Paid") {
          throw new DomainError("Invoice is already paid", ErrorCode.CONFLICT);
        }

        // 2. Fetch the bank account
        const bankAccount = await tx.bankAccount.findUnique({
          where: { id: bankAccountId, company_id: companyId }
        });

        if (!bankAccount) {
          throw new DomainError("Bank account not found", ErrorCode.NOT_FOUND);
        }

        // 3. Update the invoice status
        const updatedInvoice = await tx.invoice.update({
          where: { id: invoiceId },
          data: { payment_status: "Paid" }
        });

        // 4. Create a cash flow activity
        const cashFlow = await tx.cashFlowActivity.create({
          data: {
            company_id: companyId,
            bank_account_id: bankAccountId,
            type: "IN",
            amount: invoice.total,
            description: `Payment received for Invoice ${invoice.invoice_number}`,
            reference_id: invoice.id,
            category: "Client Payment",
            date: new Date()
          }
        });

        // 5. Update bank account balance
        const updatedBank = await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { balance: { increment: invoice.total } }
        });

        return { invoice: updatedInvoice, cashFlow, bankAccount: updatedBank };
      },
      undefined, // Default transaction options
      {
        userId: "system", // We would normally get user ID from auth
        tenantId: companyId,
        domain: "finance",
        service: "invoice-payment",
        invoiceId,
        bankAccountId
      }
    );

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    logger.error("Failed to mark invoice as paid", error, { invoiceId: params.invoiceId });
    
    if (error instanceof DomainError) {
      let status = 500;
      if (error.code === ErrorCode.NOT_FOUND) status = 404;
      if (error.code === ErrorCode.CONFLICT) status = 409;
      if (error.code === ErrorCode.VALIDATION_ERROR) status = 400;
      
      return NextResponse.json({ error: error.message }, { status });
    }
    
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: { params: { invoiceId: string } }) {
  return withIdempotency(req, payInvoiceHandler, ctx);
}
