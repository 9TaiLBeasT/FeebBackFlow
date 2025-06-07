export interface IEmailConfig {
  service: "resend" | "sendgrid";
  apiKey: string;
  defaultFrom: string;
  templates: {
    surveyInvite: string;
    reminder: string;
    notification: string;
  };
}

export interface IPushConfig {
  oneSignal: {
    appId: string;
    safariWebId: string;
    restApiKey: string;
  };
}

export interface IQrConfig {
  service: "qrserver" | "google-charts";
  apiKey?: string;
  options: {
    size: number;
    format: "png" | "svg";
    color: string;
    backgroundColor: string;
  };
}

// Load environment variables with type checking
const getEnvVar = (key: string, required: boolean = true): string => {
  const value = process.env[key];
  if (required && !value) {
    if (typeof window === "undefined") {
      console.warn(`Missing environment variable: ${key}`);
    }
    return "";
  }
  return value || "";
};

export const apiConfig = {
  email: {
    service: (getEnvVar("EMAIL_SERVICE", false) ||
      "resend") as IEmailConfig["service"],
    apiKey: getEnvVar("EMAIL_API_KEY", false) || "",
    defaultFrom:
      getEnvVar("EMAIL_FROM_ADDRESS", false) || "noreply@feedbackpro.com",
    templates: {
      surveyInvite:
        getEnvVar("EMAIL_TEMPLATE_SURVEY_INVITE", false) ||
        "default-survey-template",
      reminder:
        getEnvVar("EMAIL_TEMPLATE_REMINDER", false) ||
        "default-reminder-template",
      notification:
        getEnvVar("EMAIL_TEMPLATE_NOTIFICATION", false) ||
        "default-notification-template",
    },
  } as IEmailConfig,

  push: {
    oneSignal: {
      appId: getEnvVar("ONESIGNAL_APP_ID", false) || "demo-app-id",
      safariWebId:
        getEnvVar("ONESIGNAL_SAFARI_WEB_ID", false) ||
        "web.onesignal.auto.demo",
      restApiKey:
        getEnvVar("ONESIGNAL_REST_API_KEY", false) || "demo-rest-api-key",
    },
  } as IPushConfig,

  qr: {
    service: (getEnvVar("QR_SERVICE", false) ||
      "qrserver") as IQrConfig["service"],
    apiKey: getEnvVar("QR_API_KEY", false),
    options: {
      size: 300,
      format: "png" as const,
      color: "000000",
      backgroundColor: "ffffff",
    },
  } as IQrConfig,
};

// Email service
export class EmailService {
  private static instance: EmailService;
  private config: IEmailConfig;

  private constructor() {
    this.config = apiConfig.email;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(
    to: string[],
    subject: string,
    templateId: string,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      // Implementation depends on the selected email service
      if (this.config.service === "resend") {
        // Resend API implementation
        const response = await fetch("https://api.resend.com/v1/email/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.config.defaultFrom,
            to,
            subject,
            template_id: templateId,
            data,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send email: ${response.statusText}`);
        }

        return true;
      } else if (this.config.service === "sendgrid") {
        // SendGrid API implementation
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: to.map((email) => ({ email })) }],
            from: { email: this.config.defaultFrom },
            subject,
            template_id: templateId,
            dynamic_template_data: data,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send email: ${response.statusText}`);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("EmailService error:", error);
      return false;
    }
  }
}

// Push Notification service
export class PushService {
  private static instance: PushService;
  private config: IPushConfig;

  private constructor() {
    this.config = apiConfig.push;
  }

  public static getInstance(): PushService {
    if (!PushService.instance) {
      PushService.instance = new PushService();
    }
    return PushService.instance;
  }

  public async sendNotification(
    title: string,
    message: string,
    url?: string,
    segments: string[] = ["All"],
  ): Promise<boolean> {
    try {
      const response = await fetch(
        "https://onesignal.com/api/v1/notifications",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${this.config.oneSignal.restApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app_id: this.config.oneSignal.appId,
            included_segments: segments,
            headings: { en: title },
            contents: { en: message },
            url,
            web_buttons: url
              ? [{ id: "open-url", text: "Open", url }]
              : undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to send push notification: ${response.statusText}`,
        );
      }

      return true;
    } catch (error) {
      console.error("PushService error:", error);
      return false;
    }
  }
}

// QR Code service
export class QrCodeService {
  private static instance: QrCodeService;
  private config: IQrConfig;

  private constructor() {
    this.config = apiConfig.qr;
  }

  public static getInstance(): QrCodeService {
    if (!QrCodeService.instance) {
      QrCodeService.instance = new QrCodeService();
    }
    return QrCodeService.instance;
  }

  public generateQrCodeUrl(data: string): string {
    const { service, options } = this.config;
    const encodedData = encodeURIComponent(data);

    if (service === "qrserver") {
      return `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=${options.size}x${options.size}&format=${options.format}&color=${options.color}&bgcolor=${options.backgroundColor}`;
    } else if (service === "google-charts") {
      return `https://chart.googleapis.com/chart?cht=qr&chs=${options.size}x${options.size}&chl=${encodedData}`;
    }

    throw new Error(`Unsupported QR code service: ${service}`);
  }

  public async generateQrCodeBlob(data: string): Promise<Blob> {
    try {
      const url = this.generateQrCodeUrl(data);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("QrCodeService error:", error);
      throw error;
    }
  }
}

// Export service instances
export const emailService = EmailService.getInstance();
export const pushService = PushService.getInstance();
export const qrCodeService = QrCodeService.getInstance();
