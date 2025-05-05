import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const Settings = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState({});

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  const publicLink = `${process.env.NEXT_PUBLIC_SITE_URL}/public/${user.email}`;
  const privateLink = `${process.env.NEXT_PUBLIC_SITE_URL}/private/${user.privateToken}`;

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label>Public Link:</label>
        <input id="public-link" type="text" value={publicLink} readOnly />
      </div>
      <div>
        <label>Private Link:</label>
        <input id="private-link" type="text" value={privateLink} readOnly />
      </div>
    </div>
  );
};

export default Settings;