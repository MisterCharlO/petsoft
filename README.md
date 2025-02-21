This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Install librairies

### Shadcn UI

This install also other depedencies like cn(), radix-ui
[Shadcn]
(https://ui.shadcn.com/docs/installation/next)

```bash
npx shadcn@latest init
```

Ex. command :

```bash
npx shadcn@latest add button
```

## Prisma ORM

This install Prisma using SQLite
[Prisma]
(https://www.prisma.io/docs/getting-started/quickstart-sqlite)

```bash
npm init -y
npm install typescript ts-node @types/node --save-dev
```

```bash
npm install prisma --save-dev
```

```bash
npx prisma init --datasource-provider sqlite
```

Create your data models in schema.prisma before push

```bash
npx prisma db push
```

To see your database in Prisma Studio

```bash
npx prisma studio
```

Create db.ts file into lib folder to instantiate Prisma client only once

Create a seed.ts file into prisma folder to create dummy data into DB
Add seed script into package.json
`"prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
},`

## React Hook Form

Performant, flexible and extensible forms with easy-to-use validation.
[ReactHookForm]
(https://react-hook-form.com/get-started)

```bash
npm install react-hook-form
```

## Zod

TypeScript-first schema validation with static type inference
[Zod]
(https://zod.dev/)

```bash
npm install zod
```

```bash
npm install @hookform/resolvers
```

## Production Deployment

Change SQLite to Vercel Postgres
[Vercel]
(https://vercel.com/)

Create new Vercel Database: Storage > Create database
Change Prisma database source in schema.prisma
Update environment variables in .env for DB
Prisma Seed into new DB

```
npx prisma db push
```

```
npx prisma db seed
```

Add one script for Prisma

```
"postinstall": "prisma generate"
```

Push project on GitHub (asssure .env not in repo)
Copy environment variables in Vercel Settings

