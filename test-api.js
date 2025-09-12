// Quick test script to verify API endpoints work
async function testAPI() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("🧪 Testing API endpoints...\n");

    // Test providers endpoint
    console.log("📡 Testing GET /api/providers");
    const providersResponse = await fetch(`${baseUrl}/api/providers`);
    const providers = await providersResponse.json();
    console.log("✅ Providers:", providers.providers.length, "providers found");

    // Test cron jobs endpoint
    console.log("📡 Testing GET /api/schedules");
    const jobsResponse = await fetch(`${baseUrl}/api/schedules`);
    const jobs = await jobsResponse.json();
    console.log("✅ Cron Jobs:", jobs.jobs.length, "jobs found");

    // Test creating a cron job
    console.log("📡 Testing POST /api/schedules");
    const createResponse = await fetch(`${baseUrl}/api/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Job",
        schedule: "0 9 * * *",
        gitProvider: "github",
        messagingProvider: "slack",
      }),
    });
    const created = await createResponse.json();
    console.log("✅ Created job:", created.job.name);

    console.log("\n🎉 All API tests passed!");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    console.log(
      "\n💡 Make sure the server is running with: npm run dev:server"
    );
  }
}

testAPI();
