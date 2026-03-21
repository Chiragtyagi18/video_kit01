'use client';
import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";

const urlEndPoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const fallbackEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_API_KEY;
const resolvedUrlEndpoint = urlEndPoint || fallbackEndpoint;

export default function Provider({ children}: { children: React.ReactNode }) {
    return( 
    <SessionProvider refetchInterval={5*60}>
        <ImageKitProvider urlEndpoint={resolvedUrlEndpoint}>{children}</ImageKitProvider>
        </SessionProvider>
        );
}
