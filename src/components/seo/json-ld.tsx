interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function MultiJsonLd({ data }: { data: Record<string, unknown>[] }) {
  return (
    <>
      {data.map((item, index) => (
        <JsonLd key={index} data={item} />
      ))}
    </>
  );
}
