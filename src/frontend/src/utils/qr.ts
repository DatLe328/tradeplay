export function genVietQR({
	bankCode,
	accountNo,
	amount,
	orderId,
	accountName,
}: {
	bankCode: string;
	accountNo: string;
	amount: number;
	orderId: string;
	accountName: string;
}) {
	return (
		`https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png` +
		`?amount=${amount}` +
		`&addInfo=${encodeURIComponent(orderId)}` +
		`&accountName=${encodeURIComponent(accountName)}`
	);
}
