import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Otp } from 'src/models/model.otp';
import { Op } from 'sequelize';

@Injectable()
export class OtpCleanupService {
  private readonly logger = new Logger(OtpCleanupService.name);

  constructor(
    @InjectModel(Otp)
    private readonly otpModel: typeof Otp,
  ) {}

  // Automatic cleanup DISABLED - OTP records are kept forever in the database
  // Expired OTPs (>5 minutes) cannot be used for login but remain in DB
  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleOtpCleanup() {
  //   return await this.cleanupOldOtps();
  // }

  // Automatic cleanup method - deletes OTPs older than 5 minutes
  async cleanupOldOtps() {
    try {
      this.logger.log('=== OTP cleanupOldOtps: Starting ===');

      // Calculate date 5 minutes ago
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      this.logger.log(
        `Cleaning up OTPs created before: ${fiveMinutesAgo.toISOString()}`,
      );

      // Find all OTPs created more than 5 minutes ago
      const oldOtps = await this.otpModel.findAll({
        where: {
          createdAt: {
            [Op.lt]: fiveMinutesAgo,
          },
        },
      });

      this.logger.log(`Found OTPs to cleanup: ${oldOtps.length}`);

      if (oldOtps.length === 0) {
        this.logger.log('=== OTP cleanupOldOtps: No OTPs to cleanup ===');
        return {
          status: 200,
          data: { cleanedCount: 0 },
        };
      }

      // Get IDs for logging
      const otpIds = oldOtps.map((otp) => otp.id);

      // Permanently delete the OTPs
      await this.otpModel.destroy({
        where: {
          id: {
            [Op.in]: otpIds,
          },
        },
      });

      this.logger.log('=== OTP cleanupOldOtps: Success ===');
      this.logger.log(`Permanently deleted OTPs: ${otpIds.length}`);

      return {
        status: 200,
        data: {
          cleanedCount: oldOtps.length,
          deletedOtpIds: otpIds,
        },
      };
    } catch (error) {
      this.logger.error('=== OTP cleanupOldOtps: ERROR ===');
      this.logger.error(`Error: ${error.message}`, error.stack);
      return {
        status: 500,
        data: { error: error.message },
      };
    }
  }
}
