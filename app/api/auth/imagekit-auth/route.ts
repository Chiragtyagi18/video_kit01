// File: app/api/upload-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {
  try {
      const privateKey =
        process.env.IMAGEKIT_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
      const publicKey =
        process.env.IMAGEKIT_PUBLIC_KEY ?? process.env.PUBLIC_KEY;

      if (!privateKey || !publicKey) {
        return Response.json(
          { error: "ImageKit keys are not configured on the server." },
          { status: 500 }
        );
      }

      const authenticationParameters = getUploadAuthParams({
          privateKey,
          publicKey,
      });

      return Response.json({
        ...authenticationParameters,
        publicKey,
      });
  } catch (error) {
    console.error("ImageKit auth generation failed:", error);
    return Response.json(
        { error: "Failed to generate authentication parameters" },
         { status: 500 }
        )
    
  }
}
