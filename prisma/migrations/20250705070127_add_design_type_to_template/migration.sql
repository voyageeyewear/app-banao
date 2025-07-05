-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "designType" TEXT NOT NULL DEFAULT 'homepage',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Template" ("createdAt", "data", "id", "name", "updatedAt") SELECT "createdAt", "data", "id", "name", "updatedAt" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
