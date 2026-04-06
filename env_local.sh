# Supabase PostgreSQL — Supabase dashboard > Settings > Database > Connection string (URI)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-key-change-in-production-min-32-chars"

# Nodemailer (Ethereal — otomatik üretilecek, seed.ts'de log'a basılır)
EMAIL_SERVER_HOST="smtp.ethereal.email"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@padelburada.com"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
