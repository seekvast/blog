import React from "react";

const UserNotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8" role="alert">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-muted-foreground mb-2">
          用户不存在
        </h2>
        <p className="text-sm text-muted-foreground">
          抱歉，没有找到指定的用户信息。
        </p>
      </div>
    </div>
  );
};

export default UserNotFound;
