-- CreateTable
CREATE TABLE "shark_tank_products" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "video" TEXT,
    "tag" TEXT NOT NULL DEFAULT '',
    "showTag" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shark_tank_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "looks_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title_cursive" TEXT NOT NULL DEFAULT 'Style',
    "title_bold" TEXT NOT NULL DEFAULT 'FINDER',
    "subtitle" TEXT NOT NULL DEFAULT 'Discover every look, for every you',
    "men_tab_text" TEXT NOT NULL DEFAULT 'Men',
    "women_tab_text" TEXT NOT NULL DEFAULT 'Women',
    "men_explore_title" TEXT NOT NULL DEFAULT 'Men',
    "men_explore_subtitle" TEXT NOT NULL DEFAULT 'Explore All',
    "men_explore_link" TEXT NOT NULL DEFAULT '',
    "women_explore_title" TEXT NOT NULL DEFAULT 'Women',
    "women_explore_subtitle" TEXT NOT NULL DEFAULT 'Explore All',
    "women_explore_link" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "looks_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "looks_cards" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "productId" TEXT NOT NULL DEFAULT '',
    "collectionId" TEXT NOT NULL DEFAULT '',
    "productTitle" TEXT NOT NULL DEFAULT '',
    "collectionTitle" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "looks_cards_pkey" PRIMARY KEY ("id")
);
