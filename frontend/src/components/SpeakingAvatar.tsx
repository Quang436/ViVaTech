import React from 'react';
import { LiveAiExaminer, type LiveAiExaminerProps } from './LiveAiExaminer';

export type SpeakingAvatarProps = LiveAiExaminerProps;

export const SpeakingAvatar: React.FC<SpeakingAvatarProps> = (props) => {
  return <LiveAiExaminer {...props} />;
};

export default SpeakingAvatar;
