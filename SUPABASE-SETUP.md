# Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. In Project Settings > API, copy the Project URL and the `anon` public key into `supabase-config.js`.
4. Serve this folder over HTTP (for example, VS Code Live Server). Opening `index.html` directly can block browser requests.
5. Deploy the site to a static host (GitHub Pages, Netlify, Vercel, Firebase Hosting, or similar) and keep the same `supabase-config.js` values in the deployed build.

Products are stored in the Supabase `public.products` table and uploaded to the `product-images` bucket so the same catalog is visible to every visitor. Do not rely on browser local storage for product data in production.

The manager uses Supabase Auth and is restricted to the admin email configured in `supabase-config.js`. The SQL policies allow the public to read products, but only that authenticated admin account can insert, edit, delete, or upload product images. Never add a service-role key to the frontend.

## Set the separate admin password

The admin login uses a Supabase Auth password. It is separate from the Gmail password, and the app never receives or stores a Gmail password.

1. Open Supabase Dashboard > Authentication > Users.
2. Find `arshpinchoo859@gmail.com`.
3. Use the user actions menu to send a password reset email, or choose the password update option if it is available.
4. Open the reset email and set a new password privately. Do not put the password in `supabase-config.js`, GitHub, or any code file.
5. Open the private admin URL: `https://arshpinchoo.github.io/kashmir-cures/?admin=1` and sign in with the admin email and the new Supabase password.

Never share the password, the service-role key, or any other secret in chat. The frontend only uses the public anon key, while Supabase Auth and RLS enforce the admin identity.
