import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, StatusBar, Image, View } from 'react-native';
import PropTypes from 'prop-types';
import { useBackHandler, useAppState, useDimensions } from '@react-native-community/hooks';
import { hideNavigationBar, showNavigationBar } from 'react-native-navigation-bar-color';

import TXViewPlayer from './TXViewPlayer';
import ControlerView from './components/ControlerView';

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: 'black',
  },
});

const Player = forwardRef(
  (
    {
      title,
      source,
      qualityList,
      poster,
      style,
      themeColor,
      onFullScreen,
      onCompletion,
      setAutoPlay,
      onChangeBitrate,
      onProgress,
      onPrepare,
      isLandscape,
      ...restProps
    },
    ref
  ) => {
    const playerRef = useRef();
    const [playSource, setPlaySource] = useState(source);
    const [error, setError] = useState(false);
    const [errorObj, setErrorObj] = useState({});
    const [loading, setLoading] = useState(true);
    const [isFull, setIsFull] = useState(false);
    const [isComplate, setIsComplate] = useState(false);
    const [isStopPlay, setIsStopPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(setAutoPlay);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [buffer, setBuffer] = useState(0);
    const [isStart, setIsStart] = useState(false);
    const [bitrateList, setBitrateList] = useState([]);
    const [bitrateIndex, setBitrateIndex] = useState();
    const { screen, window } = useDimensions();
    const currentAppState = useAppState();
    const isChangeQuality = useRef(false); // 切换清晰度
    const isChangeQualityCurrent = useRef(0); // 切换清晰度当前时间

    const hasQuality = Array.isArray(qualityList) && qualityList.length;

    useImperativeHandle(ref, () => ({
      play: (play) => {
        if (play) {
          handlePlay();
        } else {
          handlePause();
        }
      },
      fullscreen: (full) => {
        if (full) {
          handleFullScreenIn();
        } else {
          handleFullScreenOut();
        }
      },
      stop: handleStop,
      seekTo: handleSlide,
    }));

    // 处理切换资源
    useEffect(() => {
      if (source) {
        !hasQuality && (isChangeQuality.current = false);
        !hasQuality && (isChangeQualityCurrent.current = 0);
        playerRef.current && playerRef.current.restartPlay();
        changeSource(source);
      }
    }, [source]);

    useEffect(() => {
      isChangeQuality.current = false;
      isChangeQualityCurrent.current = 0;
    }, [qualityList]);

    useEffect(() => {
      if (currentAppState === 'background') {
        playerRef.current.pausePlay();
        setIsPlaying(false);
      }
    }, [currentAppState]);

    useBackHandler(() => {
      if (isFull) {
        handleFullScreenOut();
        return true;
      }
      return false;
    });

    const changeSource = (src) => {
      setPlaySource(src);
      setLoading(true);
      setError(false);
    };

    const handlePlay = () => {
      if (isComplate) {
        playerRef.current.restartPlay();
        setIsComplate(false);
      } else if (isStopPlay) {
        playerRef.current.reloadPlay();
      } else {
        playerRef.current.startPlay();
      }
      setIsPlaying(true);
    };

    const handlePause = () => {
      playerRef.current.pausePlay();
      setIsPlaying(false);
    };

    const handleReload = () => {
      setError(false);
      playerRef.current.reloadPlay();
    };

    const handleSlide = (value) => {
      playerRef.current.seekTo(value);
    };

    const handleStop = () => {
      playerRef.current.stopPlay();
      setIsStopPlay(true);
      setIsPlaying(false);
      setIsStart(false);
    };

    const handleFullScreenIn = () => {
      setIsFull(true);
      onFullScreen(true);
      hideNavigationBar();
    };

    const handleFullScreenOut = () => {
      onFullScreen(false);
      setIsFull(false);
      showNavigationBar();
    };

    const handleChangeConfig = (config) => {
      playerRef.current.setNativeProps(config);
    };

    const handleChangeBitrate = (newIndex) => {
      if (hasQuality) return;
      setLoading(true);
      setBitrateIndex(newIndex);
    };

    const handleChangeQuality = (newSource) => {
      isChangeQuality.current = true;
      isChangeQualityCurrent.current = current;
      changeSource(newSource);
    };

    const isOrientationLandscape = isLandscape;

    const fullscreenStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: isOrientationLandscape
        ? Math.max(screen.width, screen.height)
        : Math.min(screen.width, screen.height),
      height: isOrientationLandscape
        ? Math.min(screen.width, screen.height)
        : Math.max(screen.width, screen.height),
      zIndex: 100,
    };

    const fullwindowStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: isOrientationLandscape
        ? Math.max(window.width, window.height)
        : Math.min(window.width, window.height),
      height: isOrientationLandscape
        ? Math.min(window.width, window.height)
        : Math.max(window.width, window.height),
      zIndex: 100,
    };
    return (
      <View style={[styles.base, isFull ? fullscreenStyle : style]}>
        <TXViewPlayer
          {...restProps}
          ref={playerRef}
          source={playSource}
          setAutoPlay={setAutoPlay}
          selectBitrateIndex={bitrateIndex}
          style={StyleSheet.absoluteFill}
          onTXVodPrepare={() => {
            if (isPlaying) {
              playerRef.current.startPlay();
            }
            if (isChangeQuality.current) {
              playerRef.current.seekTo(isChangeQualityCurrent.current);
              isChangeQuality.current = false;
              isChangeQualityCurrent.current = 0;
            } else {
              setCurrent(0);
              setBuffer(0);
              onPrepare();
            }
          }}
          onTXVodLoading={() => {
            setLoading(true);
          }}
          onTXVodLoadingEnd={() => {
            setLoading(false);
          }}
          onTXVodBegin={() => {
            setError(false);
            setLoading(false);
            setIsStopPlay(false);
            setIsPlaying(true);
            setIsStart(true);
          }}
          onTXVodProgress={({ nativeEvent }) => {
            setTotal(nativeEvent.duration);
            setCurrent(nativeEvent.progress);
            setBuffer(nativeEvent.buffered);
            onProgress(nativeEvent);
          }}
          onTXVodEnd={() => {
            setIsComplate(true);
            setIsPlaying(false);
            onCompletion();
          }}
          onTXVodError={({ nativeEvent }) => {
            setError(true);
            setErrorObj(nativeEvent);
          }}
          onTXVodBitrateChange={({ nativeEvent }) => {
            if (hasQuality) return;
            setBitrateIndex(nativeEvent.index);
            onChangeBitrate(nativeEvent);
          }}
          onTXVodBitrateReady={({ nativeEvent }) => {
            if (hasQuality) return;
            setBitrateList(nativeEvent.bitrates);
          }}
        >
          <StatusBar hidden={isFull} />
          <ControlerView
            {...restProps}
            title={title}
            isFull={isFull}
            current={current}
            buffer={buffer}
            total={total}
            isError={error}
            poster={poster}
            isStart={isStart}
            isLoading={loading}
            errorObj={errorObj}
            isPlaying={isPlaying}
            loadingObj={{}}
            themeColor={themeColor}
            playSource={playSource}
            qualityList={qualityList}
            bitrateList={bitrateList}
            bitrateIndex={bitrateIndex}
            onSlide={handleSlide}
            onPressPlay={handlePlay}
            onPressPause={handlePause}
            onPressReload={handleReload}
            onPressFullIn={handleFullScreenIn}
            onPressFullOut={handleFullScreenOut}
            onChangeConfig={handleChangeConfig}
            onChangeBitrate={handleChangeBitrate}
            onChangeQuality={handleChangeQuality}
          />
        </TXViewPlayer>
      </View>
    );
  }
);
Player.propTypes = {
  ...TXViewPlayer.propTypes,
  source: PropTypes.string, // 播放地址
  qualityList: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string, // 标清 高清
      value: PropTypes.string, // 对应播放地址
    }) // 播放列表
  ),
  poster: Image.propTypes.source, // 封面图
  onFullScreen: PropTypes.func, // 全屏回调事件
  onCompletion: PropTypes.func, // 播放完成事件
  enableFullScreen: PropTypes.bool, // 是否允许全屏
  themeColor: PropTypes.string, // 播放器主题
  enableCast: PropTypes.bool, // 是否显示投屏按钮
  onCastClick: PropTypes.func, // 投屏按钮点击事件
  onChangeBitrate: PropTypes.func, // 切换清晰度
  onProgress: PropTypes.func, // 进度回调
  onPrepare: PropTypes.func, // 播放准备回调
  isLandscape: PropTypes.bool, // 全屏是否横屏
};

Player.defaultProps = {
  onFullScreen: () => {},
  onCompletion: () => {},
  onCastClick: () => {},
  onChangeBitrate: () => {},
  onProgress: () => {},
  onPrepare: () => {},
  themeColor: '#F85959',
  enableHardwareDecoder: false,
  setSpeed: 1.0,
  setRenderMode: 0,
  isLandscape: true,
};

export default React.memo(Player);
