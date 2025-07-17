-- CreateTable
CREATE TABLE "new_drops_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'New Drops',
    "subtitle" TEXT NOT NULL DEFAULT 'Fresh collections every 15 days',
    "slide_interval" INTEGER NOT NULL DEFAULT 3,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "new_drops_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_drops_slides" (
    "id" SERIAL NOT NULL,
    "slide_image" TEXT NOT NULL DEFAULT '',
    "slide_link" TEXT NOT NULL DEFAULT '',
    "slide_heading" TEXT NOT NULL DEFAULT '',
    "slide_subheading" TEXT NOT NULL DEFAULT '',
    "button_text" TEXT NOT NULL DEFAULT '',
    "logo_1" TEXT NOT NULL DEFAULT '',
    "logo_1_position" TEXT NOT NULL DEFAULT 'top-left',
    "logo_1_size" INTEGER NOT NULL DEFAULT 50,
    "logo_2" TEXT NOT NULL DEFAULT '',
    "logo_2_position" TEXT NOT NULL DEFAULT 'top-center',
    "logo_2_size" INTEGER NOT NULL DEFAULT 50,
    "logo_3" TEXT NOT NULL DEFAULT '',
    "logo_3_position" TEXT NOT NULL DEFAULT 'top-right',
    "logo_3_size" INTEGER NOT NULL DEFAULT 50,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "new_drops_slides_pkey" PRIMARY KEY ("id")
);
