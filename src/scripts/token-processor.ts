#!/usr/bin/env tsx
// Local test script for token processor

import { tokenProcessor } from "../functions/token-processor";

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

tokenProcessor(mockReq, mockRes);
