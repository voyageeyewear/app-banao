#!/bin/bash

# App-Banao Vercel Setup Script
# This script helps you prepare for Vercel deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🔧 App-Banao Vercel Setup"
echo "=========================="
echo ""

# Check Node.js version
print_status "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    exit 1
fi

# Check npm
print_status "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm is not installed!"
    exit 1
fi

# Check if Vercel CLI is installed
print_status "Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    print_success "Vercel CLI version: $VERCEL_VERSION"
else
    print_warning "Vercel CLI is not installed."
    read -p "Do you want to install it now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed!"
    else
        print_error "Vercel CLI is required for deployment."
        exit 1
    fi
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    print_success "Logged in to Vercel as: $VERCEL_USER"
else
    print_warning "Not logged in to Vercel."
    read -p "Do you want to login now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel login
        print_success "Successfully logged in to Vercel!"
    else
        print_warning "You can login later with 'vercel login'"
    fi
fi

# Check package.json
print_status "Checking package.json..."
if [ -f "package.json" ]; then
    print_success "package.json found"
else
    print_error "package.json not found!"
    exit 1
fi

# Check Prisma schema
print_status "Checking Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
    
    # Check if database is PostgreSQL
    if grep -q "postgresql" prisma/schema.prisma; then
        print_success "Database configured for PostgreSQL"
    else
        print_warning "Database is not configured for PostgreSQL"
        print_warning "You'll need to update prisma/schema.prisma for production"
    fi
else
    print_error "Prisma schema not found!"
    exit 1
fi

# Check vercel.json
print_status "Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    print_success "vercel.json found"
else
    print_error "vercel.json not found!"
    exit 1
fi

# Check environment template
print_status "Checking environment template..."
if [ -f "vercel-env-template.txt" ]; then
    print_success "Environment template found"
else
    print_error "Environment template not found!"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed!"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated!"

# Build the project
print_status "Building project..."
npm run build
print_success "Project built successfully!"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
print_success "✅ Node.js and npm are ready"
print_success "✅ Vercel CLI is installed"
print_success "✅ Project dependencies are installed"
print_success "✅ Prisma client is generated"
print_success "✅ Project builds successfully"
echo ""

print_warning "📋 Next Steps:"
print_warning "1. Set up a PostgreSQL database (Neon, PlanetScale, or Supabase)"
print_warning "2. Copy environment variables from vercel-env-template.txt"
print_warning "3. Add environment variables to your Vercel project"
print_warning "4. Run './deploy-vercel.sh' to deploy"
echo ""

print_success "🚀 You're ready to deploy to Vercel!"
print_success "Run: ./deploy-vercel.sh" 