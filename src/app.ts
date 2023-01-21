import { config } from '@root/config';
import databaseConnection from '@root/setupDatabase';
import { ChattyServer } from '@root/setupServer';
import express from 'express';

class Application {
  public initialize(): void {
    this.loadConfig();

    databaseConnection();

    const app = express();
    const server = new ChattyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application = new Application();

application.initialize();
