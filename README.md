# Pull Request Viewer

A web application for viewing and managing pull requests across multiple Azure DevOps projects in a centralized dashboard.

## Features

- **Multi-Project Support**: View pull requests from multiple Azure DevOps projects simultaneously
- **Project Filtering**: Select and filter which projects to display pull requests from
- **Project Persistence**: Your selected projects are automatically saved to browser storage
- **Manual Refresh**: Refresh pull request data on demand with a single click
- **Real-time Status**: Visual loading indicators and status messages while fetching data
- **Error Handling**: Clear error messages for configuration and API issues
- **Clean UI**: Modern, responsive interface built with Tailwind CSS

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **API Integration**: Azure DevOps REST API
- **Linting**: ESLint

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Azure DevOps Account** with:
  - Access to your organization and projects
  - A Personal Access Token (PAT) with appropriate permissions

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PullRequestViewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the root directory of the project:

```bash
touch .env
```

Add the following environment variables:

```
VITE_ADO_ORG=your-organization-name
VITE_ADO_PAT=your-personal-access-token
```

**Note**: 
- `VITE_ADO_ORG`: Your Azure DevOps organization name (e.g., `mycompany`)
- `VITE_ADO_PAT`: Your Azure DevOps Personal Access Token with at least `Code (Read)` permissions

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` by default. Your browser should open automatically.

## Usage

1. **Select Projects**: The sidebar will load all available projects from your Azure DevOps organization
2. **Apply Filter**: Click the **Apply** button to load pull requests for selected projects
3. **View Pull Requests**: The main panel displays all pull requests from selected projects
4. **Refresh Data**: Click the **Refresh** button in the top bar to update pull request data
5. **Persistent Selection**: Your selected projects are saved automatically and restored when you revisit the app

## Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Build for Production

```bash
npm run build
```

The optimized build will be generated in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## Troubleshooting

### Configuration Error: Missing Environment Variables

If you see a configuration error, ensure your `.env` file contains both required variables:

```
VITE_ADO_ORG=your-organization-name
VITE_ADO_PAT=your-personal-access-token
```

After updating `.env`, restart the development server.

### Unable to Load Projects

- Verify your Personal Access Token is valid and has `Code (Read)` permissions
- Ensure your organization name is correct
- Check your internet connection and Azure DevOps availability

### Pull Requests Not Showing

- Ensure you have selected at least one project
- Click the **Apply** button to confirm your selection
- Try clicking **Refresh** to reload data

## Project Structure

```
src/
├── api/              # Azure DevOps API integration
├── components/       # React components
├── hooks/           # Custom React hooks
├── App.tsx          # Main application component
├── config.ts        # Configuration and environment variables
├── main.tsx         # Application entry point
└── types.ts         # TypeScript type definitions
```
