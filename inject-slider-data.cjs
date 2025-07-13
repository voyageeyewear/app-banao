#!/usr/bin/env node

/**
 * GoEye Store - Slider Data Injection Script
 * Injects current slider data from database into mobile-app.html
 * This ensures APK always has the latest slider configuration
 */

const fs = require('fs').promises;
const path = require('path');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Database connection using Prisma
async function getSliderDataFromDatabase() {
    try {
        log('blue', '🔍 Connecting to database to get latest slider data...');
        
        // Use dynamic import for Prisma client
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        try {
            // Get slider config from database
            const sliderConfig = await prisma.sliderConfig.findFirst({
                where: { id: 1 }
            });
            
            if (sliderConfig) {
                log('green', `✅ Found slider config in database: ${Array.isArray(sliderConfig.slides) ? sliderConfig.slides.length : 0} slides`);
                
                return {
                    enabled: sliderConfig.enabled,
                    slides: sliderConfig.slides,
                    settings: sliderConfig.settings,
                    lastUpdate: sliderConfig.updatedAt.getTime()
                };
            } else {
                log('yellow', '⚠️ No slider config found in database, using defaults');
                return getDefaultSliderData();
            }
        } finally {
            await prisma.$disconnect();
        }
    } catch (error) {
        log('yellow', `⚠️ Database connection failed: ${error.message}`);
        log('blue', '📋 Using default slider data as fallback');
        return getDefaultSliderData();
    }
}

// Default fallback data
function getDefaultSliderData() {
    return {
        enabled: true,
        slides: [
            {
                id: '1',
                title: 'Welcome to GoEye Store',
                description: 'Premium Eyewear Collection - Discover the perfect frames for your style',
                image: 'https://cdn.shopify.com/s/files/1/0756/1350/3718/files/goeye-hero-slide-1.jpg?v=1735729200',
                buttonText: 'Shop Now',
                buttonUrl: '/products'
            },
            {
                id: '2',
                title: 'Featured Products',
                description: 'Explore our latest collection of designer eyewear and sunglasses',
                image: 'https://cdn.shopify.com/s/files/1/0756/1350/3718/files/goeye-hero-slide-2.jpg?v=1735729200',
                buttonText: 'View Collection',
                buttonUrl: '/collections/featured'
            }
        ],
        settings: {
            autoPlay: true,
            autoPlaySpeed: 5000,
            showArrows: true,
            showDots: true
        },
        lastUpdate: Date.now()
    };
}

async function injectSliderData() {
    try {
        log('cyan', '🔍 Slider Data Injection Starting...');
        
        // Paths
        const sourceFile = path.join(__dirname, 'build/client/mobile-app.html');
        const targetFile = path.join(__dirname, 'build/client/mobile-app-with-data.html');
        
        log('blue', `📖 Reading mobile-app.html from: ${sourceFile}`);
        
        // Read the mobile app HTML file
        let htmlContent = await fs.readFile(sourceFile, 'utf8');
        
        // Get current slider data from database
        const sliderData = await getSliderDataFromDatabase();
        
        log('green', `✅ Retrieved slider data: ${sliderData.slides.length} slides`);
        log('blue', `   Settings: autoPlay=${sliderData.settings.autoPlay}, speed=${sliderData.settings.autoPlaySpeed}ms`);
        
        // Create JavaScript code to inject
        const injectionCode = `
        // Auto-injected slider data from build time
        window.SLIDER_CONFIG = ${JSON.stringify(sliderData, null, 2)};
        console.log('📱 Embedded slider config loaded from build-time injection:', window.SLIDER_CONFIG);
        `;
        
        // Find the place to inject (before the closing </script> tag of the main script)
        const scriptEndPattern = /(.*<\/script>\s*<\/body>\s*<\/html>\s*)$/s;
        const scriptStartPattern = /(<script>\s*\/\/ Global variables)/;
        
        if (scriptStartPattern.test(htmlContent)) {
            // Inject right after the global variables declaration
            htmlContent = htmlContent.replace(
                scriptStartPattern,
                `$1${injectionCode}`
            );
            
            log('green', '✅ Slider data injected successfully');
        } else {
            log('yellow', '⚠️  Could not find injection point, adding before closing script tag');
            htmlContent = htmlContent.replace(
                '</script>\n</body>',
                `${injectionCode}\n    </script>\n</body>`
            );
        }
        
        // Write the modified file
        await fs.writeFile(targetFile, htmlContent, 'utf8');
        log('green', `✅ Enhanced mobile app saved to: ${targetFile}`);
        
        // Also create the index.html file directly
        const indexFile = path.join(__dirname, 'build/client/index.html');
        await fs.writeFile(indexFile, htmlContent, 'utf8');
        log('green', `✅ Created index.html with embedded data`);
        
        log('green', '🎉 Slider data injection completed successfully!');
        
        return true;
        
    } catch (error) {
        log('red', `❌ Error during slider data injection: ${error.message}`);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    injectSliderData().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = injectSliderData; 