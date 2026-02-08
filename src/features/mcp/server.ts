import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CloudflareBindings } from "../../types";

export function createMcpServer(bindings: CloudflareBindings) {
  const server = new McpServer({
    name: "Mas Alla Del Miedo API",
    version: "1.0.0",
  });

  // Resource: List all courses
  server.resource(
    "courses",
    "courses://list",
    async (uri, { request }) => {
      const { results } = await bindings.DB.prepare(
        "SELECT id, title, slug, price, currency, description FROM courses WHERE published = 1"
      ).all();

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(results, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );

  // Resource: List recent stories
  server.resource(
    "stories",
    "stories://list",
    async (uri, { request }) => {
      const { results } = await bindings.DB.prepare(
        "SELECT id, title, slug, excerpt, published_at FROM stories WHERE status = 'published' ORDER BY published_at DESC LIMIT 20"
      ).all();

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(results, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );

  // Tool: Search stories
  server.tool(
    "search_stories",
    {
      query: z.string().describe("The search query for stories"),
    },
    async ({ query }) => {
      const { results } = await bindings.DB.prepare(
        "SELECT id, title, slug, excerpt FROM stories WHERE (title LIKE ? OR story_text LIKE ?) AND status = 'published' LIMIT 10"
      )
        .bind(`%${query}%`, `%${query}%`)
        .all();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  // Tool: Get specific story details
  server.tool(
    "get_story",
    {
      slug: z.string().describe("The slug of the story to retrieve"),
    },
    async ({ slug }) => {
      const story = await bindings.DB.prepare(
        "SELECT * FROM stories WHERE slug = ?"
      )
        .bind(slug)
        .first();

      if (!story) {
        return {
          content: [
            {
              type: "text",
              text: "Story not found",
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(story, null, 2),
          },
        ],
      };
    }
  );

    // Tool: Get specific course details
    server.tool(
        "get_course",
        {
          slug: z.string().describe("The slug of the course to retrieve"),
        },
        async ({ slug }) => {
          const course = await bindings.DB.prepare(
            "SELECT * FROM courses WHERE slug = ?"
          )
            .bind(slug)
            .first();

          if (!course) {
            return {
              content: [
                {
                  type: "text",
                  text: "Course not found",
                },
              ],
              isError: true,
            };
          }

          // Get lessons
          const { results: lessons } = await bindings.DB.prepare(
              "SELECT id, title, slug, module_number, lesson_number FROM lessons WHERE course_id = ? ORDER BY order_index ASC"
          ).bind(course.id).all();

          const data = {
              ...course,
              lessons
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }
      );

  // Tool: Get student progress (secured, but accessible if key is valid)
  server.tool(
    "get_student_progress",
    {
      email: z.string().email().describe("The email of the student"),
    },
    async ({ email }) => {
      const user = await bindings.DB.prepare(
        "SELECT id, first_name, last_name, email FROM users WHERE email = ?"
      )
        .bind(email)
        .first();

      if (!user) {
        return {
          content: [
            {
              type: "text",
              text: "User not found",
            },
          ],
          isError: true,
        };
      }

      // Get enrollments
      const { results: enrollments } = await bindings.DB.prepare(
        `SELECT c.title as course_title, e.created_at, e.payment_status
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.user_id = ?`
      )
        .bind(user.id)
        .all();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ user, enrollments }, null, 2),
          },
        ],
      };
    }
  );

  return server;
}
