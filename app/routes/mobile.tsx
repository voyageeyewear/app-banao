import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const mobileAppHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoEye Store</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: white;
            color: #333;
            line-height: 1.6;
            padding-bottom: 80px; /* Space for bottom navigation */
        }

        /* Announcement Bar Styles */
        .announcement-bar {
            background: var(--announcement-background-color, #1E1B4B);
            color: var(--announcement-text-color, #ffffff);
            padding: 8px 0;
            text-align: center;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            z-index: 21;
            overflow: hidden;
            width: 100%;
            display: block;
        }

        .announcement-content {
            position: relative;
            display: inline-block;
            animation: scrollText var(--announcement-scroll-speed, 5000ms) infinite linear;
        }

        .announcement-text {
            white-space: nowrap;
            display: inline-block;
        }

        @keyframes scrollText {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }

        /* Header Styles */
        .header {
            background: white;
            padding: 15px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: relative;
            z-index: 20;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1E1B4B;
        }

        .header-icons {
            display: flex;
            gap: 15px;
        }

        .header-icon {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        /* Navigation Styles */
        .nav-tabs {
            display: flex;
            justify-content: space-around;
            background: white;
            padding: 10px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            list-style: none;
            margin: 0;
        }

        .nav-tabs li {
            flex: 1;
            text-align: center;
        }

        .nav-tabs a {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 12px;
            text-decoration: none;
            color: #6B7280;
            font-size: 12px;
            transition: all 0.3s ease;
            position: relative;
        }

        .nav-tabs a.active {
            color: #1E1B4B;
            font-weight: 600;
        }

        .nav-tabs a.active::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 3px;
            background: #1E1B4B;
            border-radius: 2px;
        }

        .nav-tab-icon {
            width: 20px;
            height: 20px;
            margin-bottom: 4px;
        }

        .nav-tab-icon svg {
            width: 100%;
            height: 100%;
            fill: currentColor;
        }

        /* Main Content */
        .main-content {
            padding: 20px;
            min-height: 60vh;
        }

        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }

        .welcome-title {
            font-size: 28px;
            font-weight: bold;
            color: #1E1B4B;
            margin-bottom: 10px;
        }

        .welcome-subtitle {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 20px;
        }

        .debug-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4caf50;
        }

        .debug-title {
            font-weight: bold;
            color: #4caf50;
            margin-bottom: 10px;
        }

        .debug-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }

        /* Loading Animation */
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }

        .spinner {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #1E1B4B;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <!-- Announcement Bar -->
    <div class="announcement-bar" id="announcement-bar">
        <div class="announcement-content">
            <span class="announcement-text" id="announcement-text">
                Free shipping on orders over $50! 🚚
            </span>
        </div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">GoEye Store</div>
            <div class="header-icons">
                <svg class="header-icon" viewBox="0 0 24 24">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19"/>
                </svg>
                <svg class="header-icon" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <svg class="header-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
        </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="navigation">
        <ul class="nav-tabs" id="nav-tabs">
            <li>
                <a href="#" class="active">
                    <span class="nav-tab-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </span>
                    All
                </a>
            </li>
            <li>
                <a href="#">
                    <span class="nav-tab-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </span>
                    Classic
                </a>
            </li>
            <li>
                <a href="#">
                    <span class="nav-tab-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </span>
                    Premium
                </a>
            </li>
        </ul>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <div class="welcome-section">
            <h1 class="welcome-title">Welcome to GoEye Store</h1>
            <p class="welcome-subtitle">Premium Eyewear Collection</p>
        </div>

        <div class="debug-info">
            <div class="debug-title">✅ Dynamic Navigation Test</div>
            <div class="debug-text">Base navigation items loaded: 3 (All, Classic, Premium)</div>
            <div class="debug-text">Dynamic navigation will load from API...</div>
            <div class="debug-text">Expected: Additional items like "Prescription" should appear</div>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Loading dynamic navigation...</p>
        </div>
    </main>

    <script>
        // Global variables
        const API_BASE = window.location.origin;
        
        console.log('📱 GoEye Store Mobile App - Starting...');
        console.log('🔗 API Base:', API_BASE);

        // Load Header Settings for Navigation and Announcement Bar
        async function loadHeaderSettings() {
            try {
                console.log('🎨 Loading header settings for navigation and announcement bar...');
                const response = await fetch(\`\${API_BASE}/api/header-settings\`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('📊 Header settings loaded:', data);
                    
                    // Load navigation items
                    if (data.nav_items) {
                        loadNavigationItems(data.nav_items);
                        console.log('✅ Navigation items loaded successfully');
                    }
                    
                    // Load announcement bar
                    if (data.announcement_bar) {
                        loadAnnouncementBar(data.announcement_bar);
                        console.log('✅ Announcement bar loaded successfully');
                    }

                    // Hide loading indicator
                    document.getElementById('loading').style.display = 'none';
                } else {
                    console.error('❌ Failed to load header settings:', response.status);
                    document.getElementById('loading').innerHTML = '<p>Failed to load navigation data</p>';
                }
            } catch (error) {
                console.error('❌ Header settings failed:', error);
                document.getElementById('loading').innerHTML = '<p>Error loading navigation data</p>';
            }
        }

        // Load Navigation Items (replaces existing navigation)
        function loadNavigationItems(navItems) {
            const navTabs = document.getElementById('nav-tabs');
            if (!navTabs) return;

            console.log('🎯 Loading dynamic navigation items:', navItems);

            // Always replace if we have items from API
            if (navItems && navItems.length > 0) {
                console.log('📱 Replacing static navigation with dynamic items');
                navTabs.innerHTML = '';

                // Filter enabled items and sort by order
                const enabledItems = navItems.filter(item => item.enabled).sort((a, b) => a.order - b.order);

                if (enabledItems.length > 0) {
                    enabledItems.forEach((item, index) => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        
                        a.href = item.link || '#';
                        a.className = index === 0 ? 'active' : '';
                        
                        // Create icon span
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'nav-tab-icon';
                        
                        // Get appropriate icon for each tab
                        const iconSVG = getNavIcon(item.title.toLowerCase());
                        iconSpan.innerHTML = iconSVG;
                        
                        a.appendChild(iconSpan);
                        a.appendChild(document.createTextNode(' ' + item.title));
                        
                        // Add click event
                        a.addEventListener('click', function(e) {
                            e.preventDefault();
                            // Remove active class from all tabs
                            navTabs.querySelectorAll('a').forEach(tab => tab.classList.remove('active'));
                            // Add active class to clicked tab
                            a.classList.add('active');
                        });
                        
                        li.appendChild(a);
                        navTabs.appendChild(li);
                    });

                    console.log('✅ Dynamic navigation loaded successfully with', enabledItems.length, 'items');
                } else {
                    console.log('⚠️ No enabled dynamic items, keeping static navigation');
                }
            } else {
                console.log('⚠️ No dynamic items provided, keeping static navigation');
            }
        }

        // Get navigation icon SVG based on title
        function getNavIcon(title) {
            const icons = {
                'all': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>',
                'classic': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>',
                'premium': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>',
                'prescription': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
                'default': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>'
            };
            return icons[title] || icons['default'];
        }

        // Load Announcement Bar
        function loadAnnouncementBar(announcementData) {
            const announcementBar = document.getElementById('announcement-bar');
            const announcementText = document.getElementById('announcement-text');
            
            if (!announcementBar || !announcementText) return;

            if (announcementData.enabled) {
                // Set announcement text
                announcementText.textContent = announcementData.text || 'Free shipping on orders over $50! 🚚';
                
                // Set CSS variables for colors and animation speed
                const root = document.documentElement;
                root.style.setProperty('--announcement-background-color', announcementData.background_color || '#1E1B4B');
                root.style.setProperty('--announcement-text-color', announcementData.text_color || '#ffffff');
                root.style.setProperty('--announcement-scroll-speed', \`\${announcementData.scroll_speed || 5000}ms\`);
                
                // Show announcement bar
                announcementBar.style.display = 'block';
            } else {
                // Hide announcement bar
                announcementBar.style.display = 'none';
            }
        }

        // Load header settings on page load
        loadHeaderSettings();

        console.log('📱 GoEye Store Mobile App - All scripts loaded');
    </script>
</body>
</html>
  `;

  return new Response(mobileAppHtml, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}; 