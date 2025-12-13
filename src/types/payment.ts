export interface PaymentResponse {
    code: number;
    message: string;
    data: {
        status: string;
        url: string;
        message: string;
    };
}

export interface PaymentStatusQuery {
    status: string;
    txnRef: string;
    transactionNo: string;
    amount: string;
    payDate: string;
}
