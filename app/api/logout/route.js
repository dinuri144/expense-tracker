import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "token",
        value: "",
        httpOnly: true,
        path: "/",
        maxAge: 0,
    });

    return new Response(JSON.stringify({ message: "Logged out" }), { status: 200 });
}