import { useLocation } from "react-router-dom";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "product";
}

export const SeoMetadata = ({ 
  title, 
  description, 
  image = "https://tiencotruong.com/og-image.png",
  type = "website" 
}: SeoProps) => {
  const location = useLocation();
  const currentUrl = `https://tiencotruong.com${location.pathname}`;

  return (
    <>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph (Facebook/Zalo) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
};