import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        connectionFactory: (connection: Connection) => {
          if (connection.readyState === ConnectionStates.connected) {
            Logger.log('MongoDB Successfully Connected');
          }
          connection.on('connected', () => {
            Logger.log('Established connection to MongoDB');
          });
          connection.on('error', (error) => {
            Logger.error(`Error in the MongoDB Connection: ${error}`);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
