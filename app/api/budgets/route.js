import clientPromise from "../../../lib/mongodb.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuthUserId(req) {
    const auth = req.headers.get('authorization') || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
        try {
            const cookieStore = await cookies();
            token = cookieStore.get('token')?.value;
        } catch (e) {
            // ignore
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

// GET - get budgets for the authenticated user
export async function GET(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const budgets = await db.collection('budgets')
            .find({ userId })
            .toArray();

        const out = budgets.map(b => ({
            id: b._id.toString(),
            category: b.category,
            limit: b.limit,
            spent: b.spent || 0,
            createdAt: b.createdAt,
        }));

        return new Response(JSON.stringify(out), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

// POST - create a budget for the authenticated user
export async function POST(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const body = await req.json();
        const { category, limit, spent } = body;

        if (!category || typeof limit === 'undefined') {
            return new Response(JSON.stringify({ error: 'Category and limit are required' }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const newBudget = {
            userId,
            category,
            limit: Number(limit),
            spent: spent ? Number(spent) : 0,
            createdAt: new Date()
        };

        const result = await db.collection('budgets').insertOne(newBudget);

        return new Response(JSON.stringify({
            id: result.insertedId.toString(),
            ...newBudget
        }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

// DELETE - delete a budget by id
export async function DELETE(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('budgets').deleteOne({ _id: new ObjectId(id), userId });
        if (result.deletedCount === 0) {
            return new Response(JSON.stringify({ error: 'Not found or unauthorized' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}