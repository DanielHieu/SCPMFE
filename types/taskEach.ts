export interface Task {
    taskEachId: string;
    title: string;
    description: string;
    assignedToId: number;
    assigneeName: string;
    status: "Pending" | "InProgress" | "Completed";
    priority: "Low" | "Medium" | "High";
    startDate: string;
    endDate: string;
};

export interface AddTaskPayload {
    title: string;
    description: string;
    assignedToId: number;
    priority: "Low" | "Medium" | "High";
    startDate: Date;
    endDate: Date;
}

export interface UpdateTaskPayload {    
    taskEachId: string;
    title: string;
    description: string;
    assignedToId: number;
    priority: "Low" | "Medium" | "High";
    startDate: Date;
    endDate: Date;
}



