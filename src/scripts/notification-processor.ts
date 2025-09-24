#!/usr/bin/env tsx
// Local test script for notification processor

import { notificationProcessor } from "../functions/notification-processor";

// Mock req/res for local testing
const mockReq = {};
const mockRes = {
  status: (code: number) => ({
    json: (data: any) => {
      console.log(`Status: ${code}`);
      console.log("Response:", JSON.stringify(data, null, 2));
    },
  }),
};

notificationProcessor(mockReq, mockRes);
