import { getStoreSettings, getSmtpSettings, getOrderEmailMessage, getTelegramSettings } from "@/lib/settings";
import { getAboutContent } from "@/lib/about";
import { getPopupConfig } from "@/lib/popup";
import { requireTenantAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { verificationRecordName } from "@/lib/custom-domain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreSettingsForm } from "./store-settings-form";
import { AboutUsForm } from "./about-us-form";
import { PopupForm } from "./popup-form";
import { SmtpSettingsForm } from "./smtp-settings-form";
import { EmailEditor } from "./email-editor";
import { EmailLogTable } from "./email-log-table";
import { TelegramSettingsForm } from "./telegram-settings-form";
import { DocumentacionTab } from "./documentacion-tab";
import { CustomDomainForm } from "./custom-domain-form";

export default async function ConfiguracionPage() {
  const { tenant } = await requireTenantAdmin();
  const [settings, aboutContent, popupConfig, smtpSettings, orderEmailMessage, telegramSettings, tenantBilling] = await Promise.all([
    getStoreSettings(tenant.id),
    getAboutContent(tenant.id),
    getPopupConfig(tenant.id),
    getSmtpSettings(tenant.id),
    getOrderEmailMessage(tenant.id),
    getTelegramSettings(tenant.id),
    prisma.tenant.findUnique({ where: { id: tenant.id }, include: { plan: true } }),
  ]);
  const allowCustomDomain = tenantBilling?.plan?.allowCustomDomain ?? false;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Configuración</h1>

      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="about" className="flex-1">
            Sobre nosotros
          </TabsTrigger>
          <TabsTrigger value="popup" className="flex-1">
            Pop-up
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex-1">
            SMTP
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex-1">
            Mail
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex-1">
            Telegram
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex-1">
            Documentación
          </TabsTrigger>
          {allowCustomDomain && (
            <TabsTrigger value="dominio" className="flex-1">
              Dominio propio
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <StoreSettingsForm key={JSON.stringify(settings)} settings={settings} />
        </TabsContent>

        <TabsContent value="about">
          <AboutUsForm content={aboutContent} />
        </TabsContent>

        <TabsContent value="popup">
          <PopupForm key={popupConfig.version} config={popupConfig} />
        </TabsContent>

        <TabsContent value="smtp">
          <SmtpSettingsForm key={JSON.stringify(smtpSettings)} settings={smtpSettings} />
        </TabsContent>

        <TabsContent value="mail">
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="enviados">Enviados</TabsTrigger>
            </TabsList>

            <TabsContent value="editor">
              <EmailEditor
                key={orderEmailMessage ?? "default"}
                message={orderEmailMessage}
                smtpConfigured={smtpSettings.configured}
                storeSettings={settings}
              />
            </TabsContent>

            <TabsContent value="enviados">
              <EmailLogTable />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="telegram">
          <TelegramSettingsForm key={JSON.stringify(telegramSettings)} settings={telegramSettings} />
        </TabsContent>

        <TabsContent value="docs">
          <DocumentacionTab />
        </TabsContent>

        {allowCustomDomain && tenantBilling && (
          <TabsContent value="dominio">
            <CustomDomainForm
              domain={tenantBilling.customDomain}
              verified={tenantBilling.customDomainVerified}
              verificationRecordName={tenantBilling.customDomain ? verificationRecordName(tenantBilling.customDomain) : null}
              verificationToken={tenantBilling.customDomainToken}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
