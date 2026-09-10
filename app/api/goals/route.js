import clientPromise from "../../../lib/mongodb.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

// GET - get goals for the authenticated user
export async function GET(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const goals = await db.collection('goals')
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        const out = goals.map(g => ({
            id: g._id.toString(),
            title: g.title,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            targetDate: g.targetDate,
            createdAt: g.createdAt,
        }));

        return NextResponse.json(out, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST - create a goal for the authenticated user
export async function POST(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { title, targetAmount, currentAmount, targetDate } = body;

        if (!title || typeof targetAmount === 'undefined') {
            return NextResponse.json({ error: 'Title and target amount are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const newGoal = {
            userId,
            title,
            targetAmount: Number(targetAmount),
            currentAmount: currentAmount ? Number(currentAmount) : 0,
            targetDate: targetDate ? new Date(targetDate) : null,
            createdAt: new Date()
        };

        const result = await db.collection('goals').insertOne(newGoal);

        return NextResponse.json({
            id: result.insertedId.toString(),
            ...newGoal
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// PUT - update a goal or add funds
export async function PUT(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, title, targetAmount, currentAmount, targetDate } = body;

        if (!id) {
            return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
        }

        const updates = {};
        if (typeof title !== 'undefined') updates.title = title;
        if (typeof targetAmount !== 'undefined') updates.targetAmount = Number(targetAmount);
        if (typeof currentAmount !== 'undefined') updates.currentAmount = Number(currentAmount);
        if (typeof targetDate !== 'undefined') updates.targetDate = targetDate ? new Date(targetDate) : null;
        updates.updatedAt = new Date();

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('goals').findOneAndUpdate(
            { _id: new ObjectId(id), userId },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({
            id: result._id.toString(),
            title: result.title,
            targetAmount: result.targetAmount,
            currentAmount: result.currentAmount,
            targetDate: result.targetDate,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// DELETE - delete a goal
export async function DELETE(req) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('goals').deleteOne({ _id: new ObjectId(id), userId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}