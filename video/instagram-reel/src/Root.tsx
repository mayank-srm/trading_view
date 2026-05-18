import {Composition} from 'remotion';
import {InstagramFeature} from './InstagramFeature';

export const RemotionRoot = () => {
  return (
    <Composition
      id="InstagramFeature"
      component={InstagramFeature}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
