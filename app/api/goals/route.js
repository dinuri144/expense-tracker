import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUser(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return null;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

export async function GET(req) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db(); // Default database from URI

        const goals = await db.collection('goals')
            .find({ userId: new ObjectId(user.userId) })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(goals, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { title, targetAmount, currentAmount, targetDate } = body;

        if (!title || !targetAmount) {
            return NextResponse.json({ error: 'Title and target amount are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const newGoal = {
            userId: new ObjectId(user.userId),
            title,
            targetAmount: Number(targetAmount),
            currentAmount: currentAmount ? Number(currentAmount) : 0,
            targetDate: targetDate ? new Date(targetDate) : null,
            createdAt: new Date()
        };

        const result = await db.collection('goals').insertOne(newGoal);

        return NextResponse.json({ _id: result.insertedId, ...newGoal }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}