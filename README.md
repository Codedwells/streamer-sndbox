# Streamer Sandbox

Streamer Sandbox is a versatile project designed to handle video streaming and file uploads efficiently. It leverages modern technologies to provide a robust and scalable solution for managing video content.

## Features

- **Video Streaming**: Supports HLS (HTTP Live Streaming) for adaptive bitrate streaming.
- **File Uploads**: Handles file uploads with ease, including large files.
- **AWS S3 Integration**: Utilizes AWS S3 for secure and scalable storage.
- **Dockerized Environment**: Simplifies development and deployment with Docker.
- **TypeScript Support**: Ensures type safety and modern JavaScript features.

## Project Structure

```
├── app.ts
├── dev.sh
├── docker-compose.override.yml
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.dev
├── package.json
├── pnpm-lock.yaml
├── prod.sh
├── README.md
├── tsconfig.json
├── controllers/
│   └── upload.Controller.ts
├── lib/
│   ├── environments.ts
│   └── s3client.ts
├── public/
│   └── index.html
├── router/
│   └── index.ts
│
└──
```

## Getting Started

### Prerequisites

- Node.js
- Docker
- AWS account (for S3 integration)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/streamer-sandbox.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your AWS credentials and other necessary configurations.

### Running the Project

#### Development

Run the development server:

```bash
./dev.sh
```

#### Production

Build and run the production server:

```bash
./prod.sh
```

#### Docker

Build and run the Docker container:

```bash
docker-compose up
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
