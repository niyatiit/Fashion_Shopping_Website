const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-20 h-20 text-2xl" };

const Avatar = ({ user, size = "md" }) => {
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  if (user?.profileImage?.url) {
    return (
      <img
        src={user.profileImage.url}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover border border-sand`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-ink text-ivory flex items-center justify-center font-display`}>
      {initial}
    </div>
  );
};

export default Avatar;