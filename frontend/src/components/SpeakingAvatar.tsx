import React from 'react';
import { AiExaminer, type AiExaminerProps } from './AiExaminer';

export type SpeakingAvatarProps = AiExaminerProps;

export const SpeakingAvatar: React.FC<SpeakingAvatarProps> = (props) => {
  return <AiExaminer {...props} />;
};

export default SpeakingAvatar;
