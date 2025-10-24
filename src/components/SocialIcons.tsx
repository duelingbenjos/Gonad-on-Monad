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
          className="group p-2 rounded-md transition-colors hover:bg-primary"
          aria-label={`Follow us on ${link.name}`}
        >
          {/* Light: black; Dark: white; Hover: black on yellow bg */}
          <img
            src={link.icon}
            alt={link.name}
            className="w-5 h-5 dark:invert group-hover:invert-0"
          />
        </a>
      ))}
    </div>
  );
};
