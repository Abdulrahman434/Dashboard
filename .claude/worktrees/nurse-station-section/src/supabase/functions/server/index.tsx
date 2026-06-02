import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-82b93d8d/health", (c) => {
  return c.json({ status: "ok" });
});

// Comment API endpoints

// Get all comments
app.get("/make-server-82b93d8d/comments", async (c) => {
  try {
    const comments = await kv.getByPrefix("comment:");
    return c.json({ success: true, comments: comments || [] });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a new comment or reply
app.post("/make-server-82b93d8d/comments", async (c) => {
  try {
    const body = await c.req.json();
    const { page, x, y, authorName, authorEmail, text, parentId } = body;

    if (!page || !authorName || !text) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      page,
      x: x || 0,
      y: y || 0,
      authorName,
      authorEmail: authorEmail || "",
      text,
      timestamp: Date.now(),
      resolved: false,
      parentId: parentId || null,
      replies: []
    };

    await kv.set(`comment:${comment.id}`, comment);
    return c.json({ success: true, comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a comment (edit or resolve)
app.put("/make-server-82b93d8d/comments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { text, resolved } = body;

    const comment = await kv.get(`comment:${id}`);
    if (!comment) {
      return c.json({ success: false, error: "Comment not found" }, 404);
    }

    const updatedComment = {
      ...comment,
      ...(text !== undefined && { text }),
      ...(resolved !== undefined && { resolved })
    };

    await kv.set(`comment:${id}`, updatedComment);
    return c.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a comment
app.delete("/make-server-82b93d8d/comments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get all comments to find replies
    const allComments = await kv.getByPrefix("comment:");
    
    // Find all comments that are replies to this comment (recursively)
    const commentsToDelete = [id];
    const findReplies = (parentId: string) => {
      allComments.forEach((comment: any) => {
        if (comment.parentId === parentId) {
          commentsToDelete.push(comment.id);
          findReplies(comment.id); // Recursively find nested replies
        }
      });
    };
    findReplies(id);
    
    // Delete all comments (parent and all replies)
    await Promise.all(commentsToDelete.map(commentId => kv.del(`comment:${commentId}`)));
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);