-- Public loan applications create a lead user before that person has an account.
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
