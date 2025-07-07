#!/bin/bash

# App-Banao Production Deployment Script
# Usage: ./deploy.sh [platform]
# Platforms: render, railway, digitalocean, vercel

set -e  # Exit on any error

PLATFORM=${1:-render}  # Default to render

echo "🚀 Starting App-Banao deployment to $PLATFORM..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Build the application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set"
    fi
    
    if [ -z "$SHOPIFY_API_KEY" ]; then
        print_warning "SHOPIFY_API_KEY not set"
    fi
    
    if [ -z "$SHOPIFY_API_SECRET" ]; then
        print_warning "SHOPIFY_API_SECRET not set"
    fi
    
    print_success "Environment check completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if [ -n "$DATABASE_URL" ]; then
        npm run prisma generate
        npm run prisma migrate deploy
        print_success "Database setup completed"
    else
        print_warning "DATABASE_URL not set, skipping database setup"
    fi
}

# Platform-specific deployment
deploy_to_platform() {
    print_status "Deploying to $PLATFORM..."
    
    case $PLATFORM in
        "render")
            print_status "Render deployment - push to git repository"
            git add .
            git commit -m "Deploy to production $(date)"
            git push origin main
            print_success "Pushed to git. Check Render dashboard for deployment status."
            ;;
        "railway")
            if command -v railway &> /dev/null; then
                railway up
                print_success "Deployed to Railway"
            else
                print_error "Railway CLI not installed. Install with: npm install -g @railway/cli"
                exit 1
            fi
            ;;
        "vercel")
            if command -v vercel &> /dev/null; then
                vercel --prod
                print_success "Deployed to Vercel"
            else
                print_error "Vercel CLI not installed. Install with: npm install -g vercel"
                exit 1
            fi
            ;;
        "digitalocean")
            print_status "DigitalOcean App Platform - push to git repository"
            git add .
            git commit -m "Deploy to production $(date)"
            git push origin main
            print_success "Pushed to git. Check DigitalOcean dashboard for deployment status."
            ;;
        *)
            print_error "Unknown platform: $PLATFORM"
            print_status "Supported platforms: render, railway, digitalocean, vercel"
            exit 1
            ;;
    esac
}

# Create production checklist
create_checklist() {
    print_status "Creating post-deployment checklist..."
    
    cat > deployment-checklist.md << EOF
# 📋 Post-Deployment Checklist

## Immediate Actions (0-24 hours)
- [ ] Verify app is accessible at production URL
- [ ] Test Shopify app installation flow
- [ ] Check database connectivity: curl https://your-app.com/health
- [ ] Verify PDP activation works
- [ ] Test template save/load functionality
- [ ] Monitor error logs

## Week 1 Actions
- [ ] Set up monitoring alerts
- [ ] Test mobile app functionality
- [ ] Gather initial user feedback
- [ ] Plan first updates

## Environment Variables Checklist
- [ ] DATABASE_URL configured
- [ ] SHOPIFY_API_KEY configured  
- [ ] SHOPIFY_API_SECRET configured
- [ ] SHOPIFY_APP_URL configured
- [ ] NODE_ENV=production
- [ ] SESSION_SECRET configured

## Shopify App Store Preparation
- [ ] App functionality complete
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Privacy policy created
- [ ] Support email configured
- [ ] Pricing model defined

## URLs to Test
- [ ] https://your-app.com/health (should return healthy status)
- [ ] https://your-app.com/app (main app interface)
- [ ] https://your-app.com/products/test-product (PDP functionality)

Generated on: $(date)
EOF

    print_success "Checklist created: deployment-checklist.md"
}

# Main deployment flow
main() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 App-Banao Deployment                    ║"
    echo "║                      Production Ready                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_requirements
    check_env
    install_dependencies
    build_app
    setup_database
    deploy_to_platform
    create_checklist
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ Deployment Complete!                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "App-Banao has been deployed to $PLATFORM!"
    print_status "Next steps:"
    echo "  1. Check deployment-checklist.md for post-deployment tasks"
    echo "  2. Test your app at the production URL"
    echo "  3. Submit to Shopify App Store when ready"
    echo "  4. Monitor https://your-app.com/health for app status"
    echo ""
    print_status "Need help? Check DEPLOYMENT.md for detailed instructions."
}

# Run main function
main 