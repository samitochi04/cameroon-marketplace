import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { CreditCard, Phone, DollarSign, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export const PaymentSettingsTab = () => {
  const { t } = useTranslation();
  const { control, formState: { errors }, watch } = useFormContext();
  const [showCommissionInfo, setShowCommissionInfo] = useState(false);
  const [showCinetpayInfo, setShowCinetpayInfo] = useState(false);
  
  const selectedPaymentMethods = watch("paymentMethods") || [];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {showCinetpayInfo && (
          <Alert variant="info" className="mb-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">{t("vendor.cinetpay_integration")}</h4>
                <p className="text-sm mt-1">
                  {t("vendor.cinetpay_integration_description")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowCinetpayInfo(false)}
                >
                  {t("vendor.got_it")}
                </Button>
              </div>
            </div>
          </Alert>
        )}
      
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-2">{t("vendor.payment_methods")}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("vendor.payment_methods_description")}
          </p>
          
          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t("vendor.accepted_payment_methods")}
            </label>
            <Controller
              name="paymentMethods"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* MTN Mobile Money */}
                  <div 
                    className={`
                      border rounded-md p-3 cursor-pointer flex items-center transition
                      ${field.value?.includes("mtn_mobile_money") ? 'bg-primary bg-opacity-10 border-primary text-primary' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    onClick={() => {
                      const currentMethods = [...(field.value || [])];
                      if (currentMethods.includes("mtn_mobile_money")) {
                        field.onChange(currentMethods.filter(m => m !== "mtn_mobile_money"));
                      } else {
                        field.onChange([...currentMethods, "mtn_mobile_money"]);
                      }
                    }}
                  >
                    <div className="w-6 h-6 mr-2">
                      <img 
                        src="/images/mtn-logo.png" 
                        alt="MTN" 
                        className="h-full w-auto"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBob25lIj48cGF0aCBkPSJNMjIgMTYuOTJWMTkuOTJhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMkg3YTIgMiAwIDAgMSAyIDEuNzJjLjEyNy45NzUuMzYyIDEuOTMuNyAyLjg1YTIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDVjLjkyLjMzOCAxLjg3NS41NzMgMi44NS43QTIgMiAwIDAgMSAyMiAxN1oiLz48L3N2Zz4=";
                        }}
                      />
                    </div>
                    <span>{t("vendor.mtn_mobile_money")}</span>
                  </div>
                  
                  {/* Orange Money */}
                  <div 
                    className={`
                      border rounded-md p-3 cursor-pointer flex items-center transition
                      ${field.value?.includes("orange_money") ? 'bg-primary bg-opacity-10 border-primary text-primary' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    onClick={() => {
                      const currentMethods = [...(field.value || [])];
                      if (currentMethods.includes("orange_money")) {
                        field.onChange(currentMethods.filter(m => m !== "orange_money"));
                      } else {
                        field.onChange([...currentMethods, "orange_money"]);
                      }
                    }}
                  >
                    <div className="w-6 h-6 mr-2">
                      <img 
                        src="/images/orange-logo.png" 
                        alt="Orange Money" 
                        className="h-full w-auto"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBob25lIj48cGF0aCBkPSJNMjIgMTYuOTJWMTkuOTJhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMkg3YTIgMiAwIDAgMSAyIDEuNzJjLjEyNy45NzUuMzYyIDEuOTMuNyAyLjg1YTIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDVjLjkyLjMzOCAxLjg3NS41NzMgMi44NS43QTIgMiAwIDAgMSAyMiAxN1oiLz48L3N2Zz4=";
                        }}
                      />
                    </div>
                    <span>{t("vendor.orange_money")}</span>
                  </div>
                  
                  {/* Credit Card */}
                  <div 
                    className={`
                      border rounded-md p-3 cursor-pointer flex items-center transition
                      ${field.value?.includes("credit_card") ? 'bg-primary bg-opacity-10 border-primary text-primary' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    onClick={() => {
                      const currentMethods = [...(field.value || [])];
                      if (currentMethods.includes("credit_card")) {
                        field.onChange(currentMethods.filter(m => m !== "credit_card"));
                      } else {
                        field.onChange([...currentMethods, "credit_card"]);
                      }
                    }}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span>{t("vendor.credit_card")}</span>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Mobile Money Settings */}
        {(selectedPaymentMethods.includes("mtn_mobile_money") || selectedPaymentMethods.includes("orange_money")) && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-2">{t("vendor.mobile_money_settings")}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t("vendor.mobile_money_settings_description")}
            </p>
            
            {/* MTN Mobile Money Settings */}
            {selectedPaymentMethods.includes("mtn_mobile_money") && (
              <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                <h4 className="flex items-center font-medium text-gray-700 mb-3">
                  <div className="w-6 h-6 mr-2">
                    <img 
                      src="/images/mtn-logo.png" 
                      alt="MTN" 
                      className="h-full w-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBob25lIj48cGF0aCBkPSJNMjIgMTYuOTJWMTkuOTJhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMkg3YTIgMiAwIDAgMSAyIDEuNzJjLjEyNy45NzUuMzYyIDEuOTMuNyAyLjg1YTIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDVjLjkyLjMzOCAxLjg3NS41NzMgMi44NS43QTIgMiAwIDAgMSAyMiAxN1oiLz48L3N2Zz4=";
                      }}
                    />
                  </div>
                  {t("vendor.mtn_mobile_money_settings")}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* MTN Mobile Money Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.mtn_mobile_money_phone")} *
                    </label>
                    <Controller
                      name="mtnMobileMoneyPhone"
                      control={control}
                      rules={{ 
                        required: selectedPaymentMethods.includes("mtn_mobile_money") ? t("vendor.mtn_phone_required") : false,
                        pattern: {
                          value: /^[0-9]{9}$/,
                          message: t("vendor.phone_format_invalid")
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.mtn_mobile_money_phone_placeholder")}
                          leftIcon={Phone}
                          error={errors.mtnMobileMoneyPhone?.message}
                        />
                      )}
                    />
                  </div>
                  
                  {/* MTN Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.account_holder_name")} *
                    </label>
                    <Controller
                      name="mtnAccountName"
                      control={control}
                      rules={{ 
                        required: selectedPaymentMethods.includes("mtn_mobile_money") ? t("vendor.account_name_required") : false
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.account_holder_name_placeholder")}
                          error={errors.mtnAccountName?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Orange Money Settings */}
            {selectedPaymentMethods.includes("orange_money") && (
              <div className="mb-6 p-4 border border-orange-300 bg-orange-50 rounded-md">
                <h4 className="flex items-center font-medium text-gray-700 mb-3">
                  <div className="w-6 h-6 mr-2">
                    <img 
                      src="/images/orange-logo.png" 
                      alt="Orange Money" 
                      className="h-full w-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBob25lIj48cGF0aCBkPSJNMjIgMTYuOTJWMTkuOTJhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMkg3YTIgMiAwIDAgMSAyIDEuNzJjLjEyNy45NzUuMzYyIDEuOTMuNyAyLjg1YTIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDVjLjkyLjMzOCAxLjg3NS41NzMgMi44NS43QTIgMiAwIDAgMSAyMiAxN1oiLz48L3N2Zz4=";
                      }}
                    />
                  </div>
                  {t("vendor.orange_money_settings")}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Orange Money Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.orange_money_phone")} *
                    </label>
                    <Controller
                      name="orangeMoneyPhone"
                      control={control}
                      rules={{ 
                        required: selectedPaymentMethods.includes("orange_money") ? t("vendor.orange_phone_required") : false,
                        pattern: {
                          value: /^[0-9]{9}$/,
                          message: t("vendor.phone_format_invalid")
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.orange_money_phone_placeholder")}
                          leftIcon={Phone}
                          error={errors.orangeMoneyPhone?.message}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Orange Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.account_holder_name")} *
                    </label>
                    <Controller
                      name="orangeAccountName"
                      control={control}
                      rules={{ 
                        required: selectedPaymentMethods.includes("orange_money") ? t("vendor.account_name_required") : false
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.account_holder_name_placeholder")}
                          error={errors.orangeAccountName?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Bank Account for Credit Card Processing */}
        {selectedPaymentMethods.includes("credit_card") && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-2">{t("vendor.bank_account_information")}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t("vendor.bank_account_for_credit_card_description")}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("vendor.bank_name")} *
                </label>
                <Controller
                  name="bankName"
                  control={control}
                  rules={{ 
                    required: selectedPaymentMethods.includes("credit_card") ? t("vendor.bank_name_required") : false
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t("vendor.bank_name_placeholder")}
                      leftIcon={CreditCard}
                      error={errors.bankName?.message}
                    />
                  )}
                />
              </div>
              
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("vendor.account_number")} *
                </label>
                <Controller
                  name="accountNumber"
                  control={control}
                  rules={{ 
                    required: selectedPaymentMethods.includes("credit_card") ? t("vendor.account_number_required") : false 
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t("vendor.account_number_placeholder")}
                      error={errors.accountNumber?.message}
                    />
                  )}
                />
              </div>
            </div>
            
            {/* Account Holder Name */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("vendor.account_holder_name")} *
              </label>
              <Controller
                name="accountHolderName"
                control={control}
                rules={{ 
                  required: selectedPaymentMethods.includes("credit_card") ? t("vendor.account_holder_name_required") : false
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t("vendor.account_holder_name_placeholder")}
                    error={errors.accountHolderName?.message}
                  />
                )}
              />
            </div>
          </div>
        )}
        
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-2">{t("vendor.payout_preferences")}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("vendor.payout_preferences_description")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payout Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("vendor.payout_threshold")}
              </label>
              <Controller
                name="payoutThreshold"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="5000"
                    leftIcon={DollarSign}
                    rightAddon="XAF"
                  />
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t("vendor.payout_threshold_description")}
              </p>
            </div>
            
            {/* Payout Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("vendor.payout_frequency")}
              </label>
              <Controller
                name="payoutFrequency"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: "weekly", label: t("vendor.weekly") },
                      { value: "biweekly", label: t("vendor.biweekly") },
                      { value: "monthly", label: t("vendor.monthly") },
                    ]}
                  />
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Commission Information */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-2">{t("vendor.commission_information")}</h3>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <button 
              className="flex items-center text-primary font-medium"
              onClick={() => setShowCommissionInfo(!showCommissionInfo)}
              type="button" 
            >
              <DollarSign className="w-5 h-5 mr-2" />
              <span>{t("vendor.view_commission_structure")}</span>
            </button>
            
            {showCommissionInfo && (
              <div className="mt-4 space-y-3">
                <p className="text-sm">{t("vendor.price_markup_explanation")}</p>
                
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">{t("vendor.transaction_amount")}</th>
                      <th className="p-2 text-right">{t("vendor.markup_percentage")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2">0 - 50,000 XAF</td>
                      <td className="p-2 text-right font-medium">15%</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">50,001 - 100,000 XAF</td>
                      <td className="p-2 text-right font-medium">20%</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">100,001 - 300,000 XAF</td>
                      <td className="p-2 text-right font-medium">25%</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">300,001 - 1,000,000 XAF</td>
                      <td className="p-2 text-right font-medium">30%</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">1,000,001+ XAF</td>
                      <td className="p-2 text-right font-medium">35%</td>
                    </tr>
                  </tbody>
                </table>
                
                <Alert variant="info" className="text-xs mt-2">
                  {t("vendor.commission_note")}
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
