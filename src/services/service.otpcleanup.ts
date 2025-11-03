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

  // Automatic cleanup is disabled - OTP records are kept permanently
  // Uncomment the @Cron decorator below and adjust the date threshold in cleanupOldOtps() to re-enable automatic cleanup
  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleOtpCleanup() {
    // Automatic cleanup disabled - OTP records are permanent
    this.logger.log(
      'Automatic OTP cleanup is disabled. OTP records are kept permanently.',
    );
    return {
      status: 200,
      data: { message: 'Automatic cleanup is disabled', cleanedCount: 0 },
    };
  }

  // Manual cleanup method - only for manual execution if needed
  // Note: Automatic cleanup is disabled - OTP records are kept permanently by default
  async cleanupOldOtps() {
    try {
      console.log('=== OTP cleanupOldOtps: Starting ===');

      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      console.log(
        'Cleaning up OTPs created before:',
        sevenDaysAgo.toISOString(),
      );

      // Find all OTPs created more than 7 days ago
      const oldOtps = await this.otpModel.findAll({
        where: {
          createdAt: {
            [Op.lt]: sevenDaysAgo,
          },
        },
      });

      console.log('Found OTPs to cleanup:', oldOtps.length);

      if (oldOtps.length === 0) {
        console.log('=== OTP cleanupOldOtps: No OTPs to cleanup ===');
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

      console.log('=== OTP cleanupOldOtps: Success ===');
      console.log('Permanently deleted OTPs:', otpIds.length);

      return {
        status: 200,
        data: {
          cleanedCount: oldOtps.length,
          deletedOtpIds: otpIds,
        },
      };
    } catch (error) {
      console.error('=== OTP cleanupOldOtps: ERROR ===');
      console.error('Error:', error);
      return {
        status: 500,
        data: { error: error.message },
      };
    }
  }
}
