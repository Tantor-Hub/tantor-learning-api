# TODO: Integrate Payment Method Card Creation After Stripe Payment Intent

## Steps to Complete

- [ ] Modify the `create` method in `PaymentMethodCardService` to accept an optional `stripePaymentId` parameter for setting `id_stripe_payment` during initial creation.
- [ ] Update `createStripePaymentIntent` method to call `this.create` after successful Stripe Payment Intent creation, passing the PI ID.
- [ ] Adjust the response of `createStripePaymentIntent` to include the created PaymentMethodCard details alongside `clientSecret`.
- [ ] Test the integration: Run server, call `/paymentmethodcard/payment-intent`, verify DB record creation with PI ID and PENDING status.
- [ ] Verify no duplicates and proper error handling.
- [ ] Confirm payment success flow updates status to VALIDATED.
