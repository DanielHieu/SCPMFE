import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api/api-helper";

interface ContractFutureExpiredData {
    id: number;
    customerName: string;
    parkingLotName: string;
    expiredDate: string; // DateOnly in C# maps to string in TypeScript
    remainingDays: number;
}

const ContractFutureExpired = () => {
    const [contracts, setContracts] = useState<ContractFutureExpiredData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getContracts = async () => {
            setIsLoading(true);
            try {
                const data = await fetchApi('/Contract/FutureExpired');
                setContracts(data);
            } catch (error) {
                console.error("Error in contract data fetching:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getContracts();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hợp đồng sắp hết hạn (còn dưới 10 ngày)</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                ) : contracts.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center border rounded-md">
                        <p className="text-muted-foreground">Không có hợp đồng nào</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Bãi đỗ xe</TableHead>
                                    <TableHead>Ngày hết hạn</TableHead>
                                    <TableHead>Còn lại</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell className="font-medium">{contract.customerName}</TableCell>
                                        <TableCell>{contract.parkingLotName}</TableCell>
                                        <TableCell>{contract.expiredDate}</TableCell>
                                        <TableCell>
                                            <span className={`font-medium ${contract.remainingDays <= 7 ? 'text-red-500' : contract.remainingDays <= 14 ? 'text-amber-500' : 'text-green-500'}`}>
                                                {contract.remainingDays} ngày
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`/contracts/${contract.id}`}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Xem
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ContractFutureExpired;
