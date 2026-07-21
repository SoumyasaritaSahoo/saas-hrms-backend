import { getMailAssetUrl } from 'src/common/helpers/helper';

export interface EmailTemplateOptions {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}

export const baseEmailTemplate = ({
  title,
  content,
  buttonText,
  buttonUrl,
}: EmailTemplateOptions) => {
  const logoUrl = getMailAssetUrl('images/logo.png');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f7fb;
      font-family: Arial, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding: 40px 0;"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background: #f5f3ff;
                  padding: 30px;
                  text-align: center;
                "
              >
                <img src="${logoUrl}" alt="SaaS HRMS" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2
                  style="
                    margin-top: 0;
                    color: #111827;
                    font-size: 22px;
                  "
                >
                  ${title}
                </h2>

                <div
                  style="
                    color: #4b5563;
                    font-size: 15px;
                    line-height: 1.8;
                  "
                >
                  ${content}
                </div>

                ${
                  buttonText && buttonUrl
                    ? `
                  <div style="margin-top: 30px; text-align: center;">
                    <a
                      href="${buttonUrl}"
                      style="
                        display: inline-block;
                        padding: 14px 28px;
                        background: #8b5cf6;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 14px;
                      "
                    >
                      ${buttonText}
                    </a>
                  </div>
                `
                    : ''
                }
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background: #f9fafb;
                  padding: 20px;
                  text-align: center;
                  color: #9ca3af;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()} SaaS HRMS. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
