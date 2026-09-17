import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  tags = [],
  noindex = false
}) => {
  const siteName = 'RhymeMosaic';
  const siteUrl = window.location.origin;
  const defaultDescription = 'A collection of poetry by Brandon WordSmith. Explore poems about love, loss, faith, and the human experience.';
  const defaultImage = `${siteUrl}/og-image.png`;
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const metaUrl = url || window.location.href;

  // Create a shorter description for Twitter (max 200 chars)
  const twitterDescription = metaDescription.length > 200 
    ? metaDescription.substring(0, 197) + '...' 
    : metaDescription;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      
      {/* Article specific (for poems) */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && tags.length > 0 && (
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Additional SEO */}
      <meta name="author" content={author || 'Brandon WordSmith'} />
      {tags.length > 0 && (
        <meta name="keywords" content={tags.join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />
    </Helmet>
  );
};

export default SEO;
