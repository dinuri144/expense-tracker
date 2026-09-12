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


        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const expenses = await db.collection('expenses')
            .find({
                userId,
                type: { $regex: /^expense$/i },
            })
            .toArray();


        const spentByCategory = {};

        for (const exp of expenses) {
            const cat = (exp.category || 'General').trim();
            if (!cat) continue;

            // date check 
            let expDate = null;
            if (exp.date) {
                expDate = new Date(exp.date);
            } else if (exp.createdAt) {
                expDate = new Date(exp.createdAt);
            }
            if (!expDate || isNaN(expDate.getTime())) continue;
            if (expDate < monthStart || expDate > monthEnd) continue;

            const key = cat.toLowerCase();
            spentByCategory[key] = (spentByCategory[key] || 0) + Number(exp.amount || 0);
        }

        const out = budgets.map(b => {
            const catKey = (b.category || '').trim().toLowerCase();
            const calculatedSpent = spentByCategory[catKey] || 0;

            return {
                id: b._id.toString(),
                category: b.category,
                limit: b.limit,
                spent: calculatedSpent,
                createdAt: b.createdAt,
            };
        });

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