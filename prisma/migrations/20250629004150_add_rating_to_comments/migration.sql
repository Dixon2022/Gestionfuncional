-- Migration for adding rating column to PropertyComment
ALTER TABLE "PropertyComment" ADD COLUMN "rating" INTEGER;
