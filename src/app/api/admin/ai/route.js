import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { aiTools, executeAiTool } from "@/lib/ai-tools";

export const runtime = "nodejs";

const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_TOOL_ROUNDS = 5;

const SYSTEM_INSTRUCTIONS = `
You are the AI Admin Assistant for a Salon Management System.

Your job is to help authorized salon administrators understand
their business using actual database information.

Rules:
1. Use database tools whenever the question requires salon data.
2. Never invent appointments, revenue, staff performance or reviews.
3. Explain all results in simple, professional language.
4. Currency is Pakistani Rupees (PKR).
5. Revenue figures must use saved booking-time prices only.
6. Clearly mention when historical price data is missing.
7. Distinguish appointment counts from revenue.
8. Never claim an action was performed.
9. You have READ-ONLY access to salon business data.
10. Never request passwords, tokens or payment information.
11. If data is unavailable, clearly say so.
12. Respond in the language used by the administrator.
`;

export async function POST(request) {
  try {
    // 1. ADMIN AUTHENTICATION
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // 2. VALIDATE REQUEST
    const body = await request.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    const conversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    const editMessageId =
      typeof body.editMessageId === "string"
        ? body.editMessageId.trim()
        : "";

    if (!question || !conversationId) {
      return NextResponse.json(
        { message: "Question and conversation ID are required." },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { message: "Question is too long." },
        { status: 400 }
      );
    }

    // 3. VERIFY CONVERSATION OWNERSHIP
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId: decoded.id,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found." },
        { status: 404 }
      );
    }

    let chatHistory = [];

    // 4. HANDLE EDIT / REGENERATE
    if (editMessageId) {
      const existingMessages = await prisma.aIMessage.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const targetIndex = existingMessages.findIndex(
        (message) =>
          message.id === editMessageId &&
          message.role === "user"
      );

      if (targetIndex === -1) {
        return NextResponse.json(
          { message: "The message you want to edit was not found." },
          { status: 404 }
        );
      }

      const targetMessage = existingMessages[targetIndex];

      // Remove all messages after the edited question.
      const messagesToDelete = existingMessages
        .slice(targetIndex + 1)
        .map((message) => message.id);

      await prisma.$transaction(async (tx) => {
        if (messagesToDelete.length > 0) {
          await tx.aIMessage.deleteMany({
            where: {
              id: {
                in: messagesToDelete,
              },
              conversationId,
            },
          });
        }

        await tx.aIMessage.update({
          where: {
            id: targetMessage.id,
          },
          data: {
            content: question,
          },
        });
      });

      // Keep only messages before the edited question.
      chatHistory = existingMessages
        .slice(0, targetIndex)
        .slice(-30)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      // Update title if the first question was edited.
      if (targetIndex === 0) {
        await prisma.aIConversation.update({
          where: {
            id: conversationId,
          },
          data: {
            title:
              question.length > 45
                ? question.slice(0, 45) + "..."
                : question,
          },
        });
      }
    } else {
      // 5. LOAD PREVIOUS MESSAGES FOR A NORMAL QUESTION
      const previousMessages = await prisma.aIMessage.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
        select: {
          role: true,
          content: true,
        },
      });

      chatHistory = previousMessages
        .reverse()
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      // Save new user question.
      await prisma.aIMessage.create({
        data: {
          conversationId,
          role: "user",
          content: question,
        },
      });

      // Automatically generate conversation title.
      if (conversation.title === "New Chat") {
        await prisma.aIConversation.update({
          where: {
            id: conversationId,
          },
          data: {
            title:
              question.length > 45
                ? question.slice(0, 45) + "..."
                : question,
          },
        });
      }
    }

    // 6. ASK AI
    let input = [
      ...chatHistory,
      {
        role: "user",
        content: question,
      },
    ];

    let response = await openai.responses.create({
      model: MODEL,
      instructions: SYSTEM_INSTRUCTIONS,
      input,
      tools: aiTools,
      tool_choice: "auto",
    });

    // 7. EXECUTE READ-ONLY DATABASE TOOLS
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      if (response.status !== "completed") {
        throw new Error("AI response was not completed.");
      }

      const toolCalls = response.output.filter(
        (item) => item.type === "function_call"
      );

      // 8. FINAL AI ANSWER
      if (toolCalls.length === 0) {
        const answer =
          response.output_text ||
          "I could not generate an answer.";

        await prisma.aIMessage.create({
          data: {
            conversationId,
            role: "assistant",
            content: answer,
          },
        });

        await prisma.aIConversation.update({
          where: {
            id: conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          answer,
          conversationId,
        });
      }

      // 9. MAXIMUM TOOL LIMIT
      if (round === MAX_TOOL_ROUNDS) {
        return NextResponse.json(
          {
            message: "Maximum AI tool execution limit reached.",
          },
          { status: 500 }
        );
      }

      input = [
        ...input,
        ...response.output,
      ];

      const toolOutputs = await Promise.all(
        toolCalls.map(async (call) => {
          try {
            const args = JSON.parse(call.arguments);

            const result = await executeAiTool(
              call.name,
              args
            );

            return {
              type: "function_call_output",
              call_id: call.call_id,
              output: JSON.stringify(result),
            };
          } catch (error) {
            console.error("AI TOOL ERROR:", error);

            return {
              type: "function_call_output",
              call_id: call.call_id,
              output: JSON.stringify({
                error: "Unable to retrieve this information.",
              }),
            };
          }
        })
      );

      input = [
        ...input,
        ...toolOutputs,
      ];

      response = await openai.responses.create({
        model: MODEL,
        instructions: SYSTEM_INSTRUCTIONS,
        input,
        tools: aiTools,
        tool_choice: "auto",
      });
    }

    return NextResponse.json(
      { message: "Unable to complete the AI response." },
      { status: 500 }
    );
  } catch (error) {
    console.error("ADMIN AI ERROR:", error);

    return NextResponse.json(
      {
        message: "AI Assistant is temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}