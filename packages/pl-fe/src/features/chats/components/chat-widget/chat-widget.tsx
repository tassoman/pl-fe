import React from 'react';
import { useHistory } from 'react-router-dom';

import { ChatProvider } from 'pl-fe/contexts/chat-context';

import ChatPane from '../chat-pane/chat-pane';

const ChatWidget = () => {
  const history = useHistory();

  const path = history.location.pathname;
  const isChatsPath = Boolean(path.match(/^\/chats/));

  if (isChatsPath) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export { ChatWidget as default };
