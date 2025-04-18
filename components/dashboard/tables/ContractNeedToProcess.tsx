import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { fetchApi } from "@/lib/api/api-helper";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

interface ContractNeedToProcessData {
    id: string;
    customerName: string;
    parkingLotName: string;
}

const ContractNeedToProcess = () => {
    const [contracts, setContracts] = useState<ContractNeedToProcessData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getContracts = async () => {
            setIsLoading(true);
            try {
                const data = await fetchApi("/Contract/NeedToProcess");
                setContracts(data);
            } catch (error) {
                console.error("Error fetching contracts to process:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getContracts();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hợp đồng cần xử lý</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                ) : contracts.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center border rounded-md">
                        <p className="text-muted-foreground">Không có hợp đồng nào cần xử lý</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Bãi đỗ xe</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell className="font-medium">{contract.customerName}</TableCell>
                                        <TableCell>{contract.parkingLotName}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/contracts/${contract.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Xem
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ContractNeedToProcess;
