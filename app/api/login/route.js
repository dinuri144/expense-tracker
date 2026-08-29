import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return new Response(JSON.stringify({ error: "JWT_SECRET is not configured" }), { status: 500 });
        }

        // JWT Token එක generate කරගැනීම
        const token = jwt.sign(
            { sub: user._id.toString(), email: user.email },
            secret,
            { expiresIn: '7d' }
        );

        // මෙතන await එකක් දාලා cookies unwrap කරගන්න
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // දින 7ක්
        });

        return new Response(
            JSON.stringify({
                message: "Login successful",
                user: { name: user.name, email: user.email }
            }),
            { status: 200 }
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
}