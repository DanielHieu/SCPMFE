import { fetchApi } from "@/lib/api/api-helper"
import { StatsCard } from "./StatsCard"
import { SummaryCard } from "./SummaryCard"
import { SummaryReportResponse } from "@/types/dashboard"
import { Activity, Building, DollarSign, FileText, Percent, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import ContractFutureExpired from "./tables/ContractFutureExpired"
import ContractNeedToProcess from "./tables/ContractNeedToProcess"

const GeneralTabContent = () => {
    const [summaryData, setSummaryData] = useState<SummaryReportResponse | null>(null)

    useEffect(() => {
        fetchApi("/Report/Summary").then(setSummaryData)
    }, [])

    return (<>
        {/* Summary Cards */}
        < div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
            <SummaryCard
                title="Tổng khách hàng"
                value={summaryData?.totalCustomers || 0}
                icon={<Users className="h-4 w-4 text-blue-600" />}
                className="border-l-blue-600"
            />
            <SummaryCard
                title="Tổng nhân viên"
                value={summaryData?.totalStaffs || 0}
                icon={<Building className="h-4 w-4 text-green-600" />}
                className="border-l-green-600"
            />
            <SummaryCard
                title="Hợp đồng đang hoạt động"
                value={summaryData?.totalContracts || 0}
                icon={<FileText className="h-4 w-4 text-amber-600" />}
                className="border-l-amber-600"
            />
            <SummaryCard
                title="Doanh thu năm"
                value={formatCurrency(summaryData?.totalRevenueInYear || 0)}
                icon={<DollarSign className="h-4 w-4 text-purple-600" />}
                className="border-l-purple-600"
            />
        </div >

        {/* Stats Cards */}
        < div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
            <StatsCard
                title="Doanh thu tháng này"
                value={formatCurrency(summaryData?.totalRevenueInMonth || 0)}
                description={`${((summaryData?.totalRevenueInMonth || 0) / (summaryData?.totalRevenueInYear || 1) * 100).toFixed(1)}% của doanh thu năm`}
                icon={DollarSign}
            />
            <StatsCard
                title="Doanh thu tuần này"
                value={formatCurrency(summaryData?.totalRevenueInWeek || 0)}
                description={`${((summaryData?.totalRevenueInWeek || 0) / (summaryData?.totalRevenueInMonth || 1) * 100).toFixed(1)}% của doanh thu tháng`}
                icon={Activity}
            />
            <StatsCard
                title="Khách hàng hoạt động"
                value={summaryData?.totalCustomers || 0}
                description={`${((summaryData?.totalCustomers || 0) / (summaryData?.totalCustomers || 1) * 100).toFixed(1)}% tổng khách hàng`}
                icon={Users}
            />
            <StatsCard
                title="Tỷ lệ hợp đồng hoạt động"
                value={`${((summaryData?.totalContracts || 0) / (summaryData?.totalContracts || 1) * 100).toFixed(1)}%`}
                description={`${summaryData?.totalContracts || 0}/${summaryData?.totalContracts || 0} hợp đồng`}
                icon={Percent}
            />
        </div >
        <ContractNeedToProcess />
        <ContractFutureExpired />
    </>
    )
}

export default GeneralTabContent
