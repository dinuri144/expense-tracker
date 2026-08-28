import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");

        const user = await users.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Login successful", user: { name: user.name, email: user.email } }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}