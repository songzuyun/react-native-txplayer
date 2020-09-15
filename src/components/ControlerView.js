import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Text, Animated, Easing, SafeAreaView, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from './Slide';

import { formatTime, getBitrateLabel } from '../lib/utils';
import useTimeout from '../lib/useTimeout';
import PressView from './PressView';
import ControlIcon from './ControlIcon';
import StateView from './StateView';
import Progress from './Progress';
import ConfigView from './ConfigView';
import QualityView from './QualityView';

const GradientWhite = 'rgba(0,0,0,0)';
const GradientBlack = 'rgba(0,0,0,0.3)';
const controlerHeight = 40;
const controlerDismissTime = 5000;
const AnimateLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const styles = StyleSheet.create({
  controler: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  stateview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textTitle: {
    color: 'white',
    flex: 1,
    fontSize: 16,
  },
  textQuality: {
    color: 'white',
    fontSize: 16,
  },
  textTime: {
    color: 'white',
    fontSize: 16,
  },
  iconLeft: {
    marginLeft: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: controlerHeight,
    width: '100%',
    paddingHorizontal: 10,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    height: controlerHeight,
    width: '100%',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  bottomSlide: {
    flex: 0.8,
    marginHorizontal: 5,
  },
});

function ControlerView({
  title,
  isFull,
  current,
  buffer,
  total,
  isPlaying,
  enableFullScreen,
  enableCast,
  playSource,
  bitrateList,
  bitrateIndex,
  qualityList,
  themeColor,
  poster,
  isStart,
  // config
  setSpeed,
  setRenderMode,
  setLoop,
  setMute,
  // ******
  isError,
  isLoading,
  errorObj,
  loadingObj,
  onPressPlay,
  onPressPause,
  onPressReload,
  onPressFullIn,
  onPressFullOut,
  onChangeConfig,
  onChangeBitrate,
  onSlide,
  onCastClick,
}) {
  const [visible, setVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [qualityVisible, setQualityVisible] = useState(false);
  const currentFormat = formatTime(current);
  const totalFormat = formatTime(total);
  const hasBitrate = Array.isArray(bitrateList) && bitrateList.length;
  const bitrate = bitrateList && bitrateList.find((o) => o.index === bitrateIndex);
  const [configObj, setConfigObj] = useState({
    setSpeed,
    setRenderMode,
    setLoop,
    setMute,
  });
  const bitrateLabel = getBitrateLabel(bitrate) || '画质';

  const { animateValue, bottomAnimate, headerAnimate, opacityAnimate } = useMemo(() => {
    const animateValue = new Animated.Value(0);
    const bottomAnimate = animateValue.interpolate({
      inputRange: [0, 1],
      outputRange: [controlerHeight, 0],
    });
    const headerAnimate = animateValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-controlerHeight, 0],
    });
    const opacityAnimate = animateValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    return {
      animateValue,
      bottomAnimate,
      headerAnimate,
      opacityAnimate,
    };
  }, []);

  const [_, clear, set] = useTimeout(() => {
    setVisible(false);
  }, controlerDismissTime);

  useEffect(() => {
    Animated.timing(animateValue, {
      toValue: visible ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [visible, animateValue]);

  const handlePressPlayer = () => {
    if (visible) {
      setVisible(false);
      clear();
    } else {
      setVisible(true);
      set();
    }
  };

  return (
    <SafeAreaView style={styles.controler}>
      {!isStart && <Image source={poster} resizeMode="cover" style={StyleSheet.absoluteFill} />}
      <AnimateLinearGradient
        colors={[GradientBlack, GradientWhite]}
        style={[
          styles.header,
          { opacity: opacityAnimate, transform: [{ translateY: headerAnimate }] },
        ]}
      >
        {isFull && <ControlIcon onPress={onPressFullOut} name="left" />}
        <Text style={styles.textTitle}>{title}</Text>
        {Boolean(hasBitrate && isFull) && (
          <Text
            style={[styles.textQuality, styles.iconLeft]}
            onPress={() => setQualityVisible(true)}
          >
            {bitrateLabel}
          </Text>
        )}
        {enableCast && (
          <ControlIcon
            iconStyle={styles.iconLeft}
            name="iconfontdesktop"
            onPress={() => onCastClick({ current, playSource })}
          />
        )}
        {isFull && (
          <ControlIcon
            iconStyle={styles.iconLeft}
            name="setting"
            onPress={() => setConfigVisible(true)}
          />
        )}
      </AnimateLinearGradient>
      <PressView style={styles.stateview} onPress={handlePressPlayer} activeOpacity={1}>
        <StateView
          isError={isError}
          isLoading={isLoading}
          errorObj={errorObj}
          isPlaying={isPlaying}
          loadingObj={loadingObj}
          themeColor={themeColor}
          onPressPlay={onPressPlay}
          onPressReload={onPressReload}
        />
      </PressView>
      <AnimateLinearGradient
        colors={[GradientWhite, GradientBlack]}
        style={[
          styles.bottom,
          { opacity: opacityAnimate, transform: [{ translateY: bottomAnimate }] },
        ]}
      >
        <ControlIcon
          onPress={isPlaying ? onPressPause : onPressPlay}
          name={isPlaying ? 'pausecircleo' : 'playcircleo'}
        />
        <Text style={styles.textTime}>{`${currentFormat.M}:${currentFormat.S}`}</Text>
        <Slider
          progress={current}
          min={0}
          max={total}
          cache={buffer}
          style={styles.bottomSlide}
          onSlidingComplete={(value) => {
            onSlide(parseInt(value));
          }}
          themeColor={themeColor}
        />
        <Text style={styles.textTime}>{`${totalFormat.M}:${totalFormat.S}`}</Text>
        {enableFullScreen && (
          <ControlIcon
            onPress={isFull ? onPressFullOut : onPressFullIn}
            name={isFull ? 'shrink' : 'arrowsalt'}
          />
        )}
      </AnimateLinearGradient>
      <Progress disable={visible} value={current} maxValue={total} themeColor={themeColor} />
      <ConfigView
        config={configObj}
        visible={configVisible}
        themeColor={themeColor}
        onClose={() => setConfigVisible(false)}
        onChange={(res) => {
          const newConfig = Object.assign({}, configObj, res);
          setConfigObj(newConfig);
          onChangeConfig(newConfig);
        }}
      />
      <QualityView
        themeColor={themeColor}
        playSource={playSource}
        visible={qualityVisible}
        bitrateList={bitrateList}
        bitrateIndex={bitrateIndex}
        onChange={(res) => {
          onChangeBitrate(res.value);
          setQualityVisible(false);
        }}
        onClose={() => setQualityVisible(false)}
      />
    </SafeAreaView>
  );
}
export default ControlerView;