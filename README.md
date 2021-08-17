# react-native-txplayer

腾讯云点播播放器 RN 封装,支持多种播放格式,支持 android 和 ios

## Getting started

`$ npm install react-native-txplayer --save`

### Mostly automatic installation

`$ react-native link react-native-txplayer`

### Manual installation

## Usage

```javascript
import RNTXplayer from 'react-native-txplayer';

const source='http://200024424.vod.myqcloud.com/200024424_709ae516bdf811e6ad39991f76a4df69.f20.mp4'

<RNTXplayer source={source} style={{ width: screenWidth, height: 200 }} />;
```

## Props

| name             | description      |
| ---------------- | ---------------- |
| source           | 播放资源         |
| poster           | 封面图           |
| enableFullScreen | 是否允许全屏     |
| themeColor       | 主题色           |
| onFullScreen     | 全屏事件         |
| onCompletion     | 播放完毕事件     |
| enableCast       | 是否显示投屏按钮 |
| onCastClick      | 投屏按钮点击事件 |
| onChangeBitrate  | 分辨率切换       |
| onProgress       | 进度回调         |
| onPrepare        | 播放准备回调     |
| isLandscape      | 全屏是否横屏     |

## Method

| name       | parmas     | description   |
| ---------- | ---------- | ------------- |
| play       | true/false | 开始/暂停播放 |
| fullscreen | true/false | 控制是否全屏  |
| stop       | /          | 停止播放      |
| seekTo     | number(秒) | 快进到多少秒  |

```js
this.RNTXplayerRef.play();
this.RNTXplayerRef.fullscreen();
```

## Custom ui

自定义控制层 UI

```javascript
import TXViewPlayer from 'react-native-txplayer/TXViewPlayer';

// TXViewPlayer 支持参数可见源码 TXViewPlayer.propTypes
<TXViewPlayer>
  <CustomUi />
</TXViewPlayer>;
```
