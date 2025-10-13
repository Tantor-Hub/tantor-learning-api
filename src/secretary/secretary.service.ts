import { Injectable } from '@nestjs/common';
import { PaymentMethodCpfService } from '../paymentmethodcpf/paymentmethodcpf.service';
import { PaymentMethodOpcoService } from '../paymentmethodopco/paymentmethodopco.service';
import { UpdatePaymentMethodCpfDto } from '../paymentmethodcpf/dto/update-paymentmethodcpf.dto';
import { UpdatePaymentMethodOpcoDto } from '../paymentmethodopco/dto/update-paymentmethodopco.dto';
import { PaymentMethodCpfStatus } from '../enums/payment-method-cpf-status.enum';
import { PaymentMethodOpcoStatus } from '../enums/payment-method-opco-status.enum';
import { MailService } from '../services/service.mail';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';

@Injectable()
export class SecretaryService {
  constructor(
    private readonly paymentMethodCpfService: PaymentMethodCpfService,
    private readonly paymentMethodOpcoService: PaymentMethodOpcoService,
    private readonly mailService: MailService,
  ) {}

  async getAllCpfPayments() {
    return this.paymentMethodCpfService.findAll();
  }

  async getAllOpcoPayments() {
    return this.paymentMethodOpcoService.findAll();
  }

  async getCpfPaymentById(id: string) {
    return this.paymentMethodCpfService.findOne(id);
  }

  async getOpcoPaymentById(id: string) {
    return this.paymentMethodOpcoService.findOne(id);
  }

  async updateCpfPayment(
    id: string,
    updateDto: UpdatePaymentMethodCpfDto,
    secretaryId: string,
  ) {
    // Add the secretary ID to the update DTO
    const updatedDto = { ...updateDto, updatedBy: secretaryId };
    return this.paymentMethodCpfService.update(id, updatedDto);
  }

  async updateOpcoPayment(
    id: string,
    updateDto: UpdatePaymentMethodOpcoDto,
    secretaryId: string,
  ) {
    // Add the secretary ID to the update DTO
    const updatedDto = { ...updateDto, updatedBy: secretaryId };
    return this.paymentMethodOpcoService.update(updatedDto);
  }

