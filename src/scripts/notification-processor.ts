#!/usr/bin/env tsx
// Local test script for notification processor
import { Request, Response } from "@google-cloud/functions-framework";

import { notificationProcessor } from "../functions/notification-processor";

// Mock req/res for local testing
const mockReq = {};
const mockRes = {
  status: (code: number) => ({
    json: (data: object) => {
      console.log(`Status: ${code}`);
      console.log("Response:", JSON.stringify(data, null, 2));
    },
  }),
};

notificationProcessor(mockReq as Request, mockRes as Response);
