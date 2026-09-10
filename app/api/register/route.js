import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();
        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");

        const existing = await users.findOne({ email });
        if (existing) {
            return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 10);
        const result = await users.insertOne({ name: name || "", email, password: hashed, createdAt: new Date() });

        return new Response(JSON.stringify({ id: result.insertedId.toString(), email }), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}
