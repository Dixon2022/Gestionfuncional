# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Next-Auth Setup

This project uses Next-Auth for authentication.

**Important:** You need to set the `NEXTAUTH_SECRET` environment variable in your environment. This secret is used to sign and encrypt JWTs, sign cookies, and generate cryptographic keys. Next-Auth.js will throw an error in production if this option is not set.

You can generate a suitable secret using the following command:
`openssl rand -base64 32`

Add this secret to your environment variables (e.g., in a `.env.local` file):
`NEXTAUTH_SECRET=your_generated_secret`
