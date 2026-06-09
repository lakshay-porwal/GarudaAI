const Groq = require('groq-sdk');
require('dotenv').config();
const Chat = require('../database/Chat')




const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



async function main(userId, userPrompt) {
    try {




        // Purani chat history DB se lao
        // Last 20 messages only
        const chats = await Chat.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        // Reverse because we fetched newest first
        const messages = chats
            .reverse()
            .map(chat => ({
                role: chat.role,
                content: chat.content
            }));

        // Current user message add karo
        messages.push({
            role: "user",
            content: userPrompt
        });

        // User message save karo
        await Chat.create({
            userId,
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