import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class ChatCleanupService {
  private readonly logger = new Logger(ChatCleanupService.name);

  constructor(private readonly chatService: ChatService) {}

  // Run cleanup every day at 2:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleChatCleanup() {
    this.logger.log('Starting automatic chat cleanup...');

    try {
      const result = await this.chatService.cleanupDeletedChats();

      if (result.status === 200) {
        const cleanedCount = result.data?.cleanedCount || 0;
        this.logger.log(
          `Chat cleanup completed successfully. Cleaned up ${cleanedCount} deleted chat messages.`,
        );
      } else {
        this.logger.error('Chat cleanup failed:', result);
      }
    } catch (error) {
      this.logger.error('Error during automatic chat cleanup:', error);
    }
  }

  // Manual cleanup method for testing or immediate execution
  async manualCleanup(): Promise<void> {
    this.logger.log('Starting manual chat cleanup...');

    try {
      const result = await this.chatService.cleanupDeletedChats();

      if (result.status === 200) {
        const cleanedCount = result.data?.cleanedCount || 0;
        this.logger.log(
          `Manual chat cleanup completed successfully. Cleaned up ${cleanedCount} deleted chat messages.`,
        );
      } else {
        this.logger.error('Manual chat cleanup failed:', result);
      }
    } catch (error) {
      this.logger.error('Error during manual chat cleanup:', error);
    }
  }
}
