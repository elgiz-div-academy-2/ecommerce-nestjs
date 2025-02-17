-- CreateTable
CREATE TABLE "Content" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "slug" JSONB NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);
