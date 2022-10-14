import React, { useRef, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Slider, { Ballon } from 'react-native-reanimated-slider';
import Animated from 'react-native-reanimated';
import { formatTime } from '../lib/utils';

const { Value } = Animated;

function VideoSlide({
  style,
  progress,
  min,
  max,
  themeColor,
  cache,
  onSlidingChange,
  ...restProps
}) {
  const ballonRef = useRef();

  const valueMin = useMemo(() => new Value(0), []);
  const valueMax = useMemo(() => new Value(0), []);
  const valueProgress = useMemo(() => new Value(0), []);
  const valueCache = useMemo(() => new Value(0), []);

  useEffect(() => {
    valueMin.setValue(min);
    valueMax.setValue(max);
    valueProgress.setValue(progress);
    valueCache.setValue(cache);
  }, [max, min, progress, cache, valueMin, valueMax, valueProgress, valueCache]);

  const renderBallon = () => {
    // return <Ballon ref={ballonRef} color={themeColor} textStyle={{ color: 'white' }} />;
    return null;
  };

  const renderThumbImage = () => {
    return (
      <View
        style={{
          backgroundColor: themeColor,
          height: 8,
          width: 8,
          borderRadius: 4,
        }}
      />
    );
  };

  return (
    <Slider
      style={style}
      min={valueMin}
      max={valueMax}
      progress={valueProgress}
      cache={valueCache}
      trackHeight={3}
      minimumTrackTintColor={themeColor}
      cacheTrackTintColor="#bbb"
      thumbTintColor="white"
      maximumTrackTintColor="white"
      ballon={(value) => {
        const formatValue = formatTime(value);
        return `${formatValue.M}:${formatValue.S}`;
      }}
      renderBallon={renderBallon}
      renderThumbImage={renderThumbImage}
      setBallonText={(text) => {
        onSlidingChange && onSlidingChange(text);
        // ballonRef.current.setText(text)
      }}
      {...restProps}
    />
  );
}

VideoSlide.defaultProps = {
  onSlidingStart: () => {},
  onSlidingComplete: () => {},
};

export default VideoSlide;
