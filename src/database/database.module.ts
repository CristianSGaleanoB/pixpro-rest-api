import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { AppLogger } from '../common/services/app-logger.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        connectionFactory: (connection: Connection) => {
          const logger = new AppLogger('MongoDB');
          const host = configService.get<string>('database.host') || 'localhost';

          if (connection.readyState === ConnectionStates.connected) {
            logger.databaseConnected('MongoDB', host);
          }

          connection.on('connected', () => {
            logger.databaseConnected('MongoDB', host);
          });

          connection.on('error', (error: string) => {
            logger.error(`Connection error: ${error}`);
          });

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
