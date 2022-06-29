import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Animated, Easing, SafeAreaView, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SystemSetting from 'react-native-system-setting';
import { throttle } from 'lodash';
import dayjs from 'dayjs';
import Slider from './Slide';
import { useDimensions } from '@react-native-community/hooks';
import { formatTime, getBitrateLabel } from '../lib/utils';
import useTimeout from '../lib/useTimeout';
import PressView from './PressView';
import ControlIcon from './ControlIcon';
import StateView from './StateView';
import Progress from './Progress';
import ConfigView from './ConfigView';
import QualityView from './QualityView';
import GestureView from './GestureView';

const GradientWhite = 'rgba(0,0,0,0)';
const GradientBlack = 'rgba(0,0,0,0.3)';
const controlerHeight = 40;
const controlerDismissTime = 5000;
const volumeDismissTime = 2000;
const AnimateView = Animated.View;

const styles = StyleSheet.create({
  controler: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  stateview: {
    flex: 1,
    flexDirection: 'row',
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
  panResponder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekText: {
    color: 'white',
    fontSize: 30,
  },
  leftBackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBg: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  volumeProgressCon: {
    backgroundColor: '#eee',
    height: 4,
    width: 150,
    marginLeft: 6,
  },
  volumeProgress: {
    backgroundColor: '#f85959',
    height: 4,
    width: '50%',
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
  setVolume,
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
  onChangeQuality,
  onSlide,
  onCastClick,
  isShowLeftBack,
  onPressBack,
}) {
  const { screen, window } = useDimensions();
  const [visible, setVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [qualityVisible, setQualityVisible] = useState(false);
  const [currentPositon, setCurrentPositon] = useState(current);
  const [showSeek, setShowSeek] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showBrightness, setShowBrightness] = useState(false);
  const [volumeValue, setVolumeValue] = useState();
  const [brightnessValue, setBrightnessValue] = useState();
  const currentPositonFormat = formatTime(currentPositon);
  const currentFormat = formatTime(current);
  const totalFormat = formatTime(total);
  const hasBitrate = Array.isArray(bitrateList) && bitrateList.length;
  const bitrate = bitrateList && bitrateList.find((o) => o.index === bitrateIndex);
  const hasQuality = Array.isArray(qualityList) && qualityList.length;
  const quality = qualityList && qualityList.find((o) => o.value === playSource);
  const [configObj, setConfigObj] = useState({
    setSpeed,
    setRenderMode,
    setLoop,
    setMute,
    setVolume,
  });

  const [isReady, clear, set] = useTimeout(() => {
    setVisible(false);
  }, controlerDismissTime);

  const [volumeIsReady, volumeClear, volumeSet] = useTimeout(() => {
    setShowVolume(false);
  }, volumeDismissTime);

  const [brightnessIsReady, brightnessClear, brightnessSet] = useTimeout(() => {
    setShowBrightness(false);
  }, volumeDismissTime);

  // 在手势回调里不能直接使用props和state
  const totalRef = useRef(total);
  const isFullRef = useRef(isFull);
  const isPlayingRef = useRef(isPlaying);
  const configObjRef = useRef({
    setSpeed,
    setRenderMode,
    setLoop,
    setMute,
    setVolume,
  });

  useEffect(() => {
    totalRef.current = total;
    isFullRef.current = isFull;
    isPlayingRef.current = isPlaying;
    configObjRef.current = {
      setSpeed,
      setRenderMode,
      setLoop,
      setMute,
      setVolume,
    };
  }, [total, isFull, isPlaying, setSpeed, setRenderMode, setLoop, setMute, setVolume]);

  //获取声音、亮度初始值
  useEffect(() => {
    SystemSetting.getAppBrightness().then((res) => {
      setBrightnessValue(res);
    });
    SystemSetting.getVolume().then((res) => {
      setVolumeValue(res);
    });
  }, []);

  const gestureProgressRef = useRef(false); // 快进手势标记
  const gestureVolumeRef = useRef(false); // 声音手势标记
  const gestureBrightnessRef = useRef(false); // 亮度手势标记
  const currentDxRef = useRef(0); //拖动时onPanResponderMove每次回调的dx（dx是一个累加的值）
  const currentDyRef = useRef(0); //拖动时onPanResponderMove每次回调的dy（dy是一个累加的值）
  const currentPositonRef = useRef(0); //拖动时当前播放位置，用于释放时seek（onSlide）
  const clickTimeRef = useRef(); //点击时间
  const timerRef = useRef(); //定时器（区分单击还是双击）

  const onPanResponderMove = (e, gestureState) => {
    const { dx, dy, x0, y0 } = gestureState;
    const width = isFullRef.current
      ? Math.max(window.width, window.height)
      : Math.min(window.width, window.height);
    const height = 200;
    const widthE = width / 4;
    // 亮度
    if (
      !gestureProgressRef.current &&
      !gestureBrightnessRef.current &&
      !gestureVolumeRef.current &&
      Math.abs(dy) > 10 &&
      x0 < widthE * 2
    ) {
      gestureBrightnessRef.current = true;
    }
    // 声音
    if (
      !gestureProgressRef.current &&
      !gestureBrightnessRef.current &&
      !gestureVolumeRef.current &&
      Math.abs(dy) > 10 &&
      x0 > widthE * 2
    ) {
      gestureVolumeRef.current = true;
    }
    // 快进
    if (
      !gestureProgressRef.current &&
      !gestureBrightnessRef.current &&
      !gestureVolumeRef.current &&
      Math.abs(dx) > 5
    ) {
      gestureProgressRef.current = true;
    }
    // 亮度
    if (gestureBrightnessRef.current) {
      const newDy = dy - currentDyRef.current; // 每次回调dy差值
      const dt = -1 * (newDy / height);
      setBrightnessValue((pre) => {
        let next = pre + dt;
        if (next < 0) {
          next = 0;
        }
        if (next > 1) {
          next = 1;
        }
        SystemSetting.setAppBrightness(next);
        return next;
      });
      setShowVolume(false);
      setShowBrightness(true);
      brightnessSet();
      volumeClear();
    }
    // 声音
    if (gestureVolumeRef.current) {
      const newDy = dy - currentDyRef.current; // 每次回调dy差值
      const dt = -1 * (newDy / height);
      setVolumeValue((pre) => {
        let next = pre + dt;
        if (next < 0) {
          next = 0;
        }
        if (next > 1) {
          next = 1;
        }
        SystemSetting.setVolume(next);
        return next;
      });
      setShowBrightness(false);
      setShowVolume(true);
      volumeSet();
      brightnessClear();
    }
    // 快进
    if (gestureProgressRef.current) {
      const newDx = dx - currentDxRef.current; // 每次回调dx差值
      const dt = 90 * (newDx / width);
      setCurrentPositon((pre) => {
        let next = pre + dt;
        if (next < 0) {
          next = 0;
        }
        if (next > totalRef.current) {
          next = totalRef.current;
        }
        currentPositonRef.current = next;
        return next;
      });
      setShowSeek(true);
      setShowVolume(false);
      setShowBrightness(false);
    }
    //更新上一次dx、dy
    currentDxRef.current = dx;
    currentDyRef.current = dy;
  };

  const onPanResponderRelease = (e, gestureState) => {
    const { dx, dy } = gestureState;
    if (gestureProgressRef.current) {
      onSlide(parseInt(currentPositonRef.current));
    } else if (gestureVolumeRef.current) {
    } else if (gestureBrightnessRef.current) {
    } else {
      handlePressPlayer();
      setShowVolume(false);
      setShowBrightness(false);
      brightnessClear();
      volumeClear();
    }
    gestureProgressRef.current = false;
    gestureVolumeRef.current = false;
    gestureBrightnessRef.current = false;
    currentDxRef.current = 0;
    currentDyRef.current = 0;
    currentPositonRef.current = 0;
    setShowSeek(false);
  };

  //不拖动时要更新当前播放位置
  useEffect(() => {
    if (!gestureProgressRef.current) {
      setCurrentPositon(current);
    }
  }, [current]);

  const bitrateLabel = getBitrateLabel(bitrate) || '画质';
  const { label: qualityLabel } = quality || { label: '画质' };
  const finalQualityLabel = hasQuality ? qualityLabel : bitrateLabel;

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

  useEffect(() => {
    Animated.timing(animateValue, {
      toValue: visible ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [visible, animateValue]);

  const handlePressPlayer = () => {
    // 先执行单击延时，如果是双击，在双击里取消单击定时器
    //单击
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setVisible((pre) => {
          if (pre) {
            clear();
            return false;
          } else {
            set();
            return true;
          }
        });
        timerRef.current = undefined;
      }, 300);
    }
    //双击
    if (clickTimeRef.current && dayjs().valueOf() - clickTimeRef.current < 300) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
      clickTimeRef.current = undefined;
      if (isPlayingRef.current) {
        onPressPause();
      } else {
        onPressPlay();
      }
    }
    //更新点击时间
    clickTimeRef.current = dayjs().valueOf();
  };

  return (
    <SafeAreaView style={styles.controler}>
      {!isStart && <Image source={poster} resizeMode="cover" style={StyleSheet.absoluteFill} />}
      <AnimateView
        style={[
          styles.header,
          { opacity: opacityAnimate, transform: [{ translateY: headerAnimate }] },
          isFull && { paddingHorizontal: 50 },
        ]}
      >
        <LinearGradient style={StyleSheet.absoluteFill} colors={[GradientBlack, GradientWhite]} />
        {isFull && <ControlIcon onPress={onPressFullOut} name="left" />}
        <Text style={styles.textTitle}>{title}</Text>
        {Boolean((hasQuality || hasBitrate) && isFull) && (
          <Text
            style={[styles.textQuality, styles.iconLeft]}
            onPress={() => setQualityVisible(true)}
          >
            {finalQualityLabel}
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
      </AnimateView>
      {!isFull && isShowLeftBack && (
        <View style={styles.leftBackContainer}>
          <ControlIcon onPress={onPressBack} name="left" />
        </View>
      )}

      {showVolume && (
        <View style={styles.volumeContainer}>
          <View style={styles.volumeBg}>
            <ControlIcon type="feather" name="volume-2" />
            <View style={styles.volumeProgressCon}>
              <View style={[styles.volumeProgress, { width: `${volumeValue * 100}%` }]} />
            </View>
          </View>
        </View>
      )}

      {showBrightness && (
        <View style={styles.volumeContainer}>
          <View style={styles.volumeBg}>
            <ControlIcon type="material-icon" name="brightness-4" />
            <View style={styles.volumeProgressCon}>
              <View style={[styles.volumeProgress, { width: `${brightnessValue * 100}%` }]} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.stateview} activeOpacity={1}>
        <GestureView
          // onPanResponderMove={onPanResponderMove}
          onPanResponderMove={throttle(onPanResponderMove, 30)}
          onPanResponderRelease={onPanResponderRelease}
        >
          {showSeek && (
            <Text
              style={styles.seekText}
            >{`${currentPositonFormat.M}:${currentPositonFormat.S}`}</Text>
          )}
        </GestureView>

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
      </View>

      <AnimateView
        style={[
          styles.bottom,
          { opacity: opacityAnimate, transform: [{ translateY: bottomAnimate }] },
          isFull && { paddingHorizontal: 50 },
        ]}
      >
        <LinearGradient style={StyleSheet.absoluteFill} colors={[GradientWhite, GradientBlack]} />
        <ControlIcon
          type={'ionicon'}
          onPress={isPlaying ? onPressPause : onPressPlay}
          name={isPlaying ? 'pause-outline' : 'play'}
        />

        <Text style={styles.textTime}>{`${currentPositonFormat.M}:${currentPositonFormat.S}`}</Text>
        <Slider
          progress={currentPositon}
          min={0}
          max={total - 10} //减去10秒，1.拖到最后疫苗会闪退2.留一点播放时间
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
      </AnimateView>
      <Progress disable={visible} value={currentPositon} maxValue={total} themeColor={themeColor} />
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
        visible={qualityVisible}
        qualityList={qualityList}
        playSource={playSource}
        bitrateList={bitrateList}
        bitrateIndex={bitrateIndex}
        onChange={(res) => {
          onChangeQuality(res.value);
          onChangeBitrate(res.value);
          setQualityVisible(false);
        }}
        onClose={() => setQualityVisible(false)}
      />
    </SafeAreaView>
  );
}
export default ControlerView;
