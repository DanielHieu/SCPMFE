"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CalendarClock,
    Clock,
    UserCircle,
    PlusCircle,
    Filter,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    UsersRound,
} from "lucide-react";
import { toast } from "sonner";

// This would be replaced with actual API calls
const fetchScheduleData = async () => {
    // Simulate API call
    return [
        {
            id: 1,
            staffId: 1,
            staffName: "John Doe",
            date: "2023-06-15",
            startTime: "09:00",
            endTime: "17:00",
            tasks: [
                {
                    id: 101,
                    title: "Oil Change - Honda Civic",
                    time: "09:30 - 10:30",
                    customer: "Alice Johnson",
                    status: "scheduled",
                },
                {
                    id: 102,
                    title: "Brake Inspection - Toyota Camry",
                    time: "11:00 - 12:00",
                    customer: "Bob Smith",
                    status: "in-progress",
                },
            ],
        },
        {
            id: 2,
            staffId: 2,
            staffName: "Jane Smith",
            date: "2023-06-15",
            startTime: "08:00",
            endTime: "16:00",
            tasks: [
                {
                    id: 103,
                    title: "Tire Rotation - Ford F-150",
                    time: "08:30 - 09:30",
                    customer: "Charlie Brown",
                    status: "completed",
                },
            ],
        },
    ];
};

const SchedulePage = () => {
    const router = useRouter();
    const [date, setDate] = useState<Date>(new Date());
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<"day" | "week" | "month">("day");
    const [staffFilter, setStaffFilter] = useState<string>("all");

    useEffect(() => {
        const loadScheduleData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchScheduleData();
                setScheduleData(data);
            } catch (error) {
                console.error("Failed to fetch schedule data:", error);
                toast.error("Failed to load schedule data");
            } finally {
                setIsLoading(false);
            }
        };

        loadScheduleData();
    }, [date, view]);

    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    const handlePrevDay = () => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() - 1);
        setDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + 1);
        setDate(newDate);
    };

    const handleAddTask = () => {
        // Navigate to add task page or open modal
        toast.info("Add task functionality to be implemented");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "in-progress":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Staff Schedule</h1>
                <Button onClick={handleAddTask}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                                Calendar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="rounded-md border shadow-sm"
                                disabled={(date) => date < new Date('1900-01-01')}
                                initialFocus
                            />

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center">
                                    <UsersRound className="h-5 w-5 mr-2 text-primary" />
                                    <h3 className="font-medium">Staff Filters</h3>
                                </div>
                                <div className="space-y-3">
                                    <Select value={staffFilter} onValueChange={setStaffFilter}>
                                        <SelectTrigger className="w-full border-gray-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Filter by staff member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Staff Members</SelectItem>
                                            <SelectItem value="1">John Doe</SelectItem>
                                            <SelectItem value="2">Jane Smith</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>
                                    Schedule for {format(date, "MMMM d, yyyy")}
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Tabs defaultValue="day" className="mt-2">
                                <TabsList>
                                    <TabsTrigger value="day" onClick={() => setView("day")}>Day</TabsTrigger>
                                    <TabsTrigger value="week" onClick={() => setView("week")}>Week</TabsTrigger>
                                    <TabsTrigger value="month" onClick={() => setView("month")}>Month</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>Loading schedule...</p>
                                </div>
                            ) : scheduleData.length === 0 ? (
                                <div className="text-center py-10">
                                    <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-medium">No tasks scheduled</h3>
                                    <p className="mt-1 text-gray-500">
                                        There are no tasks scheduled for this day.
                                    </p>
                                    <Button className="mt-4" onClick={handleAddTask}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Task
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {scheduleData.map((staffSchedule) => (
                                        <div key={staffSchedule.id} className="border rounded-lg p-4">
                                            <div className="flex items-center mb-4">
                                                <Avatar className="h-10 w-10 mr-3">
                                                    <AvatarFallback>
                                                        {staffSchedule.staffName
                                                            .split(" ")
                                                            .map((n: string) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium">{staffSchedule.staffName}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        <Clock className="inline-block h-3 w-3 mr-1" />
                                                        {staffSchedule.startTime} - {staffSchedule.endTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {staffSchedule.tasks.map((task: any) => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-start p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => toast.info(`View details for task ${task.id}`)}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium">{task.title}</h4>
                                                                <Badge className={getStatusColor(task.status)}>
                                                                    {task.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <Clock className="inline-block h-3 w-3 mr-1" />
                                                                {task.time}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <UserCircle className="inline-block h-3 w-3 mr-1" />
                                                                {task.customer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
