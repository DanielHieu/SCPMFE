"use client"

import { getPaymentContracts } from "@/lib/api";
import { fetchApi } from "@/lib/api/api-helper";
import { Contract, ContractStatus, PaymentContract } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ContractDetailComponent = ({ contractId }: { contractId: number }) => {
    const [contract, setContract] = useState<Contract | null>(null);
    const [paymentContracts, setPaymentContracts] = useState<PaymentContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContractDetail = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi(`/Contract/GetById?id=${contractId}`, {
                method: "GET",
            });

            const paymentContracts = await getPaymentContracts(contractId);

            setContract(data);
            setPaymentContracts(paymentContracts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải thông tin hợp đồng");
            toast.error("Không thể tải thông tin hợp đồng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contractId) {
            fetchContractDetail();
        }
    }, [contractId]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Đang tải thông tin hợp đồng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-red-600 text-lg font-medium mb-2">Lỗi</h2>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h2 className="text-yellow-600 text-lg font-medium mb-2">Không tìm thấy hợp đồng</h2>
                    <p className="text-yellow-500">Không tìm thấy thông tin hợp đồng với mã {contractId}</p>
                </div>
            </div>
        );
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case ContractStatus.Active:
                return "Đang hoạt động";
            case ContractStatus.Expired:
                return "Đã hết hạn";
            case ContractStatus.Inactive:
                return "Chờ xử lý";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case ContractStatus.Active:
                return "text-green-600 bg-green-50 border-green-200";
            case ContractStatus.Expired:
                return "text-red-600 bg-red-50 border-red-200";
            case ContractStatus.Inactive:
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    function handleComplete(paymentContractId: number): void {
        console.log("handleComplete", paymentContractId);
        fetchApi(`/Contract/Accept/${paymentContractId}`, {
            method: "POST",
        })
            .then(() => {
                toast.success("Đã kiểm tra thanh toán hợp đồng thành công");
                fetchContractDetail()
                    .then(() => {
                        toast.dismiss();
                        toast.success("Đã cập nhật thông tin hợp đồng");
                    })
                    .catch(() => {
                        toast.dismiss();
                        toast.error("Lỗi khi cập nhật thông tin hợp đồng");
                    });
            })
            .catch((err) => {
                toast.error("Lỗi khi kiểm tra thanh toán hợp đồng");
            });
    }

    function handleApprove(paymentContractId: number): void {
        console.log("handleApprove", paymentContractId);
        fetchApi(`/Contract/Approve/${paymentContractId}`, {
            method: "POST",
        })
            .then(() => {
                toast.success("Đã chấp nhận hợp đồng");
                fetchContractDetail()
                    .then(() => {
                        toast.dismiss();
                        toast.success("Đã cập nhật thông tin hợp đồng");
                    })
                    .catch(() => {
                        toast.dismiss();
                        toast.error("Lỗi khi cập nhật thông tin hợp đồng");
                    });
            })
            .catch((err) => {
                toast.error("Lỗi khi chấp nhận hợp đồng");
            });
    }

    function handleReject(paymentContractId: number): void {
        const reason = prompt("Vui lòng nhập lý do từ chối:");
        if (reason === null) return; // User cancelled the dialog

        console.log("handleReject", paymentContractId, reason);
        fetchApi(`/Contract/Reject/${paymentContractId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason }),
        })
            .then(() => {
                toast.success("Đã từ chối hợp đồng");
                toast.loading("Đang cập nhật thông tin hợp đồng...");
                fetchContractDetail()
                    .then(() => {
                        toast.dismiss();
                        toast.success("Đã cập nhật thông tin hợp đồng");
                    })
                    .catch(() => {
                        toast.dismiss();
                        toast.error("Lỗi khi cập nhật thông tin hợp đồng");
                    });
            })
            .catch((err) => {
                console.log(err);
                toast.error("Lỗi khi từ chối hợp đồng");
            });
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Hợp đồng</h1>
                <p className="text-gray-500">Mã hợp đồng: {contract.contractId}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Thông tin hợp đồng */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Thông tin hợp đồng</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                                <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                                    {getStatusText(contract.status)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                                <p className="mt-1">{contract.createdDate}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ngày bắt đầu</p>
                                <p className="mt-1">{contract.startDateString}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ngày kết thúc</p>
                                <p className="mt-1">{contract.endDateString}</p>
                            </div>
                            {contract.note && (
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Ghi chú</p>
                                    <p className="mt-1">{contract.note}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="text-lg font-medium mb-3">Thông tin vị trí đỗ xe</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Bãi đỗ xe</p>
                                    <p className="mt-1">{contract.parkingLotName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Vị trí</p>
                                    <p className="mt-1">{contract.parkingSpaceName}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                                    <p className="mt-1">{contract.parkingLotAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin khách hàng và xe */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Mã khách hàng</p>
                                <p className="mt-1">{contract.car?.customerId}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tên khách hàng</p>
                                <p className="mt-1 font-medium">{contract.car?.customerName}</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="text-lg font-medium mb-3">Thông tin xe</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Biển số xe</p>
                                    <p className="mt-1 font-medium">{contract.car?.licensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Hãng xe</p>
                                    <p className="mt-1">{contract.car?.brand || "Không có thông tin"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Mẫu xe</p>
                                    <p className="mt-1">{contract.car?.model}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Màu sắc</p>
                                    <p className="mt-1">{contract.car?.color}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Thông tin thanh toán */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
                    {paymentContracts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Mã thanh toán</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Số tiền</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày thanh toán</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày bắt đầu</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày kết thúc</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Trạng thái</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paymentContracts.map((paymentContract) => (
                                        <tr key={paymentContract.paymentContractId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{paymentContract.paymentContractId}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentContract.paymentAmount || 0)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{paymentContract?.paymentDate ? paymentContract.paymentDate : ''}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{paymentContract?.startDateString ? paymentContract.startDateString : ''}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{paymentContract?.endDateString ? paymentContract.endDateString : ''}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {paymentContract.status === 'Pending' ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(paymentContract.paymentContractId)}
                                                            className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                                        >
                                                            Chấp nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(paymentContract.paymentContractId)}
                                                            className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                ) : paymentContract.status === 'Paid' ? (
                                                    <button
                                                        onClick={() => handleComplete(paymentContract.paymentContractId)}
                                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        Hoàn tất
                                                    </button>
                                                ) : (
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentContract.status === 'Approved' ? 'bg-blue-200 text-blue-900 border border-blue-300' :
                                                        paymentContract.status === 'Completed' ? 'bg-purple-200 text-purple-900 border border-purple-300' :
                                                            paymentContract.status === 'Rejected' ? 'bg-red-200 text-red-900 border border-red-300' :
                                                                'bg-gray-200 text-gray-900 border border-gray-300'
                                                        }`}>
                                                        {paymentContract.status === 'Approved' ? 'Đã chấp nhận' :
                                                            paymentContract.status === 'Completed' ? 'Hoàn tất' :
                                                                paymentContract.status === 'Rejected' ? 'Từ chối' :
                                                                    paymentContract.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {paymentContract.note}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Không có thông tin thanh toán</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractDetailComponent;