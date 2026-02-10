"use client";

import Script from "next/script";

interface TrackingConfig {
  gtmEnabled: boolean;
  gtmContainerId: string | null;
  fbPixelEnabled: boolean;
  fbPixelId: string | null;
  fbTrackPageView: boolean;
  gadsEnabled: boolean;
  gadsConversionId: string | null;
}

export function TrackingScripts({ config }: { config: TrackingConfig }) {
  return (
    <>
      {/* Google Tag Manager */}
      {config.gtmEnabled && config.gtmContainerId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${config.gtmContainerId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${config.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {config.fbPixelEnabled && config.fbPixelId && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${config.fbPixelId}');
              ${config.fbTrackPageView ? "fbq('track', 'PageView');" : ""}
            `,
          }}
        />
      )}

      {/* Google Ads */}
      {config.gadsEnabled && config.gadsConversionId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.gadsConversionId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-ads"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.gadsConversionId}');
              `,
            }}
          />
        </>
      )}
    </>
  );
}
