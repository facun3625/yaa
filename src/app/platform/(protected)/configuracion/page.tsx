import { getPlatformMarketingSettings } from "@/lib/platform-billing";
import { MarketingSettingsForm } from "./marketing-settings-form";

export default async function PlatformSettingsPage() {
  const settings = await getPlatformMarketingSettings();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Canales de contacto y opciones generales de la plataforma.</p>
      </div>

      <MarketingSettingsForm
        enabled={settings.whatsappEnabled}
        number={settings.whatsappNumber}
        message={settings.whatsappMessage}
      />
    </div>
  );
}
