import clientPromise from "../../../lib/mongodb.js";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuthUserId(req) {
    const auth = req.headers.get('authorization') || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
        try {
            const cookieStore = await cookies();
            token = cookieStore.get('token')?.value;
        } catch (e) { }
    }

    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    try {
        const payload = jwt.verify(token, secret);
        return payload && (payload.sub || payload.userId || payload.id) ? String(payload.sub || payload.userId || payload.id) : null;
    } catch (err) {
        return null;
    }
}

export async function GET(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const client = await clientPromise;
        const db = client.db();
        const settings = await db.collection("settings").findOne({ userId });

        // Default values එක්ක currency එකත් යවන්න
        return new Response(JSON.stringify(settings || { monthlyBudget: 0, weeklyBudget: 0, currency: '$' }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const body = await req.json();
        const client = await clientPromise;
        const db = client.db();

        const updateData = {
            userId,
            monthlyBudget: Number(body.monthlyBudget || 0),
            weeklyBudget: Number(body.weeklyBudget || 0),
            currency: body.currency || '$', // Frontend එකෙන් එවන currency එක save කරගන්න
            updatedAt: new Date()
        };

        await db.collection("settings").updateOne(
            { userId },
            { $set: updateData },
            { upsert: true }
        );

        return new Response(JSON.stringify({ success: true, ...updateData }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}