  async updateCpfPaymentStatus(
    id: string,
    status: PaymentMethodCpfStatus,
    secretaryId: string,
  ) {
    try {
      console.log(
        `[SECRETARY SERVICE] Updating CPF payment ${id} to status: ${status} by secretary: ${secretaryId}`,
      );

      const updateDto: UpdatePaymentMethodCpfDto = {
        id,
        status,
        updatedBy: secretaryId,
      };

      const result = await this.paymentMethodCpfService.update(id, updateDto);

      if (result.status === HttpStatusCode.Ok) {
        // Send email notification to user about status change
        await this.sendCpfStatusChangeEmail(id, status);
      }

      return result;
    } catch (error) {
      console.error(
        '[SECRETARY SERVICE] Error updating CPF payment status:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la mise à jour du statut du paiement CPF.',
      });
    }
  }

  async updateOpcoPaymentStatus(
    id: string,
    status: PaymentMethodOpcoStatus,
    secretaryId: string,
  ) {
    try {
      console.log(
        `[SECRETARY SERVICE] Updating OPCO payment ${id} to status: ${status} by secretary: ${secretaryId}`,
      );

      const updateDto: UpdatePaymentMethodOpcoDto = {
        id,
        status,
        updatedBy: secretaryId,
      };

      const result = await this.paymentMethodOpcoService.update(updateDto);

      if (result.status === HttpStatusCode.Ok) {
        // Send email notification to user about status change
        await this.sendOpcoStatusChangeEmail(id, status);
      }

      return result;
    } catch (error) {
      console.error(
        '[SECRETARY SERVICE] Error updating OPCO payment status:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la mise à jour du statut du paiement OPCO.',
      });
    }
  }

  async getPendingPayments() {
    try {
      // Get all CPF and OPCO payments
      const [cpfResult, opcoResult] = await Promise.all([
        this.paymentMethodCpfService.findAll(),
        this.paymentMethodOpcoService.findAll(),
      ]);

      if (
        cpfResult.status !== HttpStatusCode.Ok ||
        opcoResult.status !== HttpStatusCode.Ok
      ) {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: null,
          customMessage:
            'Erreur lors de la récupération des paiements en attente.',
        });
      }

      // Filter pending payments
      const pendingCpfPayments = cpfResult.data.filter(
        (payment: any) => payment.status === PaymentMethodCpfStatus.PENDING,
      );
      const pendingOpcoPayments = opcoResult.data.filter(
        (payment: any) => payment.status === PaymentMethodOpcoStatus.PENDING,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          cpf: pendingCpfPayments,
          opco: pendingOpcoPayments,
          total: pendingCpfPayments.length + pendingOpcoPayments.length,
        },
        customMessage: 'Paiements en attente récupérés avec succès.',
      });
    } catch (error) {
      console.error(
        '[SECRETARY SERVICE] Error getting pending payments:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la récupération des paiements en attente.',
      });
    }
  }

  async getPaymentStatistics() {
    try {
      // Get all CPF and OPCO payments
      const [cpfResult, opcoResult] = await Promise.all([
        this.paymentMethodCpfService.findAll(),
        this.paymentMethodOpcoService.findAll(),
      ]);

      if (
        cpfResult.status !== HttpStatusCode.Ok ||
        opcoResult.status !== HttpStatusCode.Ok
      ) {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: null,
          customMessage:
            'Erreur lors de la récupération des statistiques de paiement.',
        });
      }

      const cpfPayments = cpfResult.data;
      const opcoPayments = opcoResult.data;

      // Calculate statistics
      const statistics = {
        cpf: {
          total: cpfPayments.length,
          pending: cpfPayments.filter(
            (p: any) => p.status === PaymentMethodCpfStatus.PENDING,
          ).length,
          validated: cpfPayments.filter(
            (p: any) => p.status === PaymentMethodCpfStatus.VALIDATED,
          ).length,
          rejected: cpfPayments.filter(
            (p: any) => p.status === PaymentMethodCpfStatus.REJECTED,
          ).length,
        },
        opco: {
          total: opcoPayments.length,
          pending: opcoPayments.filter(
            (p: any) => p.status === PaymentMethodOpcoStatus.PENDING,
          ).length,
          validated: opcoPayments.filter(
            (p: any) => p.status === PaymentMethodOpcoStatus.VALIDATED,
          ).length,
          rejected: opcoPayments.filter(
            (p: any) => p.status === PaymentMethodOpcoStatus.REJECTED,
          ).length,
        },
        total: {
          total: cpfPayments.length + opcoPayments.length,
          pending:
            cpfPayments.filter(
              (p: any) => p.status === PaymentMethodCpfStatus.PENDING,
            ).length +
            opcoPayments.filter(
              (p: any) => p.status === PaymentMethodOpcoStatus.PENDING,
            ).length,
          validated:
            cpfPayments.filter(
              (p: any) => p.status === PaymentMethodCpfStatus.VALIDATED,
            ).length +
            opcoPayments.filter(
              (p: any) => p.status === PaymentMethodOpcoStatus.VALIDATED,
            ).length,
          rejected:
            cpfPayments.filter(
              (p: any) => p.status === PaymentMethodCpfStatus.REJECTED,
            ).length +
            opcoPayments.filter(
              (p: any) => p.status === PaymentMethodOpcoStatus.REJECTED,
            ).length,
        },
      };

      return Responder({
        status: HttpStatusCode.Ok,
        data: statistics,
        customMessage: 'Statistiques de paiement récupérées avec succès.',
      });
    } catch (error) {
      console.error(
        '[SECRETARY SERVICE] Error getting payment statistics:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la récupération des statistiques de paiement.',
      });
    }
  }

  private async sendCpfStatusChangeEmail(
    paymentId: string,
    status: PaymentMethodCpfStatus,
  ) {
    try {
      // Get payment details with user and training session info
      const paymentResult =
        await this.paymentMethodCpfService.findOne(paymentId);

      if (paymentResult.status !== HttpStatusCode.Ok || !paymentResult.data) {
        console.error(
          '[SECRETARY SERVICE] Could not retrieve CPF payment details for email',
        );
        return;
      }

      const payment = paymentResult.data;
      const user = payment.user;
      const trainingSession = payment.trainingSession;

      if (!user || !user.email) {
        console.error(
          '[SECRETARY SERVICE] No user email found for CPF payment notification',
        );
        return;
      }

      let emailTemplate = '';
      let subject = '';

      switch (status) {
        case PaymentMethodCpfStatus.VALIDATED:
          emailTemplate = 'payment-cpf-validated';
          subject = 'Paiement CPF validé';
          break;
        case PaymentMethodCpfStatus.REJECTED:
          emailTemplate = 'payment-cpf-rejected';
          subject = 'Paiement CPF rejeté';
          break;
        default:
          console.log(
            '[SECRETARY SERVICE] No email template for CPF status:',
            status,
          );
          return;
      }

      await this.mailService.sendMail({
        to: user.email,
        subject,
        content: this.mailService.templates({
          as: emailTemplate,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          cours: trainingSession?.title || 'Formation',
        }),
      });

      console.log(
        `[SECRETARY SERVICE] ✅ CPF status change email sent to ${user.email}`,
      );
    } catch (error) {
      console.error(
        '[SECRETARY SERVICE] ⚠️ Failed to send CPF status change email:',
        error,
      );
    }
  }

  private async sendOpcoStatusChangeEmail(
    paymentId: string,
    status: PaymentMethodOpcoStatus,
  ) {
    try {
      // Get payment details with user and training session info
      const paymentResult =
        await this.paymentMethodOpcoService.findOne(paymentId);

      if (paymentResult.status !== HttpStatusCode.Ok || !paymentResult.data) {
        console.error(
          '[SECRETARY SERVICE] Could not retrieve OPCO payment details for email',
        );
        return;
      }

      const payment = paymentResult.data;
      const user = payment.user;
      const trainingSession = payment.trainingSession;

      if (!user || !user.email) {
        console.error(
          '[SECRETARY SERVICE] No user email found for OPCO payment notification',
        );
        return;
      }

      let emailTemplate = '';
      let subject = '';

      switch (status) {
        case PaymentMethodOpcoStatus.VALIDATED:
          emailTemplate = 'payment-opco-validated';
          subject = 'Paiement OPCO validé';
          break;
        case PaymentMethodOpcoStatus.REJECTED:
          emailTemplate = 'payment-opco-rejected';
          subject = 'Paiement OPCO rejeté';
          break;
        default:
          console.log(
            '[SECRETARY SERVICE] No email template for OPCO status:',
            status,
          );
          return;
      }

      await this.mailService.sendMail({
        to: user.email,
        subject,
        content: this.mailService.templates({
          as: emailTemplate,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          cours: trainingSession?.title || 'Formation',
        }),
      });

      console.log(
        `[SECRETARY SERVICE] ✅ OPCO status change email sent to ${user.email}`,
      );
    } catch (error) {
      console.error(
        '[SECRETARY SERVICE] ⚠️ Failed to send OPCO status change email:',
        error,
      );
    }
  }
}
