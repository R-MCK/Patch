import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { randomUUID } from "crypto";
import { z } from "zod/v3";
import { dbAll, dbRun } from "./db";
import { logger } from "./types";

interface PlantIdentifier {
    id: string;
}

interface WaterPlantsArgs {
    identifiers: string[];
}

// Initialize the MCP Server
const server = new McpServer({
    name: "patch",
    version: "1.0.0"
});

// Tool: Get all plants
server.tool("get_plants", "Get a list of all plants in the user's garden", {}, async () => {
    const plants = await dbAll('SELECT * FROM plants');
    return {
        content: [{ type: "text", text: JSON.stringify(plants, null, 2) }]
    };
});

const waterPlantsInputSchema = {
    identifiers: z.array(z.string()).describe("The names of the plants that were watered")
};

// Tool: Water Plants
(server.tool as any)(
    "water_plants",
    "Record that you watered specific plants",
    waterPlantsInputSchema,
    async ({ identifiers }: WaterPlantsArgs) => {
        const results = [];
        for (const name of identifiers) {
            // Find the plant by name
            const plants = await dbAll<PlantIdentifier>('SELECT id FROM plants WHERE name LIKE ?', [`%${name}%`]);

            if (plants.length === 0) {
                results.push(`Could not find a plant matching: ${name}`);
                continue;
            }

            for (const plant of plants) {
                const taskId = randomUUID();
                // Create a completed watering task
                await dbRun(`
          INSERT INTO care_tasks(id, plant_id, task_type, scheduled_date, completed_date)
          VALUES(?, ?, 'Watering', datetime('now'), datetime('now'))
                `, [taskId, plant.id]);

                results.push(`Successfully logged watering for ${name} (ID: ${plant.id})`);
            }
        }

        return {
            content: [{ type: "text", text: results.join("\\n") }]
        };
    }
);

// Start the stdio transport
export async function startMcpServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("MCP Server running on Stdio");
}
