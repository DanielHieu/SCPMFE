"use client";
import React from "react";
import { Feedback } from "@/types"; // Use your specific Feedback type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerFeedbackListProps {
  feedback: Feedback[];
}

export function CustomerFeedbackList({ feedback }: CustomerFeedbackListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Customer Feedback</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => alert("Navigate to full feedback list")}
        >
          {" "}
          View All Feedback
        </Button>
      </CardHeader>
      <CardContent>
        {feedback?.length > 0 ? (
          <ul className="space-y-4">
            {feedback.map((item) => (
              <li
                key={item.feedbackId}
                className="p-3 border rounded-md bg-gray-50/50"
              >
                <div className="flex justify-between items-start mb-1">
                  {/* Use rating field */}
                  <span className="text-xs text-gray-500">
                    {new Date(item.daySubmitted).toLocaleDateString()}{" "}
                    {/* Use date field */}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.message}</p>{" "}
                {/* Use message/comment field */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-gray-500 py-4">
            No feedback submitted.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
