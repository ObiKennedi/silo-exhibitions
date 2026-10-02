import "dotenv/config";
import { getUpcomingEventBySlug } from "../lib/upcoming-events.ts";

async function run() {
  try {
    const event = await getUpcomingEventBySlug("owerri");
    console.log("Event title:", event?.title);
    console.log("Event stallsConfig count:", event?.stallsConfig?.length);
    console.log("StallsConfig:", JSON.stringify(event?.stallsConfig, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
