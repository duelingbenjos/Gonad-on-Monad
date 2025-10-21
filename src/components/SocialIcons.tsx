import React from 'react';

interface SocialIconsProps {
  className?: string;
}


export const SocialIcons: React.FC<SocialIconsProps> = ({ className = "" }) => {
  const socialLinks = [
    {
      name: 'X (Twitter)',
      url: 'https://x.com/gooch_air',
      icon: '/icons/x.svg',
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/TPPr6RQGZz',
      icon: '/icons/discord.svg',
    },
    {
      name: 'Farcaster',
      url: 'https://farcaster.xyz/goochisland',
      icon: '/icons/farcaster.svg',
    },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground p-2 hover:bg-accent rounded-md"
          aria-label={`Follow us on ${link.name}`}
        >
          <img 
            src={link.icon}
            alt={link.name}
            className="w-5 h-5"
          />
        </a>
      ))}
    </div>
  );
};
