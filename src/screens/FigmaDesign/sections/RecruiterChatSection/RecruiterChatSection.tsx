import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const RecruiterChatSection = (): JSX.Element => {
  return (
    <div className="w-full">
      <Card className="bg-[#2565e3] border border-solid border-[#4274d4] rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="font-normal text-[14.3px] text-[#afcef4] font-sans">
              Matching Candidates
            </div>
            <div className="font-normal text-[11.2px] text-[#a7c8f1] font-sans">
              3 candidates found
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
