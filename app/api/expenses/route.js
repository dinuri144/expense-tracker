import clientPromise from "../../../lib/mongodb.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuthUserId(req) {
    // 1. මුලින්ම Header එකෙන් ටෝකන් එක බලමු
    const auth = req.headers.get('authorization') || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    // 2. Header එකේ නැත්නම් Cookies වලින් ටෝකන් එක ලබාගමු
    if (!token) {
        try {
            const cookieStore = await cookies();
            token = cookieStore.get('token')?.value;
        } catch (e) {
            // cookies() fail වුවහොත් ignore කරයි
        }
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

// GET - list expenses (only for authenticated user)
export async function GET(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const client = await clientPromise;
        const db = client.db();
        const items = await db
            .collection("expenses")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        const out = items.map(i => ({
            id: i._id.toString(),
            description: i.description,
            amount: i.amount,
            category: i.category,
            type: i.type,
            date: i.date,
            createdAt: i.createdAt,
        }));

        return new Response(JSON.stringify(out), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}

// POST - create expense (authenticated)
export async function POST(req) {
    try {
        const userId = await getAuthUserId(req); // await දමා ඇත
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const body = await req.json();
        if (!body || !body.description || typeof body.amount === 'undefined') {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const doc = {
            userId,
            description: body.description,
            amount: Number(body.amount),
            category: body.category || 'General',
            type: body.type || 'expense',
            date: body.date || new Date().toISOString().slice(0, 10),
            createdAt: new Date(),
        };

        const result = await db.collection('expenses').insertOne(doc);
        const created = await db.collection('expenses').findOne({ _id: result.insertedId });

        const out = {
            id: created._id.toString(),
            description: created.description,
            amount: created.amount,
            category: created.category,
            type: created.type,
            date: created.date,
            createdAt: created.createdAt,
        };

        return new Response(JSON.stringify(out), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}

// PUT - update an expense (authenticated & owner only)
export async function PUT(req) {
    try {
        const userId = await getAuthUserId(req); // await දමා ඇත
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const body = await req.json();
        const id = body && (body.id || body._id);
        if (!id) return new Response(JSON.stringify({ error: 'Missing id in body' }), { status: 400 });

        const updates = {};
        if (typeof body.description !== 'undefined') updates.description = String(body.description);
        if (typeof body.amount !== 'undefined') {
            const num = Number(body.amount);
            if (Number.isNaN(num)) return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
            updates.amount = num;
        }
        if (typeof body.category !== 'undefined') updates.category = String(body.category || 'General');
        if (typeof body.type !== 'undefined') updates.type = body.type === 'income' ? 'income' : 'expense';
        if (typeof body.date !== 'undefined') updates.date = String(body.date);

        if (Object.keys(updates).length === 0) {
            return new Response(JSON.stringify({ error: 'No updatable fields provided' }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('expenses').findOneAndUpdate(
            { _id: new ObjectId(id), userId },
            { $set: { ...updates, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return new Response(JSON.stringify({ error: 'Not found or unauthorized' }), { status: 404 });
        }

        const updated = result;
        const out = {
            userId: new ObjectId(userId),
            description: updated.description,
            amount: updated.amount,
            category: updated.category,
            type: updated.type,
            date: updated.date,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };

        return new Response(JSON.stringify(out), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}

// DELETE - delete by ?id=... (authenticated & owner only)
export async function DELETE(req) {
    try {
        const userId = await getAuthUserId(req); // await දමා ඇත
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('expenses').deleteOne({ _id: new ObjectId(id), userId });
        if (result.deletedCount === 0) {
            return new Response(JSON.stringify({ error: 'Not found or unauthorized' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}