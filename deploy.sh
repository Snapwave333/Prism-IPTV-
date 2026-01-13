#!/bin/bash

###############################################################################
# Prism IPTV Complete Deployment Script
# Builds and deploys all services with latest enhancements
###############################################################################

set -e  # Exit on error

echo "======================================"
echo "Prism IPTV Deployment Script v2.0"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_step() {
    echo ""
    echo "======================================"
    echo "$1"
    echo "======================================"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking Prerequisites"

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi

    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python installed: $PYTHON_VERSION"
    else
        print_error "Python not found. Please install Python 3.10+"
        exit 1
    fi

    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker installed: $DOCKER_VERSION"
    else
        print_warning "Docker not found. Docker deployment will be skipped."
    fi

    # Check Ollama
    if command -v ollama &> /dev/null; then
        print_success "Ollama installed"
    else
        print_warning "Ollama not found. LLaMA 3.2 will need manual installation."
    fi
}

# Install Python dependencies
install_python_deps() {
    print_step "Installing Python Dependencies"

    cd lumen-mascot

    # Create virtual environment if not exists
    if [ ! -d "venv" ]; then
        print_warning "Creating Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate || source venv/Scripts/activate

    # Upgrade pip
    pip install --upgrade pip

    # Install requirements
    print_warning "Installing Python packages (this may take a while)..."
    pip install -r requirements.txt

    print_success "Python dependencies installed"

    cd ..
}

# Install Node dependencies
install_node_deps() {
    print_step "Installing Node.js Dependencies"

    # Frontend
    print_warning "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"

    # Node server
    print_warning "Installing server dependencies..."
    cd server
    npm install
    cd ..
    print_success "Server dependencies installed"

    # MCP servers
    print_warning "Installing MCP server dependencies..."
    cd mcp-servers
    npm install
    npm run build
    cd ..
    print_success "MCP servers built"
}

# Download AI models
download_models() {
    print_step "Downloading AI Models"

    # Pull LLaMA 3.2
    if command -v ollama &> /dev/null; then
        print_warning "Pulling LLaMA 3.2 (this may take several minutes)..."
        ollama pull llama3.2:3b-instruct-q4_K_M
        print_success "LLaMA 3.2 downloaded"
    else
        print_warning "Ollama not installed. Skipping LLaMA download."
    fi

    # Whisper v3 will auto-download on first use
    print_warning "Whisper v3 Large will download automatically on first use (~3GB)"
}

# Build frontend
build_frontend() {
    print_step "Building Frontend"

    npm run build
    print_success "Frontend built successfully"
}

# Setup environment
setup_environment() {
    print_step "Setting Up Environment"

    # Copy env template if not exists
    if [ ! -f "lumen-mascot/.env" ]; then
        if [ -f "lumen-mascot/.env.example" ]; then
            cp lumen-mascot/.env.example lumen-mascot/.env
            print_warning "Created .env file. Please configure API keys!"
        fi
    fi

    # Copy MCP env
    if [ ! -f "mcp-servers/.env" ]; then
        if [ -f "mcp-servers/.env.example" ]; then
            cp mcp-servers/.env.example mcp-servers/.env
            print_warning "Created MCP .env file. Please configure API keys!"
        fi
    fi

    print_success "Environment files created"
}

# Docker deployment
deploy_docker() {
    print_step "Docker Deployment"

    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Skipping Docker deployment."
        return
    fi

    read -p "Deploy with Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Building Docker images..."
        cd docker
        docker-compose build
        print_success "Docker images built"

        print_warning "Starting containers..."
        docker-compose up -d
        print_success "Containers started"

        echo ""
        echo "Docker services running:"
        docker-compose ps
        cd ..
    fi
}

# Start services (non-Docker)
start_services() {
    print_step "Starting Services"

    read -p "Start services now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Start Ollama (if needed)
        if command -v ollama &> /dev/null; then
            ollama serve &
            sleep 5
        fi

        # Start AI backend
        print_warning "Starting AI backend..."
        cd lumen-mascot
        source venv/bin/activate || source venv/Scripts/activate
        python3 main.py &
        AI_PID=$!
        cd ..
        sleep 5
        print_success "AI backend started (PID: $AI_PID)"

        # Start Node server
        print_warning "Starting Node server..."
        cd server
        npm run dev &
        SERVER_PID=$!
        cd ..
        sleep 3
        print_success "Node server started (PID: $SERVER_PID)"

        # Start frontend
        print_warning "Starting frontend..."
        npm run dev &
        FRONTEND_PID=$!
        sleep 3
        print_success "Frontend started (PID: $FRONTEND_PID)"

        echo ""
        echo "========================================"
        echo "✓ All services running!"
        echo "========================================"
        echo "Frontend:  http://localhost:3000"
        echo "API:       http://localhost:3001"
        echo "AI:        http://localhost:8000"
        echo ""
        echo "Press Ctrl+C to stop all services"
        echo ""

        # Wait for Ctrl+C
        trap "kill $AI_PID $SERVER_PID $FRONTEND_PID; exit" INT
        wait
    fi
}

# Run tests
run_tests() {
    print_step "Running Tests"

    read -p "Run tests? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Python tests
        print_warning "Running Python tests..."
        cd lumen-mascot
        source venv/bin/activate || source venv/Scripts/activate
        pytest tests/ -v
        cd ..

        # Frontend tests
        print_warning "Running frontend tests..."
        npm test

        print_success "All tests completed"
    fi
}

# Main deployment flow
main() {
    echo ""
    echo "This script will:"
    echo "1. Check prerequisites"
    echo "2. Install all dependencies"
    echo "3. Download AI models"
    echo "4. Build frontend"
    echo "5. Setup environment"
    echo "6. Optionally deploy with Docker"
    echo "7. Optionally start services"
    echo ""

    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi

    check_prerequisites
    install_python_deps
    install_node_deps
    download_models
    build_frontend
    setup_environment
    deploy_docker
    run_tests
    start_services

    echo ""
    print_success "Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Configure API keys in lumen-mascot/.env and mcp-servers/.env"
    echo "2. Access the app at http://localhost:3000"
    echo "3. Check logs for any errors"
    echo "4. Review UPGRADE_GUIDE.md for detailed configuration"
    echo ""
}

# Run main
main
