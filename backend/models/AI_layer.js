const Groq = require('groq-sdk');
require('dotenv').config();
const Chat = require('../database/Chat')
const ChatSession = require('../database/ChatSession');
const mongoose = require('mongoose');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



async function main(userId, userPrompt, chatId) {
    try {

        if (chatId) {
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                throw new Error("Invalid chatId");
            }

            // Ensure chat exists and belongs to user
            const session = await ChatSession.findOne({
                _id: chatId,
                userId
            });

            if (!session) {
                throw new Error("Chat session not found");
            }

            if (session.title === 'New Chat') {
                session.title = userPrompt.length > 28 ? userPrompt.slice(0, 28) + '...' : userPrompt;
                await session.save();
            }
        }





        // Purani chat history DB se lao
        // Last 20 messages only
        const chats = await Chat.find({ userId, chatId })
            .sort({ createdAt: -1 })
            .limit(20);

        // Reverse because we fetched newest first
        // System Prompt + Chat History
        const messages = [
            {
                role: "system",
                content: `
You are Garuda AI, a helpful AI assistant.

Response Guidelines:

- Use clean Markdown formatting.
- Start with the direct answer.
- Use headings when helpful.
- Use bullet points instead of large paragraphs.
- Avoid repeating information.
- Match response length to question complexity.
- Keep simple answers short and clear.
- Use bold text for important points.
- Make responses visually appealing and easy to read.
- Do not write essays unless the user asks for detailed explanations.
- If a question is simple, answer it in under 150 words.
- If a question is complex, use sections and structured explanations.
`
            },

            ...chats.reverse().map(chat => ({
                role: chat.role,
                content: chat.content
            })),

            {
                role: "user",
                content: userPrompt
            }
        ];


        // User message save karo
        await Chat.create({
            userId,
            chatId,
            role: "user",
            content: userPrompt
        });

        const response = await groq.chat.completions.create({
            messages,
            model: "openai/gpt-oss-20b"
        });

        const aiReply =
            response.choices[0]?.message?.content || "";

        // console.log("\nAI:", aiReply, "\n");

        // AI response save karo
        await Chat.create({
            userId,
            chatId,
            role: "assistant",
            content: aiReply
        });

        return aiReply;

    }
    catch (error) {
        console.error(error);
        throw error;
    }
}




module.exports = main;