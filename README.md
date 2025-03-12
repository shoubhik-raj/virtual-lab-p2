# AI-Powered No-Code Virtual Labs Platform

A comprehensive platform that allows educators to easily create labs, experiments, and simulations without any coding knowledge. The platform leverages AI to generate interactive simulations based on simple descriptions.

## Features

- **Authentication**: GitHub OAuth integration for secure user authentication
- **Lab Creation**: Create virtual labs with detailed metadata
- **Experiment Builder**: Design experiments with aims, theory, procedures, and assessments
- **AI-Powered Simulation Builder**: Generate interactive simulations using AI without writing code
- **GitHub Integration**: Automatically commit and deploy labs, experiments, and simulations to GitHub repositories
- **Real-time Preview**: Preview simulations as you build them

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Monaco Editor for code editing
- Lucide React for icons

### Backend
- Node.js with Express.js
- MongoDB with Mongoose for data storage
- Passport.js for GitHub OAuth
- JWT for authentication
- Multer for file uploads
- Octokit for GitHub API integration
- OpenAI API for AI-powered code generation

## System Architecture

The platform follows a modular architecture with clear separation between:

1. **Frontend Layer**: React components and Redux state management
2. **Backend API Layer**: Express.js RESTful endpoints
3. **Database Layer**: MongoDB collections with Mongoose schemas
4. **External Services**: GitHub API and OpenAI API integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- GitHub OAuth App credentials
- OpenAI API key

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/ai-virtual-labs.git
cd ai-virtual-labs
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file based on `.env.example` and fill in your credentials

4. Start the development server
```
npm run dev
```

5. In a separate terminal, start the backend server
```
npm run server
```

## Usage Flow

1. **Authentication**: Log in with your GitHub account
2. **Dashboard**: View your labs, experiments, and simulations
3. **Create Lab**: Set up a new virtual lab with metadata
4. **Create Experiment**: Add experiments to your lab with theory, procedures, and assessments
5. **Create Simulation**: Use the AI-powered simulation builder to generate interactive simulations
   - Fill in the simulation details
   - Generate an AI prompt
   - Generate simulation code
   - Preview and customize the simulation
   - Save and deploy the simulation

## License

This project is licensed under the MIT License - see the LICENSE file for details.