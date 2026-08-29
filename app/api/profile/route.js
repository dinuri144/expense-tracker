import clientPromise from "../../../lib/mongodb.js";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// 1. GET Method - යුසර් ප්‍රොෆයිල් ඩේටා ලබා ගැනීම
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne(
            { email },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 2. PUT Method - යුසර් ප්‍රොෆයිල් ඩේටා අප්ඩේට් කිරීම
export async function PUT(request) {
    try {
        const body = await request.json();
        const { email, name, currency, theme } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const updateResult = await db.collection("users").updateOne(
            { email },
            {
                $set: {
                    name,
                    currency,
                    theme,
                    updatedAt: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ success: false, error: "User not found in database" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Profile updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}