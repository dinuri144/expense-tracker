"use client";
import { useState, useEffect } from "react";
import { readCurrencyFromStorage } from "../lib/currency";

export default function useCurrency() {
    const [symbol, setSymbol] = useState("$");

    useEffect(() => {
        const update = () => setSymbol(readCurrencyFromStorage());
        update();
        window.addEventListener("userDataChanged", update);
        return () => window.removeEventListener("userDataChanged", update);
    }, []);

    return symbol;
}