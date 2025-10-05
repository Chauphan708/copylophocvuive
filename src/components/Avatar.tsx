import React from 'react';

interface AvatarProps {
  avatar: string;
  className: string; // Will contain size, bg color, etc. e.g. "w-10 h-10 bg-sky-500 rounded-full ..."
}

const Avatar: React.FC<AvatarProps> = ({ avatar, className }) => {
  const isImage = avatar && avatar.startsWith('data:image/');

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden`}>
      {isImage ? (
        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{avatar}</span>
      )}
    </div>
  );
};

export default Avatar;
