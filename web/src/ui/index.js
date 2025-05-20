// src/ui/index.js

import ChatButton   from "../components/ChatButton.js";
import ChatContainer from "../components/ChatContainer.js";
import ChatHeader   from "../components/ChatHeader.js";
import ChatInput    from "../components/ChatInput.js";
import {
  userBubble,
  assistantBubble,
  thinking
} from "../components/ChatMessages.js";
import {
  setSessions,
  getSessions,
  currentId,
  loadHistory,
  buildRecents
} from "../components/RecentChats.js";

export const button      = ChatButton;
export const frame       = ChatContainer;
export const head        = ChatHeader;
export const main        = ChatInput;
export { userBubble, assistantBubble, thinking };
export {
  setSessions,
  getSessions,
  currentId,
  loadHistory,
  buildRecents
};
