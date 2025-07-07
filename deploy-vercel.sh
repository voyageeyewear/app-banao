#!/bin/bash

# App-Banao Vercel Deployment Script
# Usage: ./deploy-vercel.sh

set -e  # Exit on any error

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

echo "🚀 Starting App-Banao deployment to Vercel..."

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed. Please install npx first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Install Vercel CLI if not installed
install_vercel_cli() {
    print_status "Checking Vercel CLI..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed!"
    else
        print_success "Vercel CLI already installed!"
    fi
}

# Prepare the project
prepare_project() {
    print_status "Preparing project for deployment..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Build the project
    print_status "Building project..."
    npm run build
    
    print_success "Project prepared!"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Deploy
    vercel --prod
    
    print_success "Deployment completed!"
}

# Main deployment process
main() {
    echo "🎯 App-Banao Vercel Deployment"
    echo "================================"
    
    check_requirements
    install_vercel_cli
    prepare_project
    
    print_warning "⚠️  IMPORTANT: Before deploying, make sure you have:"
    print_warning "   1. Created a PostgreSQL database (Neon/PlanetScale/Supabase)"
    print_warning "   2. Added all environment variables to Vercel dashboard"
    print_warning "   3. Updated your Shopify app URL in Partner Dashboard"
    echo ""
    
    read -p "Are you ready to deploy? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_to_vercel
        
        echo ""
        echo "🎉 Deployment Summary:"
        echo "================================"
        print_success "✅ App deployed to Vercel!"
        print_success "✅ Visit your app at: https://your-app-name.vercel.app"
        print_success "✅ Check health: https://your-app-name.vercel.app/health"
        echo ""
        print_warning "📋 Next Steps:"
        print_warning "   1. Test your app functionality"
        print_warning "   2. Update Shopify Partner Dashboard with new URL"
        print_warning "   3. Submit to Shopify App Store"
        echo ""
        print_success "🚀 Your App-Banao is now LIVE!"
    else
        print_status "Deployment cancelled."
    fi
}

# Run the deployment
main 