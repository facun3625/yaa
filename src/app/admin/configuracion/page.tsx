import { getStoreSettings, getSmtpSettings, getOrderEmailMessage, getTelegramSettings, getSeoSettings } from "@/lib/settings";
import { getAboutContent } from "@/lib/about";
import { getPopupConfig } from "@/lib/popup";
import { requireTenantAdminWithPlan } from "@/lib/require-admin";
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
import { SeoSettingsForm } from "./seo-settings-form";

const VALID_TABS = new Set(["general", "about", "popup", "smtp", "mail", "telegram", "docs", "dominio", "seo"]);

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { session, tenant, features } = await requireTenantAdminWithPlan();
  const { tab } = await searchParams;
  const initialTab = tab && VALID_TABS.has(tab) ? tab : "general";
  const [settings, aboutContent, popupConfig, smtpSettings, orderEmailMessage, telegramSettings, tenantDomain, seoSettings] = await Promise.all([
    getStoreSettings(tenant.id),
    getAboutContent(tenant.id),
    getPopupConfig(tenant.id),
    getSmtpSettings(tenant.id),
    getOrderEmailMessage(tenant.id),
    getTelegramSettings(tenant.id),
    prisma.tenant.findUnique({
      where: { id: tenant.id },
      select: { customDomain: true, customDomainVerified: true, customDomainToken: true },
    }),
    getSeoSettings(tenant.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Configuración</h1>

      <Tabs defaultValue={initialTab}>
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
          {features.allowTelegram && (
            <TabsTrigger value="telegram" className="flex-1">
              Telegram
            </TabsTrigger>
          )}
          <TabsTrigger value="docs" className="flex-1">
            Documentación
          </TabsTrigger>
          {features.allowCustomDomain && (
            <TabsTrigger value="dominio" className="flex-1">
              Dominio propio
            </TabsTrigger>
          )}
          {features.allowCustomDomain && (
            <TabsTrigger value="seo" className="flex-1">
              SEO
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

        {features.allowTelegram && (
          <TabsContent value="telegram">
            <TelegramSettingsForm key={JSON.stringify(telegramSettings)} settings={telegramSettings} />
          </TabsContent>
        )}

        <TabsContent value="docs">
          <DocumentacionTab />
        </TabsContent>

        {features.allowCustomDomain && tenantDomain && (
          <TabsContent value="dominio">
            <CustomDomainForm
              domain={tenantDomain.customDomain}
              verified={tenantDomain.customDomainVerified}
              verificationRecordName={tenantDomain.customDomain ? verificationRecordName(tenantDomain.customDomain) : null}
              verificationToken={tenantDomain.customDomainToken}
              contactName={session.user.name ?? ""}
              contactEmail={session.user.email ?? ""}
            />
          </TabsContent>
        )}

        {features.allowCustomDomain && (
          <TabsContent value="seo">
            <SeoSettingsForm
              key={JSON.stringify(seoSettings)}
              settings={seoSettings}
              storeName={settings.storeName}
              domainVerified={Boolean(tenantDomain?.customDomainVerified)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
